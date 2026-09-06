import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Week } from "../data/series";
import { EVENT_BY_DATE } from "../data/events";
import { T, fmtWeek, type Lang } from "../i18n";
import { moodColor } from "../mood";

/**
 * Кривая тревоги.
 *
 * ШКАЛА. Ось не 0…100. Опрос за всё время ходил в пределах 32…70 %, и
 * растянуть ось на всю сотню значило бы сплющить весь ряд в узкую полосу
 * посередине и спрятать разницу между спокойной неделей и мобилизацией.
 *
 * ЛИНИИ ПОСЕТИТЕЛЯ ЗДЕСЬ НЕТ, И ЭТО НАРОЧНО: ответ посетителя относится к
 * текущей неделе, а кривая -- к прошедшим. Пересекать их на одном полотне
 * значит сравнивать разные недели.
 */

const W_БАЗА = 1000;

/**
 * ВЫСОТА ХОЛСТА СЧИТАЕТСЯ ПО КОРОБКЕ, А НЕ ЗАДАНА ЧИСЛОМ.
 *
 * Здесь стояло H = 430 при W = 1000, то есть холст с намертво заданными
 * пропорциями 2.33:1. Коробка же под график шире и ниже -- её высоту задаёт
 * раскладка, чтобы левая карточка кончалась вровень с опросом. Браузер
 * вписывал холст в коробку целиком и центрировал, и разница уходила в пустые
 * полосы сверху и снизу. Измерено: на экране 1600 -- по 93 пикселя с каждой
 * стороны, на 1920 -- по 58. Именно эта полоса и отодвигала ряд важных дат от
 * строки поиска, и именно она съедала высоту у самой кривой.
 *
 * Теперь высота холста берётся из пропорций коробки, полос нет вовсе, и вся
 * высота достаётся кривой. Пределы -- на случай очень узкой или очень широкой
 * коробки, где деление вырождается.
 */
const H_МИН = 300;
const H_МАКС = 900;
const H_ПО_УМОЛЧАНИЮ = 430; // до первого измерения

/**
 * ЕДИНИЦА ХОЛСТА. На большом экране холст условный: W = 1000 при коробке
 * шириной 1450, то есть всё нарисованное увеличивается в полтора раза, и
 * кегль 16 читается как 23. На телефоне та же условность работает против:
 * коробка 390 пикселей, множитель 0.39, и кегль 16 превращается в 6 --
 * прочесть нельзя. Поэтому на телефоне холст мерится В ПИКСЕЛЯХ: W равно
 * ширине коробки, и все размеры здесь -- настоящие.
 */

// PAD.t держит ряд подписей и табличку недели. 96 -- ровно столько, сколько им
// нужно: рамка кончается на 35, табличка занимает 44 начиная с PAD.t - 52.
// На телефоне таблички нет, зато подписи стоят в три ряда -- им нужно больше.
const PAD_БАЗА = { l: 34, r: 12, t: 96, b: 30 };
const PAD_ТЕЛ = { l: 30, r: 10, b: 26 };
const LABEL_Y = 22; // верхний ряд подписей
const ШАГ_РЯДА = 30; // между рядами подписей на телефоне
const PADX_ТЕЛ = 14; // поля внутри рамки на телефоне -- уже, чем на экране
// Средняя ширина знака -- примерно 0.58 кегля для этого шрифта. Считаем
// ширину рамки под текст, а если текст в свою долю не влезает -- УМЕНЬШАЕМ
// КЕГЛЬ, а не режем рамку: обрезанная рамка и была причиной того, что буквы
// на неё находили.
const ШИР_ЗНАКА = 0.58;
const PADX = 22; // поля внутри рамки
const КЕГЛЬ = 15; // желаемый; уменьшается только если иначе не влезть
const КЕГЛЬ_МИН = 11;

const LO = 26;
const HI = 76;
const TICKS = [30, 40, 50, 60, 70];

/**
 * ЦВЕТ КРИВОЙ ПОСТОЯНЕН. Раньше вся линия перекрашивалась в цвет выбранной
 * недели: вся история меняла цвет от того, куда ткнули мышью, и в
 * спокойных неделях кривая уходила в тусклую бирюзу. Здесь она -- ось отсчёта,
 * а не показание, и цвет у неё один, видный на обеих темах.
 */
const CURVE = "var(--curve)";

type Props = {
  data: Week[];
  lang: Lang;
  sel: number;
  onSel: (i: number) => void;
  showFom: boolean;
  phone?: boolean;
};

export default function Chart({ data, lang, sel, onSel, showFom, phone = false }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [hovering, setHovering] = useState(false);

  // Коробка меряется, а не угадывается: её размер задаёт раскладка.
  const [бокс, setБокс] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setБокс({ w: width, h: height });
    });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  // На телефоне единица холста -- пиксель; на большом экране холст условный.
  const W = phone && бокс ? Math.round(бокс.w) : W_БАЗА;

  /**
   * СКОЛЬКО РЯДОВ ПОДПИСЕЙ. Считается по самой длинной из них, а не назначено:
   * на 390 пикселях в ряд встают три, на 320 -- только две, и назначенная
   * тройка там накладывала рамки друг на друга. Сколько влезает столбцов --
   * столько и берём, остальное уходит в ряды.
   */
  const рядов = useMemo(() => {
    if (!phone) return 1;
    const n = data.filter((d) => EVENT_BY_DATE[d.date]).length;
    if (!n) return 1;
    const длина = Math.max(
      ...data.filter((d) => EVENT_BY_DATE[d.date]).map((d) => {
        const ev = EVENT_BY_DATE[d.date];
        return (lang === "ru" ? ev.shortRu : ev.shortEn).length;
      }),
    );
    const нужно = длина * КЕГЛЬ_МИН * ШИР_ЗНАКА + PADX_ТЕЛ;
    const столбцов = Math.max(1, Math.floor((W - PAD_ТЕЛ.l - PAD_ТЕЛ.r) / нужно));
    return Math.ceil(n / столбцов);
  }, [phone, data, lang, W]);

  /**
   * ГОДЫ НА ОСИ. Пишутся полностью и стоят ВСЕ до одного: пропущенный год
   * читается как отсутствующий отрезок времени. Ряд начинается в июле 2019-го,
   * поэтому первый промежуток вдвое короче остальных, и на телефоне «2019» с
   * «2020» налезали друг на друга.
   *
   * Лечится по порядку: сперва уменьшается кегль -- ровно настолько, чтобы
   * влезть в САМЫЙ УЗКИЙ промежуток, а не в средний. Если и на предельно
   * мелком не влезает, подписи расходятся в ДВА РЯДА через одну -- промежуток
   * для каждой удваивается, и все годы остаются на месте.
   */
  const годы = useMemo(() => {
    const т: { year: number; x: number }[] = [];
    const шир = W - (phone ? PAD_ТЕЛ.l + PAD_ТЕЛ.r : PAD_БАЗА.l + PAD_БАЗА.r);
    const л = phone ? PAD_ТЕЛ.l : PAD_БАЗА.l;
    data.forEach((d, i) => {
      const yr = +d.date.slice(0, 4);
      if (!т.some((v) => v.year === yr)) т.push({ year: yr, x: л + (i / (data.length - 1)) * шир });
    });
    let мин = Infinity;
    for (let i = 0; i + 1 < т.length; i++) мин = Math.min(мин, т[i + 1].x - т[i].x);
    if (!isFinite(мин)) мин = шир;
    const нужно = (k: number) => 4 * k * ШИР_ЗНАКА + 3;
    // 11 -- граница читаемости года на телефоне, ниже неё в один ряд не
    // опускаемся: лучше два ряда крупных подписей, чем один мелких. 9 -- пол
    // на случай, когда не хватает и двух рядов.
    const ЧИТАЕМЫЙ = 11;
    const ПОЛ = 9;
    const потолок = phone ? 13 : 16;
    const лесенка = нужно(ЧИТАЕМЫЙ) > мин;
    const место = лесенка ? мин * 2 : мин;
    const кегль = Math.max(ПОЛ, Math.min(потолок, (место - 3) / (4 * ШИР_ЗНАКА)));
    return { точки: т, кегль, лесенка };
  }, [data, phone, W]);

  // Верхнее поле держит ровно столько рядов подписей, сколько получилось;
  // нижнее -- один ряд годов или два.
  const PAD = useMemo(
    () =>
      phone
        ? {
            ...PAD_ТЕЛ,
            t: LABEL_Y + (рядов - 1) * ШАГ_РЯДА + 13 + 14,
            b: PAD_ТЕЛ.b + (годы.лесенка ? годы.кегль + 3 : 0),
          }
        : PAD_БАЗА,
    [phone, рядов, годы],
  );
  const H = бокс
    ? phone
      ? Math.round(бокс.h)
      : Math.round(Math.min(H_МАКС, Math.max(H_МИН, (W * бокс.h) / бокс.w)))
    : H_ПО_УМОЛЧАНИЮ;

  const x = useCallback(
    (i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r),
    [data.length, W, PAD],
  );
  const y = useCallback(
    (v: number) => PAD.t + (1 - (v - LO) / (HI - LO)) * (H - PAD.t - PAD.b),
    [H, PAD],
  );

  const { line, area, fomLine, markers, gaps, liveX } = useMemo(() => {
    const pts = data.map((d, i) => [x(i), y(d.idx)] as const);
    let p = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      p += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    const last = pts[pts.length - 1];
    const a = `${p}L${last[0].toFixed(2)},${H - PAD.b}L${pts[0][0].toFixed(2)},${H - PAD.b}Z`;

    // Опрос рисуется отрезками: там, где волн не было, линию тянуть нельзя --
    // получится измерение, которого не делали.
    let f = "";
    let open = false;
    data.forEach((d, i) => {
      if (d.fom == null) {
        open = false;
        return;
      }
      f += `${open ? "L" : "M"}${x(i).toFixed(1)},${y(d.fom).toFixed(1)}`;
      open = true;
    });

    // РАСХОЖДЕНИЕ. Полоска от прибора до опроса на каждой неделе, где волна
    // была. Цвет говорит, кто выше. Тянуть сплошную заливку нельзя: между
    // волнами опроса нет, и залитый промежуток был бы измерением, которого
    // не делали.
    // Лента строится ПАРАМИ соседних недель: четырёхугольник между прибором и
    // опросом. Тонкая лента -- согласие, и именно это надо было увидеть; толстая
    // -- расхождение. Разрыв в опросе рвёт и ленту: между волнами измерения нет,
    // и залитый промежуток был бы измерением, которого не делали.
    const gaps: { d: string; up: boolean }[] = [];
    for (let i = 0; i + 1 < data.length; i++) {
      const A = data[i];
      const B = data[i + 1];
      if (A.fom == null || B.fom == null) continue;
      const x1 = x(i);
      const x2 = x(i + 1);
      gaps.push({
        d: `M${x1.toFixed(1)},${y(A.idx).toFixed(1)}L${x2.toFixed(1)},${y(B.idx).toFixed(1)}L${x2.toFixed(1)},${y(B.fom).toFixed(1)}L${x1.toFixed(1)},${y(A.fom).toFixed(1)}Z`,
        up: A.fom + B.fom > A.idx + B.idx,
      });
    }


    // ОДИН РЯД. Подписи стоят ровной строкой наверху, в порядке дат, каждой
    // отведена равная доля ширины -- а к своей точке на кривой от неё идёт
    // выноска. Раскладка по нескольким рядам читалась как лесенка; ровная
    // строка читается как оглавление.
    const сырые = data
      .map((d, i) => ({ d, i }))
      // Только разобранные недели. Подписи из самих данных давали лишние
      // метки -- в том числе вторую «мобилизацию» на неделе после неё.
      .filter((o) => EVENT_BY_DATE[o.d.date]);
    // НА ТЕЛЕФОНЕ РЯДОВ ТРИ. Девять подписей в одну строку по 390 пикселей --
    // это 43 пикселя на подпись, куда «Мобилизация» не влезает ни при каком
    // кегле. Три ряда дают втрое больше места каждой; лесенка на телефоне
    // читается нормально, потому что глаз и так идёт сверху вниз.
    const столбцов = Math.ceil(сырые.length / рядов);
    const шаг = (W - PAD.l - PAD.r) / столбцов;
    const ms = сырые.map((o, k) => {
      const ev = EVENT_BY_DATE[o.d.date];
      const text = lang === "ru" ? ev.shortRu : ev.shortEn;
      const поля = phone ? PADX_ТЕЛ : PADX;
      const место = шаг - (phone ? 5 : 8);
      const кегль = Math.max(
        КЕГЛЬ_МИН,
        Math.min(КЕГЛЬ, (место - поля) / (text.length * ШИР_ЗНАКА)),
      );
      const ряд = phone ? k % рядов : 0;
      const столбец = phone ? Math.floor(k / рядов) : k;
      return {
        i: o.i,
        x: x(o.i),
        y: y(o.d.idx),
        text,
        кегль,
        ряд,
        ly: LABEL_Y + ряд * ШАГ_РЯДА,
        lx: PAD.l + шаг * (столбец + 0.5),
        wid: text.length * кегль * ШИР_ЗНАКА + поля,
      };
    });

    const li = data.findIndex((d) => d.phase !== "обучение");

    return {
      line: p,
      area: a,
      fomLine: f,

      markers: ms,
      gaps,
      liveX: li < 0 ? null : x(li),
    };
  }, [data, lang, x, y, W, PAD, phone, рядов]);

  /** Плечо выноски не должно оказаться ниже самой точки. */
  const low = (py: number) => Math.max(py, PAD.t - 6);

  /**
   * Курсор ведёт неделю ТОЛЬКО когда он в поле кривой. Полотно шире поля: сверху
   * на нём стоит ряд подписей, и раньше движение мыши по подписям уже
   * перематывало неделю -- прочесть подпись, не сбив выбор, было нельзя.
   */
  const вПоле = (clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return false;
    return ((clientY - r.top) / r.height) * H >= PAD.t - 8;
  };

  const pick = (clientX: number, clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !вПоле(clientY)) return;
    const rel = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - PAD.l) / (W - PAD.l - PAD.r)) * (data.length - 1));
    onSel(Math.max(0, Math.min(data.length - 1, i)));
  };

  const cur = data[sel];
  const cx = x(sel);
  const cy = y(cur.idx);
  const flip = cx > W * 0.6;
  // Табличка держится на ОДНОМ уровне -- прямо под рядом подписей. Прыгая
  // вслед за точкой, она перекрывала то кривую, то подписи, и глаз каждый раз
  // искал её заново.
  const boxY = PAD.t - 52;
  const boxH = 44;

  return (
    <div className="relative flex w-full flex-1 select-none">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        /**
         * ПАЛЕЦ ПО ГРАФИКУ ЛИСТАЕТ СТРАНИЦУ. Стояло touch-none -- полотно
         * забирало себе все касания, и на телефоне палец, попавший на график,
         * не прокручивал страницу: она замирала. Теперь по вертикали листает
         * браузер (touch-pan-y), а неделю выбирает КАСАНИЕ, а не проведение:
         * тянуть неделю пальцем всё равно нельзя -- этот же жест листает.
         */
        className={"w-full " + (phone ? "touch-pan-y" : "touch-none")}
        style={{ height: "100%", minHeight: "var(--chart-h, 360px)", overflow: "visible" }}
        onPointerDown={(e) => {
          if (!вПоле(e.clientY)) return;
          if (!phone) (e.target as Element).setPointerCapture?.(e.pointerId);
          setHovering(true);
          pick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (phone) return;
          if ((e.pointerType === "mouse" || e.buttons > 0) && вПоле(e.clientY)) {
            setHovering(true);
            pick(e.clientX, e.clientY);
          }
        }}
        onPointerLeave={() => setHovering(false)}
        onPointerUp={() => setHovering(false)}
      >
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CURVE} stopOpacity="0.4" />
            <stop offset="60%" stopColor={CURVE} stopOpacity="0.11" />
            <stop offset="100%" stopColor={CURVE} stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-60%" width="160%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {TICKS.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray="3 7" />
            <text x={PAD.l - 6} y={y(v) + 3} fontSize="16" textAnchor="end" fill="var(--ink-3)" className="mono">
              {v}
            </text>
          </g>
        ))}

        {годы.точки.map((yr, i) => (
          <g key={yr.year}>
            <line x1={yr.x} x2={yr.x} y1={PAD.t - 12} y2={H - PAD.b} stroke="var(--line)" opacity="0.5" />
            <text
              x={yr.x + 4}
              y={H - PAD.b + годы.кегль + 4 + (годы.лесенка && i % 2 ? годы.кегль + 3 : 0)}
              fontSize={годы.кегль}
              fill="var(--ink-3)"
              className="mono"
            >
              {yr.year}
            </text>
          </g>
        ))}

        {/* Рамки эпохи здесь больше нет. Затенение и черта на 2020 годе
            объясняли устройство прибора (до 2020-го он короче) там, где
            читатель смотрит на кривую, и делили картинку надвое без пользы
            для него. Само правило никуда не делось: место недели считается
            внутри своей эпохи, и это написано словами под числом. */}

        {/* граница: правее прибор недели при настройке не видел */}
        {liveX != null && (
          <g>
            <rect
              x={liveX}
              y={PAD.t - 12}
              width={W - PAD.r - liveX}
              height={H - PAD.b - PAD.t + 12}
              fill="var(--ink)"
              opacity="0.035"
            />
            <line x1={liveX} x2={liveX} y1={PAD.t - 12} y2={H - PAD.b} stroke="var(--line-strong)" strokeDasharray="4 4" />
            {/* ЭТА подпись нужна, в отличие от эпох: она говорит не про
                устройство прибора, а про то, чего стоят его показания.
                Правее черты недель прибор при настройке не видел -- значит
                там он не подогнан, а угадывает. Сторона выбирается по месту:
                у правого края текст не помещается и встаёт слева. */}
            {(() => {
              const t = T.untuned[lang];
              const кегль = phone ? 11 : 14;
              const шир = t.length * кегль * 0.58;
              const справа = W - PAD.r - liveX > шир + 16;
              return (
                <text
                  x={справа ? liveX + 6 : liveX - 6}
                  // Наверху на телефоне подпись ложилась на выноски меток --
                  // там их три ряда. Внизу, у самой оси, пусто.
                  y={phone ? H - PAD.b - 8 : PAD.t + 6}
                  fontSize={кегль}
                  textAnchor={справа ? "start" : "end"}
                  fill="var(--ink-3)"
                >
                  {t}
                </text>
              );
            })()}
          </g>
        )}

        {showFom &&
          gaps.map((g, i) => (
            <path key={i} d={g.d} fill={g.up ? "var(--cool)" : "var(--violet)"} opacity="0.5" />
          ))}

        <path d={area} fill="url(#areaG)" />
        <path
          d={line}
          fill="none"
          stroke={CURVE}
          strokeWidth="2.3"
          strokeLinecap="round"
          filter="url(#glow)"
          className="draw"
          style={{ transition: "stroke 0.35s ease" }}
        />

        {showFom && <path d={fomLine} fill="none" stroke="var(--poll)" strokeWidth="1.7" opacity="0.95" />}

        {/* МЕТКИ СОБЫТИЙ. Подпись стоит в общем ряду, а к своей неделе идёт
            выноска: вниз от подписи, наклон, и снова вниз к точке. Подпись,
            выноска и точка -- одно кликабельное целое. stopPropagation
            обязателен: без него клик уходит в полотно, которое выбирает неделю
            по координате мыши, и попадание в край подписи выбирало бы совсем
            другую неделю. */}
        {markers.map((m) => {
          const on = sel === m.i;
          const низ = m.ly + 13;
          const плечо = Math.min(low(m.y) - 14, низ + 26);
          return (
            <g
              key={m.i}
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSel(m.i);
              }}
            >
              <polyline
                points={`${m.lx},${низ} ${m.lx},${плечо} ${m.x},${плечо + 12} ${m.x},${m.y - 6}`}
                fill="none"
                stroke="var(--accent-2)"
                strokeWidth={on ? 1.5 : 1}
                opacity={on ? 0.9 : 0.32}
              />
              <rect
                x={m.lx - m.wid / 2}
                y={m.ly - 13}
                width={m.wid}
                height={26}
                rx="13"
                fill={on ? "var(--accent-2)" : "var(--bg-2)"}
                stroke={on ? "var(--accent-2)" : "var(--line-strong)"}
                strokeWidth="1.2"
              />
              <text
                x={m.lx}
                y={m.ly + 5}
                fontSize={m.кегль}
                textAnchor="middle"
                fill={on ? "var(--bg)" : "var(--ink)"}
                style={{ pointerEvents: "none" }}
              >
                {m.text}
              </text>
              <circle cx={m.x} cy={m.y} r={on ? 5 : 3.2} fill="var(--bg)" stroke="var(--accent-2)" strokeWidth="1.8" />
            </g>
          );
        })}

        <g>
          <line x1={cx} x2={cx} y1={PAD.t - 14} y2={H - PAD.b} stroke="var(--ink)" opacity="0.35" />
          <circle cx={cx} cy={cy} r="6.5" fill="var(--bg)" stroke={CURVE} strokeWidth="2.6" style={{ transition: "stroke 0.35s ease" }} />
          <circle cx={cx} cy={cy} r="12" fill={CURVE} opacity={hovering ? 0.2 : 0.1} style={{ transition: "fill 0.35s ease" }} />
        </g>

        {/* Таблички на телефоне нет: она повторяет то, что и так стоит прямо
            над графиком крупным числом -- неделю и показание, -- а места
            стоила бы столько же, сколько ряд подписей. */}
        {!phone && hovering && (
          <g transform={`translate(${Math.max(PAD.l, Math.min(flip ? cx - 262 : cx + 14, W - PAD.r - 250))}, ${boxY})`}>
            <rect width="250" height={boxH} rx="12" fill="var(--bg-2)" stroke="var(--line-strong)" opacity="0.98" />
            <text x="14" y="18" fontSize="16" fill="var(--ink-3)" className="mono">
              {fmtWeek(cur.date, lang)}
            </text>
            <text x="14" y="37" fontSize="19" fontWeight="700" fill={moodColor(cur.idx, 8)} className="mono">
              {cur.idx.toFixed(1)}
            </text>
            <text x="74" y="37" fontSize="16" fill="var(--ink-2)" className="mono">
              {cur.fom != null ? `${lang === "ru" ? "опрос" : "poll"} ${cur.fom.toFixed(0)}` : T.fomNone[lang]}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

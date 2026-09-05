import { useCallback, useMemo, useRef, useState } from "react";
import { ГРАНИЦА_ЭПОХ, type Week } from "../data/series";
import { EVENT_BY_DATE } from "../data/events";
import { T, fmtWeek, type Lang } from "../i18n";
import { moodColor } from "../mood";

/**
 * Кривая тревоги.
 *
 * ШКАЛА. Ось не 0…100. Опрос за одиннадцать лет ходил в пределах 32…70 %, и
 * растянуть ось на всю сотню значило бы сплющить весь ряд в узкую полосу
 * посередине и спрятать разницу между спокойной неделей и мобилизацией.
 *
 * ЛИНИИ ПОСЕТИТЕЛЯ ЗДЕСЬ НЕТ, И ЭТО НАРОЧНО: ответ посетителя относится к
 * текущей неделе, а кривая -- к прошедшим. Пересекать их на одном полотне
 * значит сравнивать разные недели.
 */

const W = 1000;
const H = 430;
// Сверху оставлено место под три ряда подписей: метки должны читаться, а не
// быть точками, по которым надо угадывать.
const PAD = { l: 34, r: 12, t: 120, b: 30 };
const LABEL_Y = 22; // единственный ряд подписей, наверху
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
 * недели: одиннадцать лет истории меняли цвет от того, куда ткнули мышью, и в
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
};

export default function Chart({ data, lang, sel, onSel, showFom }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [hovering, setHovering] = useState(false);

  const x = useCallback((i: number) => PAD.l + (i / (data.length - 1)) * (W - PAD.l - PAD.r), [data.length]);
  const y = useCallback((v: number) => PAD.t + (1 - (v - LO) / (HI - LO)) * (H - PAD.t - PAD.b), []);

  const { line, area, fomLine, years, markers, gaps, liveX, eraX } = useMemo(() => {
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

    const ys: { year: number; x: number }[] = [];
    data.forEach((d, i) => {
      const yr = +d.date.slice(0, 4);
      if (!ys.some((v) => v.year === yr)) ys.push({ year: yr, x: x(i) });
    });

    // ОДИН РЯД. Подписи стоят ровной строкой наверху, в порядке дат, каждой
    // отведена равная доля ширины -- а к своей точке на кривой от неё идёт
    // выноска. Раскладка по нескольким рядам читалась как лесенка; ровная
    // строка читается как оглавление.
    const сырые = data
      .map((d, i) => ({ d, i }))
      // Только разобранные недели. Подписи из самих данных давали лишние
      // метки -- в том числе вторую «мобилизацию» на неделе после неё.
      .filter((o) => EVENT_BY_DATE[o.d.date]);
    const шаг = (W - PAD.l - PAD.r) / сырые.length;
    const ms = сырые.map((o, k) => {
      const ev = EVENT_BY_DATE[o.d.date];
      const text = lang === "ru" ? ev.shortRu : ev.shortEn;
      const место = шаг - 8;
      const кегль = Math.max(
        КЕГЛЬ_МИН,
        Math.min(КЕГЛЬ, (место - PADX) / (text.length * ШИР_ЗНАКА)),
      );
      return {
        i: o.i,
        x: x(o.i),
        y: y(o.d.idx),
        text,
        кегль,
        lx: PAD.l + шаг * (k + 0.5),
        wid: text.length * кегль * ШИР_ЗНАКА + PADX,
      };
    });

    const li = data.findIndex((d) => d.phase !== "обучение");
    const ei = data.findIndex((d) => d.date >= ГРАНИЦА_ЭПОХ);

    return {
      line: p,
      area: a,
      fomLine: f,
      years: ys,
      markers: ms,
      gaps,
      liveX: li < 0 ? null : x(li),
      eraX: ei <= 0 ? null : x(ei),
    };
  }, [data, lang, x, y]);

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
    <div className="relative w-full select-none">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        style={{ height: "clamp(360px, 42vw, 740px)", overflow: "visible" }}
        onPointerDown={(e) => {
          if (!вПоле(e.clientY)) return;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setHovering(true);
          pick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
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

        {years.map((yr) => (
          <g key={yr.year}>
            <line x1={yr.x} x2={yr.x} y1={PAD.t - 12} y2={H - PAD.b} stroke="var(--line)" opacity="0.5" />
            <text x={yr.x + 5} y={H - PAD.b + 19} fontSize="16" fill="var(--ink-3)" className="mono">
              ’{String(yr.year).slice(2)}
            </text>
          </g>
        ))}

        {/* ГРАНИЦА ЭПОХ. Левее прибор короче: ось укрытия применяется только
            с 2020 года и ранние недели не судит вовсе. Ранги по разные стороны
            не сравниваются, и это должно быть ВИДНО, а не только сказано. */}
        {eraX != null && (
          <g>
            <rect
              x={PAD.l}
              y={PAD.t - 12}
              width={eraX - PAD.l}
              height={H - PAD.b - PAD.t + 12}
              fill="var(--ink)"
              opacity="0.05"
            />
            <line x1={eraX} x2={eraX} y1={PAD.t - 12} y2={H - PAD.b} stroke="var(--ink-2)" strokeWidth="1.4" />
            <text x={eraX - 8} y={PAD.t + 6} fontSize="14" textAnchor="end" fill="var(--ink-3)">
              {T.eraEarly[lang]}
            </text>
            <text x={eraX + 8} y={PAD.t + 6} fontSize="14" fill="var(--ink-3)">
              {T.eraLate[lang]}
            </text>
          </g>
        )}

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
          const низ = LABEL_Y + 13;
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
                y={LABEL_Y - 13}
                width={m.wid}
                height={26}
                rx="13"
                fill={on ? "var(--accent-2)" : "var(--bg-2)"}
                stroke={on ? "var(--accent-2)" : "var(--line-strong)"}
                strokeWidth="1.2"
              />
              <text
                x={m.lx}
                y={LABEL_Y + 5}
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
      </svg>
    </div>
  );
}

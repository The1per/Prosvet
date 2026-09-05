import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Chart from "./components/Chart";
import People from "./components/People";
import Poll from "./components/Poll";
import { Breakdown, Methodology, Reads } from "./components/Panels";
import { BASELINE, LATEST, SERIES, ГРАНИЦА_ЭПОХ, местоВЭпохе, пикЭпохи } from "./data/series";
import { EVENT_BY_DATE } from "./data/events";
import { T, fmtWeek, type Lang } from "./i18n";
import { moodColor, moodGlow, levelIndex, moodT } from "./mood";
import { useCounter, useLocal, useReveal } from "./hooks";



export default function App() {
  const [prefs, setPrefs] = useLocal("pai.prefs.v1", { lang: "ru" as Lang });
  const [sel, setSel] = useState(SERIES.length - 1);
  const [showFom, setShowFom] = useState(true);
  // Пока посетитель ведёт ползунок опроса, отзываются силуэты и фигуры по
  // краям шкалы. ЧИСЛО И СВЕТ ЗА НИМ ВЕДЁТ ТОЛЬКО ПРИБОР: подменить показание
  // ответом посетителя значит показать ему его же ответ и выдать за измерение.
  const [preview, setPreview] = useState<number | null>(null);

  const lang = prefs.lang;
  const w = SERIES[sel];


  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = T.title[lang];
  }, [lang]);

  // Свет должен идти ИЗ-ЗА САМОЙ ЦИФРЫ, а не из доли экрана: доля разъезжается
  // на любой другой ширине окна. Поэтому место цифры измеряется, и её середина
  // становится точкой свечения. Слой при этом неподвижен относительно окна --
  // свет остаётся сверху, когда страницу листают вниз.
  const numRef = useRef<HTMLSpanElement>(null);
  const [gspot, setGspot] = useState({ x: 220, y: 420 });
  useLayoutEffect(() => {
    const мера = () => {
      const el = numRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setGspot({ x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY });
    };
    мера();
    window.addEventListener("resize", мера);
    return () => window.removeEventListener("resize", мера);
  }, []);

  const heroRef = useReveal<HTMLDivElement>();
  // 140 мс, а не полсекунды: при движении по графику число не должно
  // отставать от курсора -- иначе кажется, что оно не поспевает за неделей.
  const shown = useCounter(w.idx, 140);
  const delta = Math.round(((w.idx - BASELINE) / BASELINE) * 100);
  const level = T.levels[lang][levelIndex(w.idx)];
  // Свет за индексом ведёт ТОЛЬКО прибор. У опроса свой свет -- внутри его
  // карточки, и его ведёт ползунок: два разных показания не должны светить
  // одним и тем же цветом из одного места.
  // Пик и место считаются ВНУТРИ эпохи недели: до 2020-го прибор короче, и
  // ранжировать через эту границу нельзя. См. ГРАНИЦА_ЭПОХ в data/series.
  const ранняя = w.date < ГРАНИЦА_ЭПОХ;
  const пик = пикЭпохи(w.date);
  const место = местоВЭпохе(w.date);
  const glow = moodGlow(w.idx);
  const color = moodColor(w.idx, 6);

  const jumpTo = (d: string) => {
    const i = SERIES.findIndex((s) => s.date === d);
    if (i >= 0) setSel(i);
  };

  return (
    <div className="relative min-h-screen">
      {/* Свет НЕПОДВИЖЕН относительно окна: он начинается сверху от числа и
          остаётся с читателем, пока он листает. Раньше он был приклеен к
          самому числу и уезжал вместе с ним. */}
      <div
        className="glow-echo"
        aria-hidden
        style={{
          ["--g2" as string]: glow.mid,
          ["--g3" as string]: glow.far,
          ["--gx" as string]: `${gspot.x}px`,
        }}
      />
      <div
        className="numglow"
        aria-hidden
        style={{
          ["--g1" as string]: glow.core,
          ["--g2" as string]: glow.mid,
          ["--g3" as string]: glow.far,
          ["--gx" as string]: `${gspot.x}px`,
          ["--gy" as string]: `${gspot.y}px`,
          ["--gs" as string]: `${(1 + 0.3 * moodT(w.idx)).toFixed(2)}`,
        }}
      />
      <div className="grid-bg" />
      <div className="noise" />

      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 76%, transparent)" }}
      >
        <div className="mx-auto flex max-w-[1920px] items-center gap-3 px-2 py-2 sm:px-3">
          <Pulse idx={w.idx} />
          <h1 className="flex min-w-0 items-baseline gap-3 truncate text-[20px] font-bold tracking-tight sm:text-[26px]">
            {T.title[lang]}
            <span className="mono shrink-0 text-[16.5px] font-normal tracking-normal" style={{ color: "var(--ink-3)" }}>
              {T.badge[lang]}
            </span>
          </h1>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="btn mono px-3.5 py-1.5 text-[17px]" onClick={() => setPrefs({ ...prefs, lang: lang === "ru" ? "en" : "ru" })}>
              {lang === "ru" ? "EN" : "RU"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1920px] px-2 pb-10 pt-3 sm:px-3 sm:pt-4">
        {/* Заголовка над числом больше нет: страница открывается показанием.
            Кто такие «мы» и почему не спрашиваем -- сказано ниже, в разделе
            «как это измерено», где этому и место. */}
        {/* Колонки одной высоты: слабину забирает карточка опроса, поэтому
            график слева и разбор недели справа кончаются на одном уровне. */}
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div ref={heroRef} className="card reveal in flex h-full flex-col overflow-hidden p-4 sm:p-5">
            {/* СЕТКА, А НЕ РЯД БЛОКОВ. Верхняя строка -- цифра, строй людей и
                числа сравнения; нижняя -- их подписи. Пока это были блоки в
                flex, подпись из двух строк тянула строй вверх, и он переставал
                стоять вровень с цифрой; в сетке они выровнены по построению. */}
            <div className="mb-5 grid w-fit grid-cols-[392px_auto_124px_92px] items-end gap-x-10 gap-y-2">
              <div>
                <div className="text-[16px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
                  {sel === SERIES.length - 1 ? T.now[lang] : T.week[lang]}
                </div>
                <div className="flex items-end gap-2">
                  <span
                    ref={numRef}
                    className="mono text-[62px] font-bold leading-[0.86] sm:text-[82px]"
                    style={{ color, transition: "color 0.4s ease" }}
                  >
                    {shown.toFixed(1)}
                  </span>
                  <span className="whitespace-nowrap pb-3 text-[17px]" style={{ color: "var(--ink-2)" }}>
                    % · {level}
                  </span>
                </div>
              </div>

              <People idx={w.idx} lang={lang} preview={preview} part="строй" />

              <Kpi v={`${delta > 0 ? "+" : ""}${delta}%`} c={moodColor(w.idx, 6)} />
              <Kpi v={пик.idx.toFixed(1)} c="var(--accent)" />

              {/* Неделя и режим -- РАЗНЫМИ строками, и обе неподвижны.
                  «19—25 сентября 2022» и «28 февраля — 6 марта 2022» разной
                  длины, и в одну строку с режимом это тянуло весь ряд. Ширина
                  задана столбцом сетки, строка не переносится. */}
              <div className="mono self-start whitespace-nowrap">
                <div className="text-[21px] font-semibold" style={{ color: "var(--ink)" }}>
                  {fmtWeek(w.date, lang)}
                </div>
                <div className="mt-1 text-[17px]" style={{ color: "var(--ink-3)" }}>
                  {T.phase[lang]}: {T.phases[lang][w.phase]} · {T.placeInEra[lang](место.место, место.всего, ранняя)}
                </div>
              </div>

              <div className="self-start">
                <People idx={w.idx} lang={lang} preview={preview} part="подпись" />
              </div>

              <KpiLabel l={T.vsBaseline[lang]} />
              <KpiLabel l={`${T.peakEra[lang](ранняя)}, ${пик.date.slice(0, 4)}`} />
            </div>

            {/* Управление стоит НАД графиком: под ним его приходилось искать
                прокруткой, а легенда к кривой, до которой надо доскроллить,
                легенде не помощник. */}
            {/* Число опроса стоит рядом с кнопкой, которая его показывает:
                это одно и то же -- «сколько дал опрос» и «покажи опрос». */}
            <div className="mb-3 flex flex-wrap items-start gap-x-5 gap-y-3">
              <FomNumber fom={w.fom} idx={w.idx} lang={lang} />
              <div>
                <FomButton lang={lang} on={showFom} onToggle={() => setShowFom((s) => !s)} />
                {/* Легенда стоит ПОД своей кнопкой -- там пусто, а рядом она
                    растягивала строку. Место держит и когда выключена: иначе
                    нажатие сдвигало график на её высоту, и он скакал. */}
                <div className="mt-1.5" style={{ visibility: showFom ? "visible" : "hidden" }}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]" style={{ color: "var(--ink-3)" }}>
                    <span className="flex items-center gap-1.5">
                      <i className="inline-block h-3.5 w-3.5 rounded" style={{ background: "var(--cool)" }} />
                      {T.gapUp[lang]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="inline-block h-3.5 w-3.5 rounded" style={{ background: "var(--violet)" }} />
                      {T.gapDown[lang]}
                    </span>
                  </div>
                </div>
              </div>
              <EventSearch lang={lang} onPick={jumpTo} />
            </div>

            <Chart data={SERIES} lang={lang} sel={sel} onSel={setSel} showFom={showFom} />

            {/* Чтение недели -- сразу под кривой, в той же карточке: выбрал
                неделю, тут же видно, что на ней читали. Заодно левая колонка
                догоняет правую по высоте, и они кончаются вровень. */}
            {/* Плотно к оси: между подписями лет и заголовком чтения место
                было пустым. */}
            <div className="-mt-2 border-t pt-3.5" style={{ borderColor: "var(--line)" }}>
              <Reads w={w} lang={lang} />
            </div>
          </div>

          {/* Высоту ряда задаёт ТОЛЬКО левая карточка. Содержимое правой
              вынесено в абсолютный слой: иначе длинный разбор события тянул бы
              строку вниз, и страница меняла высоту от недели к неделе. Что не
              влезло -- прокручивается внутри разбора. */}
          <div className="relative min-h-0">
            <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden">
              <Poll weekDate={LATEST.date} lang={lang} onPreview={setPreview} />
              <div className="flex min-h-0 flex-1 flex-col">
                <Breakdown w={w} lang={lang} baseline={BASELINE} />
              </div>
            </div>
          </div>
        </section>


        <div className="mb-4 mt-10 flex items-center gap-3">
          <span className="mono text-[16.5px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-3)" }}>
            {T.scrollHint[lang]}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>
        <Methodology lang={lang} />

      </main>
    </div>
  );
}

/* ---------------- поиск по событию ---------------- */
function EventSearch({ lang, onPick }: { lang: Lang; onPick: (d: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const named = SERIES.filter((w) => w.note || EVENT_BY_DATE[w.date]).map((w) => ({
      d: w.date,
      n: EVENT_BY_DATE[w.date] ? (lang === "ru" ? EVENT_BY_DATE[w.date].ru : EVENT_BY_DATE[w.date].en) : w.note!,
    }));
    return named.filter((h) => h.n.toLowerCase().includes(s) || h.d.includes(s)).slice(0, 8);
  }, [q, lang]);

  return (
    <div ref={box} className="relative">
      <input
        className="mono rounded-full border px-5 py-2.5 text-[17px] outline-none"
        style={{ borderColor: "var(--line-strong)", background: "var(--card-2)", color: "var(--ink)", width: 420 }}
        placeholder={T.search[lang]}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 140)}
      />
      {open && q.trim() !== "" && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-[420px] overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-2)", boxShadow: "var(--shadow)" }}
        >
          {hits.length === 0 ? (
            <div className="px-4 py-2.5 text-[16px]" style={{ color: "var(--ink-3)" }}>
              {T.searchNone[lang]}
            </div>
          ) : (
            hits.map((h) => (
              <button
                key={h.d}
                className="block w-full px-4 py-2.5 text-left text-[16px]"
                style={{ background: "none", border: "none", color: "var(--ink)", cursor: "pointer" }}
                onMouseDown={() => {
                  onPick(h.d);
                  setQ("");
                  setOpen(false);
                }}
              >
                <span className="mono mr-2" style={{ color: "var(--ink-3)" }}>
                  {h.d.slice(0, 7)}
                </span>
                {h.n}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Кнопка кривой опроса с подсказкой, что такое ФОМ.
 *
 * Подсказка нужна именно здесь: без неё «ФОМ» -- три буквы, а на них держится
 * вся проверка прибора. Ссылка ведёт на источник, чтобы читатель мог посмотреть
 * тот же ряд своими глазами, а не верить нам на слово.
 */
function FomButton({ lang, on, onToggle }: { lang: Lang; on: boolean; onToggle: () => void }) {
  const [tip, setTip] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      {tip && (
        <div
          className="absolute top-[calc(100%+10px)] left-0 z-40 w-[380px] rounded-2xl border p-4 text-[16.5px] leading-relaxed"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-2)", color: "var(--ink-2)", boxShadow: "var(--shadow)" }}
        >
          {T.fomWhat[lang]}{" "}
          <a
            href="https://fom.ru/obshestvo/10946"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4"
            style={{ color: "var(--cool)" }}
          >
            fom.ru
          </a>
        </div>
      )}
      <button
        className="btn px-5 py-2.5 text-sm"
        data-on={on}
        onClick={onToggle}
        onFocus={() => setTip(true)}
        onBlur={() => setTip(false)}
      >
        {T.fomOn[lang]}
      </button>
    </div>
  );
}

/**
 * Число опроса той недели со знаком расхождения.
 *
 * ПОРОГ 5 ПУНКТОВ выбран по самим данным: медиана расхождения прибора и опроса
 * -- 3,6 пункта, в пределах пяти укладывается около трёх недель из пяти. Всё,
 * что внутри порога, -- согласие, и число стоит серым, без знака. Что вне --
 * расхождение, и треугольник показывает, в какую сторону: вверх, если опрос
 * выше прибора, вниз -- если ниже. Треугольник серый нарочно: он говорит про
 * направление, а цветом на этой странице сказано только про величину тревоги.
 */
const ПОРОГ_СОГЛАСИЯ = 5;

function FomNumber({ fom, idx, lang }: { fom: number | null; idx: number; lang: Lang }) {
  const d = fom == null ? 0 : fom - idx;
  const врозь = fom != null && Math.abs(d) >= ПОРОГ_СОГЛАСИЯ;
  // Место под стрелку держится ВСЕГДА: появляясь и пропадая, она сдвигала
  // всё, что правее, и строка дёргалась при переходе по неделям.
  return (
    <div className="flex items-center gap-2" title={fom == null ? T.fomNone[lang] : T.fomLabel[lang]}>
      {/* Ширина постоянна: прочерк вместо «69%» короче на треть, и без этого
          всё, что правее, съезжало на неделях без опроса. */}
      <span
        className="mono text-[40px] font-bold leading-none"
        style={{ color: "var(--ink-2)", width: 96, display: "inline-block" }}
      >
        {fom == null ? "—" : `${fom.toFixed(0)}%`}
      </span>
      <span className="flex w-[16px] shrink-0 justify-center">
        {врозь && (
          <span
            aria-label={d > 0 ? T.gapUp[lang] : T.gapDown[lang]}
            title={`${d > 0 ? "+" : ""}${d.toFixed(1)}`}
            style={{
              width: 0,
              height: 0,
              borderLeft: "7px solid transparent",
              borderRight: "7px solid transparent",
              [d > 0 ? "borderBottom" : "borderTop"]: "10px solid var(--ink-3)",
            }}
          />
        )}
      </span>
    </div>
  );
}

function Kpi({ v, c }: { v: string; c: string }) {
  return (
    <div className="mono whitespace-nowrap text-[30px] font-bold leading-none" style={{ color: c }}>
      {v}
    </div>
  );
}

function KpiLabel({ l }: { l: string }) {
  return (
    <div className="self-start text-[16.5px] leading-snug" style={{ color: "var(--ink-3)" }}>
      {l}
    </div>
  );
}

function Pulse({ idx }: { idx: number }) {
  const c = moodColor(idx, 6);
  const t = moodT(idx);
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <span className="absolute inset-0 rounded-full" style={{ background: c, opacity: 0.1 + 0.14 * t }} />
      <span
        className="absolute rounded-full"
        style={{ width: `${18 + 12 * t}px`, height: `${18 + 12 * t}px`, background: c, opacity: 0.22, animation: "pulse 3.4s ease-in-out infinite" }}
      />
      <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: c }} />
    </span>
  );
}

import type React from "react";
import { useState } from "react";
import { type Week } from "../data/series";
import { EVENT_BY_DATE } from "../data/events";
import { BASKET_LABEL, T, fmt, fmtWeek, type Lang } from "../i18n";
import { moodColor } from "../mood";
import { useReveal } from "../hooks";

/**
 * Тема недели -- ссылка на поиск по её названию.
 *
 * Названия у нас википедийные, и человеку, который видит «Военно-учётная
 * специальность» впервые, надо дать возможность посмотреть, что это такое,
 * не выходя из чтения страницы. Поиск, а не прямая ссылка в Википедию:
 * страница не утверждает, что читали именно её статью, и не хочет так
 * выглядеть.
 */
function Тема({ a, className, style }: { a: string; className?: string; style?: React.CSSProperties }) {
  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(a)}`}
      target="_blank"
      rel="noreferrer noopener"
      title={a}
      className={className}
      style={{ color: "inherit", textDecoration: "none", ...style }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
    >
      {a}
    </a>
  );
}

const BASKET_COLOR: Record<string, string> = {
  "рамка": "var(--cool)",
  "выживание": "var(--accent-2)",
  "конец света": "var(--accent)",
  "вера": "var(--violet)",
};

/* ---------------- Разбор недели ---------------- */
export function Breakdown({ w, lang, baseline }: { w: Week; lang: Lang; baseline: number }) {
  const ref = useReveal<HTMLDivElement>();
  const { alarm, popular } = w;
  const delta = Math.round(((w.idx - baseline) / baseline) * 100);
  const ev = EVENT_BY_DATE[w.date];


  return (
    <div ref={ref} className="card reveal in p-5 sm:p-6">
      {/* Дата ВСЕГДА справа и НИКОГДА не переносится: flex-nowrap и запрет
          переноса внутри. Съезжая под заголовок на длинных датах вроде
          «28 февраля — 6 марта 2022», она делала карточку то выше, то ниже. */}
      {/* Ниже 640 заголовок с датой ПЕРЕНОСИТСЯ: на экране 320 дата в одну
          строку с названием не помещалась и растягивала страницу вбок. Выше
          640 перенос по-прежнему запрещён -- там от него карточка меняла
          высоту от недели к неделе. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
        {/* Заголовок не обрезается: в суженном столбике «Разбор недели»
            превращалось в «Разбор неде…». Кегль чуть меньше, дата тоже --
            вдвоём они умещаются в строку целиком. */}
        <h3 className="shrink-0 whitespace-nowrap text-[18px] font-semibold">{T.breakdown[lang]}</h3>
        <span className="chip shrink whitespace-nowrap text-[13px]">{fmtWeek(w.date, lang)}</span>
      </div>

      {/* У обычной недели блока нет вовсе -- пустая рамка сверху ничего не
          сообщала. Высоту ряда задаёт левая карточка, поэтому его появление и
          исчезновение ничего больше не двигает. */}
      {ev && (
        <div
          className="mb-5 flex flex-col justify-center rounded-2xl border p-3.5"
          style={{ background: "var(--card-2)", borderColor: "var(--line)" }}
        >
          <>
            <div className="mb-1 flex flex-wrap items-baseline gap-2">
              <b className="text-[16.5px]">{lang === "ru" ? ev.ru : ev.en}</b>
              <span className="mono text-[17px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
                {T.fit[lang][ev.fit]}
              </span>
            </div>
            <p className="text-[17px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {lang === "ru" ? ev.whyRu : ev.whyEn}
            </p>
          </>
        </div>
      )}

      {/* vsMob -- это «во сколько РАЗ слабее мобилизации», а не проценты.
          В присланном виде оно печаталось как «+106 % к неделе мобилизации»:
          самая спокойная неделя выглядела вдвое тревожнее самой страшной. */}
      {/* Одна коробка в строку, а не две рядом: в половину ширины карточки
          подпись ломалась на три строки и коробка получалась выше числа. */}
      <div className="mb-5 space-y-2">
        <Stat
          big={`${delta > 0 ? "+" : ""}${delta}%`}
          label={delta >= 0 ? T.aboveNormal[lang] : T.belowNormal[lang]}
          color={moodColor(w.idx, 6)}
        />
        <Stat
          big={alarm.vsMob == null ? "1×" : `${Math.round(alarm.vsMob)}×`}
          label={alarm.vsMob == null ? T.isTheMob[lang] : T.weakerThanMob[lang]}
          color="var(--violet)"
        />
      </div>

      {/* Блока «о чём тревожились» здесь больше нет: те же статьи стоят под
          графиком, в разделе тревожного чтения, и повторять их в двух местах
          незачем. Освободившееся место отдано чтению нетревожному -- его,
          наоборот, нигде больше нет столько. */}
      {/* ЧТО ЧИТАЛИ ПОМИМО ТРЕВОЖНОГО -- с общим числом просмотров, как под
          графиком. Без этого разбор говорит только про страх, а неделя
          состоит не из него: тревога -- тонкий слой поверх обычной жизни, и
          этот слой надо видеть рядом с ним. */}
      <div className="border-t pt-4" style={{ borderColor: "var(--line)" }}>
        <div className="mb-3 text-[16px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
          {T.bgReads[lang]} · {fmt(popular.total, lang)} {T.viewsPlain[lang]}
        </div>
        <ol className="space-y-3">
          {popular.top.slice(0, 8).map((p, i) => (
            <li key={p.a}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[17.5px]">
                  <span className="mono mr-2.5 text-[16px]" style={{ color: "var(--ink-3)" }}>
                    {i + 1}
                  </span>
                  <Тема a={p.a} className="underline-offset-4" />
                </span>
                <span className="mono shrink-0 text-[16px]" style={{ color: "var(--ink-2)" }}>
                  {fmt(p.n, lang)}
                </span>
              </div>
              <div className="bar mt-1.5" style={{ height: 5 }}>
                <i
                  style={{
                    width: `${Math.max(8, (p.n / Math.max(1, popular.top[0]?.n ?? 1)) * 100)}%`,
                    background: "var(--line-strong)",
                  }}
                />
              </div>
            </li>
          ))}
          {popular.top.length === 0 && (
            <li className="text-[16.5px]" style={{ color: "var(--ink-3)" }}>
              {T.plainTopNone[lang]}
            </li>
          )}
        </ol>
      </div>

    </div>
  );
}

function Stat({ big, label, color }: { big: string; label: string; color: string }) {
  return (
    // Высота закреплена: подписи в этих коробках разной длины («слабее недели
    // мобилизации» против «это и есть самая тревожная неделя»), и без этого
    // карточка меняла высоту при переходе на неделю мобилизации.
    <div className="flex h-[62px] items-center gap-3 rounded-2xl border px-3.5" style={{ borderColor: "var(--line)", background: "var(--card-2)" }}>
      <div className="mono shrink-0 text-[23px] font-bold leading-none" style={{ color }}>
        {big}
      </div>
      <div className="text-[17px] leading-tight" style={{ color: "var(--ink-3)" }}>
        {label}
      </div>
    </div>
  );
}

/* ---------------- Что читали ---------------- */
export function Reads({ w, lang }: { w: Week; lang: Lang }) {
  const ref = useReveal<HTMLDivElement>();
  const { alarm } = w;

  // ТРЕВОЖНОЕ ЧТЕНИЕ -- это превышение по темам, а не топ недели. Поле reads
  // в данных содержит просто самые читаемые статьи, и подписать их «тревожным
  // чтением» значило бы соврать: у мобилизации там стоит умерший актёр.
  const темы = alarm.baskets
    .flatMap((b) => b.items.map((it) => ({ a: it[0], n: it[1], k: b.k })))
    .sort((x, y) => y.n - x.n)
    .slice(0, 5);
  const maxA = Math.max(...темы.map((r) => r.n), 1);

  return (
    // Без класса card: блок живёт ВНУТРИ карточки графика, и своя рамка
    // делала бы из него карточку в карточке.
    <div ref={ref} className="reveal in">
      {/* Во всю ширину список из пяти строк растягивался бы на полтора метра
          ради числа «79». Поэтому пять плиток в ряд: то же горизонтально, но
          длина полоски остаётся соразмерной числу. */}
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[20px] font-semibold">{T.readsTitle[lang]}</h3>
        <div className="text-[16px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
          {T.alarmReads[lang]} · {fmt(alarm.total, lang)} {T.views[lang]}
        </div>
      </div>
      {/* Пять мест всегда, даже если тем меньше: иначе ряд плиток то короче,
          то длиннее, и соседние блоки едут при каждом переходе на другую
          неделю. */}
      <div className="mb-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => темы[i]).map((r, i) =>
          !r ? (
            <div
              key={"пусто" + i}
              className="rounded-2xl border border-dashed"
              style={{ borderColor: "var(--line)", minHeight: 108 }}
            />
          ) : (
            <div key={r.a} className="rounded-2xl border p-3" style={{ borderColor: "var(--line)", background: "var(--card-2)", minHeight: 108 }}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="mono text-[17px]" style={{ color: "var(--ink-3)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mono text-[17px] font-bold" style={{ color: BASKET_COLOR[r.k] }}>
                  {fmt(r.n, lang)}
                </span>
              </div>
              <div className="mb-2 truncate text-[16.5px]">
                <Тема a={r.a} className="underline-offset-4" />
              </div>
              <div className="bar" style={{ height: 4 }}>
                <i style={{ width: `${(r.n / maxA) * 100}%`, background: BASKET_COLOR[r.k] }} />
              </div>
              <div className="mt-2 text-[17px]" style={{ color: "var(--ink-3)" }}>
                {BASKET_LABEL[r.k][lang].name}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Фоновое чтение отсюда убрано: оно целиком переехало в разбор недели
          справа, где ему хватает места на список с числами. Здесь остаётся
          только тревожное -- то, ради чего прибор и сделан. */}
    </div>
  );
}

/* ---------------- Методология ---------------- */
/**
 * Кусок текста между двумя парами звёздочек -- жирный. Полноценный markdown
 * тут не нужен: выделяется ровно одно -- названия тем, на которые прибор
 * отзывается, и они должны цепляться взглядом в сплошном абзаце.
 */
function Жирным({ t }: { t: string }) {
  return (
    <>
      {t.split("**").map((кусок, i) =>
        i % 2 ? (
          <b key={i} style={{ color: "var(--ink)" }}>
            {кусок}
          </b>
        ) : (
          <span key={i}>{кусок}</span>
        ),
      )}
    </>
  );
}

export function Methodology({ lang }: { lang: Lang }) {
  const ref = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(0);
  const steps = T.steps[lang];
  return (
    <div ref={ref} id="как-измерено" className="reveal grid gap-4 lg:grid-cols-[1.15fr_.85fr] scroll-mt-16">
      <div className="card p-5 sm:p-7">
        <div className="chip mb-3">{T.method[lang]}</div>
        <h3 className="mb-5 max-w-xl text-xl font-semibold leading-snug sm:text-2xl">{T.methodLead[lang]}</h3>
        <div>
          {steps.map((s, i) => (
            <button
              key={s.t}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full cursor-pointer py-3 text-left"
              style={{ borderTop: i ? "1px solid var(--line)" : "none", background: "none", border: "none", borderTopWidth: i ? 1 : 0, borderTopStyle: "solid", borderTopColor: "var(--line)", color: "inherit" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[16.5px] font-medium">{s.t}</span>
                <span
                  className="mono text-lg leading-none transition-transform"
                  style={{ color: "var(--ink-3)", transform: open === i ? "rotate(45deg)" : "none" }}
                >
                  +
                </span>
              </div>
              <div className="grid transition-all duration-500" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="pt-2 text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                    <Жирным t={s.d} />
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 sm:p-7">
        <div className="chip mb-3">{T.limits[lang]}</div>
        <ul className="space-y-3">
          {T.limitList[lang].map((l) => (
            <li key={l} className="flex gap-3 text-[16px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              <span style={{ color: "var(--accent)" }}>—</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Poles from "./Poles";
import ProfileForm from "./Profile";
import { moodColor } from "../mood";
import { SERIES } from "../data/series";
import { СБОР_ВКЛЮЧЁН, отправить, type Сводка } from "../answers";
import { T, fmtDate, type Lang } from "../i18n";

/**
 * Опрос посетителя.
 *
 * СРАВНЕНИЯ С ПРИБОРОМ ЗДЕСЬ НЕТ, И ЭТО НАРОЧНО. Прибор показывает ПРОШЕДШУЮ
 * неделю -- ту, по которой уже вышел опрос ФОМа. Человек, читающий страницу,
 * живёт в следующей. Поставить рядом «вы сказали 61, прибор говорит 47» значит
 * сравнить разные недели и выдать это за расхождение.
 *
 * Ползунок ведёт не только цвет, но и обе фигуры по краям, и десять силуэтов
 * слева: страница отзывается на движение руки, пока её ведут.
 */

/**
 * С ЧЕМ СРАВНИТЬ ОТВЕТ ПОСЕТИТЕЛЯ.
 *
 * Не с прибором: прибор показывает ПРОШЕДШУЮ неделю, ту, по которой уже вышел
 * опрос, а человек отвечает про текущую. Зато с историей самого опроса
 * сравнить можно честно: у нас есть 302 недели, по которым ФОМ публиковал
 * ответ на этот же вопрос. Отсюда и мера -- сколько из этих недель были
 * спокойнее, чем сказал посетитель.
 */
const ОПРОСЫ = SERIES.map((w) => w.fom).filter((v): v is number => v != null).sort((a, b) => a - b);

function долиНиже(v: number): number {
  let n = 0;
  while (n < ОПРОСЫ.length && ОПРОСЫ[n] < v) n++;
  return Math.round((n / ОПРОСЫ.length) * 100);
}

type Answers = Record<string, { v: number; at: number }>;
// v2: ключ поднят нарочно -- это сброс сохранённых ответов. Прежний ответ
// остаётся лежать в браузере, но страница его больше не читает, и опрос снова
// показывается целиком.
const KEY = "pai.answers.v2";

/**
 * Отладочный переключатель, в работе всегда выключен. Когда включён, опрос
 * забывает ответ при каждой загрузке страницы -- это нужно, чтобы видеть форму,
 * а не только её результат. Ответы при этом всё равно отправляются, просто не
 * читаются обратно, и доп. вопросы задаются заново.
 *
 * На опубликованной странице должно стоять false: иначе посетителя спрашивают
 * об одной и той же неделе при каждом заходе.
 */
const СБРАСЫВАТЬ_ПРИ_ЗАГРУЗКЕ = false;

/** Доля посетителей, ответивших спокойнее, по гистограмме десятков. */
function доляНиже(buckets: number[], v: number): number {
  const мой = Math.min(9, Math.max(0, Math.floor(v / 10)));
  const ниже = buckets.slice(0, мой).reduce((a, b) => a + b, 0);
  const всего = buckets.reduce((a, b) => a + b, 0);
  return всего ? Math.round((ниже / всего) * 100) : 0;
}

function load(): Answers {
  if (СБРАСЫВАТЬ_ПРИ_ЗАГРУЗКЕ) return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Answers;
  } catch {
    return {};
  }
}

export default function Poll({
  weekDate,
  lang,
  onPreview,
  phone = false,
}: {
  weekDate: string;
  lang: Lang;
  /** Значение ползунка наверх, пока его ведут: силуэты у числа отзываются. */
  onPreview?: (v: number | null) => void;
  /**
   * Телефонный вид: высота не закреплена, а заголовок сворачивает карточку.
   * Закреплять высоту тут нельзя -- на телефоне опрос стоит между графиком и
   * чтением недели, и пустой воздух под ним пришлось бы пролистывать. А
   * сворачивание нужно тому, кто уже ответил или отвечать не хочет: иначе
   * опрос стоит поперёк дороги к разбору.
   */
  phone?: boolean;
}) {
  const [открыт, setОткрыт] = useState(true);
  const [answers, setAnswers] = useState<Answers>(load);
  const [value, setValue] = useState(50);
  const [editing, setEditing] = useState(false);
  const [askMore, setAskMore] = useState(false);
  // Сводка приходит в ответ на отправку. Если сбор не настроен -- её нет, и
  // страница ведёт себя ровно как раньше.
  const [сводка, setСводка] = useState<Сводка | null>(null);

  const mine = answers[weekDate];
  const answered = !!mine && !editing;
  const color = moodColor(value, 6);
  // Что светит: пока ведут ползунок -- его значение, после ответа -- ответ.
  const показ = mine && !editing ? mine.v : value;

  useEffect(() => {
    setEditing(false);
    setValue(answers[weekDate]?.v ?? 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDate]);

  const submit = () => {
    const next = { ...answers, [weekDate]: { v: value, at: Date.now() } };
    setAnswers(next);
    setEditing(false);
    onPreview?.(null);
    let asked = false;
    try {
      asked = !СБРАСЫВАТЬ_ПРИ_ЗАГРУЗКЕ && !!localStorage.getItem("pai.profile.v2");
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    if (!asked) setAskMore(true);
    void отправить({ value }).then(setСводка);
  };

  const past = useMemo(
    () =>
      Object.entries(answers)
        .filter(([d]) => d !== weekDate)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .slice(0, 6),
    [answers, weekDate],
  );

  return (
    // ВЫСОТА ЗАКРЕПЛЕНА, И ЭТО ГЛАВНОЕ. Доп-вопросы показываются в том же
    // окне, вместо ответа, и разложены вбок -- чтобы влезть в ту же высоту.
    // Иначе ответ удлинял страницу на три сотни пикселей. Прокрутка внутри --
    // страховка на случай очень узкого окна, а не способ показать форму.
    // Высота ПОСТОЯННАЯ и равна наибольшему, что здесь бывает, -- виду с
    // доп-вопросами. Прокрутки внутри поэтому нет никогда, а до ответа внизу
    // остаётся воздух. Строку ряда задаёт левая карточка, так что и то, и
    // другое страницу не двигает.
    <div
      className={
        "card relative flex flex-col overflow-hidden " +
        (phone ? "p-4" : "h-[548px] flex-none p-5 pb-6 sm:p-6 sm:pb-6")
      }
    >
      {/* СВЕТ ОПРОСА идёт от точки бегунка и едет вместе с ним, а после ответа
          ОСТАЁТСЯ на месте ответа: он показывает, что человек сказал. Живёт в
          карточке, а не внутри ползунка, — иначе исчезал бы вместе с ним.
          Свет индекса ведёт прибор, и смешивать их нельзя: это два разных
          показания. */}
      <div
        className="pollglow"
        aria-hidden
        style={{
          ["--pg" as string]: moodColor(показ, 8, 0.55),
          ["--pg2" as string]: moodColor(показ, 2, 0.26),
          ["--pos" as string]: `${18 + показ * 0.64}%`,
        }}
      />
      {/* Название -- в верхнем углу панели; всё остальное содержимое стоит
          по центру оставшейся высоты. */}
      {phone ? (
        <button
          type="button"
          onClick={() => setОткрыт((o) => !o)}
          aria-expanded={открыт}
          className="chip relative flex w-full items-center justify-between"
          style={{ background: "none", cursor: "pointer" }}
        >
          <span>{T.poll[lang]}</span>
          {/* Галочка вниз -- открыто, вправо -- закрыто. Поворотом, а не двумя
              значками: так видно, что это одно и то же место. */}
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden
               style={{ transform: открыт ? "rotate(90deg)" : "none", transition: "transform .18s ease" }}>
            <path d="M4 2 L10 7 L4 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="chip relative self-start">{T.poll[lang]}</div>
      )}

      {(!phone || открыт) && (
        <>
      <div className="relative flex flex-1 flex-col justify-center">
        <p className="text-[18.5px] leading-snug" style={{ color: "var(--ink)" }}>
          {T.pollQ[lang]}
        </p>

      {!answered ? (
        <>
          {/* Фигуры НАД ползунком, подписи ПОД ним, сам он во всю ширину:
              так шкала читается как шкала, а не как строка с картинками по
              краям. */}
          <div className="mt-7 flex items-end justify-between">
            <Poles kind="calm" color={color} title={T.calm[lang]} live={value < 45} />
            <Poles kind="chaos" color={color} title={T.panic[lang]} live={value >= 70} />
          </div>

          <div className="relative mt-2">
            <input
              className="pai"
              style={{
                // Дорожка красится САМИМ ОТВЕТОМ: слева -- цвет выбранного
                // уровня, справа -- пустая шкала. Радуга под ползунком
                // показывала цвета, к ответу отношения не имеющие.
                ["--fill" as string]: color,
                ["--pos" as string]: `${value}%`,
                position: "relative",
                zIndex: 1,
              }}
              type="range"
              min={0}
              max={100}
              value={value}
              aria-label={T.pollQ[lang]}
              onChange={(e) => {
                const v = +e.target.value;
                setValue(v);
                onPreview?.(v);
              }}
              onPointerUp={() => onPreview?.(null)}
              onBlur={() => onPreview?.(null)}
            />
          </div>

          <div className="mt-1 flex items-baseline justify-between">
            <span className="mono text-[16px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
              {T.calm[lang]}
            </span>
            <span className="mono text-[16px] uppercase tracking-wider" style={{ color }}>
              {T.panic[lang]}
            </span>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button className="btn px-6 py-2.5 text-[16.5px]" data-on={true} onClick={submit}>
              {T.save[lang]}
            </button>
            <span className="mono text-[19px] font-semibold" style={{ color: "var(--ink-2)" }}>
              {fmtDate(weekDate, lang)}
            </span>
          </div>
        </>
      ) : (
        <div className="mt-4">
          {askMore ? (
            <div className="-mt-2">
              <p className="text-[16.5px] leading-snug">{T.thanks[lang]}</p>
              <ProfileForm lang={lang} onDone={() => setAskMore(false)} />
            </div>
          ) : (
        <>
          <div className="mono text-[17px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
            {T.youSaid[lang]}
          </div>
          <div className="mono mt-1 text-4xl font-bold leading-none" style={{ color: moodColor(mine!.v, 6) }}>
            {mine!.v}
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--card-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${mine!.v}%`, background: moodColor(mine!.v, 6) }}
            />
          </div>

          {/* При двух-трёх ответах доля ничего не значит, но и молчать нельзя:
              человек ответил и вправе знать, что ответ дошёл. Поэтому до пяти
              ответов говорим, сколько их, и прямо признаём, что сравнивать рано. */}
          {сводка && (
            <p className="mt-3 text-[16.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {сводка.total >= 5
                ? T.youVsVisitors[lang](сводка.total, доляНиже(сводка.buckets, mine!.v))
                : T.youFewVisitors[lang](сводка.total)}
            </p>
          )}
          <p className="mt-4 text-[16.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
            {T.youVsHistory[lang](
              долиНиже(mine!.v),
              ОПРОСЫ.length,
              mine!.v > ОПРОСЫ[ОПРОСЫ.length - 1] ? "выше" : mine!.v < ОПРОСЫ[0] ? "ниже" : null,
              ОПРОСЫ[0],
              ОПРОСЫ[ОПРОСЫ.length - 1],
            )}
          </p>
        </>
          )}
        </div>
      )}

        <p className="mono mt-4 text-[15px] leading-snug" style={{ color: "var(--ink-3)" }}>
          {СБОР_ВКЛЮЧЁН ? T.privacySent[lang] : T.privacyLocal[lang]}
        </p>
      </div>

      {past.length > 0 && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <div className="mono text-[17px] uppercase tracking-[0.14em]" style={{ color: "var(--ink-3)" }}>
            {T.yourPast[lang]}
          </div>
          <div className="mono mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[16px]" style={{ color: "var(--ink-2)" }}>
            {past.map(([d, a]) => (
              <span key={d}>
                {fmtDate(d, lang)} — <b style={{ color: moodColor(a.v, 6) }}>{a.v}</b>
              </span>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

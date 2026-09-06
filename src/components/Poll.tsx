import { useEffect, useMemo, useState } from "react";
import Poles from "./Poles";
import ProfileForm from "./Profile";
import { moodColor } from "../mood";
import { SERIES } from "../data/series";
import { отправить, type Сводка } from "../answers";
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

/**
 * `нет` -- ответ сохранён в браузере, но НА СЕРВЕР НЕ УШЁЛ.
 *
 * Зачем помечать. Опрос запоминал ответ независимо от того, дошёл он или нет.
 * Дальше страница показывала «Ваш ответ» вместо ползунка, и человек, у
 * которого отправка не удалась, больше никогда её не повторял: нажимать было
 * не на что. Так вышло, что месяц собирался ноль ответов при исправном
 * сервере -- домен сайта не значился среди разрешённых, браузер запрос не
 * выпускал, а страница обо всех этих ответах считала, что они отданы.
 *
 * Теперь неотданный ответ помечен и отправляется заново при следующем
 * открытии страницы -- но только если он сделан СЕГОДНЯ. Сутки для правила
 * «один ответ в день» сервер считает по своим часам, и вчерашний ответ,
 * досланный сегодня, лёг бы сегодняшним числом. Это была бы уже не починка
 * связи, а подделка даты.
 */
type Answers = Record<string, { v: number; at: number; нет?: true }>;
// v2: ключ поднят нарочно -- это сброс сохранённых ответов. Прежний ответ
// остаётся лежать в браузере, но страница его больше не читает, и опрос снова
// показывается целиком.
/**
 * ОДНОРАЗОВЫЙ СБРОС ЗАПРЕТА, 6 сентября 2026. Ключ поднят с v2 на v3.
 *
 * Причина не в разметке, а в том, что до этого дня ответы НЕ ЗАПИСЫВАЛИСЬ
 * вовсе: функция записи слала в базу поля, которых в базе ещё не было, и
 * каждая попытка кончалась ошибкой -- молча, потому что страница о своей
 * неудаче посетителю не сообщает. Люди отвечали, браузер честно запоминал
 * «этот уже ответил», а на сервере не оставалось ничего.
 *
 * Поэтому запрет снимается один раз со всех: прежние ответы остаются лежать в
 * браузере под старым ключом, страница их больше не читает, и опрос
 * показывается целиком. Дальше правило «один ответ в сутки» работает как
 * обычно -- сброс разовый, а не отмена правила.
 */
const KEY = "pai.answers.v3";

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

/** Недели, чей неотданный ответ уже досылали в этом сеансе. */
const досланные = new Set<string>();

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
  onFinished,
}: {
  weekDate: string;
  lang: Lang;
  /** Значение ползунка наверх, пока его ведут: силуэты у числа отзываются. */
  onPreview?: (v: number | null) => void;
  /**
   * Телефонный вид: высота не закреплена. Закреплять её тут нельзя -- на
   * телефоне опрос живёт в выдвижной панели, и закреплённая высота означала бы
   * пустой воздух под ответом.
   */
  phone?: boolean;
  /**
   * Опрос пройден: ответ отправлен и доп-вопросы либо отвечены, либо
   * пропущены. На телефоне по этому сигналу панель задвигается обратно.
   */
  onFinished?: () => void;
}) {
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

  // ДОСЫЛКА НЕОТДАННОГО ОТВЕТА, один раз при открытии страницы.
  // Только сегодняшнего: см. пояснение у типа Answers. Тихо -- посетителю про
  // наши неудачи знать незачем, он свой ответ уже дал.
  useEffect(() => {
    const о = answers[weekDate];
    // Один раз за сеанс на неделю: без этого сторожа досылка уходила дважды --
    // второй раз сервер отвечал «уже», и лишний запрос был безвреден, но
    // бессмыслен.
    if (!о?.нет || досланные.has(weekDate)) return;
    досланные.add(weekDate);
    const сегодня = new Date().toDateString() === new Date(о.at).toDateString();
    if (!сегодня) return;
    void отправить({ value: о.v }).then((с) => {
      if (с) {
        setСводка(с);
        пометить(weekDate, false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDate]);

  const submit = () => {
    const next = { ...answers, [weekDate]: { v: value, at: Date.now() } };
    setAnswers(next);
    setEditing(false);
    onPreview?.(null);
    let asked = false;
    try {
      asked = !СБРАСЫВАТЬ_ПРИ_ЗАГРУЗКЕ && !!localStorage.getItem("pai.profile.v3");
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
    if (!asked) setAskMore(true);
    else onFinished?.(); // доп-вопросы уже задавали -- на этом всё
    void отправить({ value }).then((с) => {
      setСводка(с);
      пометить(weekDate, с == null);
    });
  };

  /** Пометить сохранённый ответ как неотданный -- или снять пометку. */
  const пометить = (день: string, неотдан: boolean) => {
    try {
      const с = JSON.parse(localStorage.getItem(KEY) || "{}") as Answers;
      if (!с[день]) return;
      if (неотдан) с[день].нет = true;
      else delete с[день].нет;
      localStorage.setItem(KEY, JSON.stringify(с));
    } catch {
      /* noop */
    }
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
      <div className="chip relative mb-2 self-start">{T.poll[lang]}</div>

      <div className="relative flex flex-1 flex-col justify-center">
        <p className="text-[18.5px] leading-snug" style={{ color: "var(--ink)" }}>
          {T.pollQ[lang]}
        </p>

      {!answered ? (
        <>
          {/* Зачем отвечать -- сразу под вопросом. Не приписка внизу: человек
              решает, двигать ли ручку, здесь, а не после ответа. */}
          <p className="mt-2 text-[16px] leading-snug" style={{ color: "var(--ink-2)" }}>
            {T.pollCall[lang]}
          </p>
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
              <ProfileForm lang={lang} onDone={() => { setAskMore(false); onFinished?.(); }} />
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
    </div>
  );
}

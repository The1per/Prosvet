import { useState } from "react";
import { T, type Lang } from "../i18n";

/**
 * ФОРМА ОБРАТНОЙ СВЯЗИ.
 *
 * ЗАЧЕМ ФОРМА, А НЕ ТОЛЬКО АДРЕС. Письмо с телефона не напишет почти никто:
 * надо выйти из страницы, открыть почту, вспомнить, о какой неделе речь. Форма
 * же САМА прикладывает обстановку -- какая неделя открыта и какой вид графика,
 * -- а без этого половина отзывов звучит как «у вас тут неверно», и непонятно,
 * где именно.
 *
 * ВИД -- ТОТ ЖЕ, ЧТО У ОПРОСА: та же карточка, тот же зов плашкой, та же
 * кнопка. Это одно и то же действие с точки зрения посетителя -- сказать нам
 * что-то, -- и выглядеть оно должно одинаково.
 *
 * ЧТО УХОДИТ: текст, необязательное «куда ответить», обстановка, язык и номер
 * гостя -- тот же случайный номер браузера, что у опроса. Ни IP, ни чего-либо
 * личного (functions/api/otzyv.ts).
 */

/** Тот же номер браузера, что у опроса: случайный, придуман им самим. */
function номерГостя(): string {
  const КЛЮЧ = "pai.гость";
  try {
    const был = localStorage.getItem(КЛЮЧ);
    if (был) return был;
    const новый = crypto.randomUUID?.() ?? String(Math.random()).slice(2) + Date.now();
    localStorage.setItem(КЛЮЧ, новый);
    return новый;
  } catch {
    return "";
  }
}

type Состояние = "пишет" | "шлёт" | "дошло" | "не ушло" | "много";

export default function Otzyv({
  lang,
  phone = false,
  обстановка,
}: {
  lang: Lang;
  phone?: boolean;
  /** Что было на экране: неделя и вид. Уходит вместе с текстом. */
  обстановка: string;
}) {
  const [текст, setТекст] = useState("");
  const [связь, setСвязь] = useState("");
  const [приманка, setПриманка] = useState("");
  const [как, setКак] = useState<Состояние>("пишет");

  const отправить = async () => {
    if (текст.trim().length < 3 || как === "шлёт") return;
    setКак("шлёт");
    try {
      const r = await fetch("/api/otzyv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          текст, связь, приманка, обстановка, язык: lang, гость: номерГостя(),
        }),
      });
      const д = await r.json().catch(() => ({}));
      if (r.ok && д?.ок) {
        setКак("дошло");
        setТекст("");
        setСвязь("");
        /* ПАНЕЛЬ САМА НЕ ЗАКРЫВАЕТСЯ (решение хозяина). Прежде она уезжала
           через две с половиной секунды после «дошло» -- то есть выдёргивалась
           из-под руки у того, кто ещё читал ответ или собирался дописать. Закрыть
           её есть чем: крестик на карточке и нажатие мимо неё. */
      } else if (r.status === 429) {
        setКак("много");
      } else {
        console.warn("[отзыв] не записан:", r.status, д);
        setКак("не ушло");
      }
    } catch (e) {
      console.warn("[отзыв] запрос не ушёл:", e);
      setКак("не ушло");
    }
  };

  const кегль = phone ? "text-[18px]" : "text-[16.5px]";
  /** Есть ли что отправлять. Одно место на кнопку, её вид и подпись рядом. */
  const готов = текст.trim().length >= 3;

  return (
    <div className={"card relative flex flex-col " + (phone ? "p-5" : "p-5 sm:p-6")}>
      <div className="chip mb-3 self-start">{T.fbChip[lang]}</div>

      <p className={(phone ? "text-[21px]" : "text-[18.5px]") + " leading-snug"} style={{ color: "var(--ink)" }}>
        {T.fbQ[lang]}
      </p>
      <p className={"mt-2 leading-snug " + кегль} style={{ color: "var(--ink-2)" }}>
        {T.fbHint[lang]}
      </p>
      {/* Вторая строка отдельным абзацем: приглашение предложить своё не должно
          тонуть в перечислении того, что годится. */}
      <p className={"mt-1 leading-snug " + кегль} style={{ color: "var(--ink-2)" }}>
        {T.fbHint2[lang]}
      </p>

      {как === "дошло" ? (
        <p className={"mt-5 leading-relaxed " + кегль} style={{ color: "var(--ink)" }}>
          {T.fbThanks[lang]}
        </p>
      ) : (
        <>
          <textarea
            className={"mt-4 w-full resize-none rounded-xl border px-3 py-2 leading-snug " + кегль}
            style={{
              borderColor: "var(--line-strong)",
              background: "var(--bg-2)",
              color: "var(--ink)",
              minHeight: phone ? 150 : 130,
            }}
            maxLength={2000}
            value={текст}
            placeholder={T.fbPlaceholder[lang]}
            onChange={(e) => setТекст(e.target.value)}
          />
          {/* ПРИМАНКА: поля этого человек не видит и не заполняет, а бот
              заполняет всё подряд. Прячется не display:none -- часть ботов его
              проверяет, -- а выносом за край. */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            value={приманка}
            onChange={(e) => setПриманка(e.target.value)}
            style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
          />
          <input
            className={"mt-2 w-full rounded-xl border px-3 py-2 " + кегль}
            style={{
              borderColor: "var(--line)",
              background: "var(--bg-2)",
              color: "var(--ink)",
            }}
            maxLength={200}
            value={связь}
            placeholder={T.fbContact[lang]}
            onChange={(e) => setСвязь(e.target.value)}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              className={"btn " + (phone ? "px-7 py-3 text-[20px]" : "px-6 py-2.5 text-[18.5px]")}
              data-on={готов}
              disabled={!готов || как === "шлёт"}
              /* ВЫКЛЮЧЕННАЯ КНОПКА ДОЛЖНА ВЫГЛЯДЕТЬ ВЫКЛЮЧЕННОЙ. Прежде она
                 была неотличима от рабочей: пустое окно -- нажатие молча не
                 делает ничего, и человек решает, что сломан сайт. Ровно на это
                 и пожаловался хозяин. */
              style={готов ? undefined : { opacity: 0.45, cursor: "default" }}
              onClick={отправить}
            >
              {как === "шлёт" ? T.fbSending[lang] : T.fbSend[lang]}
            </button>
            {/* И СКАЗАТЬ, ПОЧЕМУ НЕ ЖМЁТСЯ. Молчащая кнопка -- худший род
                поломки: она не отличима от настоящей. */}
            {!готов && (
              <span className={"leading-snug " + кегль} style={{ color: "var(--ink-3)" }}>
                {T.fbShort[lang]}
              </span>
            )}
          </div>
          {/* ОТКАЗ -- СВОЕЙ СТРОКОЙ И ЦВЕТОМ, а не приписка сбоку от кнопки:
              сбоку её не замечают, и «ничего не произошло» повторяется. */}
          {(как === "не ушло" || как === "много") && (
            <p
              className={"mt-3 leading-snug " + кегль}
              style={{ color: "var(--accent-2)" }}
            >
              {как === "много" ? T.fbMany[lang] : T.fbFail[lang]}
            </p>
          )}
        </>
      )}
    </div>
  );
}

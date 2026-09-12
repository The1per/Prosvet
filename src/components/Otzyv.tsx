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
  onFinished,
}: {
  lang: Lang;
  phone?: boolean;
  /** Что было на экране: неделя и вид. Уходит вместе с текстом. */
  обстановка: string;
  /** Отзыв принят -- панель можно закрыть (на телефоне закрывает её сама). */
  onFinished?: () => void;
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
        // Панель закрывается не сразу: человеку надо успеть прочесть «дошло».
        setTimeout(() => onFinished?.(), 2600);
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

  return (
    <div className={"card relative flex flex-col " + (phone ? "p-5" : "p-5 sm:p-6")}>
      <div className="chip mb-3 self-start">{T.fbChip[lang]}</div>

      <p className={(phone ? "text-[21px]" : "text-[18.5px]") + " leading-snug"} style={{ color: "var(--ink)" }}>
        {T.fbQ[lang]}
      </p>
      <p className={"mt-2 leading-snug " + кегль} style={{ color: "var(--ink-2)" }}>
        {T.fbHint[lang]}
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
              data-on={текст.trim().length >= 3}
              disabled={текст.trim().length < 3 || как === "шлёт"}
              onClick={отправить}
            >
              {как === "шлёт" ? T.fbSending[lang] : T.fbSend[lang]}
            </button>
            {(как === "не ушло" || как === "много") && (
              <span className={"leading-snug " + кегль} style={{ color: "var(--ink-2)" }}>
                {как === "много" ? T.fbMany[lang] : T.fbFail[lang]}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { anxiousOfTen, moodColor, moodT } from "../mood";
import { FLOOR_FOM } from "../data/series";
import type { Lang } from "../i18n";

/**
 * Десять силуэтов, заливаемых СБОКУ, слева направо.
 *
 * Индекс приведён к шкале опроса -- доле тех, у кого настроение вокруг
 * тревожное. Поэтому idx/10 читается прямо: столько человек из десяти.
 * Дробная часть заливает последнего наполовину, а не округляется: округление
 * прибавило бы точности, которой у прибора нет.
 *
 * НЕЗАЛИТЫЕ ВИДНЫ ВСЕГДА. Если их не рисовать, десятка выглядит как пятёрка и
 * пропадает сама мысль «из десяти».
 *
 * ПОЛ. Скобка внизу отмечает, сколько человек называют настроение вокруг
 * тревожным ДАЖЕ в самую спокойную неделю за всё время опроса. Это не
 * оформление, а измеренное свойство опроса: ниже 3,2 из 10 страна не
 * опускалась ни разу. Скобка кончается ровно на 3,2, а не «около трёх».
 *
 * ДРОЖЬ начинается с 70 -- это потолок всего, что опрос когда-либо показывал.
 * Ниже 45 -- ровное дыхание. Между ними покой.
 *
 * СТРОЙ И ПОДПИСЬ РИСУЮТСЯ ПОРОЗНЬ (part). Иначе подпись из двух строк тянет
 * блок вверх, и строй перестаёт стоять вровень с цифрой индекса. В сетке
 * первого экрана строй занимает верхнюю строку -- ту же, где цифра, -- а
 * подпись нижнюю, ту же, где дата под цифрой.
 */

const BODY =
  "M11 3.6a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Zm0 6.2c3.1 0 5.2 1.7 5.6 4.4l.7 5.1c.1.9-.5 1.6-1.4 1.6h-1.5l-.5 6.3c-.1.9-.8 1.5-1.6 1.5h-2.6c-.9 0-1.6-.6-1.6-1.5L7.6 20.9H6.1c-.9 0-1.5-.7-1.4-1.6l.7-5.1c.4-2.7 2.5-4.4 5.6-4.4Z";

// 25/5, а не 27/6: строй стоит в одном ряду с числами и управлением, и
// каждый лишний пиксель его ширины -- это пиксель, из-за которого ряд
// рассыпается на две строки. Разницу в два пикселя на фигуру глаз не ловит.
const W = 25;
const GAP = 5;
export const PEOPLE_WIDTH = 10 * W + 9 * GAP;
// Телефон: строй ужат так, чтобы десять фигур влезли в 390 пикселей вместе с
// полями карточки, и не забирали высоту у графика.
const W_ТЕЛ = 20;
const GAP_ТЕЛ = 4;

type Props = {
  idx: number;
  lang: Lang;
  /** Значение ползунка опроса, пока посетитель его ведёт: люди отзываются. */
  preview?: number | null;
  part: "строй" | "подпись";
  /** Телефонный вид: фигуры мельче, подписи мельче. */
  phone?: boolean;
};

export default function People({ idx, lang, preview = null, part, phone = false }: Props) {
  const ш = phone ? W_ТЕЛ : W;
  const зазор = phone ? GAP_ТЕЛ : GAP;
  const ширина = 10 * ш + 9 * зазор;
  const live = preview ?? idx;
  const v = anxiousOfTen(live);
  const color = moodColor(live, 4);
  const t01 = Math.max(0, Math.min(1, (live - 70) / 30));
  const shiver = preview !== null && live >= 70;
  const calm = preview !== null && live < 45;

  const floor = FLOOR_FOM / 10; // 3.2 -- измеренный пол опроса
  const whole = Math.floor(floor);
  const floorPx = whole * (ш + зазор) + (floor - whole) * ш;

  const shown = (Math.round(v * 10) / 10).toFixed(1);
  const ru = lang === "ru";
  // Пока посетитель ведёт ползунок, силуэты показывают ЕГО ответ, и подпись
  // обязана это назвать. Иначе она выдаёт ответ посетителя за показание.
  const label =
    preview !== null
      ? ru
        ? `по-вашему — ${shown.replace(".", ",")} из 10`
        : `by your reading — ${shown} in 10`
      : ru
        ? `${shown.replace(".", ",")} из 10 говорят, что вокруг тревожно`
        : `${shown} in 10 say the mood around them is anxious`;
  const floorLabel = ru
    ? `${floor.toFixed(1).replace(".", ",")} из 10 — даже в самую спокойную неделю за всё время опроса`
    : `${floor.toFixed(1)} in 10 — even in the calmest week the poll has seen`;

  if (part === "подпись") {
    // Подпись НЕ ШИРЕ САМОГО СТРОЯ: со свободными 110 пикселями блок выходил
    // 434 в ширину -- самый широкий в ряду, и из-за него показатели не
    // складывались в одну строку. Строк в подписи стало больше, зато ряд один.
    return (
      <div className="space-y-1" style={{ maxWidth: phone ? "100%" : ширина }}>
        <div className={"mono " + (phone ? "text-[14px]" : "text-[17px]")} style={{ color: "var(--ink-2)" }}>
          {label}
        </div>
        <div
          className={"mono leading-snug " + (phone ? "text-[13px]" : "text-[17px]")}
          style={{ color: "var(--ink-3)" }}
        >
          ↳ {floorLabel}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block" style={{ width: ширина }}>
      <div className="flex items-end" style={{ gap: зазор }} role="img" aria-label={label}>
        {Array.from({ length: 10 }, (_, i) => {
          const fill = Math.max(0, Math.min(1, v - i));
          const id = `pm${i}`;
          return (
            <svg
              key={i}
              viewBox="0 0 22 32"
              className={`shrink-0 ${shiver ? "shiver" : calm ? "breathe" : ""}`}
              style={{
                width: ш,
                height: phone ? 30 : 40,
                ["--sx" as string]: `${(0.3 + t01 * 1.1).toFixed(2)}px`,
                ["--sr" as string]: `${(t01 * 1.6).toFixed(2)}deg`,
                ["--sd" as string]: `${(0.42 - t01 * 0.22).toFixed(2)}s`,
                animationDelay: `${(i * 37) % 190}ms`,
                filter:
                  fill > 0
                    ? `drop-shadow(0 0 ${(3 + 6 * moodT(live)).toFixed(1)}px ${moodColor(live, 0, 0.45)})`
                    : "none",
              }}
              aria-hidden
            >
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} />
                  <stop offset={`${fill * 100}%`} stopColor={color} />
                  <stop offset={`${fill * 100}%`} stopColor="transparent" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path d={BODY} fill="var(--card-2)" stroke="var(--line-strong)" strokeWidth="0.8" />
              <path d={BODY} fill={`url(#${id})`} style={{ transition: "fill 0.8s ease" }} />
            </svg>
          );
        })}
      </div>

      {/* пол опроса: столько тревожных даже в самую спокойную неделю */}
      <div
        className="pointer-events-none absolute bottom-[-8px] left-0 border-b border-l border-r border-dashed"
        style={{ width: floorPx, height: 8, borderColor: "var(--line-strong)" }}
        aria-hidden
      />
    </div>
  );
}

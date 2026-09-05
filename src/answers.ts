/**
 * Отправка ответа на сервер — если сервер настроен.
 *
 * ПОКА ПЕРЕМЕННЫХ НЕТ, страница ведёт себя ровно как раньше: ответ остаётся в
 * браузере и никуда не уходит. Это нарочно: включение сбора — отдельное
 * решение, а не побочный эффект сборки.
 *
 *     VITE_ANSWERS_URL=https://<проект>.supabase.co/functions/v1/answer
 *     VITE_SUPABASE_ANON_KEY=sb_publishable_...
 *
 * Публикуемый ключ в браузере — это нормально и так задумано: у анонимной роли
 * нет прав ни читать ответы, ни писать их. Секретный ключ сюда не попадает
 * никогда; запись делает функция на стороне Supabase (см. backend/README.md).
 */

const АДРЕС = import.meta.env.VITE_ANSWERS_URL as string | undefined;
const КЛЮЧ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Настроен ли сбор. Страница по этому решает, что обещать посетителю. */
export const СБОР_ВКЛЮЧЁН = Boolean(АДРЕС && КЛЮЧ);

export type Сводка = { total: number; buckets: number[]; уже?: boolean };

export async function отправить(ответ: {
  value: number;
  age?: string;
  sex?: string;
  city?: string;
}): Promise<Сводка | null> {
  if (!СБОР_ВКЛЮЧЁН) return null;
  try {
    const r = await fetch(АДРЕС!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: КЛЮЧ!,
        Authorization: `Bearer ${КЛЮЧ}`,
      },
      body: JSON.stringify(ответ),
    });
    if (!r.ok) return null;
    const д = await r.json();
    if (typeof д?.total !== "number" || !Array.isArray(д?.buckets)) return null;
    return д as Сводка;
  } catch {
    // Сеть могла не ответить. Молча: ответ уже сохранён в браузере, и терять
    // человеку нечего -- сообщать ему о нашей неудаче незачем.
    return null;
  }
}

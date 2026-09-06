/**
 * Отправка ответа на сервер.
 *
 * АДРЕС И КЛЮЧ ЗАПИСАНЫ ЗДЕСЬ, а не только в переменных сборки — и вот
 * почему. Файл .env.local в репозиторий сайта не уходит (он в .gitignore), и
 * сборка на хостинге собиралась БЕЗ этих переменных. Сбор при этом молча
 * выключался: страница вела себя как обычно, ответы никуда не шли, и понять
 * это можно было только по пустой таблице. Одна забытая переменная в чужой
 * панели не должна отключать половину замысла.
 *
 * Секрета здесь нет. Публикуемый ключ на то и публикуемый: у анонимной роли
 * нет прав ни читать ответы, ни писать их — запись делает функция на стороне
 * Supabase своим ключом, который сюда не попадает никогда (backend/README.md).
 *
 * Переменные сборки по-прежнему сильнее записанного: так можно направить
 * ответы в другой проект, ничего не трогая в коде.
 *
 *     VITE_ANSWERS_URL=https://<проект>.supabase.co/functions/v1/answer
 *     VITE_SUPABASE_ANON_KEY=sb_publishable_...
 */

const АДРЕС_ПО_УМОЛЧАНИЮ = "https://fqmaxobwdavctzataqcg.supabase.co/functions/v1/answer";
const КЛЮЧ_ПО_УМОЛЧАНИЮ = "sb_publishable_z2x_FZEIecPROFCAuf4sxA_paLA_5pm";

const АДРЕС = (import.meta.env.VITE_ANSWERS_URL as string | undefined) || АДРЕС_ПО_УМОЛЧАНИЮ;
const КЛЮЧ = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || КЛЮЧ_ПО_УМОЛЧАНИЮ;

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

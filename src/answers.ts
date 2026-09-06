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

import { собратьСреду } from "./sreda";

const АДРЕС_ПО_УМОЛЧАНИЮ = "https://fqmaxobwdavctzataqcg.supabase.co/functions/v1/answer";
const КЛЮЧ_ПО_УМОЛЧАНИЮ = "sb_publishable_z2x_FZEIecPROFCAuf4sxA_paLA_5pm";

const АДРЕС = (import.meta.env.VITE_ANSWERS_URL as string | undefined) || АДРЕС_ПО_УМОЛЧАНИЮ;
const КЛЮЧ = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || КЛЮЧ_ПО_УМОЛЧАНИЮ;

/** Настроен ли сбор. Страница по этому решает, что обещать посетителю. */
export const СБОР_ВКЛЮЧЁН = Boolean(АДРЕС && КЛЮЧ);

// КУДА НА САМОМ ДЕЛЕ УЙДЁТ ОТВЕТ -- печатается при загрузке. Переменная сборки
// сильнее записанного здесь адреса, и одна опечатка в чужой панели отправляет
// ответы в никуда, ничем себя не выдавая. Ключ показан обрезанным: он
// публикуемый, но светить его в консоли целиком незачем.
if (typeof console !== "undefined") {
  console.info("[опрос] адрес:", АДРЕС, "| ключ:", (КЛЮЧ ?? "").slice(0, 18) + "…",
    "| из переменной сборки:", Boolean(import.meta.env.VITE_ANSWERS_URL));
}

export type Сводка = { total: number; buckets: number[]; уже?: boolean };

/**
 * НОМЕР ГОСТЯ -- случайный, свой у каждого браузера, хранится у него же.
 *
 * Правило «один ответ в сутки» держалось на IP-адресе, и за одним домашним
 * роутером, в одной конторе, у одного мобильного оператора он общий: отвечал
 * первый, остальным сервер говорил «уже отвечали». Номер разводит устройства,
 * ничего при этом о человеке не сообщая: это не отпечаток и не слежка, а
 * просто случайное число, которое браузер придумал себе сам.
 */
function номерГостя(): string {
  const КЛЮЧ = "pai.гость";
  try {
    const был = localStorage.getItem(КЛЮЧ);
    if (был) return был;
    const новый = (crypto.randomUUID?.() ?? String(Math.random()).slice(2) + Date.now());
    localStorage.setItem(КЛЮЧ, новый);
    return новый;
  } catch {
    // Хранилище закрыто -- шлём пусто, сервер вернётся к адресу.
    return "";
  }
}

/** Дозапись доп-вопросов к сегодняшнему ответу: запрос БЕЗ показания. */
export async function отправитьПрофиль(п: {
  age?: string;
  sex?: string;
  city?: string;
}): Promise<boolean> {
  if (!СБОР_ВКЛЮЧЁН) return false;
  if (!п.age && !п.sex && !п.city) return false;
  try {
    const r = await fetch(АДРЕС!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: КЛЮЧ!,
        Authorization: `Bearer ${КЛЮЧ}`,
      },
      body: JSON.stringify({ ...п, гость: номерГостя() }),
    });
    if (!r.ok) {
      console.warn("[опрос] доп-вопросы не записаны:", r.status, await r.text().catch(() => ""));
      return false;
    }
    console.info("[опрос] доп-вопросы записаны");
    return true;
  } catch (e) {
    console.warn("[опрос] доп-вопросы не ушли:", e);
    return false;
  }
}

export async function отправить(ответ: {
  value: number;
  age?: string;
  sex?: string;
  city?: string;
}): Promise<Сводка | null> {
  if (!СБОР_ВКЛЮЧЁН) {
    console.warn("[опрос] сбор выключен: нет адреса или ключа");
    return null;
  }
  // Сведения о среде собираются здесь, а не в опросе: опрос про настроение,
  // а это про то, с чего заходили. Если браузер что-то не отдал -- шлём без
  // этого, отказ в сборе среды не должен ронять сам ответ.
  const среда = await собратьСреду().catch(() => ({}));
  try {
    const r = await fetch(АДРЕС!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: КЛЮЧ!,
        Authorization: `Bearer ${КЛЮЧ}`,
      },
      body: JSON.stringify({ ...ответ, среда, гость: номерГостя() }),
    });
    if (!r.ok) {
      console.warn("[опрос] сервер отказал:", r.status, await r.text().catch(() => ""));
      return null;
    }
    const д = await r.json();
    if (typeof д?.total !== "number" || !Array.isArray(д?.buckets)) {
      console.warn("[опрос] непонятный ответ:", д);
      return null;
    }
    console.info("[опрос] записано:", д);
    return д as Сводка;
  } catch (e) {
    // Сеть могла не ответить. Посетителю по-прежнему НИЧЕГО не показываем:
    // ответ уже сохранён в браузере, и терять ему нечего. Но в консоль пишем
    // -- иначе поломка сбора выглядит как полная тишина и ищется днями.
    console.warn("[опрос] запрос не ушёл:", e);
    return null;
  }
}

import { useState } from "react";
import { отправитьПрофиль } from "../answers";
import type { Lang } from "../i18n";

/**
 * Необязательные вопросы ПОСЛЕ ответа.
 *
 * Порядок важен: сперва благодарность, потом «если не трудно». Спрашивать
 * возраст и город до главного вопроса значит терять тех, кто закроет страницу
 * на анкете.
 *
 * Возраст спрашивается ДЕСЯТИЛЕТИЯМИ: точный возраст ничего не добавляет к
 * такой выборке, а спрашивать его -- лишний повод уйти. Город -- свободной
 * строкой, без списка: список из тридцати городов оскорбителен для всех
 * остальных.
 *
 * Отправить можно с любыми пустыми полями. Ответы остаются в этом браузере.
 */

// Ключ поднят вместе с ключом ответов (Poll.tsx): доп. вопросы уезжали на
// сервер тем же запросом, что и ответ, а значит тоже не сохранились ни разу.
// Не спросить их заново -- значит потерять их навсегда у тех, кто уже отвечал.
const KEY = "pai.profile.v3";

export type Profile = { age?: string; sex?: string; city?: string };

// Значение и подпись разведены только у младшей группы: в базу уходит
// locale-независимое "<18", а на кнопке стоит слово. У остальных значение и
// подпись совпадают, и трогать их нельзя -- по ним уже собраны ответы.
const AGES: { v: string; ru: string; en: string }[] = [
  { v: "<18", ru: "до 18", en: "under 18" },
  { v: "18–24", ru: "18–24", en: "18–24" },
  { v: "25–34", ru: "25–34", en: "25–34" },
  { v: "35–44", ru: "35–44", en: "35–44" },
  { v: "45–59", ru: "45–59", en: "45–59" },
  { v: "60+", ru: "60+", en: "60+" },
];

export default function ProfileForm({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const ru = lang === "ru";
  const [p, setP] = useState<Profile>({});
  const [sent, setSent] = useState(false);

  const set = (k: keyof Profile, v: string) =>
    setP((old) => ({ ...old, [k]: old[k] === v ? undefined : v }));

  const send = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...p, at: Date.now() }));
    } catch {
      /* noop */
    }
    // ОТПРАВКА НА СЕРВЕР. Её здесь не было вовсе: форма складывала ответы в
    // браузер и на том успокаивалась, а в базе возраст, пол и город стояли
    // пустыми у каждой строки. Уходит отдельным запросом, без показания, --
    // строка ответа к этому времени уже записана, и дозаписать в неё можно
    // только так (backend/profil.sql).
    void отправитьПрофиль(p);
    setSent(true);
    onDone();
  };

  if (sent) {
    return (
      <p className="mono mt-3 text-[15px]" style={{ color: "var(--ink-3)" }}>
        {ru ? "Записано. Спасибо. Ответить снова можно завтра." : "Saved. Thank you. You can answer again tomorrow."}
      </p>
    );
  }

  return (
    <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
      <p className="text-[14px] leading-snug" style={{ color: "var(--ink-2)" }}>
        {ru ? "Ещё три вопроса — любой можно пропустить." : "Three more questions — any can be skipped."}
      </p>

      {/* Каждый вопрос -- ОДНА ГОРИЗОНТАЛЬНАЯ строка, и всё вместе влезает в
          высоту карточки. Карточка не имеет права расти вниз: ответ удлинял
          страницу на три сотни пикселей. Поэтому здесь всё тесно нарочно. */}
      <div className="mt-2 space-y-1.5">
        {/* ВОЗРАСТ -- СЕТКОЙ, а не потоком. Шесть кнопок разной длины («до 18»
            против «60+») стояли вразнобой и переносились по-разному на каждой
            ширине. В сетке из трёх столбцов они одного размера и стоят ровно;
            кегль меньше прежнего (14 против 17), чтобы длинные не жались. */}
        <Field label={ru ? "возраст" : "age"}>
          {/* ТРИ СТОЛБЦА ВСЕГДА, а не шесть на широком экране: широкий здесь --
              экран, а не карточка. Карточка опроса узкая в обеих раскладках
              (около 350 пикселей), и в шести столбцах подписи налезали друг на
              друга: «до 18 18-24 25-34» читалось одной строкой. */}
          <div className="grid w-full grid-cols-3 gap-1.5">
            {AGES.map((a) => (
              <button
                key={a.v}
                type="button"
                className="btn w-full whitespace-nowrap px-1 py-[4px] text-[14px]"
                data-on={p.age === a.v}
                onClick={() => set("age", a.v)}
              >
                {ru ? a.ru : a.en}
              </button>
            ))}
          </div>
        </Field>

        {/* «Не скажу» убрано: это и есть пропуск, а пропустить можно, просто
            ничего не нажав. Отдельная кнопка для «ничего» только просит
            нажать на неё зря. */}
        <Field label={ru ? "пол" : "sex"}>
          <div className="grid w-full grid-cols-2 gap-1.5">
            {(ru ? ["женский", "мужской"] : ["female", "male"]).map((v) => (
              <button key={v} type="button" className="btn w-full px-3 py-[4px] text-[14px]" data-on={p.sex === v} onClick={() => set("sex", v)}>
                {v}
              </button>
            ))}
          </div>
        </Field>

        {/* ГОРОД -- ВО ВСЮ ШИРИНУ И СВОЕЙ СТРОКОЙ, кнопка под ним. Прежде поле
            делило строку с двумя кнопками и сжималось до полоски, в которую не
            влезало «Ростов-на-Дону»: человек вводил вслепую. Название города --
            единственный ответ здесь, который печатают руками, и места ему надо
            больше всех. */}
        <div>
          <label className="sr-only" htmlFor="city">
            {ru ? "город или область" : "city or region"}
          </label>
          <input
            id="city"
            type="text"
            value={p.city ?? ""}
            onChange={(e) => setP((o) => ({ ...o, city: e.target.value }))}
            placeholder={ru ? "город или область" : "city or region"}
            className="mono w-full rounded-xl border px-3 py-2 text-[15px] outline-none"
            style={{ borderColor: "var(--line)", background: "var(--card-2)", color: "var(--ink)" }}
          />
          <div className="mt-2 flex items-center gap-3">
            <button type="button" onClick={send} className="btn flex-1 px-4 py-2 text-[15px]" data-on={true}>
              {ru ? "отправить" : "send"}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="mono shrink-0 text-[13px] underline-offset-4 hover:underline"
              style={{ color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer" }}
            >
              {ru ? "пропустить" : "skip"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * Подпись СЛЕВА от ответов, а не над ними: три подписи в отдельных строках
 * стоили карточке под семьдесят пикселей, а карточке расти некуда.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {/* Ширина под самое длинное слово («возраст» в верхнем регистре с
          разрядкой), иначе подпись налезала на первую кнопку. */}
      <div className="mono w-[76px] shrink-0 text-[13px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
        {label}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

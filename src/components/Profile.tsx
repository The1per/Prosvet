import { useState } from "react";
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

const KEY = "pai.profile.v2";

export type Profile = { age?: string; sex?: string; city?: string };

const AGES = ["18–24", "25–34", "35–44", "45–59", "60+"];

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
    setSent(true);
    onDone();
  };

  if (sent) {
    return (
      <p className="mono mt-3 text-[17px]" style={{ color: "var(--ink-3)" }}>
        {ru ? "Записано. Спасибо." : "Saved. Thank you."}
      </p>
    );
  }

  return (
    <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
      <p className="text-[16.5px] leading-snug" style={{ color: "var(--ink-2)" }}>
        {ru ? "Ещё три вопроса — любой можно пропустить." : "Three more questions — any can be skipped."}
      </p>

      {/* Каждый вопрос -- ОДНА ГОРИЗОНТАЛЬНАЯ строка, и всё вместе влезает в
          высоту карточки. Карточка не имеет права расти вниз: ответ удлинял
          страницу на три сотни пикселей. Поэтому здесь всё тесно нарочно. */}
      <div className="mt-2 space-y-1.5">
        <Field label={ru ? "возраст" : "age"}>
          {AGES.map((a) => (
            <button key={a} type="button" className="btn px-2.5 py-[3px] text-[17px]" data-on={p.age === a} onClick={() => set("age", a)}>
              {a}
            </button>
          ))}
        </Field>

        <Field label={ru ? "пол" : "sex"}>
          {(ru ? ["женский", "мужской", "не скажу"] : ["female", "male", "prefer not to say"]).map((v) => (
            <button key={v} type="button" className="btn px-2.5 py-[3px] text-[17px]" data-on={p.sex === v} onClick={() => set("sex", v)}>
              {v}
            </button>
          ))}
        </Field>

        <div className="flex items-baseline gap-3">
          <label className="sr-only" htmlFor="city">
            {ru ? "город или область" : "city or region"}
          </label>
          {/* Город и кнопки в один ряд: столбиком форма не влезала в высоту
              карточки, а расти вниз ей нельзя. */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              id="city"
              type="text"
              value={p.city ?? ""}
              onChange={(e) => setP((o) => ({ ...o, city: e.target.value }))}
              placeholder={ru ? "город или область" : "city or region"}
              className="mono min-w-0 flex-1 rounded-xl border px-2.5 py-1.5 text-[16px] outline-none"
              style={{ borderColor: "var(--line)", background: "var(--card-2)", color: "var(--ink)" }}
            />
            <button type="button" onClick={send} className="btn shrink-0 px-4 py-1.5 text-[16px]" data-on={true}>
              {ru ? "отправить" : "send"}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="mono shrink-0 text-[15px] underline-offset-4 hover:underline"
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
    <div className="flex items-baseline gap-3">
      {/* Ширина под самое длинное слово («возраст» в верхнем регистре с
          разрядкой), иначе подпись налезала на первую кнопку. */}
      <div className="mono w-[92px] shrink-0 text-[15px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

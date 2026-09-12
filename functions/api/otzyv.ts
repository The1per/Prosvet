/**
 * ОБРАТНАЯ СВЯЗЬ: приём и запись. Cloudflare Pages Function, POST /api/otzyv.
 *
 * ПОЧЕМУ ЗДЕСЬ, А НЕ В SUPABASE, ГДЕ ЖИВЁТ ОПРОС. Так решено хозяином: сайт и
 * так стоит на Cloudflare Pages, и функция рядом со страницей -- это ноль новых
 * ключей, ноль CORS и один и тот же домен. Опрос остаётся там, где стоял:
 * переносить работающее ради единообразия незачем.
 *
 * ЧТО НУЖНО ОДИН РАЗ СДЕЛАТЬ В ПАНЕЛИ CLOUDFLARE (см. backend/d1_otzyv.sql):
 *   1. D1 → Create database, имя `otzyvy`;
 *   2. выполнить в ней SQL из d1_otzyv.sql;
 *   3. Pages → проект сайта → Settings → Functions → D1 database bindings:
 *      имя переменной `DB`, база `otzyvy`.
 * Пока привязки нет, функция честно отвечает «не настроено», а страница
 * показывает, что отзыв не ушёл, -- молчать о неудаче нельзя: так уже был
 * потерян месяц ответов опроса.
 *
 * ЧЕГО ЗДЕСЬ НЕТ НАРОЧНО: ни IP, ни чего-либо, чем человека можно опознать.
 * Номер гостя -- случайное число, которое браузер придумал себе сам (то же,
 * что у опроса). Поле «куда ответить» необязательное и пустым остаётся пустым.
 */

/** Ровно те части D1, которыми мы пользуемся: чужих типов не тянем. */
type D1 = {
  prepare(q: string): {
    bind(...v: unknown[]): {
      run(): Promise<unknown>;
      first<T = unknown>(col?: string): Promise<T | null>;
    };
  };
};
type Событие = {
  request: Request;
  env: { DB?: D1; TG_TOKEN?: string; TG_CHAT?: string };
  /** Дать обещанию доработать ПОСЛЕ ответа странице -- см. отправку в телеграм. */
  waitUntil?: (p: Promise<unknown>) => void;
};

const ПРЕДЕЛ_ТЕКСТА = 2000;
const ПРЕДЕЛ_СВЯЗИ = 200;
/** Сколько отзывов в сутки с одного браузера. Не один: человек вправе
    дописать, вспомнив ещё одну беду, -- но и не без счёта. */
const В_СУТКИ = 5;

const H = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

/** Календарная дата по Москве -- как и у опроса: сервер живёт по UTC. */
function деньМСК(d: Date) {
  return new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

function ответ(тело: Record<string, unknown>, код = 200) {
  return new Response(JSON.stringify(тело), { status: код, headers: H });
}

/**
 * ПЕРЕСЫЛКА В ТЕЛЕГРАМ. Консоль базы -- не то место, куда ходят читать письма
 * от людей; отзыв, который никто не прочёл, всё равно что не отправлен.
 *
 * ОТПРАВКА НЕ ДЕРЖИТ ОТВЕТ СТРАНИЦЕ и не может её сломать: она уходит в
 * waitUntil, а всякая её неудача только пишется в журнал. Человек уже сказал
 * своё; связь с телеграмом -- наша забота, а не его.
 *
 * Ни токена, ни номера разговора в коде нет: обе переменные задаются в
 * настройках Pages. Без них пересылка просто не делается, а запись в базу идёт
 * как обычно -- отзыв не теряется никогда.
 */
async function в_телеграм(env: Событие["env"], п: Record<string, string>) {
  if (!env.TG_TOKEN || !env.TG_CHAT) return;
  const строки = [
    "Отзыв с сайта",
    "",
    п.текст,
    "",
    п.связь ? "ответить: " + п.связь : "ответить некуда",
    "неделя и вид: " + (п.обстановка || "—"),
    "язык: " + (п.язык || "—") + " · " + п.время,
  ];
  try {
    const r = await fetch(
      "https://api.telegram.org/bot" + env.TG_TOKEN + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        /* Без parse_mode НАРОЧНО: в отзыве может оказаться что угодно --
           звёздочка, подчёркивание, ломаная разметка, -- и телеграм откажет
           в доставке из-за чужого текста. Простой текст доходит всегда. */
        body: JSON.stringify({
          chat_id: env.TG_CHAT,
          text: строки.join("\n").slice(0, 4000),
          disable_web_page_preview: true,
        }),
      },
    );
    if (!r.ok) {
      console.warn("[отзыв] телеграм отказал:", r.status,
                   await r.text().catch(() => ""));
    }
  } catch (e) {
    console.warn("[отзыв] телеграм недоступен:", String(e).slice(0, 120));
  }
}

export const onRequestPost = async ({ request, env, waitUntil }: Событие) => {
  let з: Record<string, unknown>;
  try {
    з = (await request.json()) as Record<string, unknown>;
  } catch {
    return ответ({ ок: false, почему: "не разобрал" }, 400);
  }

  /* ПРИМАНКА. Поле, которого человек не видит и потому не заполняет; бот
     заполняет всё подряд. Дешевле капчи и никого не мучает. */
  if (typeof з.приманка === "string" && з.приманка.trim() !== "") {
    return ответ({ ок: true }); // боту говорим «спасибо» и ничего не пишем
  }

  const текст = String(з.текст ?? "").trim();
  if (текст.length < 3) return ответ({ ок: false, почему: "пусто" }, 400);
  if (текст.length > ПРЕДЕЛ_ТЕКСТА) {
    return ответ({ ок: false, почему: "длинно" }, 400);
  }
  const связь = String(з.связь ?? "").trim().slice(0, ПРЕДЕЛ_СВЯЗИ);
  const гость = String(з.гость ?? "").trim().slice(0, 64) || "без-номера";
  const обстановка = String(з.обстановка ?? "").slice(0, 300);
  const язык = String(з.язык ?? "").slice(0, 8);
  const ua = (request.headers.get("user-agent") ?? "").slice(0, 200);

  if (!env.DB) {
    return ответ({ ок: false, почему: "не настроено" }, 503);
  }

  const день = деньМСК(new Date());
  const время = new Date().toISOString();
  try {
    const сколько = await env.DB
      .prepare("SELECT COUNT(*) AS n FROM otzyv WHERE day = ? AND guest = ?")
      .bind(день, гость)
      .first<{ n: number }>();
    if (сколько && Number(сколько.n) >= В_СУТКИ) {
      return ответ({ ок: false, почему: "много" }, 429);
    }
    await env.DB
      .prepare(
        "INSERT INTO otzyv (id, day, ts, guest, text, contact, context, lang, ua)"
        + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        день,
        время,
        гость,
        текст,
        связь || null,
        обстановка || null,
        язык || null,
        ua || null,
      )
      .run();
    /* Пересылка ПОСЛЕ записи и не вместо неё: сперва отзыв сохранён, и только
       потом мы пытаемся о нём сообщить. Если телеграм молчит -- отзыв всё
       равно в базе, и его видно страницей-читалкой и консолью. */
    const весть = в_телеграм(env, { текст, связь, обстановка, язык, время });
    if (waitUntil) {
      waitUntil(весть);
    } else {
      await весть;
    }
    return ответ({ ок: true });
  } catch (e) {
    return ответ({ ок: false, почему: "база: " + String(e).slice(0, 120) }, 500);
  }
};

/** На всякий случай: страница и функция на одном домене, но пусть будет. */
export const onRequestOptions = () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });

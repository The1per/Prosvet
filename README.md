# Индекс общественной тревоги — страница

Здесь только сайт. Прибора, правил и корпуса тут нет и быть не должно:
они живут отдельно и не публикуются.

## Запуск

    npm install
    npm run dev      -> http://localhost:5173
    npm run build    -> dist/index.html, один самодостаточный файл

## Сбор ответов

Пока нет `.env.local`, страница ничего никуда не отправляет и ответ
остаётся в браузере посетителя. Чтобы включить сбор:

    VITE_ANSWERS_URL=https://<ref>.supabase.co/functions/v1/answer
    VITE_SUPABASE_ANON_KEY=sb_publishable_...

На Cloudflare Pages те же две переменные задаются в Settings → Environment
variables. Секретных ключей здесь не бывает никогда.

## Обратная связь

Форма (значок письма в чёрной полосе) шлёт POST на `/api/otzyv` — это
Pages Function из папки `functions`, она разворачивается сама. Ей нужна
база D1, один раз:

1. **D1 → Create database**, имя `otzyvy`;
2. в её консоли выполнить SQL (таблица `otzyv`: id, day, ts, guest, text,
   contact, context, lang, ua — с индексом по (day, guest));
3. **Pages → Settings → Functions → D1 database bindings**: Variable name
   `DB`, Database `otzyvy`.

Пока привязки нет, функция отвечает «не настроено», а страница честно
показывает, что отзыв не ушёл.

## Обновление данных

Данные лежат готовым файлом `src/data/series.ts`. Пересчитали прибор —
скопировали новый файл сюда и отправили. Прибор в этот репозиторий не едет.

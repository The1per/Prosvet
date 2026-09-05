/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Адрес функции приёма ответов; пусто -- сбор выключен, см. answers.ts */
  readonly VITE_ANSWERS_URL?: string;
  /** Публикуемый ключ Supabase. В браузере он и должен быть; секретный -- нет. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

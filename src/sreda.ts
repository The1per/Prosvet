/**
 * ЧТО ИЗВЕСТНО О БРАУЗЕРЕ ОТВЕЧАЮЩЕГО.
 *
 * Собирается ровно то, что браузер отдаёт сам, без разрешений и без хитростей:
 * размер экрана, часовой пояс, язык, платформа, число ядер, модель устройства
 * там, где она заявлена. Ничего не выпытывается -- ни доступа к камере, ни
 * геолокации, ни отпечатка холста: это уже слежка, а не сведения о среде.
 *
 * ПОЧЕМУ ЭТО ВООБЩЕ НУЖНО. Ответы посетителей -- вторая, слабая мера рядом с
 * индексом, и её единственная беда в том, что отвечают не все подряд, а кто
 * зашёл. Зная, с чего заходили и откуда, можно хотя бы увидеть перекос:
 * одни ли это телефоны, один ли часовой пояс, один ли язык.
 *
 * Модель устройства и версия платформы -- «высокоэнтропийные» данные, и
 * браузер отдаёт их только по запросу и только по защищённому соединению.
 * Где не отдаёт -- поля просто нет; выдумывать нечего.
 */

export type Среда = Record<string, unknown>;

/** Мягко: любое поле может отсутствовать, и это нормально. */
function тихо<T>(f: () => T): T | undefined {
  try {
    return f();
  } catch {
    return undefined;
  }
}

type ВысокаяЭнтропия = {
  platform?: string;
  platformVersion?: string;
  model?: string;
  architecture?: string;
  bitness?: string;
  uaFullVersion?: string;
  fullVersionList?: { brand: string; version: string }[];
};

type UAData = {
  brands?: { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (h: string[]) => Promise<ВысокаяЭнтропия>;
};

export async function собратьСреду(): Promise<Среда> {
  const n = navigator as Navigator & { deviceMemory?: number; userAgentData?: UAData };
  const среда: Среда = {
    экран: тихо(() => `${screen.width}x${screen.height}`),
    окно: тихо(() => `${window.innerWidth}x${window.innerHeight}`),
    плотность: тихо(() => window.devicePixelRatio),
    глубинаЦвета: тихо(() => screen.colorDepth),
    пояс: тихо(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
    сдвигПояса: тихо(() => -new Date().getTimezoneOffset()),
    языки: тихо(() => (navigator.languages ?? [navigator.language]).slice(0, 5)),
    платформа: тихо(() => n.userAgentData?.platform ?? navigator.platform),
    ядра: тихо(() => navigator.hardwareConcurrency),
    память: тихо(() => n.deviceMemory),
    касаний: тихо(() => navigator.maxTouchPoints),
    откуда: тихо(() => document.referrer || undefined),
    тёмная: тихо(() => window.matchMedia("(prefers-color-scheme: dark)").matches),
    движениеВыкл: тихо(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
  };

  // Марки браузера -- то, что раньше приходилось выуживать из строки UA.
  const марки = тихо(() => n.userAgentData?.brands);
  if (марки) среда.марки = марки.map((b) => `${b.brand} ${b.version}`);
  const мобильный = тихо(() => n.userAgentData?.mobile);
  if (typeof мобильный === "boolean") среда.мобильный = мобильный;

  // Модель и версия платформы -- только по запросу и только по https.
  const выс = n.userAgentData?.getHighEntropyValues;
  if (выс) {
    try {
      const в = await n.userAgentData!.getHighEntropyValues!([
        "platform",
        "platformVersion",
        "model",
        "architecture",
        "bitness",
        "uaFullVersion",
      ]);
      if (в.model) среда.модель = в.model;
      if (в.platformVersion) среда.версияПлатформы = в.platformVersion;
      if (в.architecture) среда.архитектура = в.architecture + (в.bitness ? "/" + в.bitness : "");
      if (в.uaFullVersion) среда.полнаяВерсия = в.uaFullVersion;
    } catch {
      /* браузер вправе отказать -- значит этих полей просто не будет */
    }
  }

  // Пустые поля не отправляем: в базе от них один шум.
  for (const k of Object.keys(среда)) if (среда[k] === undefined) delete среда[k];
  return среда;
}

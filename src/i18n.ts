import type { BasketKey } from "./data/series";

export type Lang = "ru" | "en";

/**
 * Тексты страницы.
 *
 * ДВА ПРАВИЛА, КОТОРЫЕ НЕЛЬЗЯ НАРУШАТЬ ПРИ ПРАВКЕ.
 *
 * 1. Не публиковать рецепт. Списки поисковых запросов, полный состав тем,
 *    веса шагов, длины окон и порядок обработки -- нельзя. Показать две-три
 *    статьи недели как пример -- можно. Здесь описано, ЧТО прибор делает, а не
 *    КАК он это делает.
 *
 * 2. Не писать числа, которых не измеряли. Каждая цифра ниже -- результат
 *    проверки: 519 недель ряда, 302 недели с опросом, 84 пары из 100.
 */

export const T = {
  title: { ru: "Индекс общественной тревоги", en: "Public Anxiety Index" },
  subtitle: {
    ru: "Социология спрашивает людей. Мы не спрашиваем. Человек может не сказать интервьюеру, что боится, — но тот же человек ночью откроет статью про повестку. Опрос ловит слова, следы ловят поступки.",
    en: "Sociology asks people. We do not ask. Someone may not tell an interviewer they are afraid — yet the same person opens an article about call-up papers at night. A poll catches words; traces catch acts.",
  },
  subtitleTail: {
    ru: "Человек может не сказать интервьюеру, что боится: постесняется, не поймёт вопроса, ответит из вежливости. Но тот же человек ночью откроет статью про повестку. Опрос ловит слова, следы ловят поступки.",
    en: "Someone may not tell an interviewer they are afraid: too embarrassed, misreading the question, answering out of politeness. Yet the same person opens an article about call-up papers at night. A poll catches words; traces catch acts.",
  },
  term: {
    ru: "В науке это называется невключённым измерением по цифровым следам.",
    en: "In research this is called unobtrusive measurement from digital traces.",
  },
  /**
   * Годы и число недель БЕРУТСЯ ИЗ РЯДА, а не вписаны. Строкой здесь стояло
   * «2016 — 2026 · 519 недель», и после первого же среза ряда подпись стала
   * врать -- о годах и о числе недель разом.
   */
  badge: {
    ru: (a: string, b: string, n: number) => `${a} — ${b} · ${n} недель`,
    en: (a: string, b: string, n: number) => `${a} — ${b} · ${n} weeks`,
  },
  now: { ru: "Прошедшая неделя", en: "The past week" },
  week: { ru: "Неделя", en: "Week" },
  ofTen: { ru: "% — столько называют настроение вокруг тревожным", en: "% say the mood around them is anxious" },
  vsBaseline: { ru: "к обычной неделе", en: "vs a normal week" },
  /** Пик СВОЕЙ эпохи: между эпохами пики не сравниваются, см. ГРАНИЦА_ЭПОХ. */
  peakEra: {
    ru: (ранняя: boolean) => (ранняя ? "Пик до 2020" : "Пик с 2020"),
    en: (ранняя: boolean) => (ранняя ? "Peak before 2020" : "Peak since 2020"),
  },
  placeInEra: {
    ru: (м: number, всего: number, ранняя: boolean) =>
      `${м}-я из ${всего} ${ранняя ? "до 2020" : "с 2020"}`,
    en: (м: number, всего: number, ранняя: boolean) =>
      `${м} of ${всего} ${ранняя ? "before 2020" : "since 2020"}`,
  },
  peakAll: { ru: "Пик за 11 лет", en: "11-year peak" },
  fomLabel: { ru: "Опрос той недели", en: "Poll that week" },
  fomNone: { ru: "опроса не было", en: "no poll" },
  fomOn: { ru: "Кривая опроса ФОМ", en: "FOM poll curve" },
  /** То же на телефоне: длинная надпись там занимала строку целиком. */
  fomOnShort: { ru: "опрос ФОМ", en: "FOM poll" },
  fomWhat: {
    ru: "ФОМ каждую пятницу публикует, сколько людей называют настроение вокруг себя тревожным. На этом ряду прибор и проверяется:",
    en: "Every Friday FOM publishes the share of people who call the mood around them anxious. That is the series the instrument is checked against:",
  },
  /** Постоянная подпись рядом с числом: на чём это число основано. */
  basis: { ru: "по следам в сети", en: "from web traces" },
  gapUp: { ru: "опрос выше", en: "poll higher" },
  gapDown: { ru: "прибор выше", en: "instrument higher" },
  chartHint: { ru: "Ведите по графику или нажмите:", en: "Drag across the chart, or jump to:" },
  search: { ru: "поиск по событию", en: "search an event" },
  searchNone: { ru: "ничего не нашлось", en: "nothing found" },

  poll: { ru: "А что вокруг вас?", en: "And around you?" },
  pollQ: {
    ru: "Насколько тревожно настроение людей вокруг вас на этой неделе?",
    en: "How anxious is the mood of the people around you this week?",
  },
  calm: { ru: "спокойно", en: "calm" },
  panic: { ru: "тревожно", en: "anxious" },
  save: { ru: "Ответить", en: "Answer" },
  thanks: { ru: "Спасибо — ответ записан.", en: "Thank you — your answer is saved." },
  youSaid: { ru: "Ваш ответ", en: "Your answer" },
  change: { ru: "изменить", en: "change" },
  yourPast: { ru: "ваши прошлые ответы", en: "your earlier answers" },
  /**
   * Сравнение ответа посетителя -- с историей ОПРОСА, а не с прибором:
   * прибор показывает другую неделю. Это единственное честное сравнение,
   * которое у нас есть.
   */
  youFewVisitors: {
    ru: (всего: number) =>
      всего <= 1
        ? "Ваш ответ записан. Вы первый на этой неделе — сравнивать пока не с кем."
        : `Ваш ответ записан. На этой неделе ответили ${всего} — слишком мало, чтобы сравнивать.`,
    en: (всего: number) =>
      всего <= 1
        ? "Your answer is saved. You are the first this week — there is nobody to compare with yet."
        : `Your answer is saved. ${всего} people answered this week — too few to compare.`,
  },
  youVsVisitors: {
    ru: (всего: number, доля: number) =>
      `Из ${всего} ответивших здесь спокойнее вас сказали ${доля} из 100.`,
    en: (всего: number, доля: number) =>
      `Of the ${всего} people who answered here, ${доля} out of 100 said calmer than you.`,
  },
  /**
   * Обещание посетителю зависит от того, настроен ли сбор. Молча начать
   * отправлять ответы на сервер, пока на странице написано обратное, нельзя.
   */
  privacyLocal: {
    ru: "Ответ остаётся в этом браузере и никуда не отправляется.",
    en: "Your answer stays in this browser and is not sent anywhere.",
  },
  privacySent: {
    ru: "Ответ сохраняется у нас — без имени, без адреса, только число и то, что вы сами указали.",
    en: "Your answer is stored by us — no name, no address, just the number and whatever you chose to add.",
  },
  youVsHistory: {
    ru: (доля: number, всего: number, край: "выше" | "ниже" | null, пол: number, потолок: number) => {
      if (край === "выше")
        return `Выше, чем опрос показывал хоть раз за всё время: его потолок — ${потолок} %, неделя мобилизации.`;
      if (край === "ниже")
        return `Ниже, чем опрос опускался хоть раз за всё время: его пол — ${пол} %, и ниже страна не была ни разу.`;
      return доля >= 50
        ? `Спокойнее, чем вы сказали, было в ${доля} из 100 недель, по которым ФОМ спрашивал то же самое (всего таких недель ${всего}).`
        : `Тревожнее, чем вы сказали, было в ${100 - доля} из 100 недель, по которым ФОМ спрашивал то же самое (всего таких недель ${всего}).`;
    },
    en: (доля: number, всего: number, край: "выше" | "ниже" | null, пол: number, потолок: number) => {
      if (край === "выше")
        return `Higher than the poll has ever gone: its ceiling is ${потолок}%, the week of mobilisation.`;
      if (край === "ниже")
        return `Lower than the poll has ever fallen: its floor is ${пол}%, and the country has never been below it.`;
      return доля >= 50
        ? `${доля} out of 100 weeks in which FOM asked the same question were calmer than your answer (${всего} such weeks in all).`
        : `${100 - доля} out of 100 weeks in which FOM asked the same question were more anxious than your answer (${всего} such weeks in all).`;
    },
  },
  /** Кнопка, которой на телефоне выдвигается опрос, и её закрытие. */
  pollOpen: { ru: "Тревожно ли вокруг вас?", en: "Is it anxious around you?" },
  pollClose: { ru: "закрыть", en: "close" },
  pollDisclaimer: {
    ru: "Ваш ответ — про эту неделю. Число слева — про прошедшую, ту, по которой уже вышел опрос.",
    en: "Your answer is about this week. The number on the left is about the past week, the one the poll has already covered.",
  },

  breakdown: { ru: "Разбор недели", en: "Week breakdown" },
  baskets: { ru: "О чём тревожились", en: "What the anxiety was about" },
  readsTitle: { ru: "Что читали в эту неделю", en: "What people read that week" },
  alarmReads: { ru: "Тревожное чтение", en: "Anxious reading" },
  bgReads: { ru: "А вообще на той неделе читали", en: "What was simply popular that week" },
  views: { ru: "просмотров сверх обычного", en: "views above normal" },
  viewsPlain: { ru: "просмотров", en: "views" },
  weakerThanMob: { ru: "слабее недели мобилизации", en: "weaker than mobilisation week" },
  isTheMob: { ru: "это и есть самая тревожная неделя ряда", en: "this is the most anxious week on record" },
  aboveNormal: { ru: "выше обычной недели", en: "above a normal week" },
  belowNormalShort: { ru: "ниже обычной", en: "below normal" },
  belowNormal: { ru: "ниже обычной недели", en: "below a normal week" },
  /**
   * Сводка обычной недели. Всё в ней -- посчитанное: место среди 519 недель,
   * самая поднявшаяся тема и промах прибора против опроса. Прежняя заглушка
   * («отдельного разбора нет») занимала место и не сообщала ничего.
   */
  overHint: {
    ru: "«×1,5» — во столько раз больше обычного читали на эту тему.",
    en: "“×1.5” is how many times more than usual the topic was read.",
  },
  plainTop: { ru: "Что читали на этой неделе помимо тревожного", en: "What else the week was reading" },
  plainTopNone: { ru: "Данных о популярном чтении за эту неделю нет.", en: "No popular-reading data for this week." },
  plainWeek: {
    ru: (д: { место: number; всего: number; тема: string; раз: number; опрос: number | null; промах: number | null }) => {
      const ч = д.раз >= 1.6
        ? `Сильнее обычного читали про «${д.тема.toLowerCase()}» — в ${д.раз.toFixed(1).replace(".", ",")} раза больше нормы.`
        : "Ни одна тема заметно не поднялась: читали примерно то же, что и всегда.";
      const о = д.опрос == null
        ? "Опроса в ту неделю не было — сверить не с чем."
        : `Опрос в ту неделю дал ${d0(д.опрос)} %, прибор разошёлся с ним на ${Math.abs(д.промах!).toFixed(1).replace(".", ",")} пункта.`;
      return `${д.место}-я по тревоге из ${д.всего} недель. ${ч} ${о}`;
    },
    en: (д: { место: number; всего: number; тема: string; раз: number; опрос: number | null; промах: number | null }) => {
      const ч = д.раз >= 1.6
        ? `The topic most above its norm was “${д.тема.toLowerCase()}” — ${д.раз.toFixed(1)}× the usual.`
        : "No topic rose noticeably: the reading was much as always.";
      const о = д.опрос == null
        ? "There was no poll that week, so there is nothing to check against."
        : `The poll that week gave ${d0(д.опрос)}%, and the instrument differed from it by ${Math.abs(д.промах!).toFixed(1)} points.`;
      return `Ranked ${д.место} of ${д.всего} weeks by anxiety. ${ч} ${о}`;
    },
  },
  calmWeek: {
    ru: "Неделя спокойная: читают почти то же, что и обычно.",
    en: "A calm week: people read much what they always read.",
  },

  method: { ru: "Как это измерено", en: "How it is measured" },
  methodLead: {
    ru: "Прибор смотрит не на то, что люди говорят о своём настроении, а на то, что они в это время делают руками.",
    en: "The instrument watches not what people say about their mood, but what they do with their hands at the time.",
  },
  limits: { ru: "Границы прибора", en: "Limits of the instrument" },
  phase: { ru: "Режим", en: "Mode" },
  phases: {
    ru: { обучение: "настройка", живое: "живое", отложено: "проверка" },
    en: { обучение: "training", живое: "live", отложено: "holdout" },
  },
  phaseHint: {
    ru: {
      обучение: "на этих неделях прибор настраивался",
      отложено: "эти недели прибор при настройке не видел",
      живое: "считается сейчас, вперёд ещё не проверялось",
    },
    en: {
      обучение: "the instrument was tuned on these weeks",
      отложено: "these weeks were hidden during tuning",
      живое: "computed now, not yet validated forward",
    },
  },
  scrollHint: { ru: "ниже — как это измерено", en: "below — how it is measured" },
  events: { ru: "Что было в эти недели", en: "What happened in these weeks" },
  /**
   * Отсечка на графике. «Дальше без настройки» понимал только тот, кто уже
   * знает, что такое настройка. Здесь сказано, что это значит для читателя:
   * правее прибор эти недели впервые видит и предсказывает вслепую.
   */
  untuned: { ru: "обучение прибора закончено", en: "instrument training ends here" },
  footer: {
    ru: "Данные: открытая почасовая статистика просмотров Википедии на восьми языках и открытые ряды поискового интереса. Опрос — публичные еженедельные волны ФОМа, выходят по пятницам о прошедшей неделе.",
    en: "Data: open hourly Wikipedia pageview statistics in eight languages and open search-interest series. The poll: public weekly FOM waves, published on Fridays about the week just ended.",
  },
  levels: {
    ru: ["штиль", "фон", "напряжение", "тревога", "паника"],
    en: ["calm", "background", "tension", "alarm", "panic"],
  },
  fit: {
    ru: { точно: "прибор попал", мимо: "прибор промахнулся", молчат: "обе меры молчат" },
    en: { точно: "the instrument hit it", мимо: "the instrument missed", молчат: "both measures were silent" },
  },

  steps: {
    ru: [
      {
        t: "1. Следы вместо ответов",
        d: "Прибор никого не спрашивает. Он считает открытую статистику того, что люди в стране делали на этой неделе: что читали, что искали, чем прикрывались в сети, как обращались с наличными. Годится не всякое действие, а такое, которое человеку невыгодно и неприятно. На него идут не из любопытства, а когда припекло.",
      },
      {
        t: "2. На что он отзывается",
        d: "Прибор ищет не тревогу вообще, а четыре её следа. **Личные последствия** — когда беда касается лично: призыв, документы, выезд. **Подготовка и защита** — аптечка, убежище, запасы. **Катастрофические прогнозы** — чем всё это кончится. **Религиозное обращение** — то, к чему идут, когда сделать больше нечего. Ни одна из четырёх сама по себе ничего не значит; значит их одновременный подъём.",
      },
      {
        t: "3. Только лишнее",
        d: "У каждого следа есть свой обычный уровень, и он гуляет по временам года и дням недели. Прибор считает не уровень, а превышение над спокойной такой же неделей: обычное вычитается целиком. Крупная новость поднимает мир весь сразу — мировой подъём меряется отдельно и вычитается тоже, чтобы не выдать чужое событие за здешнюю тревогу.",
      },
      {
        t: "4. Проверка опросом",
        d: "Готовую кривую сверяют с еженедельным опросом. Мера строгая: берут любые две недели и спрашивают, какая тревожнее. Прибор отвечает верно примерно в 84 случаях из 100 — и на тех неделях, которые он при настройке не видел, тоже.",
      },
    ],
    en: [
      {
        t: "1. Traces, not answers",
        d: "The instrument asks nothing. It counts open statistics of what the country did that week: what people read, what they searched for, what they hid behind online, how they handled cash. Not every action counts — only the kind that costs something. People do it not out of curiosity but when it burns.",
      },
      {
        t: "2. What it responds to",
        d: "The instrument looks for four traces of anxiety, not anxiety in general. **Personal exposure** — when trouble reaches you: the draft, paperwork, leaving. **Preparedness** — first-aid kit, shelter, supplies. **Catastrophic forecasts** — how all this ends. **Religious recourse** — where people turn when nothing else is left. None of the four means anything on its own; what means something is all four rising at once.",
      },
      {
        t: "3. Only the excess",
        d: "Every trace has its own ordinary level, and that level drifts with the seasons and the days of the week. The instrument counts not the level but the excess over a calm week like this one: the ordinary is subtracted entirely. A big story lifts the whole world at once — that world-wide rise is measured separately and subtracted too, so that someone else’s event is not passed off as anxiety here.",
      },
      {
        t: "4. Checked against the poll",
        d: "The finished curve is checked against the weekly poll. The test is strict: take any two weeks and ask which was more anxious. The instrument answers correctly in about 84 cases out of 100 — including on weeks it never saw while being tuned.",
      },
    ],
  },

  limitList: {
    ru: [
      "Прибор видит внимание, а не чувство. Человек может пойти по этому следу из любопытства — и такие недели у прибора есть. Против этого стоят противовесы: обычный уровень вычитается целиком, а мировой подъём меряется отдельно и вычитается тоже. Полной защиты они не дают: любопытство, поднятое чужой громкой новостью, иногда проходит за здешнюю тревогу.",
      "Расходясь с опросом, прибор не всегда неправ. Неделя «Крокуса» у него 38-я из 302, у опроса по уровню — 141-я; неделя боёв в Курской области — 82-я против 120-й. События бесспорные, а уровень опроса на них почти не двинулся. Кто ближе к правде на таких неделях, проверить нечем: опрос и есть та правда, с которой сверяются.",
      "Резкий удар он видит лучше, чем затяжную тревогу: вторую волну ковида опрос поставил восьмой неделей, прибор — тридцать второй.",
      "По регионам он не считает и считать не будет: региональных опросов, с которыми можно было бы сверяться, нет — а без правды проверять нечем.",
      "Ответы посетителей на индекс не влияют. Прибор считается по чтению и ничего не знает про них: это отдельный вопрос отдельным людям, а не часть измерения.",
    ],
    en: [
      "It sees attention, not feeling. A person can follow the same trace out of curiosity — and the instrument has such weeks. There are counterweights: the ordinary level is subtracted entirely, and the world-wide rise is measured separately and subtracted too. They give no full protection: curiosity raised by someone else’s loud news sometimes passes for anxiety here.",
      "When the instrument disagrees with the poll, it is not always the instrument that is wrong. The Crocus week ranks 38th of 302 for the instrument and 141st for the poll by level; the Kursk fighting week, 82nd against 120th. The events are beyond dispute, and the poll’s level barely moved. Which of the two is closer to the truth on such weeks cannot be checked: the poll is the truth being checked against.",
      "It sees a sharp blow better than drawn-out anxiety: the poll ranked the second covid wave eighth, the instrument thirty-second.",
      "It does not measure regions and will not: there are no regional polls to check against, and without a truth there is nothing to check with.",
      "Visitors’ answers do not affect the index. The instrument is computed from reading and knows nothing about them: it is a separate question to separate people, not part of the measurement.",
    ],
  },
} as const;

/* ---------- корзины: внутренний ключ → человеческое имя ---------- */
export const BASKET_LABEL: Record<BasketKey, Record<Lang, { name: string; hint: string }>> = {
  рамка: {
    ru: { name: "Личные последствия", hint: "призыв, документы, выезд" },
    en: { name: "Personal exposure", hint: "the draft, paperwork, leaving" },
  },
  выживание: {
    ru: { name: "Подготовка и защита", hint: "аптечка, убежище, запасы, дозиметр" },
    en: { name: "Preparedness", hint: "first-aid kit, shelter, supplies, dosimeter" },
  },
  "конец света": {
    ru: { name: "Катастрофические прогнозы", hint: "пророчества, предсказания, большие страхи" },
    en: { name: "Catastrophic forecasts", hint: "prophecies, predictions, the big fears" },
  },
  вера: {
    ru: { name: "Религиозное обращение", hint: "обряд, молитва, писание, обереги" },
    en: { name: "Religious recourse", hint: "ritual, prayer, scripture, amulets" },
  },
};

const d0 = (n: number) => Math.round(n).toString();

export function fmt(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "en-US").format(Math.round(n));
}

export function fmtDate(d: string, lang: Lang) {
  return new Date(d + "T00:00:00Z").toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Неделя интервалом: одна дата обманывает — показание про все семь суток. */
export function fmtWeek(d: string, lang: Lang) {
  const a = new Date(d + "T00:00:00Z");
  const b = new Date(a.getTime() + 6 * 864e5);
  const M =
    lang === "ru"
      ? ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [da, db] = [a.getUTCDate(), b.getUTCDate()];
  const [ma, mb] = [a.getUTCMonth(), b.getUTCMonth()];
  const y = b.getUTCFullYear();
  if (lang === "ru") return ma === mb ? `${da}—${db} ${M[mb]} ${y}` : `${da} ${M[ma]} — ${db} ${M[mb]} ${y}`;
  return ma === mb ? `${M[ma]} ${da}–${db}, ${y}` : `${M[ma]} ${da} – ${M[mb]} ${db}, ${y}`;
}

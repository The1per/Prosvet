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
  /**
   * ИМЯ. Полное -- «Индекс косвенных сигналов»; то, что показано здесь --
   * его раздел, «Общественная тревога». Заглавные буквы трёх слов складывают
   * ИКС, и в заголовке они выделены цветом: аббревиатура должна читаться с
   * первого взгляда, а не расшифровываться потом.
   *
   * titleParts -- то же имя, разобранное на «буква + хвост слова», чтобы
   * разметка не занималась нарезкой строки посимвольно.
   */
  title: { ru: "Индекс Косвенных Сигналов", en: "Index of Indirect Signals" },
  titleParts: {
    ru: [
      ["И", "ндекс"],
      ["К", "освенных"],
      ["С", "игналов"],
    ],
    en: [
      ["I", "ndex of"],
      ["I", "ndirect"],
      ["S", "ignals"],
    ],
  },
  section: { ru: "Общественная тревога", en: "Public anxiety" },
  subtitle: {
    ru: "Социология спрашивает людей. Мы не спрашиваем. Человек может не сказать интервьюеру, что боится, — но тот же человек ночью откроет статью про повестку. Опрос ФОМа ловит слова, следы ловят поступки.",
    en: "Sociology asks people. We do not ask. Someone may not tell an interviewer they are afraid — yet the same person opens an article about call-up papers at night. A poll catches words; traces catch acts.",
  },
  subtitleTail: {
    ru: "Человек может не сказать интервьюеру, что боится: постесняется, не поймёт вопроса, ответит из вежливости. Но тот же человек ночью откроет статью про повестку. Опрос ФОМа ловит слова, следы ловят поступки.",
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
  // ВМЕСТО ПИКА ЭПОХИ -- изменение к прошлой неделе. Пик за годы читатель уже
  // видит на кривой, а вот «выросло или упало за неделю» с кривой не снимешь:
  // это разница двух соседних точек, и глазом она различается плохо.
  vsPrev: { ru: "к прошлой неделе", en: "vs last week" },
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
  /** То же место, но без имени эпохи -- для телефона, где строка коротка. */
  placeShort: {
    ru: (м: number, всего: number) => `${м}-я из ${всего}`,
    en: (м: number, всего: number) => `${м} of ${всего}`,
  },
  /** Подпись к месту недели, когда само место стоит числом рядом со
      сравнениями: «48-я» сверху, «из 329 недель» под ним. */
  ofTotal: {
    ru: (всего: number) => `из ${всего} недель`,
    en: (всего: number) => `of ${всего} weeks`,
  },
  peakAll: { ru: "Пик за 11 лет", en: "11-year peak" },
  fomLabel: { ru: "Опрос той недели", en: "Poll that week" },
  fomNone: { ru: "опроса ФОМа не было", en: "no poll" },
  fomOn: { ru: "Кривая опроса ФОМ", en: "FOM poll curve" },
  /** То же на телефоне: длинная надпись там занимала строку целиком. */
  fomOnShort: { ru: "Опрос ФОМ", en: "FOM poll" },
  fomWhat: {
    ru: "ФОМ каждую пятницу публикует, сколько людей называют настроение вокруг себя тревожным. На этом ряду индекс и проверяется:",
    en: "Every Friday FOM publishes the share of people who call the mood around them anxious. That is the series the index is checked against:",
  },
  /** Постоянная подпись рядом с числом: на чём это число основано. */
  // ДВЕ СТРОКИ И ПОЛНОЕ ИМЯ. «По следам в сети» отвечало на вопрос «как
  // измерено», но не говорило, ЧТО измерено. Рядом с числом должно стоять имя
  // величины, иначе число остаётся без названия.
  // Две строки -- двумя полями, а не переводом строки внутри одной: перевод
  // строки в словаре легко теряется при правке и не виден глазом.
  basis: { ru: "Индекс тревожности", en: "Anxiety index" },
  basis2: { ru: "по следам в сети", en: "from web traces" },
  // Здесь «опрос» без имени нарочно: подпись стоит вплотную к кнопке «опрос
  // ФОМ», и полное имя во второй раз только удлиняет строку.
  gapUp: { ru: "опрос выше", en: "poll higher" },
  gapDown: { ru: "индекс выше", en: "index higher" },
  chartHint: { ru: "Ведите по графику или нажмите:", en: "Drag across the chart, or jump to:" },
  search: { ru: "поиск: событие или дата", en: "search: event or date" },
  searchNone: { ru: "ничего не нашлось", en: "nothing found" },

  poll: { ru: "А что вокруг вас?", en: "And around you?" },
  pollQ: {
    ru: "Насколько тревожно настроение людей вокруг вас на этой неделе?",
    en: "How anxious is the mood of the people around you this week?",
  },
  calm: { ru: "спокойно", en: "calm" },
  panic: { ru: "тревожно", en: "anxious" },
  save: { ru: "Ответить", en: "Answer" },
  thanks: {
    ru: "Спасибо — ответ записан. Ответить снова можно завтра.",
    en: "Thank you — your answer is saved. You can answer again tomorrow.",
  },
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
  // Зачем отвечать. Стоит под вопросом и до ползунка: человек должен понимать,
  // во что его зовут, ДО того как двинет ручку, а не после.
  pollCall: {
    ru: "Социология в России спит. Пора её разбудить — вместе с вами.",
    en: "Sociology in Russia has long been asleep. Time to wake it up — with you.",
  },
  pollDisclaimer: {
    ru: "Ваш ответ — про эту неделю. Число слева — про прошедшую, ту, по которой уже вышел опрос ФОМа.",
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
  alarmNotYet: { ru: "тревожное чтение недели ещё не посчитано", en: "anxious reading not computed yet" },
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
        : `Опрос ФОМа в ту неделю дал ${d0(д.опрос)} %, индекс разошёлся с ним на ${Math.abs(д.промах!).toFixed(1).replace(".", ",")} пункта.`;
      return `${д.место}-я по тревоге из ${д.всего} недель. ${ч} ${о}`;
    },
    en: (д: { место: number; всего: number; тема: string; раз: number; опрос: number | null; промах: number | null }) => {
      const ч = д.раз >= 1.6
        ? `The topic most above its norm was “${д.тема.toLowerCase()}” — ${д.раз.toFixed(1)}× the usual.`
        : "No topic rose noticeably: the reading was much as always.";
      const о = д.опрос == null
        ? "There was no poll that week, so there is nothing to check against."
        : `The poll that week gave ${d0(д.опрос)}%, and the index differed from it by ${Math.abs(д.промах!).toFixed(1)} points.`;
      return `Ranked ${д.место} of ${д.всего} weeks by anxiety. ${ч} ${о}`;
    },
  },
  calmWeek: {
    ru: "Неделя спокойная: читают почти то же, что и обычно.",
    en: "A calm week: people read much what they always read.",
  },

  method: { ru: "Как это работает", en: "How it works" },
  methodLead: {
    ru: "Индекс смотрит не на то, что люди говорят о своём настроении, а на то, что они в это время делают руками.",
    en: "The index watches not what people say about their mood, but what they do with their hands at the time.",
  },
  limits: { ru: "Границы индекса", en: "Limits of the index" },
  phase: { ru: "Режим", en: "Mode" },
  phases: {
    ru: { обучение: "настройка", живое: "живое", отложено: "проверка" },
    en: { обучение: "training", живое: "live", отложено: "holdout" },
  },
  phaseHint: {
    ru: {
      обучение: "на этих неделях индекс настраивался",
      отложено: "эти недели индекс при настройке не видел",
      живое: "считается сейчас, вперёд ещё не проверялось",
    },
    en: {
      обучение: "the index was tuned on these weeks",
      отложено: "these weeks were hidden during tuning",
      живое: "computed now, not yet validated forward",
    },
  },
  scrollHint: { ru: "ниже — как это работает", en: "below — how it works" },
  events: { ru: "Что было в эти недели", en: "What happened in these weeks" },
  footer: {
    ru: "Данные: открытая почасовая статистика просмотров Википедии на восьми языках и открытые ряды поискового интереса. Опрос — публичные еженедельные волны ФОМа, выходят по пятницам о прошедшей неделе.",
    en: "Data: open hourly Wikipedia pageview statistics in eight languages and open search-interest series. The poll: public weekly FOM waves, published on Fridays about the week just ended.",
  },
  levels: {
    ru: ["штиль", "фон", "напряжение", "тревога", "паника"],
    en: ["calm", "background", "tension", "alarm", "panic"],
  },
  fit: {
    ru: {
      точно: "обе меры сошлись",
      мимо: "индекс не заметил",
      молчат: "обе меры промолчали",
      врозь: "меры разошлись",
    },
    en: {
      точно: "both measures agreed",
      мимо: "the index did not notice",
      молчат: "neither measure noticed",
      врозь: "the measures disagree",
    },
  },

  steps: {
    ru: [
      {
        t: "1. Следы вместо ответов",
        d: "Опросы легко исказить: люди умеют молчать убедительнее, чем говорить, — особенно там, где ответ помнят дольше, чем вопрос. Поведение так не умеет: цифровой след остаётся и там, где язык выбрал тишину. Индекс считает открытую статистику того, что люди в стране делали на этой неделе: что читали, что искали, как часто пытались что-то скрыть, как обращались с наличными. Годится не всякое действие, а такое, которое человеку невыгодно и неприятно: на него не идут из любопытства.",
      },
      {
        t: "2. На что он отзывается",
        d: "Индекс ищет не тревогу вообще, а четыре её следа. **Личные последствия** — когда беда касается лично: призыв, документы, выезд. **Подготовка и защита** — аптечка, убежище, запасы. **Катастрофические прогнозы** — чем всё это кончится. **Религиозное обращение** — то, к чему идут, когда сделать больше нечего. Ни одна из четырёх сама по себе ничего не значит; значит их одновременный подъём.",
      },
      {
        t: "3. Только лишнее",
        d: "У каждого следа есть свой обычный уровень, и он гуляет по временам года и дням недели. Индекс считает не уровень, а превышение над спокойной такой же неделей: обычное вычитается целиком. Отдельно вычитается и мировой подъём — тот, что случается сразу везде. Сериал «Чернобыль» поднял чтение про радиацию по всему свету, фильм «Оппенгеймер» — про атомную бомбу; в индексе от таких недель не остаётся ничего.",
      },
      {
        t: "4. Проверка опросом ФОМа",
        d: "Готовую кривую сверяют с еженедельным опросом ФОМа. Мера строгая: берут любые две недели и спрашивают, какая тревожнее. Индекс отвечает верно примерно в 84 случаях из 100.\n\nРяд разрезан по времени, и это главное в проверке. На 265 неделях — с 2019 по октябрь 2024 года — индекс настраивался: там подбирались все его постоянные. Следующие 89 недель, по конец 2025-го, при настройке были закрыты, и на них он отвечает верно в 83 случаях из 100. Всё, что позже, он считает впервые и вперёд ещё не проверялся вовсе.\n\nЭто разделение — не формальность. Настроить прибор так, чтобы он объяснил прошлое, легко; трудно, чтобы он угадывал то, чего не видел.\n\nТам, где они расходятся, неправ не обязательно индекс: неделю «Крокуса» он ставит 38-й из 302, а опрос по уровню — 141-й; неделю боёв в Курской области — 82-й против 120-й. События бесспорные, а уровень опроса на них почти не двинулся. Кто ближе к правде на таких неделях, проверить нечем: опрос и есть та правда, с которой сверяются.",
      },
    ],
    en: [
      {
        t: "1. Traces, not answers",
        d: "Surveys are easy to distort: people are better at staying silent than at speaking — especially where an answer is remembered longer than the question. Behaviour cannot do that: a digital trace remains even where the tongue chose silence. The index counts open statistics of what the country did that week: what people read, what they searched for, how often they tried to hide something, how they handled cash. Not every action counts — only the kind that costs something: nobody does it out of curiosity.",
      },
      {
        t: "2. What it responds to",
        d: "The index looks for four traces of anxiety, not anxiety in general. **Personal exposure** — when trouble reaches you: the draft, paperwork, leaving. **Preparedness** — first-aid kit, shelter, supplies. **Catastrophic forecasts** — how all this ends. **Religious recourse** — where people turn when nothing else is left. None of the four means anything on its own; what means something is all four rising at once.",
      },
      {
        t: "3. Only the excess",
        d: "Every trace has its own ordinary level, and that level drifts with the seasons and the days of the week. The index counts not the level but the excess over a calm week like this one: the ordinary is subtracted entirely. The world-wide rise — the kind that happens everywhere at once — is subtracted as well. The TV series Chernobyl lifted reading about radiation across the planet, the film Oppenheimer about the atomic bomb; weeks like those leave nothing in the index.",
      },
      {
        t: "4. Checked against the poll",
        d: "The finished curve is checked against the weekly FOM poll. The test is strict: take any two weeks and ask which was more anxious. The index answers correctly in about 84 cases out of 100.\n\nThe series is cut in time, and that is the heart of the test. On 265 weeks — from 2019 to October 2024 — the index was tuned: every constant in it was chosen there. The next 89 weeks, through the end of 2025, were hidden during tuning, and on them it answers correctly in 83 cases out of 100. Everything later it is computing for the first time, and has not been validated forward at all.\n\nThis split is not a formality. Tuning an instrument to explain the past is easy; making it guess what it has not seen is not.\n\nWhere the two disagree, it is not necessarily the index that is wrong: it ranks the Crocus week 38th of 302 while the poll by level ranks it 141st; the Kursk fighting week, 82nd against 120th. The events are beyond dispute, and the poll’s level barely moved. Which is closer to the truth cannot be checked: the poll is the truth being checked against.",
      },
    ],
  },

  limitList: {
    ru: [
      "Индекс видит внимание, а не чувство. Человек может пойти по этому следу из любопытства — и такие недели у индекса есть. Против этого стоят противовесы: обычный уровень вычитается целиком, а мировой подъём меряется отдельно и вычитается тоже. Полной защиты они не дают: любопытство, поднятое зарубежной громкой новостью, иногда проходит за здешнюю тревогу.",
      "Резкий удар он видит лучше, чем затяжную тревогу: вторую волну ковида опрос ФОМа поставил восьмой неделей, индекс — тридцать второй.",
      "По регионам он не считает и считать не будет: региональных опросов, с которыми можно было бы сверяться, нет — а без правды проверять нечем.",
      "Ответы посетителей на индекс не влияют. Индекс считается по чтению и ничего не знает про них: это отдельный вопрос отдельным людям, а не часть измерения.",
    ],
    en: [
      "It sees attention, not feeling. A person can follow the same trace out of curiosity — and the index has such weeks. There are counterweights: the ordinary level is subtracted entirely, and the world-wide rise is measured separately and subtracted too. They give no full protection: curiosity raised by a loud foreign story sometimes passes for anxiety here.",
      "It sees a sharp blow better than drawn-out anxiety: the poll ranked the second covid wave eighth, the index thirty-second.",
      "It does not measure regions and will not: there are no regional polls to check against, and without a truth there is nothing to check with.",
      "Visitors’ answers do not affect the index. The index is computed from reading and knows nothing about them: it is a separate question to separate people, not part of the measurement.",
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
  // КОРОТКИЕ ИМЕНА МЕСЯЦЕВ -- только для недель, что легли на два месяца.
  // «28 февраля — 6 марта 2022» на четыре знака длиннее самой длинной
  // однодневной даты, и в разборе недели строка с ним переносилась: заголовок
  // становился двухстрочным, а карточка -- на тридцать пять пикселей выше.
  // Так высота разбора менялась от недели к неделе. С короткими именами
  // «28 фев — 6 мар 2022» короче любой одномесячной даты, и перенос
  // невозможен ни при какой неделе.
  const K = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const [da, db] = [a.getUTCDate(), b.getUTCDate()];
  const [ma, mb] = [a.getUTCMonth(), b.getUTCMonth()];
  const y = b.getUTCFullYear();
  if (lang === "ru") return ma === mb ? `${da}—${db} ${M[mb]} ${y}` : `${da} ${K[ma]} — ${db} ${K[mb]} ${y}`;
  return ma === mb ? `${M[ma]} ${da}–${db}, ${y}` : `${M[ma]} ${da} – ${M[mb]} ${db}, ${y}`;
}

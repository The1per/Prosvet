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
    ru: "Раз в неделю ФОМ спрашивает людей, тревожно ли настроение вокруг них. Выпуск выходит через десять дней после самой недели, а модель считает ту же неделю в понедельник. С этим рядом его и сверяют:",
    en: "Once a week FOM asks people whether the mood around them is anxious. The issue appears ten days after the week itself; the model has that week ready on Monday. That is the series it is checked against:",
  },
  /**
   * ЧТО СКАЗАТЬ, КОГДА ЧИСЛА ОПРОСА ЕЩЁ НЕТ.
   *
   * Прочерк на месте числа сам по себе не говорит, поломка это или порядок
   * вещей. Порядок: волну опрашивают в воскресенье недели, а выпуск с ней
   * выходит через одиннадцать дней, по четвергам, -- значит у свежих недель
   * числа опроса не может быть в принципе, и день, когда оно появится, можно
   * назвать заранее.
   */
  fomSoon: {
    ru: (дата: string) =>
      `Опроса за эту неделю ещё нет. Волну опрашивают в воскресенье, а выпуск с ней выходит через одиннадцать дней: ждём ${дата}.`,
    en: (дата: string) =>
      `No poll for this week yet. The wave is surveyed on Sunday and published eleven days later: expected ${дата}.`,
  },
  /** День и месяц без «г.»: дата стоит внутри фразы, и точка у неё своя. */
  dayMonth: {
    ru: (д: string) =>
      new Date(д + "T00:00:00Z").toLocaleDateString("ru-RU", {
        day: "numeric", month: "long", timeZone: "UTC",
      }),
    en: (д: string) =>
      new Date(д + "T00:00:00Z").toLocaleDateString("en-GB", {
        day: "numeric", month: "long", timeZone: "UTC",
      }),
  },
  /** Недели, до которых опрос просто не дотягивается: его тогда не было. */
  fomNever: {
    ru: "Опроса за эту неделю нет: волны за неё ФОМ не публиковал.",
    en: "There is no poll for this week: FOM published no wave for it.",
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
  gapDown: { ru: "модель выше", en: "model higher" },
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
        : `Опрос ФОМа в ту неделю дал ${d0(д.опрос)} %, модель разошлась с ним на ${Math.abs(д.промах!).toFixed(1).replace(".", ",")} пункта.`;
      return `${д.место}-я по тревоге из ${д.всего} недель. ${ч} ${о}`;
    },
    en: (д: { место: number; всего: number; тема: string; раз: number; опрос: number | null; промах: number | null }) => {
      const ч = д.раз >= 1.6
        ? `The topic most above its norm was “${д.тема.toLowerCase()}” — ${д.раз.toFixed(1)}× the usual.`
        : "No topic rose noticeably: the reading was much as always.";
      const о = д.опрос == null
        ? "There was no poll that week, so there is nothing to check against."
        : `The poll that week gave ${d0(д.опрос)}%, and the model differed from it by ${Math.abs(д.промах!).toFixed(1)} points.`;
      return `Ranked ${д.место} of ${д.всего} weeks by anxiety. ${ч} ${о}`;
    },
  },
  calmWeek: {
    ru: "Неделя спокойная: читают почти то же, что и обычно.",
    en: "A calm week: people read much what they always read.",
  },

  method: { ru: "Как это работает", en: "How it works" },
  limits: { ru: "Границы модели", en: "Limits of the model" },

  /* ---------- обратная связь ---------- */
  fbOpen: { ru: "Написать автору", en: "Write to the author" },
  fbChip: { ru: "Обратная связь", en: "Feedback" },
  fbQ: {
    ru: "Что здесь не так или чего не хватает?",
    en: "What is wrong here, or what is missing?",
  },
  /* ДВЕ СТРОКИ, А НЕ ОДНА (решение хозяина): сперва перечислено, что годится,
     и с новой строки -- приглашение предложить своё вместе с обещанием
     прочесть. Разбито двумя полями, а не переводом строки внутри одного:
     перевод строки в словаре легко теряется при правке и не виден глазом. */
  fbHint: {
    ru: "Промах модели на конкретной неделе, непонятное слово, сломанная кнопка — всё годится.",
    en: "A miss on a particular week, an unclear wording, a broken button — all of it helps.",
  },
  fbHint2: {
    ru: "Или есть предложение? Читаю каждое письмо.",
    en: "Or do you have a suggestion? Every message is read.",
  },
  /** Поля-подсказки в окне отзыва нет: пустое окно и без неё понятно. */
  fbPlaceholder: { ru: "", en: "" },
  fbContact: { ru: "Куда ответить — если ждёте ответа", en: "Where to reply — if you want one" },
  fbSend: { ru: "Отправить", en: "Send" },
  fbSending: { ru: "Отправляю…", en: "Sending…" },
  fbThanks: { ru: "Дошло. Спасибо.", en: "Received. Thank you." },
  fbFail: {
    ru: "Не ушло: связь или сбор не отвечают. Попробуйте позже — написанное осталось в поле.",
    en: "Not sent: the network or the collector did not answer. Try later — your text is still here.",
  },
  /* Число здесь обязано совпадать с В_СУТКИ в functions/api/otzyv.ts. */
  fbMany: {
    ru: "На сегодня хватит: больше трёх отзывов в сутки с одного браузера не принимаю.",
    en: "Enough for today: no more than three messages a day from one browser.",
  },
  phase: { ru: "Режим", en: "Mode" },
  phases: {
    ru: { обучение: "настройка", живое: "живое", отложено: "проверка" },
    en: { обучение: "training", живое: "live", отложено: "holdout" },
  },
  phaseHint: {
    ru: {
      обучение: "на этих неделях модель настраивалась",
      отложено: "эти недели модель при настройке не видела",
      живое: "считается сейчас, вперёд ещё не проверялось",
    },
    en: {
      обучение: "the model was tuned on these weeks",
      отложено: "these weeks were hidden during tuning",
      живое: "computed now, not yet validated forward",
    },
  },
  scrollHint: { ru: "ниже — как это работает", en: "below — how it works" },
  events: { ru: "Что было в эти недели", en: "What happened in these weeks" },
  footer: {
    ru: "Данные: открытая почасовая статистика просмотров Википедии на восьми языках и открытые ряды поискового интереса. Опрос — публичные еженедельные волны ФОМа: людей спрашивают в воскресенье, а выпуск выходит через десять дней. Модель считает ту же неделю в понедельник.",
    en: "Data: open hourly Wikipedia pageview statistics in eight languages and open search-interest series. The poll: public weekly FOM waves, published on Fridays about the week just ended.",
  },
  levels: {
    ru: ["штиль", "фон", "напряжение", "тревога", "паника"],
    en: ["calm", "background", "tension", "alarm", "panic"],
  },
  fit: {
    ru: {
      точно: "обе меры сошлись",
      мимо: "модель не заметила",
      молчат: "обе меры промолчали",
      врозь: "меры разошлись",
    },
    en: {
      точно: "both measures agreed",
      мимо: "the model did not notice",
      молчат: "neither measure noticed",
      врозь: "the measures disagree",
    },
  },

  steps: {
    ru: [
      {
        t: "1. Следы вместо ответов",
        d: "Опросы легко исказить: люди умеют молчать убедительнее, чем говорить. Поведение скрыть сложнее — цифровой след остаётся почти всегда. Отпечаток этот частичный, но по нему можно судить о том, что люди чувствуют.",
      },
      {
        t: "2. На что он отзывается",
        d: "Модель считает открытую статистику того, что люди в стране делали на этой неделе: что читали, что искали, о чём и как говорили между собой — в комментариях, в городских каналах, в заголовках новостей. Речь берётся не по словам-приметам: считается, сколько разных бед идёт разом и насколько разошлось то, о чём пишут люди, и то, о чём пишет пресса. К чтению и речи добавлено поведение, на которое идут не из любопытства, а по необходимости: попытки закрыться от наблюдения в сети — речь не о VPN, а о средствах, которые ставят, когда важно, чтобы о заходе не осталось записи, — и уход от безналичного следа.\n\nИщет он не тревогу вообще, а четыре её следа. **Личные последствия** — когда беда касается лично: призыв, документы, выезд. **Подготовка и защита** — аптечка, убежище, запасы. **Конец времён** — чем всё это кончится и к кому просить заступничества. **Обряд и гадание** — то, к чему идут, когда сделать больше нечего. Ни одна из четырёх сама по себе ничего не значит; значит их одновременный подъём.",
      },
      {
        t: "3. Только лишнее",
        d: "У каждого следа есть свой обычный уровень, и он гуляет по временам года и дням недели. Модель считает не уровень, а превышение над спокойной такой же неделей: обычное вычитается целиком.\n\nГодовой ход снимается дважды. Сперва календарём, снятым с постороннего, нетревожного чтения: он, в отличие от собственного, предсказуем год к году. Потом сравнением недели с такой же неделей прошлых лет. Отдельно вычитается мировой подъём — тот, что случается сразу везде: сериал «Чернобыль» поднял чтение про радиацию по всему свету, фильм «Оппенгеймер» — про атомную бомбу; в индексе от таких недель не остаётся ничего.\n\nИсточники ломаются, их блокируют, связь выключают. Поэтому неделя сравнивается не с постоянной меркой, а с недавним прошлым самого источника, и там, где это возможно, канал читается в сравнении с собой же в остальном мире: падение источника видно отдельно от подъёма тревоги. Это помогает, но не лечит совсем — где источник просел в разы, точность по нему падает.",
      },
      {
        t: "4. Проверка опросом ФОМа",
        d: "Готовую кривую сверяют с еженедельным опросом ФОМа. Мера строгая: берут любые две недели и спрашивают, какая тревожнее. На настроечных неделях модель отвечает верно в 85 случаях из 100.\n\nРяд разрезан по времени, и это главное в проверке. На 221 неделе с опросом — до октября 2024 года — модель настраивалась: там подбирались все её постоянные. Следующие 88 недель при настройке были закрыты, и на них он отвечает верно в 89 случаях из 100, а на одном 2026 годе — в 91. Самые свежие недели он считает впервые и вперёд ещё не проверялся вовсе.\n\nЭто разделение — не формальность. Настроить прибор так, чтобы он объяснил прошлое, легко; трудно, чтобы он угадывал то, чего не видел.\n\nТам, где они расходятся, неправа не обязательно модель: неделю «Крокуса» он ставит 56-й из 309, а опрос по уровню — 158-й; неделю боёв в Курской области — 72-й против 122-й. События бесспорные, а уровень опроса на них почти не двинулся. Кто ближе к правде на таких неделях, проверить нечем: опрос и есть та правда, с которой сверяются.",
      },
    ],
    en: [
      {
        t: "1. Traces, not answers",
        d: "Surveys are easy to distort: people are better at staying silent than at speaking. Behaviour is harder to hide — a digital trace remains almost always. That imprint is partial, but it still tells you something about what people feel.",
      },
      {
        t: "2. What it responds to",
        d: "The model counts open statistics of what the country did that week: what people read, what they searched for, what and how they said to one another — in comments, in local channels, in news headlines. Speech is not read word by word: what is counted is how many different troubles run at once, and how far what people write has drifted from what the press writes. To reading and speech is added behaviour nobody undertakes out of curiosity: attempts to stay unobserved online — not a VPN, but the tools people install when it matters that the visit leaves no record — and stepping away from the cashless trail.\n\nWhat it looks for is not anxiety in general but four of its traces. **Personal exposure** — when trouble reaches you: the draft, paperwork, leaving. **Preparedness** — first-aid kit, shelter, supplies. **End times** — how all this ends, and who to ask for help. **Rite and divination** — where people turn when nothing else is left. None of the four means anything on its own; what means something is all four rising at once.",
      },
      {
        t: "3. Only the excess",
        d: "Every trace has its own ordinary level, and that level drifts with the seasons and the days of the week. The model counts not the level but the excess over a calm week like this one: the ordinary is subtracted entirely.\n\nThe yearly swing is removed twice. First by a calendar taken from unrelated, non-anxious reading: unlike the index's own, it is predictable from year to year. Then by comparing the week with the same week of earlier years. The world-wide rise — the kind that happens everywhere at once — is subtracted separately: the TV series Chernobyl lifted reading about radiation across the planet, the film Oppenheimer about the atomic bomb; weeks like those leave nothing in the index.\n\nSources break, get blocked, connections are switched off. So a week is compared not against a fixed yardstick but against the recent past of the source itself, and where possible a channel is read against itself in the rest of the world: a source's own decline shows separately from a rise in anxiety. This helps but does not cure — where a source has fallen several-fold, its precision falls with it.",
      },
      {
        t: "4. Checked against the poll",
        d: "The finished curve is checked against the weekly FOM poll. The test is strict: take any two weeks and ask which was more anxious. On the tuning weeks the model answers correctly in 85 cases out of 100.\n\nThe series is cut in time, and that is the heart of the test. On 221 poll weeks — up to October 2024 — the model was tuned: every constant in it was chosen there. The next 88 weeks were hidden during tuning, and on them it answers correctly in 89 cases out of 100, and on 2026 alone in 91. The freshest weeks it is computing for the first time, and has not been validated forward at all.\n\nThis split is not a formality. Tuning an instrument to explain the past is easy; making it guess what it has not seen is not.\n\nWhere the two disagree, it is not necessarily the model that is wrong: it ranks the Crocus week 56th of 309 while the poll by level ranks it 158th; the Kursk fighting week, 72nd against 122nd. The events are beyond dispute, and the poll’s level barely moved. Which is closer to the truth cannot be checked: the poll is the truth being checked against.",
      },
    ],
  },

  /**
   * ГРАНИЦЫ -- ТАКИЕ ЖЕ СКЛАДНЫЕ БЛОКИ, ЧТО И ШАГИ (решение хозяина,
   * 12 сентября 2026), и у каждого своё название. Пять абзацев подряд читались
   * одной стеной, а с крупным кеглем заняли бы два экрана: свёрнутые, они
   * показывают сразу весь список того, чего прибор не умеет, -- а подробность
   * открывает тот, кому она нужна.
   */
  limitList: {
    ru: [
      {
        t: "Внимание, а не чувство",
        d: "Человек может пойти по этому следу из любопытства — и такие недели у модели есть. Против этого стоят противовесы: обычный уровень вычитается целиком, годовой ход снимается по постороннему, нетревожному чтению, а мировой подъём меряется отдельно и вычитается тоже. Полной защиты они не дают: любопытство, поднятое зарубежной громкой новостью, иногда проходит за здешнюю тревогу.",
      },
      {
        t: "Удар виден лучше, чем затяжная тревога",
        d: "Пик второй волны ковида опрос ставит 8-й неделей из 309, модель — 13-й; год назад этот разрыв был втрое больше, его сократили, но он остался.",
      },
      {
        t: "Источники не вечны",
        d: "Их блокируют, они затухают, связь выключают. Неделя поэтому сравнивается с недавним прошлым самого источника, а где можно — с ним же в остальном мире. Это отделяет падение источника от подъёма тревоги, но не лечит: где источник просел в разы, точность по нему падает.",
      },
      {
        t: "По регионам он не считает",
        d: "И считать не будет: региональных опросов, с которыми можно было бы свериться, автор не знает — а без ориентира проверять нечем.",
      },
      {
        t: "Ответы посетителей ничего не меняют",
        d: "На модель они не влияют: это отдельный вопрос отдельным людям, а не часть измерения.",
      },
    ],
    en: [
      {
        t: "Attention, not feeling",
        d: "A person can follow the same trace out of curiosity — and the model has such weeks. There are counterweights: the ordinary level is subtracted entirely, the yearly swing is removed using unrelated, non-anxious reading, and the world-wide rise is measured separately and subtracted too. They give no full protection: curiosity raised by a loud foreign story sometimes passes for anxiety here.",
      },
      {
        t: "A blow shows better than drawn-out anxiety",
        d: "The poll ranks the peak of the second covid wave 8th of 309 weeks, the model 13th; a year ago that gap was three times wider — it has been narrowed, not closed.",
      },
      {
        t: "Sources do not last",
        d: "They get blocked, they fade, connections are switched off. So a week is compared with the recent past of the source itself and, where possible, with the same source in the rest of the world. That separates a source's decline from a rise in anxiety, but does not cure it: where a source has fallen several-fold, its precision falls too.",
      },
      {
        t: "It does not measure regions",
        d: "And it will not: the author knows of no regional polls to check against, and without a reference point there is nothing to check with.",
      },
      {
        t: "Visitors’ answers change nothing",
        d: "They do not affect the model: it is a separate question to separate people, not part of the measurement.",
      },
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
  /* ИМЕНА ИСПРАВЛЕНЫ 12 сентября 2026 по замечанию хозяина: «Отче наш» в
     группе «Катастрофические прогнозы» выглядел странно -- и справедливо.
     Чтение в этой группе не только про прогнозы: рядом с пророчествами и
     Апокалипсисом там молитвы о заступничестве и вопросы о том, что после
     смерти. Это одна связка -- «чем всё кончится и к кому просить», -- и имя
     должно называть её целиком, а не одну её половину.
     Вторая группа переименована по той же причине: рядом с иконами и
     обрядами там гадание и гороскопы, а «Религиозное обращение» их не
     покрывало. */
  "конец света": {
    ru: { name: "Конец времён", hint: "пророчества, Апокалипсис, молитва, жизнь после смерти" },
    en: { name: "End times", hint: "prophecy, Apocalypse, prayer, life after death" },
  },
  вера: {
    ru: { name: "Обряд и гадание", hint: "иконы и святые, обряды, писание, гадание" },
    en: { name: "Rite and divination", hint: "icons and saints, rites, scripture, fortune-telling" },
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

/**
 * Разбор важных недель.
 *
 * Каждый разбор устроен одинаково: СНАЧАЛА что случилось, потом что показал
 * прибор и что сказал опрос. Раньше здесь стояли одни места в рейтинге --
 * читателю, который не помнит, что было в ноябре 2020-го, они не говорили
 * ничего.
 *
 * Места опираются на числа, а не на память: положение недели среди 302 недель,
 * по которым опрос выходил. Неудачи прибора названы неудачами; замалчивать их
 * значит показывать не прибор, а рекламу прибора.
 *
 * Мятеж Пригожина стоит здесь при том, что в самих данных подписи у него нет:
 * неделя поучительная -- обе меры молчат.
 *
 * Недели, следующей за мобилизацией, здесь нет нарочно: она не событие, а
 * продолжение предыдущего, и в ряду важных дат читалась как второе событие.
 */

export type Ev = {
  date: string;
  ru: string;
  en: string;
  /** Короткое имя для метки на графике: полные подписи там налезают. */
  shortRu: string;
  shortEn: string;
  whyRu: string;
  whyEn: string;
  /** Совпали ли прибор и опрос: это честная оценка, а не украшение. */
  fit: "точно" | "мимо" | "молчат" | "врозь";
};

export const EVENTS: Ev[] = [
  {
    date: "2018-12-10",
    ru: "Ложная тревога, декабрь 2018",
    en: "False alarm, December 2018",
    shortRu: "Ложная",
    shortEn: "False alarm",
    whyRu:
      "Ничего не случилось — и в этом всё дело. Индекс подняли предсказатели: «Конец света» читали в 15,9 раза больше, чем на соседних неделях, «Отче наш» в 4 раза, «Нострадамус» в 3,8, в среду был всплеск «Ванги». Это середина декабря — пора предсказаний на будущий год, календарь, а не тревога. Мировая опора тут бессильна: в мире этого не читали, читали мы.",
    whyEn:
      "Nothing happened — and that is the point. What lifted the index was prophecy: “The end of the world” was read 15.9 times more than in neighbouring weeks, “Our Father” 4 times, “Nostradamus” 3.8, with a spike of “Baba Vanga” on the Wednesday. This is mid-December, the season of predictions for the coming year — a calendar, not anxiety. The world anchor is powerless here: the world was not reading this, we were.",
    fit: "мимо",
  },
  {
    date: "2020-03-30",
    ru: "Ковид: объявлены нерабочие дни",
    en: "Covid: non-working days declared",
    shortRu: "Локдаун",
    shortEn: "Lockdown",
    whyRu:
      "30 марта 2020-го страну закрыли: объявлены «нерабочие дни» с сохранением зарплаты, закрылись школы, кафе и границы. Индекс поднялся не на медицине, а на пророчествах и конце света — люди искали не как лечиться, а чем всё это кончится.",
    whyEn:
      "On 30 March 2020 the country shut down: paid ‘non-working days’ were declared, schools, cafés and borders closed. The index rose not on medicine but on prophecy and end-times reading — people asked not how to be treated, but how all this ends.",
    fit: "точно",
  },
  {
    date: "2020-11-09",
    ru: "Вторая волна ковида",
    en: "The second covid wave",
    shortRu: "COVID, 2 волна",
    shortEn: "COVID wave 2",
    whyRu:
      "Осенью 2020-го заболеваемость и смертность впервые перекрыли весенние, но локдауна больше не объявляли — тревога тянулась месяцами без единого громкого дня. Опрос ставит эту неделю восьмой, индекс — тридцать второй: затяжное он видит хуже, чем резкий удар.",
    whyEn:
      "In autumn 2020 cases and deaths first exceeded the spring peak, but no lockdown was declared — the anxiety dragged on for months with no single loud day. The poll ranks this week eighth, the index thirty-second: it sees the drawn-out worse than a sharp blow.",
    fit: "мимо",
  },
  {
    date: "2022-02-28",
    ru: "Вторжение в Украину",
    en: "The invasion of Ukraine",
    shortRu: "Вторжение",
    shortEn: "Invasion",
    whyRu:
      "24 февраля 2022-го началось вторжение; в те же дни рухнул рубль, закрылось небо и легли Visa и Mastercard. Индекс ставит эту неделю восьмой, опрос ФОМа — пятьдесят девятой: чтение вспыхнуло сразу, а настроение по опросу поднялось только к осени.",
    whyEn:
      "The invasion began on 24 February 2022; in those same days the rouble collapsed, airspace closed and Visa and Mastercard stopped working. The index ranks this week eighth, the poll fifty-ninth: reading flared at once, while the polled mood only rose by autumn.",
    fit: "мимо",
  },
  {
    date: "2022-09-19",
    ru: "Объявлена мобилизация",
    en: "Mobilisation announced",
    shortRu: "Мобилизация",
    shortEn: "Mobilisation",
    whyRu:
      "21 сентября 2022-го объявили «частичную мобилизацию»: повестки, очереди на выезд, закрывающиеся границы. Единственный случай полного согласия на вершине — обе меры называют эту неделю самой тревожной за всё время наблюдений, и читали тогда ровно то, что решает судьбу: категории годности, военно-учётную специальность, отсрочку.",
    whyEn:
      "On 21 September 2022 ‘partial mobilisation’ was declared: call-up papers, queues at the exits, borders closing. The one case of full agreement at the top — both measures call this the most anxious week on record, and the reading was exactly what decides a fate: fitness categories, military speciality codes, deferment.",
    fit: "точно",
  },
  {
    date: "2023-06-19",
    ru: "Мятеж Пригожина",
    en: "The Prigozhin mutiny",
    shortRu: "Мятеж",
    shortEn: "Mutiny",
    whyRu:
      "24 июня 2023-го колонна ЧВК «Вагнер» заняла Ростов и пошла на Москву, а к вечеру повернула назад. Ни индекс, ни опрос ФОМа не шелохнулись: про мятеж читали запоем, но не искали ни отсрочку, ни лекарства — на него смотрели как на зрелище, а не как на угрозу себе.",
    whyEn:
      "On 24 June 2023 a Wagner column took Rostov and marched on Moscow, then turned back by evening. Neither index nor poll moved: people read about the mutiny avidly but looked up neither deferments nor medicines — they watched it as a spectacle, not as a threat to themselves.",
    fit: "молчат",
  },
  {
    date: "2024-03-25",
    ru: "Теракт в «Крокус Сити Холле»",
    en: "The Crocus City Hall attack",
    shortRu: "«Крокус»",
    shortEn: "Crocus",
    whyRu:
      "22 марта 2024-го в подмосковном концертном зале расстреляли и подожгли зал: 145 погибших, крупнейший теракт в России за двадцать лет. Индекс поставил эту неделю 38-й из 302, опрос ФОМа по уровню — 141-й: 2024-й был спокойным годом, и скачок опроса в десять пунктов утонул в низком фоне. Здесь расходятся не мелочи: событие бесспорное, а уровень опроса на нём почти не двинулся.",
    whyEn:
      "On 22 March 2024 gunmen shot up and burned a concert hall outside Moscow: 145 dead, the deadliest attack in Russia in twenty years. The index ranks this week 38th of 302, the poll by level 141st: 2024 was a calm year and the poll’s ten-point leap drowned in a low background. The disagreement is not a detail: the event is beyond dispute, and the poll’s level barely moved.",
    fit: "мимо",
  },
  {
    date: "2024-08-05",
    ru: "Бои в Курской области",
    en: "Fighting in the Kursk region",
    shortRu: "Курск",
    shortEn: "Kursk",
    whyRu:
      "6 августа 2024-го украинские войска вошли в Курскую область — впервые с 1941 года бои шли на признанной российской земле, десятки тысяч человек эвакуировали. Индекс поставил неделю 82-й из 302, опрос ФОМа — 120-й: обе меры сдержанны, но индекс поднялся заметно выше.",
    whyEn:
      "On 6 August 2024 Ukrainian forces entered the Kursk region — the first fighting on undisputed Russian soil since 1941, with tens of thousands evacuated. The index ranked it 82nd of 302, the poll 120th: both restrained, but the index rose markedly higher.",
    fit: "точно",
  },
  {
    date: "2026-07-06",
    ru: "Эскалация войны, июль 2026",
    en: "War escalation, July 2026",
    shortRu: "Эскалация",
    shortEn: "Escalation",
    // ЧТО ЗДЕСЬ НАПИСАНО. Только то, что видно в самих числах: какие темы
    // поднялись, насколько и в каком порядке. Названия события в новостях мы
    // не приводим -- индекс его не знает, он знает, что люди читали.
    whyRu:
      "Пятая по тревожности неделя из 355 — и первая такая после мобилизации 2022 года. Поднялось не чтение вообще, а именно то, за чем стоит решение о себе: «Мобилизация» дала 541 просмотр сверх обычного, следом «Военное положение» и «Комендантский час». Через неделю они поменялись местами — «Военное положение» вышло вперёд с 514, — а ещё через неделю добавились «Бомбоубежище» и «Йодид калия». Три недели подряд не ниже 55: так ведёт себя не одна новость, а нарастание. Опрос ФОМа в те же недели стоял на 53 % — 37-е место из 302: расхождение здесь одно из крупнейших за весь ряд.",
    whyEn:
      "The fifth most anxious week of 355 — and the first of its kind since the 2022 mobilisation. What rose was not reading in general but the kind that precedes a decision about oneself: ‘Mobilisation’ gave 541 views above normal, then ‘Martial law’ and ‘Curfew’. A week later they swapped places — ‘Martial law’ took the lead with 514 — and a week after that ‘Bomb shelter’ and ‘Potassium iodide’ joined in. Three weeks above 55 in a row: that is not one piece of news but a build-up. The FOM poll stood at 53% through those weeks — 37th of 302: one of the largest disagreements in the whole series.",
    fit: "врозь",
  },
];

export const EVENT_BY_DATE: Record<string, Ev> = Object.fromEntries(
  EVENTS.map((e) => [e.date, e]),
);

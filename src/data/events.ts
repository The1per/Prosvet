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
  fit: "точно" | "мимо" | "молчат";
};

export const EVENTS: Ev[] = [
  {
    date: "2018-12-10",
    ru: "Ложная тревога, декабрь 2018",
    en: "False alarm, December 2018",
    shortRu: "Ложная",
    shortEn: "False alarm",
    whyRu:
      "Ничего не случилось — и в этом всё дело. Прибор подняли предсказатели: «Конец света» читали в 15,9 раза больше, чем на соседних неделях, «Отче наш» в 4 раза, «Нострадамус» в 3,8, в среду был всплеск «Ванги». Это середина декабря — пора предсказаний на будущий год, календарь, а не тревога. Мировая опора тут бессильна: в мире этого не читали, читали мы.",
    whyEn:
      "Nothing happened — and that is the point. What lifted the instrument was prophecy: “The end of the world” was read 15.9 times more than in neighbouring weeks, “Our Father” 4 times, “Nostradamus” 3.8, with a spike of “Baba Vanga” on the Wednesday. This is mid-December, the season of predictions for the coming year — a calendar, not anxiety. The world anchor is powerless here: the world was not reading this, we were.",
    fit: "мимо",
  },
  {
    date: "2020-03-30",
    ru: "Ковид: объявлены нерабочие дни",
    en: "Covid: non-working days declared",
    shortRu: "Локдаун",
    shortEn: "Lockdown",
    whyRu:
      "30 марта 2020-го страну закрыли: объявлены «нерабочие дни» с сохранением зарплаты, закрылись школы, кафе и границы. Прибор поднялся не на медицине, а на пророчествах и конце света — люди искали не как лечиться, а чем всё это кончится.",
    whyEn:
      "On 30 March 2020 the country shut down: paid ‘non-working days’ were declared, schools, cafés and borders closed. The instrument rose not on medicine but on prophecy and end-times reading — people asked not how to be treated, but how all this ends.",
    fit: "точно",
  },
  {
    date: "2020-11-09",
    ru: "Вторая волна ковида",
    en: "The second covid wave",
    shortRu: "2-я волна",
    shortEn: "Second wave",
    whyRu:
      "Осенью 2020-го заболеваемость и смертность впервые перекрыли весенние, но локдауна больше не объявляли — тревога тянулась месяцами без единого громкого дня. Опрос ставит эту неделю восьмой, прибор — тридцать второй: затяжное он видит хуже, чем резкий удар.",
    whyEn:
      "In autumn 2020 cases and deaths first exceeded the spring peak, but no lockdown was declared — the anxiety dragged on for months with no single loud day. The poll ranks this week eighth, the instrument thirty-second: it sees the drawn-out worse than a sharp blow.",
    fit: "мимо",
  },
  {
    date: "2022-02-21",
    ru: "Признание ДНР и ЛНР",
    en: "Recognition of the DNR and LNR",
    shortRu: "Признание",
    shortEn: "DNR",
    whyRu:
      "21 февраля 2022-го Россия признала ДНР и ЛНР и ввела туда войска — за три дня до вторжения. Прибор и опрос сошлись близко: тревога поднялась ещё до 24 февраля, люди поняли, к чему идёт.",
    whyEn:
      "On 21 February 2022 Russia recognised the DNR and LNR and sent troops in — three days before the invasion. Instrument and poll agreed closely: anxiety rose before 24 February; people saw where it was going.",
    fit: "точно",
  },
  {
    date: "2022-02-28",
    ru: "Вторжение в Украину",
    en: "The invasion of Ukraine",
    shortRu: "Вторжение",
    shortEn: "Invasion",
    whyRu:
      "24 февраля 2022-го началось вторжение; в те же дни рухнул рубль, закрылось небо и легли Visa и Mastercard. Прибор ставит эту неделю восьмой, опрос — пятьдесят девятой: чтение вспыхнуло сразу, а настроение по опросу поднялось только к осени.",
    whyEn:
      "The invasion began on 24 February 2022; in those same days the rouble collapsed, airspace closed and Visa and Mastercard stopped working. The instrument ranks this week eighth, the poll fifty-ninth: reading flared at once, while the polled mood only rose by autumn.",
    fit: "мимо",
  },
  {
    date: "2022-09-19",
    ru: "Объявлена мобилизация",
    en: "Mobilisation announced",
    shortRu: "Мобилизация",
    shortEn: "Mobilisation",
    whyRu:
      "21 сентября 2022-го объявили «частичную мобилизацию»: повестки, очереди на выезд, закрывающиеся границы. Единственный случай полного согласия на вершине — обе меры называют эту неделю самой тревожной за одиннадцать лет, и читали тогда ровно то, что решает судьбу: категории годности, военно-учётную специальность, отсрочку.",
    whyEn:
      "On 21 September 2022 ‘partial mobilisation’ was declared: call-up papers, queues at the exits, borders closing. The one case of full agreement at the top — both measures call this the most anxious week in eleven years, and the reading was exactly what decides a fate: fitness categories, military speciality codes, deferment.",
    fit: "точно",
  },
  {
    date: "2023-06-19",
    ru: "Мятеж Пригожина",
    en: "The Prigozhin mutiny",
    shortRu: "Мятеж",
    shortEn: "Mutiny",
    whyRu:
      "24 июня 2023-го колонна ЧВК «Вагнер» заняла Ростов и пошла на Москву, а к вечеру повернула назад. Ни прибор, ни опрос не шелохнулись: про мятеж читали запоем, но не искали ни отсрочку, ни лекарства — на него смотрели как на зрелище, а не как на угрозу себе.",
    whyEn:
      "On 24 June 2023 a Wagner column took Rostov and marched on Moscow, then turned back by evening. Neither instrument nor poll moved: people read about the mutiny avidly but looked up neither deferments nor medicines — they watched it as a spectacle, not as a threat to themselves.",
    fit: "молчат",
  },
  {
    date: "2024-03-25",
    ru: "Теракт в «Крокус Сити Холле»",
    en: "The Crocus City Hall attack",
    shortRu: "«Крокус»",
    shortEn: "Crocus",
    whyRu:
      "22 марта 2024-го в подмосковном концертном зале расстреляли и подожгли зал: 145 погибших, крупнейший теракт в России за двадцать лет. По уровню опрос ставит неделю сто пятьдесят третьей, но по приращению — двадцать пятой из 306: 2024-й был спокойным годом, и скачок в десять пунктов утонул в низком фоне.",
    whyEn:
      "On 22 March 2024 gunmen shot up and burned a concert hall outside Moscow: 145 dead, the deadliest attack in Russia in twenty years. By level the poll ranks this week 153rd, but by jump 25th of 306: 2024 was a calm year and a ten-point leap drowned in a low background.",
    fit: "мимо",
  },
  {
    date: "2024-08-05",
    ru: "Бои в Курской области",
    en: "Fighting in the Kursk region",
    shortRu: "Курск",
    shortEn: "Kursk",
    whyRu:
      "6 августа 2024-го украинские войска вошли в Курскую область — впервые с 1941 года бои шли на признанной российской земле, десятки тысяч человек эвакуировали. Обе меры оценили это сдержанно: прибор восемьдесят третьей неделей, опрос — сто тридцать седьмой.",
    whyEn:
      "On 6 August 2024 Ukrainian forces entered the Kursk region — the first fighting on undisputed Russian soil since 1941, with tens of thousands evacuated. Both measures were restrained: the instrument ranked it 83rd, the poll 137th.",
    fit: "точно",
  },
];

export const EVENT_BY_DATE: Record<string, Ev> = Object.fromEntries(
  EVENTS.map((e) => [e.date, e]),
);

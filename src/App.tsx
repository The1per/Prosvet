import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Chart from "./components/Chart";
import People from "./components/People";
import Poll from "./components/Poll";
import { Breakdown, Methodology, Reads } from "./components/Panels";
import { BASELINE, LATEST, SERIES, ГРАНИЦА_ЭПОХ, indexOfDate, местоВЭпохе } from "./data/series";
import { EVENT_BY_DATE } from "./data/events";
import { T, fmtWeek, type Lang } from "./i18n";
import { moodColor, moodGlow, levelIndex, moodT } from "./mood";
import { useCounter, useLocal, useReveal, useТелефон } from "./hooks";



export default function App() {
  const [prefs, setPrefs] = useLocal("pai.prefs.v1", { lang: "ru" as Lang });
  const [sel, setSel] = useState(SERIES.length - 1);
  // Кривая опроса по умолчанию ВЫКЛЮЧЕНА: страница открывается своим
  // показанием, а сверка с опросом -- следующий шаг, по нажатию.
  const [showFom, setShowFom] = useState(false);
  // Пока посетитель ведёт ползунок опроса, отзываются силуэты и фигуры по
  // краям шкалы. ЧИСЛО И СВЕТ ЗА НИМ ВЕДЁТ ТОЛЬКО ПРИБОР: подменить показание
  // ответом посетителя значит показать ему его же ответ и выдать за измерение.
  const [preview, setPreview] = useState<number | null>(null);

  const lang = prefs.lang;
  const w = SERIES[sel];
  // Телефон -- не «узкий экран», а другая раскладка: один столбец, свой
  // порядок блоков и свой график. См. ТЕЛЕФОН в scale.ts.
  const телефон = useТелефон();
  // На телефоне опрос живёт в выдвижной панели, а не в потоке страницы.
  const [опросОткрыт, setОпросОткрыт] = useState(false);



  /**
   * ЗНАЧОК В БРАУЗЕРЕ -- ЦВЕТОМ ПОСЛЕДНЕЙ ПОСЧИТАННОЙ НЕДЕЛИ. В index.html
   * лежит запасной, в самом спокойном цвете шкалы: он нужен, пока страница
   * не открылась. Дальше показание известно, и вкладка красится по нему --
   * та же точка, что в шапке.
   *
   * Именно LATEST, а не выбранная неделя: значок -- про состояние страны на
   * сегодня, а не про то, куда посетитель ткнул мышью.
   */
  useEffect(() => {
    const c = moodColor(LATEST.idx, 6);
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
      "<circle cx='32' cy='32' r='32' fill='#0a0c12'/>" +
      "<circle cx='32' cy='32' r='19' fill='none' stroke='" + c + "' stroke-opacity='.3' stroke-width='3'/>" +
      "<circle cx='32' cy='32' r='10' fill='" + c + "'/></svg>";
    let l = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!l) {
      l = document.createElement("link");
      l.rel = "icon";
      document.head.appendChild(l);
    }
    l.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    // В заголовке вкладки -- аббревиатура и раздел: там места на полное имя
    // нет, а «ИКС» узнаётся и в списке из двадцати вкладок.
    document.title = (lang === "ru" ? "ИКС · " : "IIS · ") + T.section[lang];
  }, [lang]);

  // Свет должен идти ИЗ-ЗА САМОЙ ЦИФРЫ, а не из доли экрана: доля разъезжается
  // на любой другой ширине окна. Поэтому место цифры измеряется, и её середина
  // становится точкой свечения. Слой при этом неподвижен относительно окна --
  // свет остаётся сверху, когда страницу листают вниз.
  const numRef = useRef<HTMLSpanElement>(null);
  const [gspot, setGspot] = useState({ x: 220, y: 420 });
  useLayoutEffect(() => {
    const мера = () => {
      const el = numRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setGspot({ x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY });
    };
    мера();
    window.addEventListener("resize", мера);
    return () => window.removeEventListener("resize", мера);
  }, []);

  /* Место под легенду держится всегда: иначе нажатие на кнопку сдвигало бы
     всё, что ниже, на её высоту. На телефоне -- только когда она нужна. */
  /**
   * Легенда к кривой опроса. На экране место под неё держится всегда: иначе
   * нажатие сдвигало бы всё, что ниже, на её высоту. На телефоне она висит
   * ПОД кнопкой отдельным слоем и не двигает вообще ничего -- строка там
   * тесная, и лишняя её высота съедала бы график.
   */
  const легенда = (
    <div
      style={{ visibility: showFom ? "visible" : "hidden" }}
      hidden={телефон && !showFom}
    >
      <div
        className={
          // На экране легенда стоит СТОЛБИКОМ: в строку она была 270 пикселей
          // шириной и ровно на них раздувала блок, из-за чего числам и строю
          // не хватало места в ряду.
          "flex flex-col gap-y-0.5 " + (телефон ? "text-[13px]" : "text-[14.5px]")
        }
        style={{ color: "var(--ink-3)" }}
      >
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3.5 w-3.5 rounded" style={{ background: "var(--cool)" }} />
          {T.gapUp[lang]}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3.5 w-3.5 rounded" style={{ background: "var(--violet)" }} />
          {T.gapDown[lang]}
        </span>
      </div>
    </div>
  );

  /**
   * КУСКИ УПРАВЛЕНИЯ ЗАВЕДЕНЫ ОДИН РАЗ, а стоят в разных местах: на экране --
   * в верхнем ряду, рядом с числами, на телефоне -- каждый у своего числа.
   * Дважды написанная разметка разъезжается при первой же правке.
   */
  const парФОМ = (
    // shrink-0 и nowrap: пара не имеет права разъезжаться на две строки. Когда
    // кнопку увеличили, ей перестало хватать восьми пикселей, и число оставалось
    // на строке места, а кнопка падала под неё -- будто это разные вещи.
    <div className="relative flex shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap">
      <FomNumber fom={w.fom} idx={w.idx} lang={lang} phone={телефон} />
      <FomButton lang={lang} on={showFom} onToggle={() => setShowFom((s) => !s)} phone={телефон} />
    </div>
  );
  const кнопкаОпроса = (
    <button
      type="button"
      onClick={() => setОпросОткрыт(true)}
      className={"pollbtn font-semibold " + (телефон ? "max-w-[100px] px-2 py-1.5 text-[12px] leading-tight" : "whitespace-nowrap px-3 py-1.5 text-[13px]")}
      /* Пульсирует цветом показания той недели, что сейчас на экране: спокойная
         неделя -- спокойное свечение, тревожная -- тревожное. */
      style={{
        ["--pulse-1" as string]: moodColor(w.idx, 6, 0.34),
        ["--pulse-2" as string]: moodColor(w.idx, 6, 0.16),
        ["--pulse-3" as string]: moodColor(w.idx, 6, 0.4),
        ["--pulse-4" as string]: moodColor(w.idx, 6, 0.75),
      }}
    >
      {T.pollOpen[lang]}
    </button>
  );
  const heroRef = useReveal<HTMLDivElement>();
  // 140 мс, а не полсекунды: при движении по графику число не должно
  // отставать от курсора -- иначе кажется, что оно не поспевает за неделей.
  const shown = useCounter(w.idx, 140);
  const delta = Math.round(((w.idx - BASELINE) / BASELINE) * 100);
  /**
   * Изменение к ПРЕДЫДУЩЕЙ неделе, в процентах. У самой первой недели ряда
   * предыдущей нет -- там прочерк, а не ноль: ноль означал бы «не изменилось».
   */
  const пред = sel > 0 ? SERIES[sel - 1] : null;
  const дельтаНед = пред ? Math.round(((w.idx - пред.idx) / пред.idx) * 100) : null;
  const level = T.levels[lang][levelIndex(w.idx)];
  // Свет за индексом ведёт ТОЛЬКО прибор. У опроса свой свет -- внутри его
  // карточки, и его ведёт ползунок: два разных показания не должны светить
  // одним и тем же цветом из одного места.
  // Пик и место считаются ВНУТРИ эпохи недели: до 2020-го прибор короче, и
  // ранжировать через эту границу нельзя. См. ГРАНИЦА_ЭПОХ в data/series.
  const ранняя = w.date < ГРАНИЦА_ЭПОХ;
  const место = местоВЭпохе(w.date);
  const glow = moodGlow(w.idx);
  const color = moodColor(w.idx, 6);

  const jumpTo = (d: string) => {
    const i = SERIES.findIndex((s) => s.date === d);
    if (i >= 0) setSel(i);
  };

  return (
    <div className="relative min-h-screen">
      {/* Свет НЕПОДВИЖЕН относительно окна: он начинается сверху от числа и
          остаётся с читателем, пока он листает. Раньше он был приклеен к
          самому числу и уезжал вместе с ним. */}
      <div
        className="glow-echo"
        aria-hidden
        style={{
          ["--g2" as string]: glow.mid,
          ["--g3" as string]: glow.far,
          ["--gx" as string]: `${gspot.x}px`,
        }}
      />
      <div
        className="numglow"
        aria-hidden
        style={{
          ["--g1" as string]: glow.core,
          ["--g2" as string]: glow.mid,
          ["--g3" as string]: glow.far,
          ["--gx" as string]: `${gspot.x}px`,
          ["--gy" as string]: `${gspot.y}px`,
          ["--gs" as string]: `${(1 + 0.3 * moodT(w.idx)).toFixed(2)}`,
        }}
      />
      <div className="grid-bg" />
      <div className="noise" />

      <header
        className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 76%, transparent)" }}
      >
        <div className="mx-auto flex max-w-[1920px] items-center gap-3 px-2 py-1.5 sm:px-3">
          <Pulse idx={w.idx} />
          {/* На телефоне заголовок обрезался на «трев»: там нет места ни на
              кегль 20, ни на годы в одну строку с ним. Кегль меньше, годы --
              строкой ниже и мелко. */}
          <h1
            className={
              "flex min-w-0 flex-col font-bold tracking-tight " +
              (телефон
                ? "text-[16px] leading-tight"
                : "flex-row items-baseline gap-3 truncate text-[20px] sm:text-[26px]")
            }
          >
            {/* ИКС СОБИРАЕТСЯ НА ГЛАЗАХ: первые буквы трёх слов выделены
                цветом показания и стоят чуть крупнее. Расшифровывать
                аббревиатуру отдельной строкой не нужно -- она и есть строка. */}
            <span className={телефон ? "truncate" : "whitespace-nowrap"}>
              {T.titleParts[lang].map(([буква, хвост], i) => (
                <span key={буква + i}>
                  {i > 0 ? " " : ""}
                  {/* Буквы не перекрашены -- они ПОМЕЧЕНЫ: крупнее остальных и
                      с чертой снизу. Одним цветом кривой на серебряном тексте
                      разницы не видно вовсе, а черта под буквой -- обычный
                      знак аббревиатуры, и читается сразу. */}
                  <span
                    style={{
                      color: "var(--curve)",
                      fontSize: "1.22em",
                      // Черта живёт цветом показания: имя и число -- об одном.
                      borderBottom: "2px solid " + color,
                      paddingBottom: "1px",
                      textShadow: "0 0 12px color-mix(in srgb, var(--curve) 60%, transparent)",
                    }}
                  >
                    {буква}
                  </span>
                  {хвост}
                </span>
              ))}
            </span>
            {/* Раздел -- то, что показано на этой странице. Отделён точкой и
                набран обычным начертанием: это не часть имени. */}
            <span
              className={
                "shrink-0 font-normal " + (телефон ? "text-[13px]" : "text-[19px] sm:text-[21px]")
              }
              style={{ color: "var(--ink-2)" }}
            >
              {телефон ? "" : "· "}
              {T.section[lang]}
            </span>
            <span
              className={
                "mono shrink-0 font-normal tracking-normal " +
                (телефон ? "text-[12.5px]" : "text-[16.5px]")
              }
              style={{ color: "var(--ink-3)" }}
            >
              {T.badge[lang](SERIES[0].date.slice(0, 4), SERIES[SERIES.length - 1].date.slice(0, 4), SERIES.length)}
            </span>
          </h1>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="btn mono px-3.5 py-1.5 text-[17px]" onClick={() => setPrefs({ ...prefs, lang: lang === "ru" ? "en" : "ru" })}>
              {lang === "ru" ? "EN" : "RU"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1920px] px-2 pb-8 pt-2 sm:px-3">
        {/* Заголовка над числом больше нет: страница открывается показанием.
            Кто такие «мы» и почему не спрашиваем -- сказано ниже, в разделе
            «как это измерено», где этому и место. */}
        {/* Колонки одной высоты: слабину забирает карточка опроса, поэтому
            график слева и разбор недели справа кончаются на одном уровне. */}
        {/* Порог md, а не xl: страница масштабируется (см. scale.ts), и на
            экране 1024 её действующая ширина -- 1600, места на две колонки
            хватает. С порогом xl колонки схлопывались там, где не нужно. */}
        <section
          className={
            телефон
              ? "flex flex-col gap-3"
              : "grid gap-3 md:grid-cols-[minmax(0,1fr)_374px]"
          }
        >
          {/* СТОЛБЦЫ ОДНОЙ ВЫСОТЫ -- и это безопасно ровно потому, что высота
              графика закреплена: карточка тянется за разбором, но внутри ничего
              не двигается, слабина уходит вниз, под чтение недели. Пока график
              растягивался по карточке, он на этом прыгал на 444 пикселя при
              переходе на другую неделю. */}
          <div
            ref={heroRef}
            className={"card reveal in flex h-full flex-col overflow-hidden " + (телефон ? "p-2" : "p-3 sm:p-4")}
          >
            {/* ПАРЫ «ЗНАЧЕНИЕ + ПОДПИСЬ», А НЕ СЕТКА. Прежде здесь была сетка с
                жёсткими колонками (392+324+124+92 и просветы) -- на экране уже
                1280 она вылезала за край и не переносилась в принципе.
                Теперь каждая пара -- свой блок, а выравнивание держится не
                колонками, а ОДИНАКОВОЙ ВЫСОТОЙ верхней части у всех блоков:
                значения садятся на общую линию, подписи начинаются на общей.
                Такой ряд переносится сам и влезает в любую ширину. */}
            {/* На телефоне общая высота блоков не нужна: они стоят друг под
                другом, и выравнивать нечего, а 76 пикселей у каждого -- это
                пустой воздух перед графиком. Число и строй занимают всю
                ширину, два сравнения встают рядом сами. */}
            <div
              /* НА КОМПЬЮТЕРЕ РЯД НЕ ПЕРЕНОСИТСЯ ВОВСЕ (lg:flex-nowrap). Пик
                 тревоги -- последний блок ряда -- срывался на вторую строку,
                 стоило любому блоку подрасти на несколько пикселей: запас там
                 восемь пикселей из 1156. Раскладка рассчитана на ширину 1600 и
                 сжимается zoom-ом целиком (scale.ts), поэтому переносить её
                 незачем -- она и так влезает в любое окно шире 1024.
                 Ниже 1024 zoom упирается в свой предел и ширины уже не
                 хватает: там перенос остаётся, для того он и оставлен. */
              className={
                "flex flex-wrap items-start lg:flex-nowrap " +
                (телефон ? "mb-2 gap-x-3 gap-y-2" : "mb-3 gap-x-5 gap-y-3")
              }
            >
              {/* Блок числа занимает всю ширину, но НЕ ЯВЛЯЕТСЯ рядом: пока
                  он был флексом, колонка с датой сжималась по содержимому, и
                  строка под ней ездила вправо-влево на длине даты вместе с
                  кнопкой ФОМа. */}
              {/* ШИРИНА БЛОКА НА КОМПЬЮТЕРЕ ЗАКРЕПЛЕНА. Строка места -- «81-я из
                  329 с 2020» -- меняет длину от недели к неделе: у ранга то
                  одна цифра, то три, а на границе эпох меняется и знаменатель,
                  и хвост. Пока ширина бралась по содержимому, самая длинная
                  строка блока раздвигала его -- и весь ряд правее, строй с
                  человечками и оба сравнения, ездил вбок при каждом движении
                  по графику. */}
              <div className={телефон ? "w-full" : "shrink-0"} style={телефон ? undefined : { width: ШИРИНА_ЧИСЛА }}>
                <div>
                {/* Надписи «прошедшая неделя» над числом больше нет: дата
                    недели стоит прямо под числом и говорит то же самое. */}
                {/* Число прижато к ВЕРХУ ряда, как и строй: прижатое к низу
                    76-пиксельной коробки, оно оказывалось ниже человечков. */}
                <div className={"flex flex-col " + (телефон ? "pt-1.5" : "")}>
                  <div className="flex items-end gap-2">
                    <span
                      ref={numRef}
                      className={
                        "mono font-bold leading-[0.84] " +
                        (телефон ? "text-[46px]" : "text-[44px] sm:text-[54px] lg:text-[64px]")
                      }
                      style={{ color, transition: "color 0.4s ease" }}
                    >
                      {shown.toFixed(1)}
                    </span>
                    {/* Рядом с числом стоит ПОСТОЯННАЯ подпись, а не слово
                        уровня. Слово меняло длину от недели к неделе («штиль»
                        против «напряжения»), а от его длины зависела ширина
                        первого блока -- и весь ряд ездил вбок. Слово уровня
                        переехало к строю: там оно живёт внутри блока
                        постоянной ширины и ничего не двигает. */}
                    <span className={"whitespace-nowrap pb-1 " + (телефон ? "text-[15px]" : "text-[17px]")} style={{ color: "var(--ink-2)" }}>
                      {/* ЗНАЧКА ПРОЦЕНТА БОЛЬШЕ НЕТ. Показание -- не доля
                          чего-либо: это место недели в истории, приведённое к
                          шкале опроса. Процент рядом с ним обещал долю и
                          обещал зря. */}
                      ·{" "}
                      {/* Подпись -- ссылка вниз, к разбору метода: человек,
                          который спросит «по каким ещё следам?», получает
                          ответ в одно нажатие, а не поиском по странице.
                          Звёздочка и подчёркивание -- чтобы было видно, что на
                          неё вообще можно нажать. */}
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("как-измерено")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }
                        className={
                          "whitespace-pre-line text-left underline decoration-dotted underline-offset-4 font-medium leading-tight " +
                          (телефон ? "text-[15px]" : "text-[18px]")
                        }
                        style={{ background: "none", border: "none", padding: 0, color: "var(--ink)", cursor: "pointer" }}
                      >
                        <span className="block">{T.basis[lang]}</span>
                        <span className="block">{T.basis2[lang]}*</span>
                      </button>
                    </span>
                  </div>
                </div>
                {/* Пара ФОМа стоит НА УРОВНЕ СТРОКИ НЕДЕЛИ: вровень с числом
                    она спорила с ним за верх карточки, а числа тут два разных
                    и путать их нельзя. */}
                <div className="mono mt-1.5">
                  <div>
                  {/* На телефоне дата мельче и НЕ ПЕРЕНОСИТСЯ: на длинных
                      датах она разъезжалась на две строки, и весь блок под
                      индексом прыгал от недели к неделе. */}
                  <div
                    className={
                      "font-semibold " + (телефон ? "whitespace-nowrap text-[16px]" : "text-[18px] sm:text-[19px]")
                    }
                    style={{ color: "var(--ink)" }}
                  >
                    {fmtWeek(w.date, lang)}
                  </div>
                  {/* Пара ФОМа стоит на строке МЕСТА, а не даты. На строке
                      даты её выносило за край экрана: дата не переносится, а
                      длина у неё гуляет на семьдесят пикселей от недели к
                      неделе -- кнопка ездила следом. Строка места короткая и
                      почти постоянная. */}
                  <div
                    className={
                      "mt-0.5 flex items-end justify-between gap-3 " +
                      (телефон ? "text-[13.5px]" : "text-[19px]")
                    }
                    style={{ color: "var(--ink-3)" }}
                  >
                    <span className="whitespace-nowrap tabular-nums">{T.placeInEra[lang](место.место, место.всего, ранняя)}</span>
                    {телефон && <span className="shrink-0">{парФОМ}</span>}
                  </div>
                  {/* НА ЭКРАНЕ ПАРА ФОМа СТОИТ СВОЕЙ СТРОКОЙ. Кнопку увеличили,
                      и втроём -- место, число опроса, кнопка -- они перестали
                      помещаться в ширину блока: кнопка срывалась под строку
                      сама, а число оставалось наверху, будто это разные вещи.
                      Своей строкой пара держится вместе и читается как одно
                      целое: показание опроса и переключатель его кривой. */}
                  {!телефон && <div className="mt-2 flex">{парФОМ}</div>}
                  </div>
                </div>
                </div>
              </div>

              <div className={телефон ? "w-full" : "shrink-0"}>
                {/* НА ТЕЛЕФОНЕ КНОПКА ОПРОСА -- СПРАВА ОТ ФИГУР, вровень с
                    кнопкой ФОМа строкой выше: две кнопки в столбик читаются
                    как пара. Прежде она стояла в ряду сравнений, через две
                    строки от той, с которой её и надо сравнивать глазом. */}
                <div className={телефон ? "flex items-center justify-between gap-3" : "flex items-end"}>
                  <People idx={w.idx} lang={lang} preview={preview} part="строй" phone={телефон} level={level} />
                  {телефон && <div className="flex w-[111px] shrink-0 justify-center">{кнопкаОпроса}</div>}
                </div>
                {/* На экране подписи здесь нет вовсе: и главная строка, и пол
                    опроса стоят внутри part="строй" -- одна справа от фигур,
                    другой прямо под ними. Иначе между фигурами и полом
                    оставался провал в высоту главной строки. */}
                {телефон && (
                  <div className="mt-2">
                    <People idx={w.idx} lang={lang} preview={preview} part="подпись" phone level={level} />
                  </div>
                )}
              </div>

              <div className={телефон ? "" : "shrink-0"}>
                {/* Прижаты к ВЕРХУ ряда, как число и строй: в коробке на 76
                    пикселей с прижатием к низу они висели заметно ниже всего
                    остального и читались как приписка. */}
                <div className="flex items-start">
                  <Kpi v={`${delta > 0 ? "+" : ""}${delta}%`} c={moodColor(w.idx, 6)} phone={телефон} />
                </div>
                <div className={телефон ? "mt-1 max-w-[150px]" : "mt-1.5 w-[108px]"}>
                  <KpiLabel l={T.vsBaseline[lang]} phone={телефон} />
                </div>
              </div>

              <div className={телефон ? "" : "shrink-0"}>
                <div className="flex items-start">
                  <Kpi
                    v={`${дельтаНед == null ? "—" : (дельтаНед > 0 ? "+" : "") + дельтаНед}%`}
                    c={дельтаНед == null ? "var(--ink-3)" : moodColor(w.idx, 6)}
                    phone={телефон}
                  />
                </div>
                <div className={телефон ? "mt-1 max-w-[150px]" : "mt-1.5 w-[108px]"}>
                  <KpiLabel l={T.vsPrev[lang]} phone={телефон} />
                </div>
              </div>

            </div>

            {/* НА ТЕЛЕФОНЕ над графиком остаётся только лупа и, когда опрос
                включён, его легенда. Всё остальное управление разошлось по
                своим числам в ряду выше. Поле поиска во всю ширину стоило
                здесь целой строки, а нужно оно редко -- поэтому лупа. */}

            {/* ВЫСОТА ГРАФИКА ЗАКРЕПЛЕНА и ни от чего на странице не зависит.
                Растягивать его по высоте карточки нельзя: карточка тянется за
                правым столбиком, а разбор у разных недель разной длины -- и
                график менял рост при переходе на другую неделю, в том числе
                когда курсор просто проходил по кривой. Слабина карточки
                уходит вниз, под чтение недели, где она никому не мешает. */}
            {/* Поиск сидит В ПРАВОМ ВЕРХНЕМ УГЛУ ГРАФИКА. Своей строкой он
                стоил высоты перед кривой, а полем во всю ширину -- ещё и
                места в ряду показателей. Ряд подписей событий укорочен
                справа ровно на его ширину, чтобы они не встретились. */}
            {/* ВАЖНЫЕ ДАТЫ НА ТЕЛЕФОНЕ -- ОДНОЙ ПОЛОСОЙ НАД ГРАФИКОМ.
                Прежде они стояли рамками внутри самого поля, в три-четыре
                ряда, и держали сто пятьдесят семь пикселей верхнего поля --
                почти половину высоты, отданной кривой. Теперь это лента:
                события идут по порядку слева направо, лишние уезжают за край
                и достаются пальцем. Кривая получила эти полтораста пикселей,
                а на ней остались точки событий -- где они лежат, видно и без
                подписей. */}
            {телефон && <ПолосаСобытий lang={lang} sel={sel} onSel={setSel} />}

            <div className="flex h-[var(--chart-h,360px)] flex-none flex-col">
              <Chart
                data={SERIES}
                lang={lang}
                sel={sel}
                onSel={setSel}
                showFom={showFom}
                phone={телефон}
                уголок={
                  <div className="flex flex-col items-start gap-2">
                    <EventSearch lang={lang} onPick={jumpTo} phone />
                    {/* Легенда стоит ПОД ЛУПОЙ, В УГЛУ САМОГО ПОЛЯ -- и на
                        телефоне тоже. Прежде на телефоне она висела отдельным
                        слоем под кнопкой опроса, то есть в строке с числами:
                        объясняла цвета кривой, стоя далеко от кривой. */}
                    {легенда}
                  </div>
                }
              />
            </div>

            {/* Чтение недели -- сразу под кривой, в той же карточке: выбрал
                неделю, тут же видно, что на ней читали. Заодно левая колонка
                догоняет правую по высоте, и они кончаются вровень.
                На телефоне чтение уезжает ниже опроса -- см. ниже. */}
            {/* Отрицательного отступа здесь больше нет. Он ставился, когда у
                холста снизу была пустая полоса в девяносто пикселей и чтение
                нужно было подтянуть к оси. Полосы давно нет -- холст мерится по
                коробке, -- и отступ стал вычитать не пустоту, а сами подписи
                годов: они уходили под заголовок «Что читали в эту неделю». */}
            {/* my-auto: блок садится ПО ЦЕНТРУ того места, что осталось под
                графиком. Прижатый к графику он оставлял пустоту внизу,
                прижатый к низу -- пустоту сверху. */}
            {!телефон && (
              <div className="my-auto border-t pt-3" style={{ borderColor: "var(--line)" }}>
                <Reads w={w} lang={lang} />
              </div>
            )}
          </div>

          {телефон ? (
            /* ПОРЯДОК НА ТЕЛЕФОНЕ. Опрос стоит сразу под графиком, до чтения
               недели: человека спрашивают, пока он смотрит на кривую, а не
               после трёх экранов списков. Разбор -- следом, он объясняет ту же
               неделю. Чтение -- последним: это самая длинная часть, и листать
               её мимо вопроса было бы наоборот. */
            <>
              {/* Опроса здесь нет: на телефоне он выдвигается сбоку по кнопке
                  внизу экрана. В потоке он вставал поперёк дороги к разбору, а
                  свернуть его значило прятать то, ради чего человека и позвали. */}
              <Breakdown w={w} lang={lang} baseline={BASELINE} />
              <div className="card p-4">
                <Reads w={w} lang={lang} />
              </div>
            </>
          ) : (
            /* ПРАВЫЙ СТОЛБИК ПОКАЗЫВАЕТСЯ ЦЕЛИКОМ. Прежде он стоял абсолютным
               слоем с прокруткой внутри: так высота страницы не менялась от
               недели к неделе, но длинный разбор приходилось прокручивать в
               окошке. Теперь наоборот -- высоту ряда задаёт тот столбик,
               который выше, а график слева забирает слабину и растёт вместе с
               ним. Цена: страница меняет высоту от недели к неделе. */
            <div className="flex flex-col gap-3">
              <Poll idx={w.idx} weekDate={LATEST.date} lang={lang} onPreview={setPreview} />
              <Breakdown w={w} lang={lang} baseline={BASELINE} />
            </div>
          )}
        </section>


        <div className="mb-4 mt-10 flex items-center gap-3">
          <span className="mono text-[16.5px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-3)" }}>
            {T.scrollHint[lang]}
          </span>
          <span className="h-px flex-1" style={{ background: "var(--line)" }} />
        </div>
        <Methodology lang={lang} />

      </main>

      {/* ВЫДВИЖНОЙ ОПРОС НА ТЕЛЕФОНЕ.
          Кнопка держится внизу экрана и видна всегда -- на любой высоте
          прокрутки, а не только там, куда человек долистал. Панель уезжает
          вправо за край и возвращается по нажатию; когда опрос пройден, она
          задвигается сама.
          Панель нарисована ВСЕГДА, а не по условию: анимации нужен элемент,
          который уже стоит на месте, иначе он появлялся бы рывком. */}
      {телефон && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ pointerEvents: опросОткрыт ? "auto" : "none" }}
            aria-hidden={!опросОткрыт}
          >
            <div
              onClick={() => setОпросОткрыт(false)}
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.5)",
                opacity: опросОткрыт ? 1 : 0,
                transition: "opacity .28s ease",
              }}
            />
            <div
              className="absolute right-0 top-0 flex h-full w-[min(430px,94vw)] flex-col overflow-y-auto p-3"
              style={{
                background: "var(--bg)",
                borderLeft: "1px solid var(--line-strong)",
                transform: опросОткрыт ? "translateX(0)" : "translateX(102%)",
                transition: "transform .28s ease",
              }}
            >
              <button
                type="button"
                onClick={() => setОпросОткрыт(false)}
                className="mono mb-2 self-end px-2 py-1 text-[15px] underline-offset-4"
                style={{ color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer" }}
              >
                {T.pollClose[lang]} ✕
              </button>
              <Poll
                idx={w.idx}
                weekDate={LATEST.date}
                lang={lang}
                onPreview={setPreview}
                phone
                /* ПАНЕЛЬ НЕ ЗАКРЫВАЕТСЯ САМА. Прежде она уезжала через секунду
                   после ответа -- ровно тогда, когда человеку показывали, как
                   его ответ лёг среди прочих и среди недель опроса. Читать это
                   было некогда. Закрывает теперь только он сам. */
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * РАЗБОР ДНЯ ИЗ СТРОКИ ПОИСКА.
 *
 * Понимает то, как человек пишет дату на самом деле: «24.08.2026», «2026-08-24»,
 * «24 августа 2026», «август 2026», «2026». Месяц принимается и в
 * именительном, и в родительном падеже, и по первым трём буквам -- «авг».
 * Год без месяца -- это первое января, месяц без дня -- первое число: дальше
 * всё равно ищется НЕДЕЛЯ, в которую этот день попал.
 *
 * Возвращает ISO-день или null, если дату разобрать не удалось.
 */
const МЕСЯЦЫ: Record<string, string[]> = {
  ru: [
    "янв", "фев", "мар", "апр", "мая май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек",
  ],
  en: [
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
  ],
};

function номерМесяца(слово: string, lang: Lang): number | null {
  const w = слово.toLowerCase();
  const список = МЕСЯЦЫ[lang] ?? МЕСЯЦЫ.ru;
  for (let i = 0; i < 12; i++) if (список[i].split(" ").some((k) => w.startsWith(k))) return i + 1;
  // Другой язык тоже принимаем: человек может писать «august» в русской версии
  const другой = lang === "ru" ? МЕСЯЦЫ.en : МЕСЯЦЫ.ru;
  for (let i = 0; i < 12; i++) if (другой[i].split(" ").some((k) => w.startsWith(k))) return i + 1;
  return null;
}

const дв = (n: number) => String(n).padStart(2, "0");

/** Последний день недели, начавшейся в этот понедельник. */
function конецНедели(понедельник: string): string {
  const d = new Date(понедельник + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

function разобратьДень(s: string, lang: Lang): string | null {
  const t = s.trim();

  // 2026-08-24 и 2026/08/24
  let m = t.match(/^(\d{4})[-./](\d{1,2})(?:[-./](\d{1,2}))?$/);
  if (m) return `${m[1]}-${дв(+m[2])}-${дв(+(m[3] ?? 1))}`;

  // 24.08.2026 и 24/8/26
  m = t.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2,4})$/);
  if (m) {
    const г = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return `${г}-${дв(+m[2])}-${дв(+m[1])}`;
  }

  // 24 августа 2026 / августа 2026 / август 26
  m = t.match(/^(?:(\d{1,2})\s+)?([a-zа-яё]{3,})\.?\s+(\d{2,4})$/i);
  if (m) {
    const мес = номерМесяца(m[2], lang);
    if (мес) {
      const г = +m[3] < 100 ? 2000 + +m[3] : +m[3];
      return `${г}-${дв(мес)}-${дв(+(m[1] ?? 1))}`;
    }
  }

  // просто год
  m = t.match(/^(20\d{2})$/);
  if (m) return `${m[1]}-01-01`;

  return null;
}

/* ---------------- поиск по событию ---------------- */
function EventSearch({ lang, onPick, phone = false }: { lang: Lang; onPick: (d: string) => void; phone?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  // На телефоне поиск свёрнут в лупу и разворачивается по нажатию: полем во
  // всю ширину он занимал целую строку перед графиком, а нужен редко.
  const [развёрнут, setРазвёрнут] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const поле = useRef<HTMLInputElement>(null);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];

    // СНАЧАЛА ДАТА. Если в строке разобралась дата, ответ ровно один -- та
    // неделя, в которую этот день попал. Искать по названиям в этом случае
    // бессмысленно: человек спросил про день, а не про слово.
    const день = разобратьДень(s, lang);
    if (день) {
      // За пределами ряда искать нечего -- честнее сказать «не нашлось», чем
      // отдать первую попавшуюся неделю.
      if (день < SERIES[0].date || день > конецНедели(SERIES[SERIES.length - 1].date)) return [];
      let i = indexOfDate(день);
      // В ряду есть дыры: новогодние недели из него вырезаны. Если день попал
      // в дыру -- показываем ближайшую следующую неделю, а не пустоту: человек
      // спросил «что было около этого дня», и это ближайшее, что у нас есть.
      if (день > конецНедели(SERIES[i].date) && i + 1 < SERIES.length) i += 1;
      const w = SERIES[i];
      const ev = EVENT_BY_DATE[w.date];
      return [
        {
          d: w.date,
          // Без приставки с годом-месяцем: она уже есть в самой подписи недели
          дата: true,
          n:
            (lang === "ru" ? "неделя " : "week of ") +
            fmtWeek(w.date, lang) +
            (ev ? " · " + (lang === "ru" ? ev.ru : ev.en) : w.note ? " · " + w.note : ""),
        },
      ];
    }

    const named = SERIES.filter((w) => w.note || EVENT_BY_DATE[w.date]).map((w) => ({
      d: w.date,
      дата: false,
      n: EVENT_BY_DATE[w.date] ? (lang === "ru" ? EVENT_BY_DATE[w.date].ru : EVENT_BY_DATE[w.date].en) : w.note!,
    }));
    return named.filter((h) => h.n.toLowerCase().includes(s) || h.d.includes(s)).slice(0, 8);
  }, [q, lang]);

  const свёрнут = phone && !развёрнут;

  return (
    <div ref={box} className="relative">
      {свёрнут ? (
        <button
          type="button"
          aria-label={T.search[lang]}
          onClick={() => {
            setРазвёрнут(true);
            window.setTimeout(() => поле.current?.focus(), 0);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--line-strong)", background: "var(--card-2)", color: "var(--ink-3)", cursor: "pointer" }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
            <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.4 10.4 L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <input
          ref={поле}
          className={
            "mono rounded-full border outline-none " +
            (phone ? "px-4 py-1.5 text-[14px]" : "px-5 py-2.5 text-[17px]")
          }
          style={{ borderColor: "var(--line-strong)", background: "var(--card-2)", color: "var(--ink)", width: phone ? "min(260px, 68vw)" : "min(170px, 100%)" }}
          placeholder={T.search[lang]}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() =>
            window.setTimeout(() => {
              setOpen(false);
              if (phone && q.trim() === "") setРазвёрнут(false);
            }, 140)
          }
        />
      )}
      {open && q.trim() !== "" && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-40 w-[min(420px,90vw)] overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--line-strong)", background: "var(--bg-2)", boxShadow: "var(--shadow)" }}
        >
          {hits.length === 0 ? (
            <div className="px-4 py-2.5 text-[16px]" style={{ color: "var(--ink-3)" }}>
              {T.searchNone[lang]}
            </div>
          ) : (
            hits.map((h) => (
              <button
                key={h.d}
                className="block w-full px-4 py-2.5 text-left text-[16px]"
                style={{ background: "none", border: "none", color: "var(--ink)", cursor: "pointer" }}
                onMouseDown={() => {
                  onPick(h.d);
                  setQ("");
                  setOpen(false);
                }}
              >
                {!h.дата && (
                  <span className="mono mr-2" style={{ color: "var(--ink-3)" }}>
                    {h.d.slice(0, 7)}
                  </span>
                )}
                {h.n}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Кнопка кривой опроса с подсказкой, что такое ФОМ.
 *
 * Подсказка нужна именно здесь: без неё «ФОМ» -- три буквы, а на них держится
 * вся проверка прибора. Ссылка ведёт на источник, чтобы читатель мог посмотреть
 * тот же ряд своими глазами, а не верить нам на слово.
 */
function FomButton({ lang, on, onToggle, phone = false }: { lang: Lang; on: boolean; onToggle: () => void; phone?: boolean }) {
  const [tip, setTip] = useState(false);
  /**
   * ПОЯСНЕНИЕ ПОКАЗЫВАЕТСЯ ПО НАВЕДЕНИЮ И ГАСНЕТ ПО НАЖАТИЮ.
   *
   * Прежде оно всплывало САМО при первом включении кривой и висело, пока
   * куда-нибудь не нажмёшь. Человек в этот момент смотрел на кривую, которую
   * только что вызвал, -- а ему поверх неё выкладывали текст, которого он не
   * просил. Теперь наоборот: навёл на кнопку -- прочитал, нажал -- пояснение
   * ушло и осталась кривая.
   *
   * На телефоне наведения нет, и там пояснение не показывается вовсе: место
   * под него всё равно негде взять, а нажатие там значит «включить».
   */
  useEffect(() => {
    if (!on) return;
    setTip(false);
  }, [on]);
  return (
    <div
      className="relative"
      onMouseEnter={() => !phone && setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      {tip && (
        <div
          /* На телефоне кнопка стоит у ПРАВОГО края, и подсказка, привязанная
             к левому краю кнопки, уезжала за экран. Там она цепляется правым
             краем и меряется от ширины окна, а не от своей. */
          className={
            "absolute top-[calc(100%+10px)] z-40 rounded-2xl border leading-relaxed " +
            (phone ? "right-0 p-3 text-[13.5px]" : "left-0 p-4 text-[16px]")
          }
          /* Ширина стилем, а не классом: произвольное значение с calc внутри
             min() Tailwind не собрал, и подсказка сжималась до ширины кнопки. */
          style={{
            borderColor: "var(--line-strong)",
            background: "var(--bg-2)",
            color: "var(--ink-2)",
            boxShadow: "var(--shadow)",
            width: phone ? "min(280px, calc(100vw - 32px))" : 340,
          }}
        >
          {T.fomWhat[lang]}{" "}
          <a
            href="https://fom.ru/obshestvo/10946"
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4"
            style={{ color: "var(--cool)" }}
          >
            fom.ru
          </a>
        </div>
      )}
      <button
        className={
          "btn " +
          (phone ? "px-2.5 py-1 text-[12px]" : "px-7 py-3.5 text-[17px] font-semibold") +
          // Перелив идёт, только пока кривую не включили.
          (on ? "" : " fombtn-idle")
        }
        data-on={on}
        onClick={() => {
          setTip(false);
          onToggle();
        }}
      >
        {T.fomOnShort[lang]}
      </button>
    </div>
  );
}

/**
 * Число опроса той недели со знаком расхождения.
 *
 * ПОРОГ 5 ПУНКТОВ выбран по самим данным: медиана расхождения прибора и опроса
 * -- 3,6 пункта, в пределах пяти укладывается около трёх недель из пяти. Всё,
 * что внутри порога, -- согласие, и число стоит серым, без знака. Что вне --
 * расхождение, и треугольник показывает, в какую сторону: вверх, если опрос
 * выше прибора, вниз -- если ниже. Треугольник серый нарочно: он говорит про
 * направление, а цветом на этой странице сказано только про величину тревоги.
 */
const ПОРОГ_СОГЛАСИЯ = 5;

/**
 * Ширина блока с числом на компьютере, в пикселях.
 *
 * Замерена по самой длинной раскладке: строка места «153-я из 329 с 2020»
 * рядом с числом опроса, знаком расхождения и кнопкой. Меньше -- строка места
 * налезает на кнопку, больше -- между блоком и строем зияет пустота.
 */
const ШИРИНА_ЧИСЛА = 356;

/**
 * Лента важных дат для телефона.
 *
 * Прокручивается пальцем вбок. Порядок -- хронологический, тот же, что на
 * кривой: лента читается как её оглавление. Выбранное событие залито своим
 * цветом, прочие обведены им же -- цвет тот же, каким показание этой недели
 * горит на графике и в числе.
 *
 * Полосок прокрутки нет нарочно (см. .lenta в index.css): на телефоне их и не
 * показывают, а место они занимают.
 */
function ПолосаСобытий({ lang, sel, onSel }: { lang: Lang; sel: number; onSel: (i: number) => void }) {
  const события = useMemo(
    () =>
      SERIES.map((w, i) => ({ w, i, ev: EVENT_BY_DATE[w.date] })).filter((x) => x.ev),
    [],
  );
  return (
    <div className="lenta -mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
      {события.map(({ w, i, ev }) => {
        const on = sel === i;
        const c = moodColor(w.idx, 6);
        return (
          <button
            key={w.date}
            type="button"
            onClick={() => onSel(i)}
            className="shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium"
            style={{
              borderColor: c,
              background: on ? c : "var(--bg-2)",
              color: on ? "var(--bg)" : "var(--ink)",
              cursor: "pointer",
            }}
          >
            {lang === "ru" ? ev!.shortRu : ev!.shortEn}
          </button>
        );
      })}
    </div>
  );
}

function FomNumber({ fom, idx, lang, phone = false }: { fom: number | null; idx: number; lang: Lang; phone?: boolean }) {
  const d = fom == null ? 0 : fom - idx;
  const врозь = fom != null && Math.abs(d) >= ПОРОГ_СОГЛАСИЯ;
  // Место под стрелку держится ВСЕГДА: появляясь и пропадая, она сдвигала
  // всё, что правее, и строка дёргалась при переходе по неделям.
  return (
    <div
      className={"flex items-center " + (phone ? "gap-1" : "gap-2")}
      title={fom == null ? T.fomNone[lang] : T.fomLabel[lang]}
    >
      {/* Ширина постоянна: прочерк вместо «69%» короче на треть, и без этого
          всё, что правее, съезжало на неделях без опроса. На телефоне и кегль,
          и эта ширина втрое меньше: 96 пикселей там -- четверть строки, и из-за
          них кнопка с легендой не вставали в один ряд. */}
      <span
        // Число опроса опущено на несколько пикселей: вровень с кнопкой оно
        // спорило с ней за внимание, а это разные вещи -- показание и переключатель.
        className={"mono font-bold leading-none " + (phone ? "text-[17px]" : "relative top-[6px] text-[40px]")}
        style={{ color: "var(--ink-2)", width: phone ? 38 : 72, display: "inline-block" }}
      >
        {fom == null ? "—" : `${fom.toFixed(0)}%`}
      </span>
      <span className={"flex shrink-0 justify-center " + (phone ? "w-[11px]" : "w-[16px]")}>
        {врозь && (
          <span
            aria-label={d > 0 ? T.gapUp[lang] : T.gapDown[lang]}
            title={`${d > 0 ? "+" : ""}${d.toFixed(1)}`}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${phone ? 5 : 7}px solid transparent`,
              borderRight: `${phone ? 5 : 7}px solid transparent`,
              [d > 0 ? "borderBottom" : "borderTop"]: `${phone ? 7 : 10}px solid var(--ink-3)`,
            }}
          />
        )}
      </span>
    </div>
  );
}

function Kpi({ v, c, phone = false }: { v: string; c: string; phone?: boolean }) {
  // Кегль сравнений УМЕНЬШЕН (было 30 и 24). Они стоят рядом с главным числом,
  // и почти равный ему рост спорил с ним за внимание: показание недели одно, а
  // это к нему приписки.
  return (
    <div
      className={"mono whitespace-nowrap font-bold leading-none " + (phone ? "text-[20px]" : "text-[24px]")}
      style={{ color: c }}
    >
      {v}
    </div>
  );
}

/**
 * КЕГЛЬ ПОДПИСЕЙ РАВЕН КЕГЛЮ РАЗДЕЛА «Общественная тревога» -- это наименьший
 * кегль страницы, и ниже него не опускается ничто. Прежде подписи сжимались до
 * двенадцати и ниже: формально читаемо, на деле мелко.
 *
 * Раз сжимать нельзя, подпись просто ПЕРЕНОСИТСЯ. Прыгать от недели к неделе
 * ей теперь нечем: «к обычной неделе» постоянна, а у «Пик с 2020, 2022»
 * меняются только цифры года, и длина строки от этого не меняется.
 */
const ПОДПИСЬ_КЕГЛЬ = { экран: 19, телефон: 13 };
/**
 * Подпись под числом сравнения.
 *
 * СЖАТИЯ БОЛЬШЕ НЕТ. Подпись умела уменьшаться, чтобы влезть в одну строку, и
 * доходила до девяти-двенадцати пикселей -- формально читаемо, на деле мелко.
 * Теперь кегль постоянен и равен наименьшему на странице (ПОДПИСЬ_КЕГЛЬ, тот
 * же, что у раздела «Общественная тревога»), а не помещается -- переносится.
 *
 * Прыгать от недели к неделе ей нечем: «к обычной неделе» постоянна, а у
 * «Пик с 2020, 2022» меняются только цифры года, и число строк от этого не
 * меняется.
 */
function KpiLabel({ l, phone = false }: { l: string; phone?: boolean }) {
  return (
    <div
      className="w-full leading-snug"
      style={{ color: "var(--ink-3)", fontSize: phone ? ПОДПИСЬ_КЕГЛЬ.телефон : ПОДПИСЬ_КЕГЛЬ.экран }}
    >
      {l}
    </div>
  );
}

function Pulse({ idx }: { idx: number }) {
  const c = moodColor(idx, 6);
  const t = moodT(idx);
  return (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <span className="absolute inset-0 rounded-full" style={{ background: c, opacity: 0.1 + 0.14 * t }} />
      <span
        className="absolute rounded-full"
        style={{ width: `${18 + 12 * t}px`, height: `${18 + 12 * t}px`, background: c, opacity: 0.22, animation: "pulse 3.4s ease-in-out infinite" }}
      />
      <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: c }} />
    </span>
  );
}

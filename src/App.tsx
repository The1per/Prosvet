import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Chart from "./components/Chart";
import People from "./components/People";
import Poll from "./components/Poll";
import { Breakdown, Methodology, Reads } from "./components/Panels";
import { BASELINE, LATEST, SERIES, ГРАНИЦА_ЭПОХ, местоВЭпохе, пикЭпохи } from "./data/series";
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



  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = T.title[lang];
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

  /**
   * КУСКИ УПРАВЛЕНИЯ ЗАВЕДЕНЫ ОДИН РАЗ, а стоят в разных местах: на экране --
   * в верхнем ряду, рядом с числами, на телефоне -- каждый у своего числа.
   * Дважды написанная разметка разъезжается при первой же правке.
   */
  const парФОМ = (
    <div className="flex items-center gap-2">
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
  /* Место под легенду держится всегда: иначе нажатие на кнопку сдвигало бы
     всё, что ниже, на её высоту. На телефоне -- только когда она нужна. */
  const легенда = (
    <div style={{ visibility: showFom ? "visible" : "hidden" }} hidden={телефон && !showFom}>
      <div
        className={
          "flex flex-wrap items-center gap-y-1 " +
          (телефон ? "gap-x-2.5 text-[12.5px]" : "gap-x-4 text-[15px]")
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

  const heroRef = useReveal<HTMLDivElement>();
  // 140 мс, а не полсекунды: при движении по графику число не должно
  // отставать от курсора -- иначе кажется, что оно не поспевает за неделей.
  const shown = useCounter(w.idx, 140);
  const delta = Math.round(((w.idx - BASELINE) / BASELINE) * 100);
  const level = T.levels[lang][levelIndex(w.idx)];
  // Свет за индексом ведёт ТОЛЬКО прибор. У опроса свой свет -- внутри его
  // карточки, и его ведёт ползунок: два разных показания не должны светить
  // одним и тем же цветом из одного места.
  // Пик и место считаются ВНУТРИ эпохи недели: до 2020-го прибор короче, и
  // ранжировать через эту границу нельзя. См. ГРАНИЦА_ЭПОХ в data/series.
  const ранняя = w.date < ГРАНИЦА_ЭПОХ;
  const пик = пикЭпохи(w.date);
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
            <span className={телефон ? "truncate" : ""}>{T.title[lang]}</span>
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
              className={
                "flex flex-wrap items-start " +
                (телефон ? "mb-2 gap-x-3 gap-y-2" : "mb-3 gap-x-5 gap-y-3")
              }
            >
              {/* Блок числа занимает всю ширину, но НЕ ЯВЛЯЕТСЯ рядом: пока
                  он был флексом, колонка с датой сжималась по содержимому, и
                  строка под ней ездила вправо-влево на длине даты вместе с
                  кнопкой ФОМа. */}
              <div className={телефон ? "w-full" : ""}>
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
                      % ·{" "}
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
                          "underline decoration-dotted underline-offset-4 " +
                          (телефон ? "text-[16px]" : "text-[18.5px]")
                        }
                        style={{ background: "none", border: "none", padding: 0, color: "var(--ink)", cursor: "pointer" }}
                      >
                        {T.basis[lang]}*
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
                      "mt-0.5 " +
                      (телефон
                        ? "flex items-end justify-between gap-2 text-[13.5px]"
                        : "text-[15.5px]")
                    }
                    style={{ color: "var(--ink-3)" }}
                  >
                    <span>{T.placeInEra[lang](место.место, место.всего, ранняя)}</span>
                    {телефон && <span className="shrink-0">{парФОМ}</span>}
                  </div>
                  </div>
                </div>
                </div>
              </div>

              <div className={телефон ? "w-full" : ""}>
                <div className={телефон ? "flex items-end" : "flex items-end"}>
                  <People idx={w.idx} lang={lang} preview={preview} part="строй" phone={телефон} />
                </div>
                {/* Отступ больше обычного: под строем идёт пунктирная скобка
                    пола опроса, и слово уровня ложилось прямо на неё. */}
                <div className="mt-3">
                  <People idx={w.idx} lang={lang} preview={preview} part="подпись" phone={телефон} level={level} />
                </div>
              </div>

              <div>
                <div className={телефон ? "flex items-end" : "flex h-[76px] items-end"}>
                  <Kpi v={`${delta > 0 ? "+" : ""}${delta}%`} c={moodColor(w.idx, 6)} phone={телефон} />
                </div>
                <div className={телефон ? "mt-1 max-w-[150px]" : "mt-1.5 w-[92px]"}>
                  <KpiLabel l={T.vsBaseline[lang]} phone={телефон} />
                </div>
              </div>

              <div>
                <div className={телефон ? "flex items-end" : "flex h-[76px] items-end"}>
                  <Kpi v={пик.idx.toFixed(1)} c="var(--accent)" phone={телефон} />
                </div>
                <div className={телефон ? "mt-1 max-w-[150px]" : "mt-1.5 w-[92px]"}>
                  <KpiLabel l={`${T.peakEra[lang](ранняя)}, ${пик.date.slice(0, 4)}`} phone={телефон} />
                </div>
              </div>

              {/* Кнопка опроса -- сразу справа от цифры пика: последнее число
                  ряда, и следом вопрос к самому читателю. */}
              {телефон && <div className="flex items-end self-stretch pb-1">{кнопкаОпроса}</div>}

              {/* НА ЭКРАНЕ управление стоит в том же ряду, что и числа: своей
                  строкой под ними оно отодвигало график, а сказать хотело то
                  же самое -- «вот другое показание этой недели, вот как его
                  показать, вот как найти неделю». */}
              {!телефон && (
                <div>
                  <div className="flex h-[76px] items-end">{парФОМ}</div>
                  <div className="mt-1.5">{легенда}</div>
                </div>
              )}
            </div>

            {/* НА ТЕЛЕФОНЕ над графиком остаётся только лупа и, когда опрос
                включён, его легенда. Всё остальное управление разошлось по
                своим числам в ряду выше. Поле поиска во всю ширину стоило
                здесь целой строки, а нужно оно редко -- поэтому лупа. */}
            {телефон && легенда && (
              <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">{легенда}</div>
            )}

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
            <div className="flex h-[var(--chart-h,360px)] flex-none flex-col">
              <Chart
                data={SERIES}
                lang={lang}
                sel={sel}
                onSel={setSel}
                showFom={showFom}
                phone={телефон}
                уголок={<EventSearch lang={lang} onPick={jumpTo} phone />}
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
            {!телефон && (
              <div className="mt-auto border-t pt-3" style={{ borderColor: "var(--line)" }}>
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
              <Poll weekDate={LATEST.date} lang={lang} onPreview={setPreview} />
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
                weekDate={LATEST.date}
                lang={lang}
                onPreview={setPreview}
                phone
                /* Пауза перед закрытием -- чтобы человек успел увидеть, что
                   ответ принят, а не смотрел, как панель исчезает в тот же миг. */
                onFinished={() => window.setTimeout(() => setОпросОткрыт(false), 1100)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
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
    const named = SERIES.filter((w) => w.note || EVENT_BY_DATE[w.date]).map((w) => ({
      d: w.date,
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
                <span className="mono mr-2" style={{ color: "var(--ink-3)" }}>
                  {h.d.slice(0, 7)}
                </span>
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
/**
 * Пояснение про ФОМ показывается ОДИН РАЗ ЗА ЗАГРУЗКУ СТРАНИЦЫ -- при первом
 * включении кривой. Выключение кривой его закрывает; второе включение уже
 * молчит. Прежде оно всплывало при каждом наведении, и человеку, знающему,
 * что такое ФОМ, приходилось читать это снова и снова.
 *
 * Флаг живёт в модуле, а не в состоянии: он обязан пережить перерисовку
 * кнопки и умереть вместе со страницей -- ровно «один раз за обновление».
 */
let пояснялиПроФОМ = false;

function FomButton({ lang, on, onToggle, phone = false }: { lang: Lang; on: boolean; onToggle: () => void; phone?: boolean }) {
  const [tip, setTip] = useState(false);
  useEffect(() => {
    if (!on) {
      setTip(false);
      return;
    }
    if (пояснялиПроФОМ) return;
    пояснялиПроФОМ = true;
    setTip(true);
  }, [on]);
  // Любое нажатие по странице гасит пояснение: прочитал -- и дальше, а не
  // ищи, куда бы нажать, чтобы оно ушло. Слушаем на всплытии, поэтому нажатие
  // по самой кнопке сюда тоже приходит -- и тоже гасит.
  useEffect(() => {
    if (!tip) return;
    const прочь = () => setTip(false);
    document.addEventListener("pointerdown", прочь);
    return () => document.removeEventListener("pointerdown", прочь);
  }, [tip]);
  return (
    <div className="relative">
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
        className={"btn " + (phone ? "px-2.5 py-1 text-[11.5px]" : "px-5 py-2.5 text-sm")}
        data-on={on}
        onClick={onToggle}
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
        className={"mono font-bold leading-none " + (phone ? "text-[17px]" : "text-[40px]")}
        style={{ color: "var(--ink-2)", width: phone ? 38 : 80, display: "inline-block" }}
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
  return (
    <div
      className={"mono whitespace-nowrap font-bold leading-none " + (phone ? "text-[24px]" : "text-[30px]")}
      style={{ color: c }}
    >
      {v}
    </div>
  );
}

function KpiLabel({ l, phone = false }: { l: string; phone?: boolean }) {
  return (
    <div
      className={"self-start leading-snug " + (phone ? "text-[12px]" : "text-[16.5px]")}
      style={{ color: "var(--ink-3)" }}
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

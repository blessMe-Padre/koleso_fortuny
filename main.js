// надписи и цвета на секторах
const prizes = [
    // {
    //     text: "Скидка 10%",
    //     color: "hsl(197 30% 43%)",
    // },
    {
        text: "Скидка 10%",
        color: "#FAA6AE",

    },
    {
        text: "Дизайн в подарок",
        color: "#FAA6AE",
    },
    {
        text: "Второй сайт бесплатно",
        color: "hsl(43 74% 66%)",
    },
    {
        text: "Скидка 50%",
        color: "hsl(27 87% 67%)",
    },
    {
        text: "Блог в подарок",
        color: "hsl(12 76% 61%)",
    },
    {
        text: "Скидок нет",
        color: "hsl(350 60% 52%)",
    },
    {
        text: "Таргет в подарок",
        color: "hsl(91 43% 54%)",
    },
    {
        text: "Скидка 30% на всё",
        color: "hsl(140 36% 74%)",
    }
];

const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");

// на сколько секторов нарезаем круг
const prizeSlice = 360 / prizes.length;
// на какое расстояние смещаем сектора друг относительно друга
const prizeOffset = Math.floor(180 / prizes.length);
// прописываем CSS-классы, которые будем добавлять и убирать из стилей
const spinClass = "is-spinning";
const selectedClass = "selected";
// получаем все значения параметров стилей у секторов
const spinnerStyles = window.getComputedStyle(spinner);


// переменная для анимации⠀
let tickerAnim;
// угол вращения
let rotation = 0;
// текущий сектор⠀
let currentSlice = 0;
// переменная для текстовых подписей
let prizeNodes;


// расставляем текст по секторам
const createPrizeNodes = () => {
    // обрабатываем каждую подпись
    prizes.forEach(({ text, color, reaction }, i) => {
        // каждой из них назначаем свой угол поворота
        const rotation = ((prizeSlice * i) * -1) - prizeOffset;
        // добавляем код с размещением текста на страницу в конец блока spinner
        spinner.insertAdjacentHTML(
            "beforeend",
            // текст при этом уже оформлен нужными стилями
            `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
          <span class="text">${text}</span>
        </li>`
        );
    });
};

const createConicGradientWithBorders = () => {
    const borderWidth = 0.5; // Ширина бордюра в процентах
    const adjustedSectorSize = (100 - borderWidth * prizes.length) / prizes.length;

    spinner.setAttribute(
        "style",
        `background: conic-gradient(
            from -90deg,
            ${prizes
            // Для каждого сектора добавляем белый бордюр и цвет сектора
            .map(({ color }, i) => {
                const start = (adjustedSectorSize + borderWidth) * i;
                const end = start + adjustedSectorSize;
                return `${color} ${start}% ${end}%, white ${end}% ${end + borderWidth}%`;
            })
            .join(", ")
        }
        );`
    );
};

// создаём функцию, которая нарисует колесо в сборе
const setupWheel = () => {
    // сначала секторы
    createConicGradientWithBorders();
    // потом текст
    createPrizeNodes();
    // а потом мы получим список всех призов на странице, чтобы работать с ними как с объектами
    prizeNodes = wheel.querySelectorAll(".prize");
};

// подготавливаем всё к первому запуску
setupWheel();

// функция запуска вращения с плавной остановкой
const spinertia = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// отслеживаем нажатие на кнопку
trigger.addEventListener("click", () => {
    // делаем её недоступной для нажатия
    trigger.disabled = true;
    // задаём начальное вращение колеса
    rotation = Math.floor(Math.random() * 360 + spinertia(2000, 5000));
    // убираем прошлый приз
    prizeNodes.forEach((prize) => prize.classList.remove(selectedClass));
    // добавляем колесу класс is-spinning, с помощью которого реализуем нужную отрисовку
    wheel.classList.add(spinClass);
    // через CSS говорим секторам, как им повернуться
    spinner.style.setProperty("--rotate", rotation);
    // возвращаем язычок в горизонтальную позицию
    ticker.style.animation = "none";
    // запускаем анимацию вращение
    runTickerAnimation();
});


// функция запуска вращения с плавной остановкой
const runTickerAnimation = () => {
    // взяли код анимации отсюда: https://css-tricks.com/get-value-of-css-rotation-through-javascript/
    const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
    const a = values[0];
    const b = values[1];
    let rad = Math.atan2(b, a);

    if (rad < 0) rad += (2 * Math.PI);

    const angle = Math.round(rad * (180 / Math.PI));
    const slice = Math.floor(angle / prizeSlice);

    // анимация язычка, когда его задевает колесо при вращении
    // если появился новый сектор
    if (currentSlice !== slice) {
        // убираем анимацию язычка
        ticker.style.animation = "none";
        // и через 10 миллисекунд отменяем это, чтобы он вернулся в первоначальное положение
        setTimeout(() => ticker.style.animation = null, 10);
        // после того как язычок прошёл сектор — делаем его текущим 
        currentSlice = slice;
    }
    // запускаем анимацию
    tickerAnim = requestAnimationFrame(runTickerAnimation);
};

// отслеживаем, когда закончилась анимация вращения колеса
spinner.addEventListener("transitionend", () => {
    // останавливаем отрисовку вращения
    cancelAnimationFrame(tickerAnim);
    // получаем текущее значение поворота колеса
    rotation %= 360;
    // выбираем приз
    selectPrize();
    // убираем класс, который отвечает за вращение
    wheel.classList.remove(spinClass);
    // отправляем в CSS новое положение поворота колеса
    spinner.style.setProperty("--rotate", rotation);
    // делаем кнопку снова активной
    trigger.disabled = false;
});

// функция выбора призового сектора
const selectPrize = () => {
    const selected = Math.floor(rotation / prizeSlice);
    prizeNodes[selected].classList.add(selectedClass);
};
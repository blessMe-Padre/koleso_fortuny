// надписи и цвета на секторах
const prizes = [
    {
        text: "Промокод на скидку 5%",
        color: "hsl(140 36% 74%)",
        image: "./img/product-img.png",
        description: "Введите его в корзине при оформлении заказа и получите скидку",
        title: "Промокод на скидку 5%",
    },
    {
        text: "Карточка мужской группы",
        color: "hsl(140 36% 74%)",
        image: "./img/man.png",
        description: "Она автоматически будет добавлена в корзину при оформлении заказа",
        title: "Карточка мужской группы",
    },
    {
        text: "Промокод на скидку 15%",
        color: "hsl(140 36% 74%)",
        image: "./img/product-img.png",
        description: "Введите его в корзине при оформлении заказа и получите скидку",
        title: "Промокод на скидку 15%",
    },
    {
        text: "Карточка женской группы",
        color: "hsl(140 36% 74%)",
        image: "./img/woman.png",
        description: "Она автоматически будет добавлена в корзину при оформлении заказа",
        title: "Карточка мужской группы",
    },
    {
        text: "Промокод на скидку 5%",
        color: "#FAA6AE",
        image: "./img/product-img.png",
        description: "Введите его в корзине при оформлении заказа и получите скидку",
        title: "Промокод на скидку 15%",
    },
    {
        text: "Скидок нет",
        color: "hsl(140 36% 74%)",
        image: "",
        description: "",
        title: "вы ничего не выиграли",
    },
    {
        text: "Карточка мужской группы",
        color: "hsl(140 36% 74%)",
        image: "./img/man.png",
        description: "Она автоматически будет добавлена в корзину при оформлении заказа",
        title: "Карточка мужской группы",
    },
    {
        text: "Скидка 30% на всё",
        color: "hsl(140 36% 74%)",
        image: "./img/product-img.png",
        description: "Введите его в корзине при оформлении заказа и получите скидку",
        title: "промокод на скидку 5%",
    }
];

const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = document.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");
const wheelDescriptionStart = document.querySelector('.wheel-description-start');
const wheelDescriptionResultWrapper = document.querySelector('.wheel-description-result');
const wheelDescriptionResult = document.querySelector('.wheel-inner');

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
    prizes.forEach(({ text, color, reaction, image }, i) => {
        // каждой из них назначаем свой угол поворота
        const rotation = ((prizeSlice * i) * -1) - prizeOffset;
        // добавляем код с размещением текста на страницу в конец блока spinner
        spinner.insertAdjacentHTML(
            "beforeend",
            // текст при этом уже оформлен нужными стилями
            `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
          <span class="text">${text}</span>
          <img src="${image}">
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

    wheelDescriptionStart.classList.add('hidden');
    wheelDescriptionResultWrapper.classList.remove('hidden');

    // Получаем объект выбранного приза из массива
    const selectedPrize = prizes[selected];

    // Создаем элемент для изображения и устанавливаем его атрибуты
    const img = document.createElement('img');
    img.src = selectedPrize.image;
    img.classList.add('prize-img');
    img.alt = 'Prize Image';


    // Создаем элемент для заголовка
    const title = document.createElement('p');
    title.textContent = selectedPrize.title;

    // Создаем элемент для описания
    const description = document.createElement('p');
    description.textContent = selectedPrize.description;

    // Добавляем созданные элементы в div
    wheelDescriptionResult.appendChild(title);
    wheelDescriptionResult.appendChild(img);
    wheelDescriptionResult.appendChild(description);
};


const btnSpinRreload = document.querySelector('.btn-spin-reload');
btnSpinRreload.addEventListener('click', () => {
    window.location.reload();
});
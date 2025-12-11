// Призы для колеса - цвета по брендбуку ALTAY RESTART
const prizes = [
    { id: 1, name: "Скидка 20%", description: "Скидка 20% на любой сеанс криотерапии", color: "#90482A" },
    { id: 2, name: "Аффирмация", description: "Персональная новогодняя аффирмация для успеха", color: "#b2b2b2" },
    { id: 3, name: "Мини-диагностика", description: "Бесплатная мини-диагностика организма", color: "#AC802E" },
    { id: 4, name: "Скидка 15%", description: "Скидка 15% на программу восстановления", color: "#AAAAAA" },
    { id: 5, name: "Криосеанс", description: "Бесплатный пробный криосеанс", color: "#F5A785" },
    { id: 6, name: "Скидка 10%", description: "Скидка 10% на любую услугу", color: "#FCF2AE" },
    { id: 7, name: "Программа", description: "Мини-программа восстановления на 3 дня", color: "#EC6639" },
    { id: 8, name: "Консультация", description: "Бесплатная консультация специалиста", color: "#A83717" }
];

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
let userData = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    createWheel();
    setupEventListeners();
    checkIfAlreadyPlayed();
    createSnowflakes();
});

// Создание новогодних снежинок
function createSnowflakes() {
    const snowflakeCount = 15;
    const snowflakes = ['❄', '❅', '❆'];

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        snowflake.style.fontSize = (Math.random() * 0.5 + 0.8) + 'rem';
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;
        document.body.appendChild(snowflake);
    }
}

// Инициализация Telegram
function initTelegram() {
    if (tg) {
        tg.ready();
        tg.expand();

        // Получаем данные пользователя
        userData = {
            id: tg.initDataUnsafe?.user?.id || null,
            firstName: tg.initDataUnsafe?.user?.first_name || 'Гость',
            lastName: tg.initDataUnsafe?.user?.last_name || '',
            username: tg.initDataUnsafe?.user?.username || null,
            languageCode: tg.initDataUnsafe?.user?.language_code || 'ru',
            initData: tg.initData || null
        };

        console.log('Telegram user:', userData);

        // Устанавливаем цвета темы
        document.body.style.backgroundColor = tg.backgroundColor || '#1a1a2e';
    } else {
        // Для тестирования вне Telegram
        userData = {
            id: 'test_' + Date.now(),
            firstName: 'Тестовый',
            lastName: 'Пользователь',
            username: 'test_user',
            languageCode: 'ru',
            initData: null
        };
        console.log('Running outside Telegram, test mode');
    }
}

// Создание секторов колеса
function createWheel() {
    const wheel = document.getElementById('wheel');
    const sectorAngle = 360 / prizes.length;

    // Создаем conic-gradient для фона колеса
    let gradient = 'conic-gradient(from 0deg, ';
    prizes.forEach((prize, index) => {
        const startAngle = sectorAngle * index;
        const endAngle = sectorAngle * (index + 1);
        gradient += `${prize.color} ${startAngle}deg ${endAngle}deg`;
        if (index < prizes.length - 1) gradient += ', ';
    });
    gradient += ')';
    wheel.style.background = gradient;

    // Добавляем текстовые метки для каждого сектора
    prizes.forEach((prize, index) => {
        const label = document.createElement('div');
        label.className = 'wheel-label';

        // Угол в центре сектора
        const angle = sectorAngle * index + sectorAngle / 2;
        const angleRad = (angle - 90) * (Math.PI / 180);

        // Позиция метки (70% от центра к краю)
        const radius = 40; // процент от центра
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);

        label.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%) rotate(${angle}deg);
            font-size: 0.65rem;
            font-weight: 400;
            color: ${prize.color === '#b2b2b2' || prize.color === '#AAAAAA' || prize.color === '#FCF2AE' || prize.color === '#F5A785' ? '#000000' : '#FFFFFF'};
            text-align: center;
            width: 75px;
            line-height: 1.2;
            text-shadow: ${prize.color === '#b2b2b2' || prize.color === '#AAAAAA' || prize.color === '#FCF2AE' || prize.color === '#F5A785' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(255,255,255,0.3)'};
            pointer-events: none;
            letter-spacing: 0.5px;
        `;
        label.textContent = prize.name;

        wheel.appendChild(label);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    const spinBtn = document.getElementById('spinBtn');
    const activateBtn = document.getElementById('activateBtn');

    spinBtn.addEventListener('click', spinWheel);
    activateBtn.addEventListener('click', activatePrize);
}

// Вращение колеса
let isSpinning = false;
let currentPrize = null;

function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    const wheel = document.getElementById('wheel');

    spinBtn.disabled = true;

    // Случайный выбор приза
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    currentPrize = prizes[prizeIndex];

    // Вычисляем угол для остановки на выбранном призе
    const sectorAngle = 360 / prizes.length;
    const prizeAngle = sectorAngle * prizeIndex;

    // Добавляем несколько полных оборотов + угол до приза
    // Стрелка сверху, поэтому корректируем угол
    const spins = 5 + Math.random() * 3; // 5-8 полных оборотов
    const finalAngle = spins * 360 + (360 - prizeAngle - sectorAngle / 2);

    wheel.style.transform = `rotate(${finalAngle}deg)`;

    // Показываем результат после остановки
    setTimeout(() => {
        showResult();
        isSpinning = false;
    }, 4200);
}

// Показ результата
function showResult() {
    const modal = document.getElementById('resultModal');
    const prizeText = document.getElementById('prizeText');

    prizeText.innerHTML = `Ты выиграл:<br><strong>${currentPrize.description}</strong>`;
    modal.classList.add('show');

    // Создаем конфетти
    createConfetti();
}

// Активация приза
async function activatePrize() {
    const data = {
        user: {
            id: userData.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            language_code: userData.languageCode
        },
        prize: {
            id: currentPrize.id,
            name: currentPrize.name,
            description: currentPrize.description
        },
        timestamp: new Date().toISOString()
    };

    console.log('Sending data:', data);

    // Отправляем на webhook
    try {
        await fetch('https://testn8n.easydrafting.ru/webhook/fortuna_mother', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error('Webhook error:', e);
    }

    // Сохраняем что пользователь уже крутил
    localStorage.setItem('wheel_played_' + userData.id, 'true');

    if (tg) {
        // Отправляем данные боту и закрываем WebApp
        tg.sendData(JSON.stringify(data));
        tg.close();
    } else {
        // Для тестирования
        console.log('Prize activated (test mode):', data);
        alert('Подарок активирован! WebApp закроется.\n\n' + JSON.stringify(data, null, 2));
    }
}

// Проверка, играл ли пользователь
function checkIfAlreadyPlayed() {
    const played = localStorage.getItem('wheel_played_' + userData.id);
    if (played) {
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;
        spinBtn.innerHTML = '<span>УЖЕ</span>';

        // Показываем сообщение
        const modal = document.getElementById('resultModal');
        const prizeText = document.getElementById('prizeText');
        const activateBtn = document.getElementById('activateBtn');

        prizeText.innerHTML = 'Ты уже участвовал в розыгрыше!<br><strong>Одна попытка на пользователя</strong>';
        activateBtn.textContent = 'Закрыть';
        activateBtn.onclick = () => {
            if (tg) tg.close();
            else modal.classList.remove('show');
        };
        modal.classList.add('show');
    }
}

// Создание конфетти с цветами брендбука
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    const colors = ['#AC802E', '#FCF2AE', '#90482A', '#F5A785', '#EC6639'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            opacity: ${Math.random() * 0.5 + 0.5};
            animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        confettiContainer.appendChild(confetti);
    }

    // Добавляем анимацию конфетти
    if (!document.getElementById('confettiStyle')) {
        const style = document.createElement('style');
        style.id = 'confettiStyle';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    top: 100%;
                    opacity: 0;
                    transform: rotate(720deg) translateX(${Math.random() * 100 - 50}px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

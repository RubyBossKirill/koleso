// Призы для колеса - цвета по брендбуку ALTAY RESTART
// Теперь только 4 приза согласно лимитам
const prizes = [
    { id: 1, name: "Скидка 20% на проживание", description: "Скидка 20% на следующее проживание от 5 суток", color: "#90482A" },
    { id: 2, name: "Скидка 50% ресторан", description: "Скидка 50% на меню ресторана без алкоголя", color: "#AC802E" },
    { id: 3, name: "Скидка 10% ресторан", description: "Скидка 10% на меню ресторана без алкоголя", color: "#FCF2AE" },
    { id: 4, name: "Криосеанс", description: "Бесплатный разовый криосеанс", color: "#AAAAAA" }
];

// URL API (GET - проверка, POST - выдача приза)
const API_URL = 'https://n8n.altaitravel.net/webhook/8ed5a0ec-1cd3-466e-923b-91a404dfa641';

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
let userData = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    createWheel();
    setupEventListeners();
    checkUserStatus();
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
        // Для тестирования вне Telegram - числовой ID
        userData = {
            id: Math.floor(Math.random() * 900000000) + 100000000,
            firstName: 'Тестовый',
            lastName: 'Пользователь',
            username: 'test_user',
            languageCode: 'ru',
            initData: null
        };
        console.log('Running outside Telegram, test mode. User ID:', userData.id);
    }
}

// Создание секторов колеса
// ВАЖНО: Единая система координат
// - Стрелка указывает СВЕРХУ (на 12 часов)
// - Первый сектор (index 0) должен быть СВЕРХУ в начальном положении
// - conic-gradient from -90deg начинается сверху
// - CSS rotate: положительное значение = по часовой стрелке
function createWheel() {
    const wheel = document.getElementById('wheel');
    const sectorAngle = 360 / prizes.length; // 90° для 4 призов

    // Создаем conic-gradient: from -90deg означает начало СВЕРХУ
    // Сектора идут по часовой стрелке: верх -> право -> низ -> лево
    let gradient = 'conic-gradient(from -90deg, ';
    prizes.forEach((prize, index) => {
        const startAngle = sectorAngle * index;
        const endAngle = sectorAngle * (index + 1);
        gradient += `${prize.color} ${startAngle}deg ${endAngle}deg`;
        if (index < prizes.length - 1) gradient += ', ';
    });
    gradient += ')';
    wheel.style.background = gradient;

    // Добавляем текстовые метки
    // Позиции меток должны совпадать с секторами градиента
    // Градиент from -90deg: 0° в градиенте = верх на экране
    prizes.forEach((prize, index) => {
        const label = document.createElement('div');
        label.className = 'wheel-label';

        // Угол центра сектора (0° = верх, по часовой стрелке)
        const angleDeg = sectorAngle * index + sectorAngle / 2;

        // Конвертация в CSS/Math координаты:
        // В CSS/Math: 0° = право (3 часа)
        // Наша система: 0° = верх (12 часов)
        // Разница: -90° (или +270°)
        // CSS угол = наш угол - 90°
        const cssAngle = angleDeg - 90;
        const angleRad = cssAngle * (Math.PI / 180);

        // Позиция метки (40% от центра к краю)
        const radius = 40;
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);

        // Поворот текста для читаемости (текст идёт от центра наружу)
        const textRotation = angleDeg;

        label.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: translate(-50%, -50%) rotate(${textRotation}deg);
            font-size: 0.7rem;
            font-weight: 500;
            color: ${prize.color === '#FCF2AE' || prize.color === '#AAAAAA' ? '#000000' : '#FFFFFF'};
            text-align: center;
            width: 80px;
            line-height: 1.2;
            text-shadow: ${prize.color === '#FCF2AE' || prize.color === '#AAAAAA' ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.5)'};
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
    spinBtn.addEventListener('click', spinWheel);
}

// Вращение колеса
let isSpinning = false;
let currentPrize = null;

async function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const spinBtn = document.getElementById('spinBtn');
    const wheel = document.getElementById('wheel');

    spinBtn.disabled = true;
    spinBtn.innerHTML = '<span>...</span>';

    try {
        // Запрашиваем приз с сервера
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userData.id,
                username: userData.username || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || ''
            })
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (result.status === 'already_played') {
            // Пользователь уже играл
            isSpinning = false;
            showAlreadyPlayed(result.prize);
            return;
        }

        if (result.status === 'no_prizes_left') {
            // Призы закончились
            isSpinning = false;
            showNoPrizes();
            return;
        }

        if (result.success && result.prize) {
            // Получили приз - крутим колесо
            currentPrize = result.prize;

            // Находим индекс приза в массиве
            const serverPrizeId = Number(currentPrize.id);
            const prizeIndex = prizes.findIndex(p => p.id === serverPrizeId);

            if (prizeIndex === -1) {
                throw new Error('Приз не найден');
            }

            // Расчёт угла вращения
            const sectorAngle = 360 / prizes.length;
            const sectorCenter = sectorAngle * prizeIndex + sectorAngle / 2;
            const spins = 5 + Math.floor(Math.random() * 3);
            const stopAngle = (360 - sectorCenter) % 360;
            const finalAngle = spins * 360 + stopAngle;

            // Сбрасываем колесо в начальное положение перед вращением
            wheel.style.transition = 'none';
            wheel.style.transform = 'rotate(0deg)';
            wheel.offsetHeight; // force reflow
            wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';

            wheel.style.transform = `rotate(${finalAngle}deg)`;

            // Показываем результат после остановки
            setTimeout(() => {
                showResult();
                isSpinning = false;
            }, 4200);
        } else {
            // Ошибка
            throw new Error(result.message || 'Неизвестная ошибка');
        }

    } catch (error) {
        console.error('Error:', error);
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.innerHTML = '<span>КРУТИТЬ</span>';
        alert('Произошла ошибка. Попробуйте ещё раз.');
    }
}

// Показ результата
function showResult() {
    const modal = document.getElementById('resultModal');
    const prizeText = document.getElementById('prizeText');
    const activateBtn = document.getElementById('activateBtn');

    prizeText.innerHTML = `Ты выиграл:<br><strong>${currentPrize.description}</strong>`;
    activateBtn.textContent = 'Забрать подарок';
    activateBtn.onclick = closePrize;
    modal.classList.add('show');

    // Создаем конфетти
    createConfetti();
}

// Показ сообщения "уже играл"
function showAlreadyPlayed(prize) {
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<span>УЖЕ</span>';

    const modal = document.getElementById('resultModal');
    const prizeText = document.getElementById('prizeText');
    const activateBtn = document.getElementById('activateBtn');

    if (prize) {
        prizeText.innerHTML = `Ты уже выиграл:<br><strong>${prize.description}</strong>`;
    } else {
        prizeText.innerHTML = 'Ты уже участвовал в розыгрыше!<br><strong>Одна попытка на пользователя</strong>';
    }

    activateBtn.textContent = 'Закрыть';
    activateBtn.onclick = () => {
        if (tg) tg.close();
        else modal.classList.remove('show');
    };
    modal.classList.add('show');
}

// Показ сообщения "призы закончились"
function showNoPrizes() {
    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.innerHTML = '<span>:(</span>';

    const modal = document.getElementById('resultModal');
    const prizeText = document.getElementById('prizeText');
    const activateBtn = document.getElementById('activateBtn');

    prizeText.innerHTML = 'К сожалению, все подарки разобрали!<br><strong>Попробуй в следующий раз</strong>';
    activateBtn.textContent = 'Закрыть';
    activateBtn.onclick = () => {
        if (tg) tg.close();
        else modal.classList.remove('show');
    };
    modal.classList.add('show');
}

// Закрытие после получения приза
async function closePrize() {
    const CLAIM_URL = 'https://n8n.altaitravel.net/webhook/29c58245-6516-4565-a0fe-5862d1e18d6b';

    // Отправляем информацию о выигрыше
    const data = {
        type: "fortune",
        user: {
            platform_id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: userData.username
        },
        prize: {
            id: currentPrize.id,
            name: currentPrize.name,
            description: currentPrize.description
        },
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(CLAIM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log('Prize claim sent:', data);
    } catch (error) {
        console.error('Error sending claim:', error);
    }

    // Закрываем WebApp
    if (tg) {
        tg.close();
    } else {
        console.log('Prize claimed (test mode):', currentPrize);
        alert('Подарок получен!\n\n' + currentPrize.description);
        document.getElementById('resultModal').classList.remove('show');
    }
}

// Проверка статуса пользователя при загрузке
async function checkUserStatus() {
    // Если нет userId - не проверяем
    if (!userData.id) return;

    try {
        // GET запрос для проверки статуса (без выдачи приза)
        const response = await fetch(`${API_URL}?userId=${userData.id}`, {
            method: 'GET'
        });

        const result = await response.json();
        console.log('Check status response:', result);

        if (result.status === 'already_played' && result.prize) {
            // Пользователь уже играл - показываем его приз
            showAlreadyPlayed(result.prize);
        } else if (result.status === 'no_prizes_left') {
            // Призы закончились
            showNoPrizes();
        }
        // Если can_play - ничего не делаем, пользователь может крутить

    } catch (error) {
        console.error('Check status error:', error);
        // При ошибке просто даём крутить
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

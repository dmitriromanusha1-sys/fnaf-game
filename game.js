// ===================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====================
let gameTime = 0;
let powerLevel = 100;
let gameActive = true;
let night = 1;
let gameInterval = null;

let stats = {
    cameraSwitches: 0,
    doorCloses: 0,
    threatsBlocked: 0
};

let leftDoorClosed = false;
let rightDoorClosed = false;
let leftVentClosed = false;
let rightVentClosed = false;
let flashlightOn = false;       // legacy (unused)
let leftFlashlightOn = false;   // левый фонарь — видит Бонни в hall
let rightFlashlightOn = false;  // правый фонарь — видит Чику и Фредди в hall
let audioEnabled = true;

// ===================== МУЗЫКА (MP3) =====================
let atmosphericAudio = null;
let cameraSwitchAudio = null;
let victoryAudio = null;
let foxyRunAudio = null;
let pirateSongAudio = null;
let kitchenNoiseAudio = null;
let doorPoundAudio = null;
let phoneRingAudio = null;
let menuAmbienceAudio = null;

function initMusic() {
    // Атмосферная фоновая музыка
    atmosphericAudio = new Audio('music/Atmospheric_sound.mp3');
    atmosphericAudio.loop = true;
    atmosphericAudio.volume = (gameSettings.volume || 70) / 100 * 0.5;

    // Звук переключения камер
    cameraSwitchAudio = new Audio('music/Switching_cameras.mp3');
    cameraSwitchAudio.volume = (gameSettings.volume || 70) / 100 * 0.6;

    // Музыка победы
    victoryAudio = new Audio('music/Sound of Victory.mp3');
    victoryAudio.volume = (gameSettings.volume || 70) / 100 * 0.8;

    // Звук бега Фокси
    foxyRunAudio = new Audio('music/foxy_run.mp3');
    foxyRunAudio.loop = false;
    foxyRunAudio.volume = (gameSettings.volume || 70) / 100 * 0.9;

    // Пение Фокси (играет когда выглядывает из бухты)
    pirateSongAudio = new Audio('music/pirate_song.mp3');
    pirateSongAudio.loop = true;
    pirateSongAudio.volume = 0; // стартует тихо, нарастает

    // Звук гремящих кастрюль на кухне
    kitchenNoiseAudio = new Audio('music/kitchen_noise.mp3');
    kitchenNoiseAudio.loop = false;
    kitchenNoiseAudio.volume = 0;

    // Стук Фокси в дверь
    doorPoundAudio = new Audio('music/door_pound.mp3');
    doorPoundAudio.loop = false;
    doorPoundAudio.volume = (gameSettings.volume || 70) / 100 * 1.0;

    // Звонок телефона
    phoneRingAudio = new Audio('music/phone_ring.mp3');
    phoneRingAudio.loop = false;
    phoneRingAudio.volume = (gameSettings.volume || 70) / 100 * 0.20;

    // Атмосфера главного меню
    menuAmbienceAudio = new Audio('music/menu_ambience.mp3');
    menuAmbienceAudio.loop = true;
    menuAmbienceAudio.volume = (gameSettings.volume || 70) / 100 * 0.55;
}

function startAtmosphericMusic() {
    if (!audioEnabled || !atmosphericAudio) return;
    atmosphericAudio.volume = (gameSettings.volume || 70) / 100 * 0.5;
    atmosphericAudio.currentTime = 0;
    atmosphericAudio.play().catch(() => {});
}

function stopAtmosphericMusic() {
    if (!atmosphericAudio) return;
    atmosphericAudio.pause();
    atmosphericAudio.currentTime = 0;
}

function playCameraSwitchMusic() {
    if (!audioEnabled || !cameraSwitchAudio) return;
    cameraSwitchAudio.volume = (gameSettings.volume || 70) / 100 * 0.6;
    cameraSwitchAudio.currentTime = 0;
    cameraSwitchAudio.play().catch(() => {});
}

function updateMusicVolume() {
    const vol = audioEnabled ? (gameSettings.volume || 70) / 100 : 0;
    if (atmosphericAudio) atmosphericAudio.volume = vol * 0.5;
    if (cameraSwitchAudio) cameraSwitchAudio.volume = vol * 0.6;
    if (victoryAudio) victoryAudio.volume = vol * 0.8;
    if (foxyRunAudio) foxyRunAudio.volume = vol * 0.9;
    if (doorPoundAudio) doorPoundAudio.volume = vol * 1.0;
    if (phoneRingAudio) phoneRingAudio.volume = vol * 0.20;
    if (menuAmbienceAudio) menuAmbienceAudio.volume = vol * 0.55;
    // pirateSong volume управляется плавным fade, не трогаем напрямую
}

function startMenuAmbience() {
    if (!audioEnabled || !menuAmbienceAudio) return;
    if (!menuAmbienceAudio.paused) return;
    menuAmbienceAudio.volume = (gameSettings.volume || 70) / 100 * 0.55;
    menuAmbienceAudio.currentTime = 0;

    // Пробуем воспроизвести сразу — если браузер заблокирует,
    // повесим одноразовый listener на первое касание страницы
    const tryPlay = () => {
        menuAmbienceAudio.play().catch(() => {
            const unlock = () => {
                menuAmbienceAudio.play().catch(() => {});
                document.removeEventListener('pointerdown', unlock, true);
                document.removeEventListener('keydown', unlock, true);
            };
            document.addEventListener('pointerdown', unlock, { once: true, capture: true });
            document.addEventListener('keydown', unlock, { once: true, capture: true });
        });
    };

    // Разблокируем AudioContext если нужно (для Safari и старых браузеров)
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume().then(tryPlay);
            } else {
                tryPlay();
            }
        } else {
            tryPlay();
        }
    } catch (e) {
        tryPlay();
    }
}

function stopMenuAmbience() {
    if (!menuAmbienceAudio) return;
    menuAmbienceAudio.pause();
    menuAmbienceAudio.currentTime = 0;
}

function playDoorPound() {
    if (!audioEnabled || !doorPoundAudio) return;
    doorPoundAudio.volume = (gameSettings.volume || 70) / 100 * 1.0;
    doorPoundAudio.currentTime = 0;
    doorPoundAudio.play().catch(() => {});
}

function playFoxyRunSound() {
    if (!audioEnabled || !foxyRunAudio) return;
    foxyRunAudio.volume = (gameSettings.volume || 70) / 100 * 0.9;
    foxyRunAudio.currentTime = 0;
    foxyRunAudio.play().catch(() => {});
}

function stopFoxyRunSound() {
    if (!foxyRunAudio) return;
    foxyRunAudio.pause();
    foxyRunAudio.currentTime = 0;
}

// Плавное нарастание пения Фокси
let pirateSongFadeInterval = null;

function startPirateSong() {
    if (!audioEnabled || !pirateSongAudio) return;
    if (pirateSongFadeInterval) clearInterval(pirateSongFadeInterval);

    const maxVol = (gameSettings.volume || 70) / 100 * 0.35;
    pirateSongAudio.currentTime = 0;
    pirateSongAudio.volume = 0;
    pirateSongAudio.play().catch(() => {});

    // Плавно нарастаем до maxVol за ~3 секунды
    pirateSongFadeInterval = setInterval(() => {
        if (!pirateSongAudio) return;
        if (pirateSongAudio.volume < maxVol - 0.01) {
            pirateSongAudio.volume = Math.min(pirateSongAudio.volume + 0.015, maxVol);
        } else {
            pirateSongAudio.volume = maxVol;
            clearInterval(pirateSongFadeInterval);
            pirateSongFadeInterval = null;
        }
    }, 100);
}

function stopPirateSong() {
    if (!pirateSongAudio) return;
    if (pirateSongFadeInterval) { clearInterval(pirateSongFadeInterval); pirateSongFadeInterval = null; }

    // Плавно затихаем
    const fadeOut = setInterval(() => {
        if (!pirateSongAudio) { clearInterval(fadeOut); return; }
        if (pirateSongAudio.volume > 0.015) {
            pirateSongAudio.volume = Math.max(pirateSongAudio.volume - 0.02, 0);
        } else {
            pirateSongAudio.volume = 0;
            pirateSongAudio.pause();
            pirateSongAudio.currentTime = 0;
            clearInterval(fadeOut);
        }
    }, 80);
}

// ── Кухонные звуки ──
let kitchenNoiseTimer = null;
let kitchenNoisePlaying = false;
let kitchenNoisesPlayed = 0; // счётчик — максимум 2 за одно посещение

function scheduleKitchenNoise() {
    if (kitchenNoiseTimer) return;
    if (kitchenNoisesPlayed >= 2) return; // максимум 2 раза

    // Только если Чика на кухне или складе
    const chica = typeof animatronics !== 'undefined' && animatronics.chica;
    const chicaInKitchen = chica && (chica.location === 'kitchen' || chica.location === 'supply');
    if (!chicaInKitchen) return;

    const delay = (8 + Math.random() * 12) * 1000; // 8–20 сек между звуками
    kitchenNoiseTimer = setTimeout(() => {
        kitchenNoiseTimer = null;
        playKitchenNoise();
    }, delay);
}

function playKitchenNoise() {
    if (!audioEnabled || !kitchenNoiseAudio || !gameActive) return;
    if (kitchenNoisesPlayed >= 2) return;

    // Проверяем снова — Чика всё ещё на кухне/складе?
    const chica = typeof animatronics !== 'undefined' && animatronics.chica;
    const chicaInKitchen = chica && (chica.location === 'kitchen' || chica.location === 'supply');
    if (!chicaInKitchen) return;

    const vol = (gameSettings.volume || 70) / 100;
    const watchingKitchen = cameraActive &&
        document.querySelector('.camera-sidebar-btn.active[data-room="kitchen"]');
    kitchenNoiseAudio.volume = watchingKitchen ? vol * 0.6 : vol * 0.2;

    kitchenNoiseAudio.currentTime = 0;
    kitchenNoiseAudio.play().catch(() => {});

    kitchenNoiseAudio.onended = () => {
        kitchenNoisePlaying = false;
        kitchenNoisesPlayed++;
        if (gameActive && kitchenNoisesPlayed < 2) scheduleKitchenNoise();
    };
    kitchenNoisePlaying = true;
}

// Сбрасываем счётчик когда Чика уходит с кухни
function resetKitchenNoiseIfNeeded() {
    const chica = typeof animatronics !== 'undefined' && animatronics.chica;
    const chicaInKitchen = chica && (chica.location === 'kitchen' || chica.location === 'supply');
    if (!chicaInKitchen && kitchenNoisesPlayed > 0) {
        kitchenNoisesPlayed = 0;
        if (kitchenNoiseTimer) { clearTimeout(kitchenNoiseTimer); kitchenNoiseTimer = null; }
    }
    // Если Чика только что пришла на кухню — планируем звук
    if (chicaInKitchen && !kitchenNoiseTimer && kitchenNoisesPlayed < 2 && !kitchenNoisePlaying) {
        scheduleKitchenNoise();
    }
}

function stopKitchenNoise() {
    if (kitchenNoiseTimer) { clearTimeout(kitchenNoiseTimer); kitchenNoiseTimer = null; }
    if (kitchenNoiseAudio) { kitchenNoiseAudio.pause(); kitchenNoiseAudio.currentTime = 0; }
    kitchenNoisePlaying = false;
    kitchenNoisesPlayed = 0;
}

function playVictoryMusic() {
    if (!audioEnabled || !victoryAudio) return;
    victoryAudio.volume = (gameSettings.volume || 70) / 100 * 0.8;
    victoryAudio.currentTime = 0;
    victoryAudio.play().catch(() => {});
}
let cameraActive = false;
let cameraViewTime = 0;

// Константы расхода энергии (в % в секунду)
// Ночь длится 360 секунд. Стартует 100%.
// Базовый расход: 100 / 360 ≈ 0.278%/сек — без действий игрок теряет энергию за ~6 минут
// Двери: дополнительно +0.04%/сек каждая
// Фонарик: +0.05%/сек
// Камеры: +0.06%/сек
// При закрытых обеих дверях + камерах + фонарике: ~0.23%/сек сверх базового — энергия кончается быстрее
const POWER_DRAIN = {
    BASE: 0.014,       // Базовый расход — очень медленный, можно дотянуть 6AM
    LEFT_DOOR: 0.15,   // Дверь: ощутимо, но не катастрофически
    RIGHT_DOOR: 0.15,
    FLASHLIGHT: 0.05,  // Фонарик: умеренный расход
    CAMERA: 0.12       // Камеры: стимулирует быстрые переключения
};

// Уровни AI для каждой ночи (чем выше — тем чаще двигается)
// Ночь 1: учебная — аниматроники медленные, дают время освоиться
// Ночь 2: заметное ускорение
// Ночь 5+: настоящий хардкор
const nightAILevels = {
    //           Фредди  Бонни  Чика   Фокси
    1: { freddy: 0,  bonnie: 3,  chica: 1,  foxy: 2  }, // Бонни двигается, остальные тихо
    2: { freddy: 1,  bonnie: 5,  chica: 3,  foxy: 5  }, // Фокси начинает выглядывать
    3: { freddy: 3,  bonnie: 7,  chica: 5,  foxy: 8  }, // Фокси реально опасен
    4: { freddy: 6,  bonnie: 9,  chica: 7,  foxy: 11 }, // Все активны
    5: { freddy: 9,  bonnie: 11, chica: 9,  foxy: 14 }, // Жёстко
    6: { freddy: 12, bonnie: 13, chica: 12, foxy: 17 }, // Почти нет передышки
    7: { freddy: 15, bonnie: 15, chica: 15, foxy: 20 }  // Максимум — все на пределе
};

// ===================== ИЗОБРАЖЕНИЯ АНИМАТРОНИКОВ =====================
// Маппинг имён аниматроников → файлы в папке textures/animatronics/
const ANIMATRONIC_IMAGES = {
    freddy:        'textures/animatronics/freddy_idle.png',
    bonnie:        'textures/animatronics/bonnie_idle.png',
    chica:         'textures/animatronics/chica_idle.png',
    foxy:          'textures/animatronics/foxy_idle.png',
    'golden-freddy': 'textures/animatronics/golden_freddy.png'
};

// Предзагруженные объекты Image
const loadedAnimatronicImages = {};

function preloadAnimatronicImages() {
    for (const [name, src] of Object.entries(ANIMATRONIC_IMAGES)) {
        const img = new Image();
        img.src = src;
        loadedAnimatronicImages[name] = img;
    }
}

function getAnimatronicImageSrc(animName) {
    return ANIMATRONIC_IMAGES[animName] || ANIMATRONIC_IMAGES['freddy'];
}

// Пути аниматроников (уникальные маршруты)
// Фредди: Сцена → Обеденный зал → Туалеты → West Hall → Коридор → Офис (обходит слева через зал)
// Бонни:  Сцена → West Hall → Коридор → Офис (быстрый левый путь, левая дверь)
// Чика:   Кухня → Склад → Обеденный зал → East Hall → Коридор → Офис (правый путь, правая дверь)
// Фокси:  Пиратская Бухта → Закулисье → East Hall → Коридор → Офис (крадётся справа, левая дверь)
const animatronicPaths = {
    freddy: ["stage", "dining", "bathroom", "west-hall", "hall", "office"],
    bonnie: ["stage", "west-hall", "hall", "office"],
    chica:  ["kitchen", "supply", "dining", "east-hall", "hall", "office"],
    foxy:   ["parts", "backstage", "east-hall", "hall", "office"]
};

// Объекты аниматроников
const animatronics = {
    freddy: { 
        name: "Фредди",
        location: "stage",
        ai: 1,
        progress: 0,
        moveTimer: 0,
        attackCooldown: 0,
        isActive: true,
        isVisible: false,
        doorSide: "right",
        behaviorState: "idle",
        position: { x: 50, y: 50 }
    },
    bonnie: {
        name: "Бонни", 
        location: "stage",
        ai: 1,
        progress: 0,
        moveTimer: 0,
        attackCooldown: 0,
        isActive: true,
        isVisible: false,
        doorSide: "left",
        behaviorState: "idle",
        position: { x: 50, y: 50 }
    },
    chica: {
        name: "Чика",
        location: "kitchen",
        ai: 1,
        progress: 0,
        moveTimer: 0,
        attackCooldown: 0,
        isActive: true,
        isVisible: false,
        doorSide: "right",
        behaviorState: "idle",
        position: { x: 50, y: 50 }
    },
    foxy: {
        name: "Фокси",
        location: "parts",
        ai: 1,
        progress: 0,
        moveTimer: 0,
        attackCooldown: 0,
        isActive: true,
        isVisible: false,
        doorSide: "left",
        behaviorState: "hiding",
        stage: "hiding",
        runChance: 0,
        peekTimer: 0,
        runTimer: 0,
        peekRunThreshold: 0,
        position: { x: 50, y: 50 }
    }
};

// ===================== DOM ЭЛЕМЕНТЫ =====================
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const newGameBtn = document.getElementById('new-game-btn');
const settingsBtn = document.getElementById('settings-btn');

const timeElement = document.getElementById('game-time');
const timeProgress = document.getElementById('time-progress-fill');
const nightElement = document.getElementById('night-number');
const timeLeftElement = document.getElementById('time-left');

const powerValue = document.getElementById('power-value');
const powerFill = document.getElementById('power-fill');
const powerUsage = document.getElementById('power-usage');
const powerTimeLeft = document.getElementById('power-time-left');

const statsTime = document.getElementById('stats-time');
const statsSwitches = document.getElementById('stats-switches');
const statsDoors = document.getElementById('stats-doors');
const statsThreats = document.getElementById('stats-threats');

const systemButtons = document.querySelectorAll('.system-btn');
const leftDoorBtn = document.getElementById('left-door-btn');
const rightDoorBtn = document.getElementById('right-door-btn');
const flashlightBtn = document.getElementById('flashlight-btn');
const audioToggle = document.getElementById('audio-toggle');
const cameraSystemBtn = document.getElementById('camera-system-btn');

const leftDoorOverlay = document.getElementById('left-door-overlay');
const rightDoorOverlay = document.getElementById('right-door-overlay');
const staticOverlay = document.querySelector('.static-overlay');

const jumpscareOverlay = document.getElementById('jumpscare-overlay');
const jumpscareImage = document.getElementById('jumpscare-image');
const gameOverScreen = document.getElementById('game-over-screen');
const deathReason = document.getElementById('death-reason');
const nightProgress = document.getElementById('night-progress');
const restartBtn = document.getElementById('restart-btn');

// Элементы системы камер
const cameraModalOverlay = document.getElementById('camera-modal-overlay');
const closeCameraBtn = document.getElementById('close-camera-btn');
const cameraSidebarBtns = document.querySelectorAll('.camera-sidebar-btn');
const cameraPowerWarning = document.getElementById('camera-power-warning');
const cameraPowerDrainElement = document.getElementById('camera-power-drain');
const cameraSystemStatusElement = document.getElementById('camera-system-status');
const cameraViewTimeElement = document.getElementById('camera-view-time');

// Статусные элементы
const cameraStatusText = document.getElementById('camera-status-text');
const viewModeText = document.getElementById('view-mode-text');

// Элементы центральных кнопок
const leftDoorStatus = document.getElementById('left-door-status');
const rightDoorStatus = document.getElementById('right-door-status');
const flashlightStatus = document.getElementById('flashlight-status');

// ===================== УПРАВЛЕНИЕ МЕНЮ =====================
function showMainMenu() {
    mainMenu.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    night = 1;

    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }

    // Останавливаем игровые звуки
    stopAtmosphericMusic();
    if (typeof stopFoxyRunSound === 'function') stopFoxyRunSound();
    if (typeof stopPirateSong === 'function') stopPirateSong();
    if (typeof stopKitchenNoise === 'function') stopKitchenNoise();

    // Сбрасываем все читы
    if (typeof resetCheats === 'function') resetCheats();

    // Запускаем музыку меню
    startMenuAmbience();
}

function startNewGame() {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    stopMenuAmbience();

    if (typeof scaleGame === 'function') scaleGame();

    if (!night || night < 1) night = 1;
    initGame();
}

// ===================== ИНИЦИАЛИЗАЦИЯ ИГРЫ =====================
function initGame() {
    console.log('🔄 Инициализация игры...');
    
    // Останавливаем предыдущий игровой цикл
    if (gameInterval) clearInterval(gameInterval);
    
    gameTime = 0;
    powerLevel = 100;
    gameActive = true;
    cameraActive = false;
    cameraViewTime = 0;
    stats = { cameraSwitches: 0, doorCloses: 0, threatsBlocked: 0 };
    
    leftDoorClosed = false;
    rightDoorClosed = false;
    leftVentClosed = false;
    rightVentClosed = false;
    flashlightOn = false;
    leftFlashlightOn = false;
    rightFlashlightOn = false;
    
    resetAnimatronics();
    setAIDifficulty();
    if (typeof applyCheatAI === 'function') applyCheatAI();
    if (typeof applyCustomNightAI === 'function') applyCustomNightAI();
    if (typeof applyCheatsToGame === 'function') applyCheatsToGame();

    // Сбрасываем Golden Freddy
    goldenFreddyTimer = 0;
    goldenFreddyVisible = false;
    goldenFreddyInOffice = false;
    goldenFreddyCountdown = 0;
    goldenFreddyCamTimer = 0;
    document.querySelectorAll('.golden-freddy-marker').forEach(el => el.classList.remove('golden-freddy-marker'));
    const gfEl = document.getElementById('enemy-golden-freddy');
    if (gfEl) {
        gfEl.style.display = 'none';
        gfEl.style.opacity = '0';
        gfEl.style.filter = '';
        gfEl.classList.remove('visible', 'golden-freddy-appear');
    }
    
    updateUI();
    updateAnimatronicDisplays();
    
    jumpscareOverlay.style.display = 'none';
    gameOverScreen.style.display = 'none';
    cameraModalOverlay.style.display = 'none';

    // Сбрасываем флаг применения картинок (чтобы переприменились при следующем updateAnimatronicDisplays)
    document.querySelectorAll('.enemy').forEach(el => {
        el.removeAttribute('data-img-applied');
    });

    // Переприменяем текстуры комнат
    if (typeof applyTexturesToAllElements === 'function') {
        applyTexturesToAllElements();
    }

    // Сбрасываем кнопки
    updateButtonStatus();
    
    startGameLoop();
    if (victoryAudio) { victoryAudio.pause(); victoryAudio.currentTime = 0; }
    startAtmosphericMusic();
    scheduleKitchenNoise();
    if (typeof scheduleSignalTear === 'function') scheduleSignalTear();
    
    // Телефонный звонок на всех ночах 1–7
    if (night <= 7 && phoneMessages[night]) {
        setTimeout(() => {
            if (gameActive) startPhoneCall(night);
        }, 1000);
    }
    
    // Применяем настройки
    applyScanlines();
    
    // Тост с номером ночи
    setTimeout(() => showNotif(`🌙 НОЧЬ ${night} НАЧАЛАСЬ`, 'info', 3000), 500);
}

function resetAnimatronics() {
    for (const key in animatronics) {
        const anim = animatronics[key];
        anim.location = animatronicPaths[key] ? animatronicPaths[key][0] : "stage";
        anim.progress = 0;
        anim.moveTimer = 0;
        anim.attackCooldown = 0;
        anim.isActive = true;
        anim.isVisible = false;
        anim.position = { x: 50, y: 50 };
        anim.behaviorState = "idle";
        
        if (key === "foxy") {
            anim.stage = "hiding";
            anim.runChance = 0;
            anim.peekTimer = 0;
            anim.runTimer = 0;
            anim.peekRunThreshold = 0;
            anim.location = "parts";
        }
        // Мгновенно переставляем точку на карте
        setTimeout(() => snapMapDot(key), 50);
    }
}

function setAIDifficulty() {
    // night=8 → кастомная ночь, AI задаётся через applyCustomNightAI
    if (typeof isCustomNight !== 'undefined' && isCustomNight) return;
    const aiSettings = nightAILevels[Math.min(night, 7)] || nightAILevels[1];
    const mult = (typeof difficultyMultipliers !== 'undefined' && gameSettings)
        ? (difficultyMultipliers[gameSettings.difficulty] || 1.0)
        : 1.0;

    for (const animatronic in animatronics) {
        if (aiSettings[animatronic] !== undefined) {
            // AI=0 означает "не двигается" — не форсируем минимум 1
            const raw = aiSettings[animatronic] * mult;
            animatronics[animatronic].ai = aiSettings[animatronic] === 0 ? 0 : Math.max(1, Math.round(raw));
        }
    }

    nightElement.textContent = (typeof isCustomNight !== 'undefined' && isCustomNight) ? 'C' : night;
}

// ===================== СИСТЕМА КАМЕР =====================
function openCameraSystem() {
    if (!gameActive || cameraActive || powerLevel <= 0) return;

    // Выключаем фонарики при открытии камер
    leftFlashlightOn = false;
    rightFlashlightOn = false;
    document.getElementById('left-flash-btn')?.classList.remove('active');
    document.getElementById('right-flash-btn')?.classList.remove('active');
    updateFlashlightEffects();

    cameraActive = true;
    cameraModalOverlay.style.display = 'flex';
    document.getElementById('office-monitors')?.classList.add('cameras-active');
    if (cameraStatusText) cameraStatusText.textContent = 'АКТИВНО';
    const cpw = document.getElementById('camera-power-warning');
    if (cpw) cpw.style.display = 'flex';
    if (cameraSystemStatusElement) cameraSystemStatusElement.textContent = 'АКТИВНО';
    
    // Activate first cam view (stage)
    document.querySelectorAll('.camera-room-view').forEach(v => v.classList.remove('active'));
    const firstView = document.getElementById('camera-stage');
    if (firstView) firstView.classList.add('active');
    document.querySelectorAll('.camera-sidebar-btn').forEach(b => b.classList.remove('active'));
    const firstBtn = document.querySelector('.camera-sidebar-btn[data-room="stage"]');
    if (firstBtn) firstBtn.classList.add('active');
    
    playCameraSwitchMusic();
    updateCameraModalMarkers();
    updateCameraWarnings();
    updateMapDots();
    updateCameraFeedLabel('stage');
}

function closeCameraSystem() {
    cameraActive = false;
    cameraModalOverlay.style.display = 'none';
    document.getElementById('office-monitors')?.classList.remove('cameras-active');
    if (cameraStatusText) cameraStatusText.textContent = 'ВЫКЛ';
    if (viewModeText) viewModeText.textContent = 'ОФИС';
    
    playCameraSwitchMusic();
}

function switchCameraInModal(room) {
    if (!cameraActive) return;
    
    // Сбрасываем активные кнопки (используем querySelectorAll по классу)
    document.querySelectorAll('.camera-sidebar-btn').forEach(btn => btn.classList.remove('active'));
    
    // Устанавливаем активную кнопку
    const activeBtn = document.querySelector(`.camera-sidebar-btn[data-room="${room}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Переключаем вид камеры
    document.querySelectorAll('.camera-room-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // room id may contain hyphens: west-hall → camera-west-hall
    const targetCameraView = document.getElementById(`camera-${room}`);
    if (targetCameraView) {
        targetCameraView.classList.add('active');
    }
    
    // Обновляем статус просмотра
    if (viewModeText) viewModeText.textContent = getLocationText(room).split(' ')[0];
    
    // Обновляем маркеры и карту
    updateCameraModalMarkers();
    updateMapDots();
    
    stats.cameraSwitches++;
    playCameraSwitchMusic();
    if (typeof triggerCameraSwitchNoise === 'function') triggerCameraSwitchNoise();
    if (typeof maybeSignalLoss === 'function') maybeSignalLoss();
}

function updateCameraModalMarkers() {
    // Скрываем все маркеры
    document.querySelectorAll('.camera-marker-modal').forEach(marker => {
        marker.classList.remove('visible');
    });
    
    if (!cameraActive) return;
    
    // Определяем текущую комнату в модальном окне
    const activeCameraView = document.querySelector('.camera-room-view.active');
    if (!activeCameraView) return;
    
    // camera-west-hall → west-hall
    const currentRoom = activeCameraView.id.replace(/^camera-/, '');
    
    // Показываем маркеры для аниматроников в текущей комнате
    for (const animName in animatronics) {
        const anim = animatronics[animName];
        if (anim.location === currentRoom) {
            // Build marker id: camera-modal-{anim}-{room} (or just camera-modal-{anim}-office)
            const markerId = currentRoom === 'office'
                ? `camera-modal-${animName}-office`
                : `camera-modal-${animName}-${currentRoom}`;
            
            const marker = document.getElementById(markerId);
            if (marker) {
                marker.classList.add('visible');
                positionCameraModalMarker(marker, animName, currentRoom);
                updateMarkerStyle(marker, animName, anim);
            }
        }
    }
    
    // Update map dots
    updateMapDots();
    
    // Update feed label
    updateCameraFeedLabel(currentRoom);
}

// Camera label data
const CAMERA_META = {
    'stage':     { id: 'CAM 1A', name: 'СЦЕНА' },
    'west-hall': { id: 'CAM 1B', name: 'WEST HALL' },
    'bathroom':  { id: 'CAM 1C', name: 'ТУАЛЕТЫ' },
    'dining':    { id: 'CAM 2A', name: 'ОБЕДЕННЫЙ ЗАЛ' },
    'supply':    { id: 'CAM 2B', name: 'СКЛАД' },
    'kitchen':   { id: 'CAM 2C', name: 'КУХНЯ' },
    'parts':     { id: 'CAM 3A', name: 'ПИРАТСКАЯ БУХТА' },
    'east-hall': { id: 'CAM 3B', name: 'EAST HALL' },
    'backstage': { id: 'CAM 3C', name: 'ЗАКУЛИСЬЕ' },
    'hall':      { id: 'CAM 4A', name: 'ГЛАВНЫЙ КОРИДОР' },
    'office':    { id: 'CAM 4B', name: 'ОФИС ОХРАНЫ' }
};

function updateCameraFeedLabel(room) {
    const meta = CAMERA_META[room] || { id: 'CAM ?', name: room.toUpperCase() };
    const camIdEl = document.getElementById('camera-feed-cam-id');
    const camNameEl = document.getElementById('camera-feed-room-name');
    if (camIdEl) camIdEl.textContent = meta.id;
    if (camNameEl) camNameEl.textContent = meta.name;
    
    // Timestamp
    const tsEl = document.getElementById('camera-timestamp');
    if (tsEl) {
        const now = new Date();
        const h = now.getHours().toString().padStart(2,'0');
        const m = now.getMinutes().toString().padStart(2,'0');
        const s = now.getSeconds().toString().padStart(2,'0');
        tsEl.textContent = `${h}:${m}:${s}`;
    }
}

// Map room → SVG coordinates for animatronic dots
const ROOM_MAP_COORDS = {
    'stage':      { x: 65,  y: 50  },
    'dining':     { x: 210, y: 50  },
    'parts':      { x: 355, y: 50  },
    'west-hall':  { x: 65,  y: 160 },
    'supply':     { x: 210, y: 125 },
    'east-hall':  { x: 355, y: 160 },
    'kitchen':    { x: 210, y: 190 },
    'bathroom':   { x: 65,  y: 258 },
    'backstage':  { x: 355, y: 258 },
    'hall':       { x: 210, y: 328 },
    'office':     { x: 210, y: 410 }
};

// Offsets so multiple animatronics in same room don't overlap
const ANIM_OFFSETS = { freddy: [-12,0], bonnie: [4,0], chica: [12,0], foxy: [-4,0] };

// ── Плавное движение точек на карте ──
// Для каждого аниматроника храним текущие экранные координаты (cx/cy)
// и целевые координаты. RAF-цикл интерполирует между ними.
const animMapPos = {
    freddy: { cx: 65, cy: 50, tx: 65, ty: 50 },
    bonnie: { cx: 65, cy: 50, tx: 65, ty: 50 },
    chica:  { cx: 210, cy: 50, tx: 210, ty: 50 },
    foxy:   { cx: 355, cy: 50, tx: 355, ty: 50 }
};

const MAP_LERP_SPEED = 0.055; // скорость интерполяции (0.0–1.0 за кадр)
let mapAnimRAF = null;

function startMapAnimation() {
    if (mapAnimRAF) return; // уже запущен
    function frame() {
        let anyMoving = false;
        for (const animName in animMapPos) {
            const pos = animMapPos[animName];
            const dx = pos.tx - pos.cx;
            const dy = pos.ty - pos.cy;
            if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
                pos.cx += dx * MAP_LERP_SPEED;
                pos.cy += dy * MAP_LERP_SPEED;
                anyMoving = true;

                // Применяем к SVG-элементам
                const dotEl = document.getElementById('map-dot-' + animName);
                const labelEl = document.getElementById('map-label-' + animName);
                if (dotEl) {
                    dotEl.setAttribute('cx', pos.cx.toFixed(2));
                    dotEl.setAttribute('cy', pos.cy.toFixed(2));
                }
                if (labelEl) {
                    labelEl.setAttribute('x', pos.cx.toFixed(2));
                    labelEl.setAttribute('y', (pos.cy + 4).toFixed(2));
                }

                // Обновляем линию-след от текущей позиции до цели
                const trailEl = document.getElementById('map-trail-' + animName);
                if (trailEl) {
                    const showTrail = typeof cheats !== 'undefined' && cheats.seeAll;
                    if (showTrail) {
                        trailEl.setAttribute('x1', pos.cx.toFixed(2));
                        trailEl.setAttribute('y1', pos.cy.toFixed(2));
                        trailEl.setAttribute('x2', pos.tx.toFixed(2));
                        trailEl.setAttribute('y2', pos.ty.toFixed(2));
                        trailEl.style.opacity = Math.min(Math.sqrt(dx*dx + dy*dy) / 40, 0.5).toFixed(2);
                    } else {
                        trailEl.style.opacity = '0';
                    }
                }
            } else {
                // Привязываем точно к цели
                pos.cx = pos.tx;
                pos.cy = pos.ty;

                // Скрываем след когда добрались
                const trailEl = document.getElementById('map-trail-' + animName);
                if (trailEl) trailEl.style.opacity = '0';
            }
        }
        mapAnimRAF = requestAnimationFrame(frame);
    }
    mapAnimRAF = requestAnimationFrame(frame);
}

function stopMapAnimation() {
    if (mapAnimRAF) { cancelAnimationFrame(mapAnimRAF); mapAnimRAF = null; }
}

// Устанавливает целевую точку для аниматроника на карте
function setMapTarget(animName) {
    const anim = animatronics[animName];
    const coord = ROOM_MAP_COORDS[anim.location];
    if (!coord) return;
    const offset = ANIM_OFFSETS[animName] || [0, 0];
    const pos = animMapPos[animName];
    if (pos) {
        pos.tx = coord.x + offset[0];
        pos.ty = coord.y + offset[1];
    }
}

// Мгновенно помещает точку (при сбросе / телепорте)
function snapMapDot(animName) {
    const anim = animatronics[animName];
    const coord = ROOM_MAP_COORDS[anim.location];
    if (!coord) return;
    const offset = ANIM_OFFSETS[animName] || [0, 0];
    const pos = animMapPos[animName];
    if (pos) {
        pos.cx = pos.tx = coord.x + offset[0];
        pos.cy = pos.ty = coord.y + offset[1];
        const dotEl = document.getElementById('map-dot-' + animName);
        const labelEl = document.getElementById('map-label-' + animName);
        if (dotEl) { dotEl.setAttribute('cx', pos.cx); dotEl.setAttribute('cy', pos.cy); }
        if (labelEl) { labelEl.setAttribute('x', pos.cx); labelEl.setAttribute('y', pos.cy + 4); }
    }
}

function updateMapDots() {
    // Точки аниматроников видны только при включённом чите seeAll
    const showDots = typeof cheats !== 'undefined' && cheats.seeAll;

    for (const animName in animatronics) {
        const anim = animatronics[animName];
        const dotEl = document.getElementById(`map-dot-${animName}`);
        const labelEl = document.getElementById(`map-label-${animName}`);
        if (!dotEl || !labelEl) continue;

        const coord = ROOM_MAP_COORDS[anim.location];

        // Всегда обновляем цель для плавного движения (даже если скрыто)
        if (coord) setMapTarget(animName);

        if (!showDots || !coord) {
            dotEl.classList.remove('visible');
            labelEl.classList.remove('visible');
            continue;
        }

        dotEl.classList.add('visible');
        labelEl.classList.add('visible');

        // Скорость пульсации в зависимости от угрозы
        if (anim.progress > 80 || anim.behaviorState === 'attacking') {
            dotEl.style.animationDuration = '0.3s';
        } else if (anim.progress > 50) {
            dotEl.style.animationDuration = '0.6s';
        } else {
            dotEl.style.animationDuration = '1.2s';
        }
    }
    
    // Highlight active camera room on map
    document.querySelectorAll('.map-room').forEach(r => r.classList.remove('map-active'));
    const activeCamView = document.querySelector('.camera-room-view.active');
    if (activeCamView) {
        const room = activeCamView.id.replace(/^camera-/, '');
        const mapRoom = document.querySelector(`.map-room[data-room="${room}"]`);
        if (mapRoom) mapRoom.classList.add('map-active');
    }
    
    // Threat highlights on map rooms — только при чите seeAll
    document.querySelectorAll('.map-room').forEach(r => {
        r.classList.remove('map-warning', 'map-danger');
    });
    const showThreats = typeof cheats !== 'undefined' && cheats.seeAll;
    if (showThreats) {
        for (const animName in animatronics) {
            const anim = animatronics[animName];
            const mapRoom = document.querySelector(`.map-room[data-room="${anim.location}"]`);
            if (!mapRoom) continue;
            if (anim.progress > 80 || anim.behaviorState === 'attacking' || (animName === 'foxy' && anim.stage === 'running')) {
                mapRoom.classList.add('map-danger');
            } else if (anim.progress > 50) {
                if (!mapRoom.classList.contains('map-danger')) mapRoom.classList.add('map-warning');
            }
        }
    }
}

function updateMarkerStyle(marker, animName, anim) {
    // Цвета для аниматроников
    const colors = {
        freddy: { primary: '#8B0000', glow: '#ff3333' },
        bonnie: { primary: '#00008B', glow: '#6666ff' },
        chica: { primary: '#666600', glow: '#ffff00' },
        foxy: { primary: '#660000', glow: '#ff6666' }
    };
    
    const color = colors[animName] || { primary: '#333333', glow: '#666666' };
    
    // Устанавливаем цвет маркера
    marker.style.borderColor = 'transparent';
    marker.style.boxShadow = 'none';
    marker.style.backgroundColor = 'transparent';
    
    // Если аниматроник близко к атаке
    if (anim.progress > 80 || anim.behaviorState === "attacking" || 
        (animName === "foxy" && anim.stage === "running")) {
        marker.style.animation = 'dangerPulse 0.5s infinite';
    } else if (anim.progress > 50) {
        marker.style.animation = 'warningPulse 1s infinite';
    } else {
        marker.style.animation = '';
    }
}

function positionCameraModalMarker(marker, animName, room) {
    // Clear previous positioning
    marker.style.left = marker.style.right = marker.style.top = marker.style.bottom = '';

    const positions = {
        'stage':        { freddy: { left:'28%', bottom:'20%' }, bonnie: { left:'60%', bottom:'20%' } },
        'dining':       { chica:  { left:'45%', bottom:'15%' }, freddy: { left:'20%', bottom:'15%' } },
        'west-hall':    { bonnie: { left:'38%', bottom:'10%' }, freddy: { left:'62%', bottom:'10%' } },
        'bathroom':     { freddy: { left:'50%', bottom:'15%' } },
        'supply':       { chica:  { left:'50%', bottom:'15%' } },
        'kitchen':      { chica:  { left:'48%', bottom:'18%' } },
        'parts':        { foxy:   { left:'45%', bottom:'10%' } },
        'east-hall':    { foxy:   { left:'36%', bottom:'10%' }, chica: { left:'62%', bottom:'10%' } },
        'backstage':    { foxy:   { left:'50%', bottom:'10%' } },
        'hall':         { freddy: { left:'15%', bottom:'12%' }, bonnie: { left:'35%', bottom:'12%' }, chica: { left:'58%', bottom:'12%' }, foxy: { left:'78%', bottom:'12%' } },
        'office':       { freddy: { right:'120px', bottom:'160px' }, bonnie: { left:'80px', bottom:'160px' }, chica: { right:'260px', bottom:'160px' }, foxy: { left:'220px', bottom:'160px' } }
    };
    
    const roomPos = positions[room];
    if (roomPos && roomPos[animName]) {
        Object.assign(marker.style, roomPos[animName]);
    } else {
        // fallback center
        marker.style.left = '45%';
        marker.style.bottom = '15%';
    }
}

function updateCameraWarnings() {
    document.querySelectorAll('.camera-sidebar-btn').forEach(btn => {
        btn.classList.remove('warning', 'danger');
        
        const room = btn.getAttribute('data-room');
        let threatLevel = 0;
        
        for (const animName in animatronics) {
            const anim = animatronics[animName];
            if (anim.location === room) {
                if (anim.progress > 80 || anim.behaviorState === "attacking" || 
                    (animName === "foxy" && anim.stage === "running")) {
                    threatLevel = 2;
                    break;
                } else if (anim.progress > 50) {
                    threatLevel = Math.max(threatLevel, 1);
                }
            }
        }
        
        if (threatLevel === 2) {
            btn.classList.add('danger');
        } else if (threatLevel === 1) {
            btn.classList.add('warning');
        }
    });
}

// ===================== ОСНОВНОЙ ИГРОВОЙ ЦИКЛ =====================
function startGameLoop() {
    startMapAnimation();
    gameInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(gameInterval);
            return;
        }
        
        gameTime++;
        
        // Проверка окончания ночи (6 часов = 360 секунд игрового времени)
        if (gameTime >= 360) {
            endNightSuccess();
            clearInterval(gameInterval);
            return;
        }
        
        // Обновление систем
        updatePowerConsumption();
        updateAnimatronics();
        checkGoldenFreddy();
        if (typeof tickCheats === 'function') tickCheats();
        if (typeof resetKitchenNoiseIfNeeded === 'function') resetKitchenNoiseIfNeeded();
        
        // Обновление системы камер
        if (cameraActive) {
            cameraViewTime++;
            if (cameraViewTimeElement) cameraViewTimeElement.textContent = `${cameraViewTime}с`;
        }
        
        // Обновление интерфейса
        updateUI();
        updateAnimatronicDisplays();
        updateIndicators();
        updateCameraModalMarkers();
        updateCameraWarnings();
        updateDangerOverlay();
        if (typeof updateThreatEffects === 'function') updateThreatEffects();
        if (typeof updatePowerEffects === 'function') updatePowerEffects();
        if (typeof updateCameraStaticEffect === 'function') updateCameraStaticEffect();
        if (typeof updateCamDangerFrame === 'function') updateCamDangerFrame();
        
        // Наблюдение за Фокси через камеру
        if (cameraActive) {
            const activeCam = document.querySelector('.camera-sidebar-btn.active');
            const currentRoom = activeCam ? activeCam.getAttribute('data-room') : null;
            updateFoxyWatchEffect(currentRoom);
        } else {
            updateFoxyWatchEffect(null);
        }
        
        // Прогресс времени
        const progressPercent = (gameTime / 360) * 100;
        timeProgress.style.width = `${progressPercent}%`;
        
    }, 1000); // Обновление каждую секунду
}

// ===================== МЕХАНИКА АНИМАТРОНИКОВ (переписана с нуля) =====================
//
// Каждый тик (1 сек) вызываются:
//   updateAnimatronics() → для Фредди/Бонни/Чики вызывает tickStandardAnim()
//                        → для Фокси вызывает tickFoxy()
//
// Состояния (behaviorState):
//   "idle"      — аниматроник спокойно стоит, ждёт своего хода
//   "moving"    — переходит в следующую комнату
//   "waiting"   — добрался до двери офиса, ждёт атаки
//   "attacking" — атакует (таймер перед джампскером)
//   "blocked"   — дверь закрыта, стоит снаружи
//
// Фокси имеет свои стадии (stage): hiding → peeking → running → attacking

function updateAnimatronics() {
    for (const animName in animatronics) {
        const anim = animatronics[animName];
        if (!anim.isActive) continue;

        // Уменьшаем cooldown каждый тик
        if (anim.attackCooldown > 0) anim.attackCooldown--;

        if (animName === "foxy") {
            tickFoxy();
        } else {
            tickStandardAnim(animName);
        }
    }
}

// --- Стандартный аниматроник (Фредди, Бонни, Чика) ---
function tickStandardAnim(animName) {
    const anim = animatronics[animName];

    // AI=0 → не двигается совсем (ночь 1 Фредди)
    if (anim.ai === 0) return;

    anim.moveTimer++;

    switch (anim.behaviorState) {

        case "idle":
        case "moving": {
            // Минимальная пауза: уменьшается с ростом AI (от 12 сек до 3 сек)
            const minPause = Math.max(3, 14 - anim.ai);
            // Шанс хода: от 1%/тик (AI=1) до 22%/тик (AI=15)
            const moveChance = Math.min(0.01 + anim.ai * 0.014, 0.22);

            if (anim.moveTimer >= minPause && Math.random() < moveChance) {
                anim.moveTimer = 0;
                advanceAnim(animName);
            }
            break;
        }

        case "waiting": {
            // Аниматроник стоит у двери. Каждый тик — шанс атаки.
            if (anim.attackCooldown > 0) break;

            const doorClosed = anim.doorSide === "left" ? leftDoorClosed : rightDoorClosed;

            if (doorClosed) {
                // Дверь закрыта — уйдёт через 3–5 секунд
                anim.behaviorState = "blocked";
                anim.attackCooldown = 3 + Math.floor(Math.random() * 3); // 3, 4 или 5 сек
                stats.threatsBlocked++;
            } else {
                // Дверь открыта: с нарастающим шансом атакуем
                const attackChance = Math.min(0.03 + anim.ai * 0.018, 0.55);
                if (Math.random() < attackChance) {
                    launchAttack(animName);
                }
            }
            break;
        }

        case "blocked": {
            if (anim.attackCooldown > 0) break;

            const doorClosed = anim.doorSide === "left" ? leftDoorClosed : rightDoorClosed;

            if (!doorClosed) {
                // Дверь открыли пока он стоял — сразу переходит в "waiting"
                anim.behaviorState = "waiting";
            } else {
                // Уходит через 3–5 секунд после блокировки (attackCooldown уже 0)
                retreatAnim(animName);
            }
            break;
        }

        // "attacking" — обрабатывается через setTimeout в launchAttack()
    }
}

// Переходим в следующую комнату по пути
function advanceAnim(animName) {
    const anim = animatronics[animName];
    const path = animatronicPaths[animName];
    const idx = path.indexOf(anim.location);

    if (idx === -1 || idx >= path.length - 1) return;

    const nextRoom = path[idx + 1];

    if (nextRoom === "office") {
        const doorClosed = anim.doorSide === "left" ? leftDoorClosed : rightDoorClosed;

        if (doorClosed) {
            // Дверь закрыта — уйдёт через 3–5 секунд
            anim.behaviorState = "blocked";
            anim.attackCooldown = 3 + Math.floor(Math.random() * 3); // 3, 4 или 5 сек
            anim.isVisible = true;
            stats.threatsBlocked++;
            showNotif(`🚫 ${anim.name} заблокирован дверью!`, 'hint', 2000);
            return;
        }

        // Входит в офис
        anim.location = "office";
        anim.progress = 100;
        anim.behaviorState = "waiting";
        anim.isVisible = true;
        playSound('warning');
        showNotif(`🚨 ${anim.name} у вашей двери!`, 'danger', 2500);
    } else {
        anim.location = nextRoom;
        anim.progress = ((idx + 1) / (path.length - 1)) * 100;
        anim.behaviorState = "moving";
        anim.isVisible = false;
    }
}

// Аниматроник атакует (с маленькой задержкой — шанс для игрока)
function launchAttack(animName) {
    const anim = animatronics[animName];
    anim.behaviorState = "attacking";

    // 700мс задержка — игрок ВИДИТ анимацию атаки и может успеть закрыть дверь
    setTimeout(() => {
        if (!gameActive) return;
        if (anim.location !== "office") return;

        // Режим призрака — атака блокируется
        if (typeof cheats !== 'undefined' && cheats.ghostMode) {
            retreatAnim(animName);
            showNotif(`👻 ${anim.name} прошёл сквозь тебя...`, 'hint', 1500);
            return;
        }

        const doorClosed = anim.doorSide === "left" ? leftDoorClosed : rightDoorClosed;

        if (!doorClosed) {
            // Атака удалась — джампскер
            triggerJumpscare(animName);
        } else {
            // Игрок успел закрыть дверь в последний момент
            retreatAnim(animName);
            stats.threatsBlocked++;
            showNotif(`✅ Закрыто вовремя! ${anim.name} отступил.`, 'hint', 2000);
        }
    }, 700);
}

// Аниматроник отходит назад в коридор
function retreatAnim(animName) {
    const anim = animatronics[animName];
    const path = animatronicPaths[animName];

    // Фокси всегда возвращается в Пиратскую Бухту — своя логика
    if (animName === "foxy") {
        const prevRoom = path.length >= 2 ? path[path.length - 2] : path[0];
        anim.location = prevRoom;
        anim.progress = ((path.length - 2) / (path.length - 1)) * 100;
        anim.behaviorState = "idle";
        anim.isVisible = false;
        anim.attackCooldown = 10;
        return;
    }

    // Фредди, Бонни, Чика — телепортируются в случайную комнату маршрута (без office)
    const availableRooms = path.filter(r => r !== "office");
    const randomIdx = Math.floor(Math.random() * availableRooms.length);
    const teleportRoom = availableRooms[randomIdx];
    const roomIdx = path.indexOf(teleportRoom);

    anim.location = teleportRoom;
    anim.progress = roomIdx > 0 ? (roomIdx / (path.length - 1)) * 100 : 0;
    anim.behaviorState = "idle";
    anim.isVisible = false;
    anim.attackCooldown = 12;

    // Мгновенная телепортация точки на карте (без плавности — это телепорт)
    snapMapDot(animName);

    // Визуальный эффект глитча на камерах
    triggerGlitchEffect();
    showNotif(`👁 ${anim.name} исчез...`, 'hint', 2500);
}

function triggerGlitchEffect() {
    // Кратковременный глитч на всём экране камер
    const cameraView = document.getElementById('camera-view');
    if (!cameraView) return;

    cameraView.classList.add('camera-glitch');
    setTimeout(() => cameraView.classList.remove('camera-glitch'), 400);

    // Мигание статики
    const overlay = document.querySelector('.camera-static-overlay');
    if (overlay) {
        overlay.style.opacity = '0.8';
        setTimeout(() => { overlay.style.opacity = ''; }, 300);
    }
}

// --- Фокси (уникальная логика: прячется → выглядывает → бежит → атакует) ---
function tickFoxy() {
    const foxy = animatronics.foxy;
    if (foxy.attackCooldown > 0) foxy.attackCooldown--;

    switch (foxy.stage) {

        case "hiding": {
            // AI напрямую ускоряет накопление: AI=2→+0.003/тик, AI=20→+0.021/тик
            const chargeRate = 0.001 + foxy.ai * 0.001;
            foxy.runChance = Math.min(foxy.runChance + chargeRate, 1.0);

            // Шанс начать выглядывать пропорционален runChance и AI
            const peekChance = foxy.runChance * (0.008 + foxy.ai * 0.003);
            if (Math.random() < peekChance) {
                foxy.stage = "peeking";
                // Рандомная задержка перед первым тиком peek: 1–4 сек (через отрицательный таймер)
                foxy.peekTimer = -(1 + Math.floor(Math.random() * 4));
                foxy.location = "parts";
                startPirateSong(); // Фокси выглядывает — начинает петь
            }
            break;
        }

        case "peeking": {
            foxy.peekTimer++;

            const watchingParts = cameraActive &&
                document.querySelector('.camera-sidebar-btn.active[data-room="parts"]');

            if (watchingParts) {
                foxy.stage = "hiding";
                // Спугнуть сложнее на высоком AI: меньше штраф к runChance
                const penalty = Math.max(0.5, 0.9 - foxy.ai * 0.02);
                foxy.runChance = Math.max(0, foxy.runChance * penalty);
                stopPirateSong(); // Спугнули — замолкает
                showNotif('👁 Фокси заметил слежку!', 'hint', 1500);
                break;
            }

            // Рандомный порог бега: базовый 2–3 тика, на высоком AI быстрее
            // Порог задаётся один раз при переходе в peeking (через runTimer как temp)
            if (!foxy.peekRunThreshold) {
                const base = Math.max(2, 4 - Math.floor(foxy.ai / 7));
                foxy.peekRunThreshold = base + Math.floor(Math.random() * 2); // base или base+1
            }
            if (foxy.peekTimer >= foxy.peekRunThreshold) {
                foxy.peekRunThreshold = 0; // сбрасываем для следующего раза
                foxy.stage = "running";
                foxy.runTimer = 0;
                foxy.behaviorState = "attacking";
                stopPirateSong(); // Побежал — пение прекращается
                playSound('foxyCharge');
                playFoxyRunSound();
                showNotif('🦊 ФОКСИ БЕЖИТ!', 'danger', 2000);
            }
            break;
        }

        case "running": {
            foxy.runTimer++;
            if (foxy.runTimer === 1) {
                foxy.location = "hall";   // сразу в коридор
            } else if (foxy.runTimer >= 3) {
                foxy.location = "office"; // добегает за 3 тика (~3 сек = длина звука бега)
                foxy.stage = "attacking";
                foxy.isVisible = true;
            }
            break;
        }

        case "attacking": {
            if (!leftDoorClosed) {
                // Атака!
                triggerJumpscare("foxy");
            } else {
                // Удар в дверь — стоит 3% энергии
                playDoorPound();
                if (typeof triggerDoorImpact === 'function') triggerDoorImpact();
                powerLevel = Math.max(0, powerLevel - 3);
                foxy.stage = "hiding";
                foxy.location = "parts";
                foxy.runChance = Math.max(0, foxy.runChance * 0.5);
                foxy.isVisible = false;
                foxy.behaviorState = "idle";
                foxy.attackCooldown = 8;
                foxy.peekRunThreshold = 0;
                stats.threatsBlocked++;
                stopFoxyRunSound();
                showNotif('🦊 Фокси отступил!', 'hint', 2500);
            }
            break;
        }
    }
}

// ===================== GOLDEN FREDDY =====================
// Механика:
//   1. Появляется с ночи 3 как ГАЛЛЮЦИНАЦИЯ на камере cam-1A (сцена) — редкий шанс
//   2. Если игрок держит камеру на cam-1A пока GF там — он "замечает" его
//   3. После этого GF телепортируется В ОФИС (посреди экрана) — материализуется
//   4. В офисе: игрок должен БЫСТРО открыть камеры чтобы GF исчез
//   5. Если игрок не открыл камеры за 5 секунд — GF атакует (уникальный джампскер)
//   6. Если игрок смотрит в камеры когда GF в офисе — GF исчезает (спасение)

let goldenFreddyTimer = 0;
let goldenFreddyVisible = false;       // GF на камере (галлюцинация)
let goldenFreddyInOffice = false;      // GF материализовался в офисе
let goldenFreddyCountdown = 0;         // таймер пока GF в офисе
let goldenFreddyCamTimer = 0;          // сколько тиков игрок смотрит на его камеру

function checkGoldenFreddy() {
    if (night < 3) return;
    if (!gameActive) return;

    // --- Фаза 1: Галлюцинация на камере ---
    if (!goldenFreddyVisible && !goldenFreddyInOffice) {
        goldenFreddyTimer++;
        // Шанс появления: ~0.4% в тик на ночи 3, растёт с ночью
        const chance = 0.004 + (night - 3) * 0.002;
        if (goldenFreddyTimer > 45 && Math.random() < chance) {
            _showGoldenFreddyOnCamera();
        }
        return;
    }

    // --- Фаза 2: Виден на камере ---
    if (goldenFreddyVisible && !goldenFreddyInOffice) {
        // Проверяем — смотрит ли игрок на cam-1A (сцена)
        const watchingStage = cameraActive &&
            document.querySelector('.camera-sidebar-btn.active[data-room="stage"]');

        if (watchingStage) {
            goldenFreddyCamTimer++;
            // Смотрит на него 2+ секунды → GF телепортируется в офис
            if (goldenFreddyCamTimer >= 2) {
                _goldenFreddyMaterialize();
            }
        } else {
            // Не смотрит — таймер присутствия на камере
            goldenFreddyCountdown--;
            if (goldenFreddyCountdown <= 0) {
                // Исчез с камеры без последствий
                _hideGoldenFreddyCamera();
            }
        }
        return;
    }

    // --- Фаза 3: Материализован в офисе ---
    if (goldenFreddyInOffice) {
        // Игрок открыл камеры — GF исчезает (спасение)
        if (cameraActive) {
            _hideGoldenFreddyOffice(false);
            showNotif('📷 Камера отогнала его...', 'success', 2500);
            return;
        }

        goldenFreddyCountdown--;
        if (goldenFreddyCountdown <= 0) {
            // Время вышло — атака
            _goldenFreddyAttack();
        }
    }
}

function _showGoldenFreddyOnCamera() {
    goldenFreddyVisible = true;
    goldenFreddyCamTimer = 0;
    goldenFreddyCountdown = 6; // 6 секунд виден на камере до исчезновения

    // Показываем призрак на камере сцены
    const ghost = document.getElementById('camera-golden-freddy-marker');
    if (ghost) {
        ghost.classList.remove('hidden');
        // Перезапускаем анимацию
        ghost.style.animation = 'none';
        ghost.offsetHeight; // reflow
        ghost.style.animation = '';
    }

    // Показываем иконку на карте (мигающая на stage)
    const stageMapRoom = document.querySelector('.map-room[data-room="stage"]');
    if (stageMapRoom) stageMapRoom.classList.add('golden-freddy-marker');

    showNotif('👁 ЧТО-ТО НА СЦЕНЕ...', 'info', 3000);
}

function _goldenFreddyMaterialize() {
    goldenFreddyVisible = false;
    goldenFreddyInOffice = true;
    goldenFreddyCountdown = 5; // 5 секунд чтобы открыть камеру

    // Убираем маркер с карты
    document.querySelectorAll('.golden-freddy-marker').forEach(el => el.classList.remove('golden-freddy-marker'));

    // Закрываем камеры принудительно
    if (cameraActive) closeCameraSystem();

    const el = document.getElementById('enemy-golden-freddy');
    if (el) {
        el.style.backgroundImage = `url("${getAnimatronicImageSrc('golden-freddy')}")`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center bottom';
        el.style.display = 'block';
        el.style.position = 'absolute';
        el.style.left = '50%';
        el.style.top = '10%';
        el.style.transform = 'translateX(-50%)';
        el.style.width = '55%';
        el.style.height = '85%';
        el.style.filter = 'drop-shadow(0 0 30px rgba(255,210,0,0.9)) brightness(0.85) saturate(0.7)';
        el.style.opacity = '0';
        el.style.zIndex = '14';
        el.classList.add('visible', 'golden-freddy-appear');
        // Плавное появление
        setTimeout(() => { if (el) el.style.opacity = '0.92'; }, 50);
    }

    playSound('warning');
    showNotif('⚠️ ОТКРОЙ КАМЕРУ! БЫСТРО!', 'danger', 4500);
}

function _hideGoldenFreddyCamera() {
    goldenFreddyVisible = false;
    goldenFreddyTimer = 0;
    goldenFreddyCamTimer = 0;
    const ghost = document.getElementById('camera-golden-freddy-marker');
    if (ghost) ghost.classList.add('hidden');
    document.querySelectorAll('.golden-freddy-marker').forEach(el => el.classList.remove('golden-freddy-marker'));
}

function _hideGoldenFreddyOffice(wasAttack) {
    goldenFreddyInOffice = false;
    goldenFreddyVisible = false;
    goldenFreddyTimer = 0;
    goldenFreddyCamTimer = 0;

    const ghost = document.getElementById('camera-golden-freddy-marker');
    if (ghost) ghost.classList.add('hidden');

    const el = document.getElementById('enemy-golden-freddy');
    if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.display = 'none';
            el.classList.remove('visible', 'golden-freddy-appear');
        }, 300);
    }
    document.querySelectorAll('.golden-freddy-marker').forEach(e => e.classList.remove('golden-freddy-marker'));
}

function _goldenFreddyAttack() {
    if (!gameActive) return;
    gameActive = false;
    stopMapAnimation();
    if (gameInterval) clearInterval(gameInterval);
    if (cameraActive) closeCameraSystem();
    endPhoneCall();
    triggerScreenShake();
    saveNightRecord(night, false, gameTime);
    stopAtmosphericMusic();
    if (typeof stopFoxyRunSound === 'function') stopFoxyRunSound();
    if (typeof stopPirateSong === 'function') stopPirateSong();
    if (typeof stopKitchenNoise === 'function') stopKitchenNoise();

    // Уникальный джампскер — Голден Фредди (используем его текстуру)
    const src = getAnimatronicImageSrc('golden-freddy');
    jumpscareImage.style.backgroundImage = `url("${src}")`;
    jumpscareImage.style.backgroundSize = 'cover';
    jumpscareImage.style.backgroundRepeat = 'no-repeat';
    jumpscareImage.style.backgroundPosition = 'center';
    jumpscareImage.style.width = '100%';
    jumpscareImage.style.height = '100%';
    jumpscareImage.style.filter = 'sepia(1) hue-rotate(30deg) brightness(1.3)';
    playSound('jumpscare');
    jumpscareOverlay.style.display = 'flex';
    jumpscareOverlay.style.background = 'rgba(200,180,0,0.15)';

    setTimeout(() => {
        jumpscareOverlay.style.display = 'none';
        jumpscareOverlay.style.background = '';
        jumpscareImage.style.filter = '';

        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverIcon = document.getElementById('game-over-icon');
        const deathReasonEl = document.getElementById('death-reason');
        const nightProgressEl = document.getElementById('night-progress');
        const nextNightBtn = document.getElementById('next-night-btn');

        gameOverTitle.textContent = 'ОН БЫЛ ЗДЕСЬ';
        gameOverTitle.style.color = '#d4a900';
        gameOverTitle.style.textShadow = '0 0 20px rgba(212,169,0,0.8)';
        gameOverIcon.textContent = '👁';
        deathReasonEl.textContent = 'ЗОЛОТОЙ ФРЕДДИ ПОГЛОТИЛ ВАС';
        deathReasonEl.style.color = '#d4a900';

        const hours = Math.floor(gameTime / 60);
        const minutes = gameTime % 60;
        nightProgressEl.textContent = `Ночь ${night} — вы продержались ${hours}ч ${minutes}м`;
        nextNightBtn.style.display = 'none';

        showGameOverStats();
        gameOverScreen.style.display = 'flex';

        _hideGoldenFreddyOffice(true);
    }, 2000);
}

// ===================== СБРОС GOLDEN FREDDY ПРИ INITGAME =====================
function updatePowerConsumption() {
    if (powerLevel <= 0) {
        triggerPowerOutage();
        return;
    }
    
    let drain = POWER_DRAIN.BASE; // Базовый расход
    
    // Расход за двери
    if (leftDoorClosed) drain += POWER_DRAIN.LEFT_DOOR;
    if (rightDoorClosed) drain += POWER_DRAIN.RIGHT_DOOR;
    
    // Расход за фонарик
    if (leftFlashlightOn || rightFlashlightOn) drain += POWER_DRAIN.FLASHLIGHT;
    
    // Расход за использование камер
    if (cameraActive) {
        drain += POWER_DRAIN.CAMERA;
    }
    
    // Рассчитываем время до полной разрядки
    let timeLeftSeconds = powerLevel / drain;
    let timeLeftMinutes = Math.floor(timeLeftSeconds / 60);
    let timeLeftSecondsRemaining = Math.floor(timeLeftSeconds % 60);
    
    if (timeLeftMinutes > 60) {
        powerTimeLeft.textContent = `> 60 мин`;
    } else if (timeLeftMinutes > 0) {
        powerTimeLeft.textContent = `~ ${timeLeftMinutes} мин ${timeLeftSecondsRemaining} сек`;
    } else {
        powerTimeLeft.textContent = `${Math.floor(timeLeftSeconds)} сек`;
    }
    
    // Уменьшаем уровень энергии
    powerLevel = Math.max(0, powerLevel - drain);
    powerUsage.textContent = `${drain.toFixed(2)}%/сек`;
    
    // Предупреждения об энергии
    if (powerLevel <= 20 && powerLevel > 19) {
        showNotif('⚡ КРИТИЧЕСКИЙ УРОВЕНЬ ЭНЕРГИИ!', 'danger', 3000);
    } else if (powerLevel <= 50 && powerLevel > 49) {
        showNotif('⚠️ Энергия на исходе!', 'warning', 3000);
    }
    
    // Обновляем предупреждение о расходе энергии камер
    cameraPowerDrainElement.textContent = `${POWER_DRAIN.CAMERA.toFixed(1)}%/сек`;
}

function triggerPowerOutage() {
    if (!gameActive) return;
    
    stopAtmosphericMusic();
    playSound('powerOut');
    
    // Закрываем камеры при отключении энергии
    if (cameraActive) {
        closeCameraSystem();
    }
    
    // Открываем все двери при отключении энергии
    leftDoorClosed = false;
    rightDoorClosed = false;
    flashlightOn = false;
    leftFlashlightOn = false;
    rightFlashlightOn = false;
    updateFlashlightEffects();

    // Обновляем кнопки
    updateButtonStatus();
    
    // Немедленная атака при отключении энергии
    setTimeout(() => {
        if (gameActive) {
            // Выбираем аниматроника, который ближе всего к офисе
            let closestAnim = null;
            let maxProgress = 0;
            
            for (const animName in animatronics) {
                const anim = animatronics[animName];
                if (anim.progress > maxProgress) {
                    maxProgress = anim.progress;
                    closestAnim = animName;
                }
            }
            
            if (closestAnim) {
                triggerJumpscare(closestAnim);
            } else {
                triggerJumpscare("freddy");
            }
        }
    }, 1000);
}

// ===================== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА =====================
function updateUI() {
    // Время (12 AM → 1 AM → ... → 6 AM)
    const hours = Math.floor(gameTime / 60);
    const minutes = gameTime % 60;
    const displayHour = hours === 0 ? '12' : hours.toString().padStart(2, '0');
    const timeStr = `${displayHour}:${minutes.toString().padStart(2, '0')} AM`;
    if (timeElement) timeElement.textContent = timeStr;
    // HUD time
    const hudTime = document.getElementById('game-time');
    if (hudTime) hudTime.textContent = timeStr;
    
    const timeLeft = 360 - gameTime;
    const hoursLeft = Math.floor(timeLeft / 60);
    const minutesLeft = timeLeft % 60;
    const timeLeftStr = `${hoursLeft}:${minutesLeft.toString().padStart(2, '0')}`;
    if (timeLeftElement) timeLeftElement.textContent = timeLeftStr;
    const hudTimeLeft = document.getElementById('time-left');
    if (hudTimeLeft) hudTimeLeft.textContent = timeLeftStr;
    
    // Энергия (старые элементы — скрыты, но обновляем для совместимости)
    if (powerValue) powerValue.textContent = `${Math.floor(powerLevel)}%`;
    if (powerFill) powerFill.style.width = `${powerLevel}%`;

    // HUD энергия
    const hudVal = document.getElementById('power-value-hud');
    const hudFill = document.getElementById('power-fill-hud');
    const hudDrain = document.getElementById('power-usage-hud');
    if (hudVal) hudVal.textContent = `${Math.floor(powerLevel)}%`;
    if (hudFill) {
        hudFill.style.width = `${powerLevel}%`;
        if (powerLevel > 50) {
            hudVal.style.color = '#00ff88';
            hudVal.style.textShadow = '0 0 12px rgba(0,255,100,0.6)';
            hudFill.style.background = 'linear-gradient(to right, #00aa44, #00ff88)';
        } else if (powerLevel > 20) {
            hudVal.style.color = '#ffcc00';
            hudVal.style.textShadow = '0 0 12px rgba(255,200,0,0.6)';
            hudFill.style.background = 'linear-gradient(to right, #cc8800, #ffcc00)';
        } else {
            hudVal.style.color = '#ff4444';
            hudVal.style.textShadow = '0 0 12px rgba(255,0,0,0.6)';
            hudFill.style.background = 'linear-gradient(to right, #aa0000, #ff4444)';
        }
    }
    
    // Статистика
    if (statsTime) statsTime.textContent = `${displayHour}:${minutes.toString().padStart(2, '0')}`;
    if (statsSwitches) statsSwitches.textContent = stats.cameraSwitches;
    if (statsDoors) statsDoors.textContent = stats.doorCloses;
    if (statsThreats) statsThreats.textContent = stats.threatsBlocked;
    
    // Состояние дверей
    updateButtonStatus();
    
    // Статус камеры
    if (cameraSystemBtn) cameraSystemBtn.classList.toggle('active', cameraActive);
}

function updateButtonStatus() {
    // Левая дверь
    leftDoorBtn.classList.toggle('active', leftDoorClosed);
    // Оверлей двери — всегда показываем если дверь закрыта
    leftDoorOverlay.classList.toggle('door-closed', leftDoorClosed);
    if (leftDoorStatus) leftDoorStatus.textContent = leftDoorClosed ? 'ЗАКРЫТА' : 'ОТКРЫТА';

    // Правая дверь
    rightDoorBtn.classList.toggle('active', rightDoorClosed);
    rightDoorOverlay.classList.toggle('door-closed', rightDoorClosed);
    if (rightDoorStatus) rightDoorStatus.textContent = rightDoorClosed ? 'ЗАКРЫТА' : 'ОТКРЫТА';

    // Индикаторы на стенах
    const ldLight = document.getElementById('left-door-light');
    if (ldLight) ldLight.classList.toggle('active', leftDoorClosed);
    const rdLight = document.getElementById('right-door-light');
    if (rdLight) rdLight.classList.toggle('active', rightDoorClosed);
    const lfLight = document.getElementById('left-flash-light');
    if (lfLight) lfLight.classList.toggle('active', leftFlashlightOn);
    const rfLight = document.getElementById('right-flash-light');
    if (rfLight) rfLight.classList.toggle('active', rightFlashlightOn);

    // Кнопки фонарей
    document.getElementById('left-flash-btn')?.classList.toggle('active', leftFlashlightOn);
    document.getElementById('right-flash-btn')?.classList.toggle('active', rightFlashlightOn);

    // Монитор
    const monBtn = document.getElementById('office-monitor-btn');
    if (monBtn) monBtn.style.opacity = cameraActive ? '0' : '1';

    updateFlashlightEffects();
}

// ===================== ФОНАРИК И ДВЕРИ =====================
// МЕХАНИКА:
//   Дверь ОТКРЫТА  → аниматроник виден в офисе через updateAnimatronicDisplays
//   Дверь ЗАКРЫТА  → enemy-div полностью скрыт; показывается ТОЛЬКО через door-anim-view при включённом фонаре
//   Фонарь (hold)  → проявляет аниматроника через щель двери если он в hall ИЛИ в офисе у этой двери
//   Фонарь при открытой двери → не нужен, ничего не делает

function updateFlashlightEffects() {
    if (cameraActive) {
        leftFlashlightOn  = false;
        rightFlashlightOn = false;
        document.getElementById('left-flash-btn')?.classList.remove('active');
        document.getElementById('right-flash-btn')?.classList.remove('active');
    }
    _updateOneSide('left',  leftDoorClosed,  leftFlashlightOn,  ['bonnie']);
    _updateOneSide('right', rightDoorClosed, rightFlashlightOn, ['chica', 'freddy']);
}

function _updateOneSide(side, doorClosed, flashOn, animNames) {
    const peep     = document.getElementById(`${side}-door-peep`);
    const animView = document.getElementById(`${side}-door-anim-view`);
    const fxEl     = document.getElementById(`flashlight-${side}-effect`);

    // Фонарь показывает аниматроника ТОЛЬКО если он вошёл в офис (location === 'office')
    // hall = главный коридор перед дверью — там не видно
    let activeAnimName = null;
    for (const name of animNames) {
        const a = animatronics[name];
        if (!a) continue;
        if (a.location === 'office') { activeAnimName = name; break; }
    }

    // --- ДВЕРЬ ОТКРЫТА ---
    if (!doorClosed) {
        if (fxEl)     fxEl.classList.add('hidden');
        if (peep)     peep.classList.remove('active');
        if (animView) { animView.classList.remove('active', 'has-anim'); animView.style.backgroundImage = 'none'; }
        return;
    }

    // --- ДВЕРЬ ЗАКРЫТА ---
    // Прячем enemy-div этой стороны — они за дверью, невидимы
    for (const name of animNames) {
        const el = document.getElementById(`enemy-${name}`);
        if (el) {
            el.style.display = 'none';
            el.classList.remove('visible', 'attacking', 'approaching', 'flashlit-left', 'flashlit-right', 'flashlit-peek');
        }
    }

    // Боковой световой эффект
    if (fxEl) fxEl.classList.toggle('hidden', !flashOn);

    // Глазок
    if (peep) peep.classList.toggle('active', flashOn);

    // Вид через глазок — показываем ТОЛЬКО если аниматроник в hall И фонарь включён
    if (animView) {
        const showAnim = flashOn && (activeAnimName !== null);
        animView.classList.toggle('active', flashOn);
        animView.classList.toggle('has-anim', showAnim);
        if (showAnim) {
            animView.style.backgroundImage = `url("${getAnimatronicImageSrc(activeAnimName)}")`;
        } else {
            animView.style.backgroundImage = 'none';
        }
    }
}

function updateAnimatronicDisplays() {
    // Карта: кто за какой дверью
    const LEFT_SIDE  = ['bonnie', 'foxy'];
    const RIGHT_SIDE = ['freddy', 'chica'];

    for (const animName in animatronics) {
        const anim = animatronics[animName];
        const enemyElement = document.getElementById(`enemy-${animName}`);
        if (!enemyElement) continue;

        // Применяем картинку один раз
        if (!enemyElement.dataset.imgApplied) {
            const src = getAnimatronicImageSrc(animName);
            enemyElement.style.backgroundImage = `url("${src}")`;
            enemyElement.style.backgroundSize = 'contain';
            enemyElement.style.backgroundPosition = 'center bottom';
            enemyElement.style.backgroundRepeat = 'no-repeat';
            enemyElement.dataset.imgApplied = '1';
        }

        // Определяем дверь этого аниматроника
        const isLeftSide  = LEFT_SIDE.includes(animName);
        const isRightSide = RIGHT_SIDE.includes(animName);
        const doorClosed  = isLeftSide ? leftDoorClosed : (isRightSide ? rightDoorClosed : false);

        // Аниматроник вошёл в офис, но дверь закрыта → скрыт от прямого взгляда,
        // виден только через фонарь (door-anim-view)
        const atClosedDoor = doorClosed && anim.location === 'office';
        const inOffice = anim.location === 'office' && anim.isActive && anim.isVisible;

        if (atClosedDoor) {
            // Скрыт — виден только через door-anim-view при включённом фонаре
            enemyElement.style.display = 'none';
            enemyElement.classList.remove('visible', 'attacking', 'approaching');
            continue;
        }

        if (inOffice && !doorClosed) {
            // Аниматроник вошёл — дверь открыта, виден в офисе
            enemyElement.style.display = 'block';
            enemyElement.classList.add('visible');

            // 18.5% −20% = 14.8%, высота 72% −20% = 57.6%
            enemyElement.style.width  = '14.8%';
            enemyElement.style.height = '57.6%';
            enemyElement.style.bottom = '0';
            enemyElement.style.backgroundSize     = 'contain';
            enemyElement.style.backgroundPosition = 'center bottom';

            if (anim.doorSide === 'left') {
                enemyElement.style.left  = '3%';
                enemyElement.style.right = 'auto';
            } else {
                enemyElement.style.right = '3%';
                enemyElement.style.left  = 'auto';
            }

            enemyElement.classList.remove('attacking', 'approaching');
            enemyElement.style.opacity = '1';

            if (anim.behaviorState === 'attacking') {
                enemyElement.classList.add('attacking');
                enemyElement.style.filter = 'drop-shadow(0 0 40px rgba(255,0,0,0.9)) brightness(1.3)';
            } else if (anim.behaviorState === 'blocked') {
                enemyElement.style.opacity = '0.65';
                enemyElement.style.filter  = 'grayscale(0.5) drop-shadow(0 0 10px rgba(255,100,0,0.5))';
            } else {
                enemyElement.classList.add('approaching');
                enemyElement.style.filter = 'drop-shadow(0 0 20px rgba(255,0,0,0.6))';
            }
        } else {
            enemyElement.style.display = 'none';
            enemyElement.classList.remove('visible', 'attacking', 'approaching');
            enemyElement.style.filter  = '';
            enemyElement.style.opacity = '1';
        }

        // Обновляем панель статуса
        const statusElement = document.getElementById(`${animName}-status`);
        if (statusElement) {
            const locationText = getLocationText(anim.location);
            statusElement.querySelector('.animatronic-location').textContent = locationText;
            statusElement.querySelector('.animatronic-ai').textContent = `AI: ${anim.ai}`;

            const colors = {
                freddy: { primary: '#8B0000', glow: '#ff3333' },
                bonnie: { primary: '#00008B', glow: '#6666ff' },
                chica: { primary: '#666600', glow: '#ffff00' },
                foxy:   { primary: '#660000', glow: '#ff6666' }
            };
            const color = colors[animName] || { primary: '#333333', glow: '#666666' };

            if (anim.location === "office") {
                statusElement.style.backgroundColor = 'rgba(139, 0, 0, 0.5)';
                statusElement.style.borderLeftColor = color.glow;
            } else if (anim.behaviorState === "blocked") {
                statusElement.style.backgroundColor = 'rgba(255, 153, 0, 0.3)';
                statusElement.style.borderLeftColor = '#ff9900';
            } else {
                statusElement.style.backgroundColor = '';
                statusElement.style.borderLeftColor = color.primary;
            }
        }
    }
}

function getLocationText(location) {
    const locations = {
        'stage':      'СЦЕНА',
        'hall':       'ГЛАВНЫЙ КОРИДОР',
        'kitchen':    'КУХНЯ',
        'parts':      'ПИРАТСКАЯ БУХТА',
        'bathroom':   'ТУАЛЕТЫ',
        'office':     'ОФИС',
        'dining':     'ОБЕДЕННЫЙ ЗАЛ',
        'supply':     'СКЛАД',
        'west-hall':  'WEST HALL',
        'east-hall':  'EAST HALL',
        'backstage':  'ЗАКУЛИСЬЕ'
    };
    return locations[location] || location.toUpperCase();
}

function updateIndicators() {
    updateDoorIndicators();
    updateVentIndicators();
}

function updateDoorIndicators() {
    const leftIndicator = document.getElementById('door-left-indicator');
    const rightIndicator = document.getElementById('door-right-indicator');
    
    // Левая дверь (Бонни и Фокси)
    let leftEnemies = [];
    if (animatronics.bonnie.location === "office" || animatronics.bonnie.progress > 80) {
        leftEnemies.push("БОННИ");
    }
    if (animatronics.foxy.location === "office" || animatronics.foxy.stage === "running" || animatronics.foxy.stage === "attacking") {
        leftEnemies.push("ФОКСИ");
    }
    
    if (leftEnemies.length > 0) {
        leftIndicator.style.display = 'flex';
        leftIndicator.textContent = leftEnemies.join('+');
        
        const colors = {
            bonnie: { primary: '#00008B', glow: '#6666ff' },
            foxy: { primary: '#660000', glow: '#ff6666' }
        };
        
        leftIndicator.style.backgroundColor = leftEnemies.includes("ФОКСИ") ? colors.foxy.primary : colors.bonnie.primary;
        leftIndicator.style.borderColor = leftEnemies.includes("ФОКСИ") ? colors.foxy.glow : colors.bonnie.glow;
    } else {
        leftIndicator.style.display = 'none';
    }
    
    // Правая дверь (Фредди и Чика)
    let rightEnemies = [];
    if (animatronics.freddy.location === "office" || animatronics.freddy.progress > 80) {
        rightEnemies.push("ФРЕДДИ");
    }
    if (animatronics.chica.location === "office" || animatronics.chica.progress > 80) {
        rightEnemies.push("ЧИКА");
    }
    
    if (rightEnemies.length > 0) {
        rightIndicator.style.display = 'flex';
        rightIndicator.textContent = rightEnemies.join('+');
        
        const colors = {
            freddy: { primary: '#8B0000', glow: '#ff3333' },
            chica: { primary: '#666600', glow: '#ffff00' }
        };
        
        rightIndicator.style.backgroundColor = rightEnemies.includes("ЧИКА") ? colors.chica.primary : colors.freddy.primary;
        rightIndicator.style.borderColor = rightEnemies.includes("ЧИКА") ? colors.chica.glow : colors.freddy.glow;
        rightIndicator.style.color = rightEnemies.includes("ЧИКА") ? 'black' : 'white';
    } else {
        rightIndicator.style.display = 'none';
    }
}

function updateVentIndicators() {
    // Вентиляция пока не реализована, скрываем индикаторы
    document.getElementById('vent-indicator-left').style.display = 'none';
    document.getElementById('vent-indicator-right').style.display = 'none';
}

// ===================== КОНЕЦ ИГРЫ И ДЖАМПСКЕРЫ =====================
function triggerJumpscare(animatronic) {
    if (!gameActive) return;
    
    gameActive = false;
    stopMapAnimation();
    if (gameInterval) clearInterval(gameInterval);
    
    if (cameraActive) closeCameraSystem();
    endPhoneCall();
    triggerScreenShake();
    saveNightRecord(night, false, gameTime);
    
    stopAtmosphericMusic();
    if (typeof stopFoxyRunSound === 'function') stopFoxyRunSound();
    if (typeof stopPirateSong === 'function') stopPirateSong();
    if (typeof stopKitchenNoise === 'function') stopKitchenNoise();
    createBasicJumpscare(animatronic);
    playSound('jumpscare');
    
    jumpscareOverlay.style.display = 'flex';
    
    setTimeout(() => {
        jumpscareOverlay.style.display = 'none';
        
        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverIcon = document.getElementById('game-over-icon');
        const deathReasonEl = document.getElementById('death-reason');
        const nightProgressEl = document.getElementById('night-progress');
        const nextNightBtn = document.getElementById('next-night-btn');
        
        gameOverTitle.textContent = "ИГРА ОКОНЧЕНА";
        gameOverTitle.style.color = '';
        gameOverTitle.style.textShadow = '';
        gameOverIcon.textContent = '💀';
        
        const animName = animatronics[animatronic]?.name || animatronic;
        deathReasonEl.textContent = `${animName.toUpperCase()} АТАКОВАЛ ВАС!`;
        deathReasonEl.style.color = '';
        
        const hours = Math.floor(gameTime / 60);
        const minutes = gameTime % 60;
        nightProgressEl.textContent = `Ночь ${night} — вы продержались ${hours}ч ${minutes}м`;
        
        nextNightBtn.style.display = 'none';
        
        showGameOverStats();
        gameOverScreen.style.display = 'flex';
    }, 2000);
}

function showGameOverStats() {
    document.getElementById('go-stat-cams').textContent = stats.cameraSwitches;
    document.getElementById('go-stat-doors').textContent = stats.doorCloses;
    document.getElementById('go-stat-threats').textContent = stats.threatsBlocked;
    document.getElementById('go-stat-ai').textContent = 
        `Ф:${animatronics.freddy.ai} Б:${animatronics.bonnie.ai} Ч:${animatronics.chica.ai} ФО:${animatronics.foxy.ai}`;
    
    // Скрываем danger overlay
    document.getElementById('danger-overlay').className = 'hidden';
}

function createBasicJumpscare(animatronic) {
    // Всегда используем реальную картинку аниматроника из папки
    const src = getAnimatronicImageSrc(animatronic);
    jumpscareImage.style.backgroundImage = `url("${src}")`;
    jumpscareImage.style.backgroundSize = 'contain';
    jumpscareImage.style.backgroundRepeat = 'no-repeat';
    jumpscareImage.style.backgroundPosition = 'center';
    jumpscareImage.style.width = '100%';
    jumpscareImage.style.height = '100%';
}

function endNightSuccess() {
    gameActive = false;
    if (typeof isCustomNight !== 'undefined') isCustomNight = false;
    stopMapAnimation();
    // Убираем реалистичные эффекты
    document.getElementById('main-view')?.classList.remove('threat-pulse');
    document.getElementById('game-container')?.classList.remove('danger-vignette', 'power-low');
    document.getElementById('camera-view')?.classList.remove('foxy-static');
    if (typeof stopCameraEffects === 'function') stopCameraEffects();
    if (gameInterval) clearInterval(gameInterval);
    
    if (cameraActive) closeCameraSystem();
    endPhoneCall();
    stopAtmosphericMusic();
    if (typeof stopFoxyRunSound === 'function') stopFoxyRunSound();
    if (typeof stopPirateSong === 'function') stopPirateSong();
    if (typeof stopKitchenNoise === 'function') stopKitchenNoise();
    playVictoryMusic();
    saveNightRecord(night, true, gameTime);
    if (typeof checkCheatsUnlocked === 'function') checkCheatsUnlocked();
    
    setTimeout(() => {
        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverIcon = document.getElementById('game-over-icon');
        const deathReasonEl = document.getElementById('death-reason');
        const nightProgressEl = document.getElementById('night-progress');
        const nextNightBtn = document.getElementById('next-night-btn');
        
        showGameOverStats();
        
        if (night < 7) {
            gameOverTitle.textContent = "НОЧЬ ПЕРЕЖИТА! 🎉";
            gameOverTitle.style.color = '#00cc00';
            gameOverTitle.style.textShadow = '0 0 20px #00ff00';
            gameOverIcon.textContent = '✅';
            deathReasonEl.textContent = `ВЫ ВЫЖИЛИ НОЧЬ ${night}!`;
            deathReasonEl.style.color = '#00cc00';
            nightProgressEl.textContent = `Следующая: Ночь ${night + 1}`;
            nextNightBtn.style.display = 'flex';
            nextNightBtn.onclick = () => { night++; initGame(); };
        } else {
            gameOverTitle.textContent = "ПОБЕДА! 🏆";
            gameOverTitle.style.color = '#ffcc00';
            gameOverTitle.style.textShadow = '0 0 30px #ffff00';
            gameOverIcon.textContent = '🏆';
            deathReasonEl.textContent = "ВЫ ПРОШЛИ ВСЕ 7 НОЧЕЙ!";
            deathReasonEl.style.color = '#ffcc00';
            nightProgressEl.textContent = "Вы мастер ночной смены Freddy's!";
            nextNightBtn.style.display = 'none';
        }
        
        gameOverScreen.style.display = 'flex';
    }, 1000);
}

// ===================== АУДИО =====================
function playSound(soundName) {
    if (!audioEnabled) return;
    const vol = (gameSettings.volume || 70) / 100;

    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const sounds = {
            jumpscare:    () => playJumpscare(ctx, vol),
            powerOut:     () => playPowerOut(ctx, vol),
            foxyCharge:   () => playFoxyCharge(ctx, vol),
            doorClose:    () => playDoorClose(ctx, vol),
            warning:      () => playWarningBeep(ctx, vol),
        };

        if (sounds[soundName]) sounds[soundName]();
    } catch (e) {
        // Аудио недоступно
    }
}

function playJumpscare(ctx, vol) {
    // Резкий металлический скрежет + низкий удар
    [80, 160, 320, 640].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(vol * (0.3 - i * 0.05), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime + i * 0.02);
        osc.stop(ctx.currentTime + 0.8);
    });
}

function playCameraClick(ctx, vol) {
    // Щелчок реле
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = vol * 0.4;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
}

function playPowerOut(ctx, vol) {
    // Гудение падающее в тишину
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 2);
    gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.start();
    osc.stop(ctx.currentTime + 2);
}

function playFoxyCharge(ctx, vol) {
    // Ускоряющийся топот
    for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        const t = ctx.currentTime + i * (0.15 - i * 0.02);
        osc.frequency.setValueAtTime(200 + i * 30, t);
        gain.gain.setValueAtTime(vol * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
    }
}

function playDoorClose(ctx, vol) {
    // Тяжёлый стук двери
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(vol * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

function playWarningBeep(ctx, vol) {
    // Тревожный писк
    [0, 0.3].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
    });
}

// ===================== ОБРАБОТЧИКИ СОБЫТИЙ =====================

// Панорама отключена — статичный офис

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Игра загружается...');
    
    // Предзагружаем картинки аниматроников
    preloadAnimatronicImages();
    
    // Инициализируем музыку
    initMusic();

    // Автозапуск музыки меню через 100мс — единоразовый триггер при старте
    // Используем programmatic click на скрытый элемент чтобы обойти autoplay policy
    setTimeout(() => {
        if (menuAmbienceAudio) {
            menuAmbienceAudio.volume = (gameSettings.volume || 70) / 100 * 0.55;
            menuAmbienceAudio.currentTime = 0;
            menuAmbienceAudio.play().then(() => {
                // Успешно запустилось
            }).catch(() => {
                // Браузер заблокировал — вешаем одноразовый перехватчик
                // на самое раннее касание страницы
                const unlock = () => {
                    if (menuAmbienceAudio && menuAmbienceAudio.paused) {
                        menuAmbienceAudio.play().catch(() => {});
                    }
                    document.removeEventListener('pointerdown', unlock, true);
                    document.removeEventListener('mousedown', unlock, true);
                    document.removeEventListener('keydown', unlock, true);
                    document.removeEventListener('touchstart', unlock, true);
                };
                document.addEventListener('pointerdown', unlock, { once: true, capture: true });
                document.addEventListener('mousedown',   unlock, { once: true, capture: true });
                document.addEventListener('keydown',     unlock, { once: true, capture: true });
                document.addEventListener('touchstart',  unlock, { once: true, capture: true });
            });
        }
    }, 100);
    
    // Загружаем настройки
    loadSettings();
    updateMenuRecords();

    // Кнопка новой игры → экран выбора ночи
    newGameBtn.addEventListener('click', () => {
        startMenuAmbience(); // запускаем звук меню при первом взаимодействии
        showNightSelectScreen();
    });
    
    // Кнопка "Продолжить"
    document.getElementById('continue-btn')?.addEventListener('click', () => {
        night = unlockedNights;
        document.getElementById('main-menu').classList.add('hidden');
        startNewGame();
    });
    
    // Кнопки выбора ночи
    document.getElementById('night-select-back')?.addEventListener('click', hideNightSelectScreen);
    
    // Кнопка настроек
    settingsBtn.addEventListener('click', () => { startMenuAmbience(); showSettings(); });
    _initSettingsEvents();
    _initControlsEvents();

    // Слайдер громкости (уже обрабатывается _initSettingsEvents)
    
    // ===== ВЫХОД В МЕНЮ =====
    document.getElementById('exit-to-menu-btn')?.addEventListener('click', () => {
        document.getElementById('confirm-exit-overlay').classList.remove('hidden');
    });
    document.getElementById('confirm-exit-no')?.addEventListener('click', () => {
        document.getElementById('confirm-exit-overlay').classList.add('hidden');
    });
    document.getElementById('confirm-exit-yes')?.addEventListener('click', () => {
        document.getElementById('confirm-exit-overlay').classList.add('hidden');
        // Останавливаем всё
        gameActive = false;
        if (gameInterval) { clearInterval(gameInterval); gameInterval = null; }
        if (typeof endPhoneCall === 'function') endPhoneCall();
        if (typeof stopAtmosphericMusic === 'function') stopAtmosphericMusic();
        if (typeof stopVictoryMusic === 'function') stopVictoryMusic();
        document.getElementById('danger-overlay').className = 'hidden';
        document.getElementById('alert-toast').classList.add('hidden');
        document.getElementById('game-over-screen').style.display = 'none';
        showMainMenu();
        updateMenuRecords();
    });
    
    // Кнопка возврата в меню в конце игры
    restartBtn.addEventListener('click', () => {
        document.getElementById('danger-overlay').className = 'hidden';
        document.getElementById('alert-toast').classList.add('hidden');
        showMainMenu();
        updateMenuRecords();
    });
    
    // Телефонный звонок - пропуск
    document.getElementById('phone-skip-btn')?.addEventListener('click', skipPhoneCall);
    
    // Кнопка системы камер (старая — оставляем для совместимости)
    cameraSystemBtn?.addEventListener('click', () => {
        if (cameraActive) {
            closeCameraSystem();
        } else {
            openCameraSystem();
        }
    });

    // Клик по мониторам в офисе → открытие камер
    document.getElementById('office-monitors')?.addEventListener('click', () => {
        if (!gameActive) return;
        if (!cameraActive) openCameraSystem();
    });
    // Новая кнопка — телевизор-монитор
    document.getElementById('office-monitor-btn')?.addEventListener('click', () => {
        if (!gameActive) return;
        if (cameraActive) closeCameraSystem(); else openCameraSystem();
    });
    
    // Закрытие камер
    closeCameraBtn.addEventListener('click', () => {
        closeCameraSystem();
    });
    
    // Кнопки камер - event delegation для всех кнопок (включая новые)
    document.getElementById('camera-btn-list')?.addEventListener('click', (e) => {
        if (!cameraActive) return;
        const btn = e.target.closest('[data-room]');
        if (btn) switchCameraInModal(btn.getAttribute('data-room'));
    });
    // Клики на SVG карту (через onclick уже установлены, но добавим для надёжности)
    document.getElementById('pizzeria-map')?.addEventListener('click', (e) => {
        if (!cameraActive) return;
        const room = e.target.closest('[data-room]')?.getAttribute('data-room');
        if (room) switchCameraInModal(room);
    });
    
    // Системные кнопки (только визуальный эффект)
    systemButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (cameraActive && !e.target.id?.includes('camera')) return;
            systemButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
    
    // Левая дверь
    leftDoorBtn.addEventListener('click', () => {
        if (!gameActive || powerLevel <= 0) return;
        leftDoorClosed = !leftDoorClosed;
        if (leftDoorClosed) {
            stats.doorCloses++;
            playSound('doorClose');
        } else {
            playCameraSwitchMusic();
        }
        leftDoorBtn.classList.toggle('active', leftDoorClosed);
        updateButtonStatus();
    });

    // Правая дверь
    rightDoorBtn.addEventListener('click', () => {
        if (!gameActive || powerLevel <= 0) return;
        rightDoorClosed = !rightDoorClosed;
        if (rightDoorClosed) {
            stats.doorCloses++;
            playSound('doorClose');
            if (animatronics.freddy.location === 'office' || animatronics.chica.location === 'office') {
                showNotif('⚠️ Аниматроник заблокирован!', 'hint', 2000);
            }
        } else {
            playCameraSwitchMusic();
        }
        updateButtonStatus();
    });
    
    // Левый фонарь — зажать и держать
    const leftFlashBtn = document.getElementById('left-flash-btn');
    const _leftFlashOn  = () => { if (!gameActive || powerLevel <= 0 || cameraActive) return; leftFlashlightOn = true;  updateButtonStatus(); };
    const _leftFlashOff = () => { leftFlashlightOn = false; updateButtonStatus(); };
    leftFlashBtn?.addEventListener('mousedown',   _leftFlashOn);
    leftFlashBtn?.addEventListener('mouseup',     _leftFlashOff);
    leftFlashBtn?.addEventListener('mouseleave',  _leftFlashOff);
    leftFlashBtn?.addEventListener('touchstart',  (e)=>{ e.preventDefault(); _leftFlashOn(); },  {passive:false});
    leftFlashBtn?.addEventListener('touchend',    _leftFlashOff);
    leftFlashBtn?.addEventListener('touchcancel', _leftFlashOff);

    // Правый фонарь — зажать и держать
    const rightFlashBtn = document.getElementById('right-flash-btn');
    const _rightFlashOn  = () => { if (!gameActive || powerLevel <= 0 || cameraActive) return; rightFlashlightOn = true;  updateButtonStatus(); };
    const _rightFlashOff = () => { rightFlashlightOn = false; updateButtonStatus(); };
    rightFlashBtn?.addEventListener('mousedown',   _rightFlashOn);
    rightFlashBtn?.addEventListener('mouseup',     _rightFlashOff);
    rightFlashBtn?.addEventListener('mouseleave',  _rightFlashOff);
    rightFlashBtn?.addEventListener('touchstart',  (e)=>{ e.preventDefault(); _rightFlashOn(); },  {passive:false});
    rightFlashBtn?.addEventListener('touchend',    _rightFlashOff);
    rightFlashBtn?.addEventListener('touchcancel', _rightFlashOff);

    // Старая кнопка фонарика (для совместимости с хоткеем F)
    flashlightBtn?.addEventListener('click', () => {
        if (!gameActive) return;
        flashlightOn = !flashlightOn;
        updateButtonStatus();
    });
    
    // Аудио
    audioToggle.addEventListener('click', () => {
        audioEnabled = !audioEnabled;
        gameSettings.volume = audioEnabled ? 70 : 0;
        audioToggle.innerHTML = audioEnabled ?
            '<i class="fas fa-volume-up"></i><span>ЗВУК ВКЛ</span>' :
            '<i class="fas fa-volume-mute"></i><span>ЗВУК ВЫКЛ</span>';
        updateMusicVolume();

        const inMenu = mainMenu && !mainMenu.classList.contains('hidden');

        if (audioEnabled) {
            if (inMenu) {
                // В меню — включаем только музыку меню
                if (menuAmbienceAudio && menuAmbienceAudio.paused) {
                    menuAmbienceAudio.play().catch(() => {});
                }
            } else if (gameActive) {
                // В игре — включаем только игровую атмосферу
                if (atmosphericAudio && atmosphericAudio.paused) {
                    atmosphericAudio.play().catch(() => {});
                }
            }
        } else {
            // Выкл — останавливаем всё
            if (atmosphericAudio) atmosphericAudio.pause();
            if (menuAmbienceAudio) menuAmbienceAudio.pause();
        }
    });
    
    // Управление клавиатурой — динамические бинды из gameSettings.keybinds
    document.addEventListener('keydown', (e) => {
        // Если идёт перехват клавиши для ребиндинга — не обрабатываем
        if (typeof _capturingAction !== 'undefined' && _capturingAction) return;

        // Пропуск телефона
        if (e.key === 'Enter' && phoneCallActive) {
            skipPhoneCall();
            return;
        }

        // Закрыть настройки / подтверждение выхода по Escape
        if (e.key === 'Escape') {
            const confirmOverlay = document.getElementById('confirm-exit-overlay');
            if (!confirmOverlay.classList.contains('hidden')) {
                confirmOverlay.classList.add('hidden');
                return;
            }
            const settingsOverlay = document.getElementById('settings-overlay');
            if (!settingsOverlay.classList.contains('hidden')) {
                settingsOverlay.classList.add('hidden');
                return;
            }
            if (gameActive && cameraActive) {
                closeCameraSystem();
                e.preventDefault();
            }
            return;
        }

        if (!gameActive) return;

        // Не реагируем если фокус в поле ввода
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const k = e.key.toLowerCase();
        const binds = (typeof gameSettings !== 'undefined' && gameSettings.keybinds)
            ? gameSettings.keybinds
            : {};

        // Камеры
        if (k === (binds.camera || 'c')) {
            e.preventDefault();
            if (cameraActive) closeCameraSystem();
            else openCameraSystem();
            return;
        }

        // Левая дверь
        if (k === (binds.leftDoor || 'a')) {
            e.preventDefault();
            leftDoorBtn.click();
            return;
        }

        // Правая дверь
        if (k === (binds.rightDoor || 'd')) {
            e.preventDefault();
            rightDoorBtn.click();
            return;
        }

        // Левый фонарь
        if (k === (binds.leftFlash || 'f')) {
            e.preventDefault();
            if (powerLevel <= 0 || cameraActive) return;
            leftFlashlightOn = true;
            updateButtonStatus();
            return;
        }

        // Правый фонарь
        if (k === (binds.rightFlash || 'g')) {
            e.preventDefault();
            if (powerLevel <= 0 || cameraActive) return;
            rightFlashlightOn = true;
            updateButtonStatus();
            return;
        }

        // Быстрое переключение камер
        if (cameraActive) {
            const camMap = {
                [binds.cam_stage      || '1']: 'stage',
                [binds['cam_west-hall']|| '2']: 'west-hall',
                [binds.cam_bathroom   || '3']: 'bathroom',
                [binds.cam_dining     || '4']: 'dining',
                [binds.cam_supply     || '5']: 'supply',
                [binds.cam_kitchen    || '6']: 'kitchen',
                [binds.cam_parts      || '7']: 'parts',
                [binds['cam_east-hall']|| '8']: 'east-hall',
                [binds.cam_hall       || '9']: 'hall',
                [binds.cam_backstage  || '0']: 'backstage',
            };
            const room = camMap[k];
            if (room) {
                e.preventDefault();
                document.querySelector(`.camera-sidebar-btn[data-room="${room}"]`)?.click();
            }
        }
    });
    
    // Клавиатура — ОТПУСКАНИЕ клавиш фонарей
    document.addEventListener('keyup', (e) => {
        if (!gameActive) return;
        const k = e.key.toLowerCase();
        const binds = (typeof gameSettings !== 'undefined' && gameSettings.keybinds) ? gameSettings.keybinds : {};
        if (k === (binds.leftFlash  || 'f')) { leftFlashlightOn  = false; updateButtonStatus(); }
        if (k === (binds.rightFlash || 'g')) { rightFlashlightOn = false; updateButtonStatus(); }
    });

});
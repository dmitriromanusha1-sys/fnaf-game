// ===================== ДОПОЛНЕНИЯ К ИГРЕ =====================

// Настройки игры
const gameSettings = {
    volume: 70,
    difficulty: 'normal',
    scanlines: true,
    screenShake: true,
    phoneCall: true,
    // Аудио — каналы
    volAtmosphere: 50,
    volMenu: 55,
    volSfx: 100,
    volJumpscare: 100,
    foxySong: true,
    kitchenNoise: true,
    // Графика
    gfxQuality: 'medium',
    vignette: true,
    chromatic: true,
    grain: true,
    shadows: false,
    brightness: 100,
    contrast: 110,
    // Управление
    keybinds: {
        camera:         'c',
        leftDoor:       'a',
        rightDoor:      'd',
        leftFlash:      'f',
        rightFlash:     'g',
        cam_stage:      '1',
        'cam_west-hall':'2',
        cam_bathroom:   '3',
        cam_dining:     '4',
        cam_supply:     '5',
        cam_kitchen:    '6',
        cam_parts:      '7',
        'cam_east-hall':'8',
        cam_hall:       '9',
        cam_backstage:  '0'
    }
};

// Множители сложности
const difficultyMultipliers = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.8
};

// Рекорды
let gameRecords = JSON.parse(localStorage.getItem('fnaf_records') || '{}');
// Разблокированные ночи (из localStorage)
let unlockedNights = parseInt(localStorage.getItem('fnaf_unlocked') || '1');

// ===================== ТЕЛЕФОННЫЕ ЗВОНКИ =====================
// Каждое сообщение — объект { text, delay, speed, pause }
// delay — пауза ПЕРЕД фразой (мс), speed — мс на символ, pause — пауза ПОСЛЕ (мс)
// Специальные маркеры в тексте:
//   [...]  — пауза 800мс (задумчивость)
//   {...}  — помеха на линии (глитч-эффект)
//   *текст* — выделенное (важное) слово — будет подсвечено
const phoneMessages = {
    1: [
        { text: "Алло? Алло, алло?", delay: 800, speed: 60, pause: 600 },
        { text: "Эм... я хотел записать это сообщение, чтобы помочь вам устроиться. [...]", delay: 200, speed: 45, pause: 400 },
        { text: "Хм... хотя... если вы слышите это, значит вы, скорее всего, уже заняли место ночного охранника.", delay: 0, speed: 40, pause: 500 },
        { text: "Поздравляю. {...}", delay: 300, speed: 55, pause: 700 },
        { text: "Ладно, для начала скажу — место абсолютно безопасное. Никаких причин для беспокойства.", delay: 200, speed: 42, pause: 400 },
        { text: "Аниматроники — Фредди, Бонни, Чика и Фокси — ночью должны двигаться. [...]", delay: 100, speed: 43, pause: 300 },
        { text: "Если они остановятся, их *сервомоторы* заблокируются. Техническая проблема.", delay: 0, speed: 40, pause: 500 },
        { text: "Теперь о главном. Если один из них *зайдёт в офис*... [...]", delay: 300, speed: 45, pause: 400 },
        { text: "...компания больше не несёт ответственности. По юридическим соображениям.", delay: 0, speed: 38, pause: 600 },
        { text: "Используй *камеры*, чтобы следить за ними. И *двери* — чтобы они не вошли.", delay: 200, speed: 42, pause: 400 },
        { text: "Но помни — *энергия* ограничена. Береги её. [...]", delay: 100, speed: 45, pause: 500 },
        { text: "Ладно. Удачи тебе. [...]  Она тебе понадобится. {...}", delay: 400, speed: 50, pause: 800 }
    ],
    2: [
        { text: "Привет, снова я!", delay: 500, speed: 55, pause: 300 },
        { text: "Первая ночь позади. Молодец. {...}", delay: 200, speed: 45, pause: 500 },
        { text: "Сегодня ночью... кхм... [...]", delay: 300, speed: 50, pause: 400 },
        { text: "Бонни и Чика стали... активнее. Следи за *западным* и *восточным* коридорами.", delay: 100, speed: 42, pause: 500 },
        { text: "Про Фокси. Он любит, когда на него *НЕ смотрят*. Проверяй пиратскую бухту почаще. [...]", delay: 200, speed: 43, pause: 400 },
        { text: "Если он выбежал — *захлопни левую дверь*. Быстро.", delay: 100, speed: 45, pause: 500 },
        { text: "Ах, и ещё — не держи двери закрытыми дольше, чем нужно. *Энергия уходит быстро*. [...]", delay: 200, speed: 40, pause: 400 },
        { text: "Ладно, на сегодня всё. Берегись. {...}", delay: 400, speed: 55, pause: 700 }
    ],
    3: [
        { text: "Привет. Третья ночь... {...}", delay: 600, speed: 50, pause: 500 },
        { text: "Ты продержался дольше, чем большинство. Не многие доходят до этого момента. [...]", delay: 200, speed: 40, pause: 600 },
        { text: "Фредди. Он... другой. Он двигается *только в темноте*. Если смотришь на него через камеру — он стоит. [...]", delay: 300, speed: 38, pause: 500 },
        { text: "Но стоит отвернуться... {...} ...он уже ближе.", delay: 200, speed: 45, pause: 600 },
        { text: "Слышал ли ты *смех на кухне*? [...]", delay: 400, speed: 50, pause: 500 },
        { text: "Кухонная камера не работает. Никогда не работала. [...]", delay: 100, speed: 42, pause: 400 },
        { text: "Но иногда слышно... движение. Шорохи. Стуки. [...]", delay: 200, speed: 45, pause: 500 },
        { text: "Это просто... эхо. Да. Просто эхо. {...}", delay: 300, speed: 48, pause: 700 },
        { text: "Удачи. *Серьёзно*. [...]  Она тебе очень нужна сегодня. {...}", delay: 400, speed: 44, pause: 800 }
    ],
    4: [
        { text: "...Алло? {...}", delay: 900, speed: 55, pause: 700 },
        { text: "Это снова я. [...]", delay: 400, speed: 48, pause: 500 },
        { text: "Слушай... сегодня днём здесь кое-что произошло. Я не хотел тебе говорить, но... [...]", delay: 300, speed: 40, pause: 600 },
        { text: "Один из охранников дневной смены... он зашёл в подсобку. {...}", delay: 200, speed: 38, pause: 700 },
        { text: "Мы не знаем точно что там случилось. Официально — *несчастный случай*. [...]", delay: 300, speed: 40, pause: 500 },
        { text: "Техники осмотрели аниматроников. Говорят, всё в порядке. [...]", delay: 200, speed: 42, pause: 400 },
        { text: "Я им не верю. {...}", delay: 500, speed: 52, pause: 800 },
        { text: "Сегодня они все четверо активны *с самого начала смены*. Фредди, Бонни, Чика, Фокси. [...]", delay: 300, speed: 39, pause: 500 },
        { text: "Фредди... он изменился. Раньше он ждал. Наблюдал. Теперь — *нет*. [...]", delay: 200, speed: 38, pause: 600 },
        { text: "Следи за *обеденным залом*. Фредди любит там останавливаться. Смотрит прямо в камеру. [...]", delay: 300, speed: 40, pause: 500 },
        { text: "И ещё одна вещь. Это важно. [...]", delay: 400, speed: 45, pause: 400 },
        { text: "Иногда... очень редко... можно увидеть *золотого костюма*. В офисе. Прямо перед тобой. [...]", delay: 200, speed: 37, pause: 700 },
        { text: "Если это случится — *не паникуй*. Закрой планшет с камерами. Опусти голову. [...]", delay: 100, speed: 38, pause: 500 },
        { text: "Он уйдёт. Наверное. {...}", delay: 400, speed: 50, pause: 700 },
        { text: "Это старый костюм. Его давно должны были списать. Но он... остался. [...]", delay: 200, speed: 40, pause: 500 },
        { text: "Ладно. Мне нужно идти. Сегодня здесь остаётся ещё пара человек из персонала. [...]", delay: 300, speed: 41, pause: 400 },
        { text: "Хотя... может, это и плохо. {...}", delay: 500, speed: 52, pause: 700 },
        { text: "Держись, ладно? *Держись*. [...]  Удачи. {...}", delay: 400, speed: 45, pause: 900 }
    ],
    5: [
        { text: "{...}", delay: 1200, speed: 60, pause: 900 },
        { text: "Алло... ты слышишь меня? {...}", delay: 600, speed: 50, pause: 700 },
        { text: "Хорошо. Хорошо, что слышишь. [...]", delay: 400, speed: 44, pause: 500 },
        { text: "Пятая ночь. Ты дошёл до пятой ночи. [...]", delay: 300, speed: 40, pause: 600 },
        { text: "Знаешь... из всех кто работал здесь ночным охранником... единицы добирались до этого момента. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "Я должен тебе кое-что объяснить. То, о чём мы обычно не говорим вслух. [...]", delay: 300, speed: 38, pause: 600 },
        { text: "Аниматроники... они *не просто машины*. {...}", delay: 400, speed: 42, pause: 700 },
        { text: "Внутри каждого из них есть... остаточная программа. Что-то вроде... памяти. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "Они помнят детей. Помнят праздники. Музыку. Смех. [...]", delay: 200, speed: 38, pause: 600 },
        { text: "Но ночью... когда зал пустой... они не понимают почему вокруг тихо. [...]", delay: 300, speed: 36, pause: 500 },
        { text: "Они видят тебя. И думают, что ты — *один из них*. Только без костюма. {...}", delay: 200, speed: 38, pause: 700 },
        { text: "Поэтому они и идут к тебе. Не из злобы. Они просто... *хотят помочь*. [...]", delay: 300, speed: 37, pause: 600 },
        { text: "В этом вся жуть. {...}", delay: 500, speed: 55, pause: 800 },
        { text: "Сегодня будет особенно тяжело. Они все на максимальной активности. [...]", delay: 300, speed: 38, pause: 500 },
        { text: "Следи за *пиратской бухтой* в первую очередь. Фокси сегодня не будет ждать. [...]", delay: 200, speed: 38, pause: 500 },
        { text: "И... смотри в оба за *восточным коридором*. Чика идёт оттуда. Тихо. Очень тихо. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "Я... [...]  ...я надеюсь, что ты справишься. Правда надеюсь. [...]", delay: 400, speed: 40, pause: 600 },
        { text: "Потому что если нет... [...]  ...ну ты понимаешь. {...}", delay: 300, speed: 42, pause: 700 },
        { text: "Ещё одна ночь. *Всего одна*. [...]  Ты можешь. {...}", delay: 500, speed: 45, pause: 900 }
    ],
    6: [
        { text: "{...} ...{...}", delay: 1400, speed: 60, pause: 1000 },
        { text: "Алло. [...]", delay: 700, speed: 50, pause: 600 },
        { text: "Шестая ночь. Ты действительно дошёл до шестой ночи. [...]", delay: 400, speed: 40, pause: 700 },
        { text: "Я... честно говоря, не готовил речь для этого момента. [...]", delay: 300, speed: 38, pause: 500 },
        { text: "Никто обычно не доходит до шестой. {...}", delay: 400, speed: 42, pause: 700 },
        { text: "Послушай. Мне нужно сказать тебе кое-что о *пропавших детях*. [...]", delay: 300, speed: 37, pause: 600 },
        { text: "Несколько лет назад... здесь случилось... что-то плохое. Официально это назвали *инцидентом*. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "Пятеро. Пятеро детей. [...]", delay: 500, speed: 42, pause: 800 },
        { text: "И никто так и не понял... куда они исчезли. {...}", delay: 300, speed: 38, pause: 700 },
        { text: "Пиццерию временно закрывали. Потом снова открыли. Бизнес есть бизнес. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "Но аниматроники... *после того случая* — они стали другими. [...]", delay: 300, speed: 37, pause: 600 },
        { text: "Я думаю... они помнят. По-своему. {...}", delay: 400, speed: 42, pause: 700 },
        { text: "Именно поэтому они такие настойчивые ночью. Они *ищут*. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "Сегодня все четверо будут на пике. Без пауз. Без передышки. [...]", delay: 300, speed: 36, pause: 500 },
        { text: "Энергию трать *только на критические моменты*. Каждый процент на счету. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "Следи за *западным коридором* — Бонни сегодня особенно быстр. [...]", delay: 200, speed: 37, pause: 500 },
        { text: "И... если услышишь музыку из зала... [...]", delay: 400, speed: 40, pause: 600 },
        { text: "...просто игнорируй. Не думай об этом. *Просто игнорируй*. {...}", delay: 300, speed: 38, pause: 700 },
        { text: "Ты почти у цели. [...]  Одна ночь осталась после этой. [...]", delay: 400, speed: 39, pause: 500 },
        { text: "Я верю в тебя. {...}", delay: 600, speed: 48, pause: 900 }
    ],
    7: [
        { text: "{...}", delay: 1800, speed: 70, pause: 1200 },
        { text: "...{...}...", delay: 1000, speed: 65, pause: 1000 },
        { text: "Ты слышишь меня? [...]", delay: 700, speed: 48, pause: 800 },
        { text: "Седьмая ночь. [...]", delay: 500, speed: 45, pause: 700 },
        { text: "Я даже не знаю, как ты это делаешь. {...}", delay: 400, speed: 42, pause: 700 },
        { text: "Знаешь... я записал все эти сообщения заранее. Думал, что никто никогда не дойдёт до седьмого. [...]", delay: 300, speed: 36, pause: 600 },
        { text: "Я ошибся. {...}", delay: 500, speed: 50, pause: 800 },
        { text: "Сегодня... правил нет. Совсем. [...]", delay: 400, speed: 40, pause: 600 },
        { text: "Они не будут медленно подходить. Не будут заглядывать в коридор. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "*С первой секунды* — они идут к тебе. Все четверо. Одновременно. {...}", delay: 300, speed: 36, pause: 700 },
        { text: "Фредди пойдёт через обеденный зал. Прямо. Не останавливаясь. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "Бонни — западный коридор. Он не даст тебе передышки. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "Чика — восток. Тихо. Незаметно. Пока не поздно. [...]", delay: 200, speed: 36, pause: 500 },
        { text: "Фокси... он уже смотрит на тебя. Прямо сейчас. {...}", delay: 300, speed: 38, pause: 700 },
        { text: "Камеры. Двери. Энергия. Это всё что у тебя есть. [...]", delay: 300, speed: 37, pause: 500 },
        { text: "Один неверный выбор — и всё. [...]", delay: 400, speed: 40, pause: 600 },
        { text: "Но ты дошёл до седьмой. *Ты дошёл до седьмой*. [...]", delay: 300, speed: 37, pause: 500 },
        { text: "Значит ты знаешь что делать. [...]", delay: 300, speed: 38, pause: 500 },
        { text: "...{...}...", delay: 600, speed: 65, pause: 800 },
        { text: "Удачи. *В последний раз*. [...]  Прощай. {...}", delay: 500, speed: 42, pause: 1000 }
    ]
};

// ── Состояние телефонного звонка ──
let phoneCallActive = false;
let phoneMessageIndex = 0;
let phoneTimer = null;
let phoneCharIndex = 0;
let phoneCurrentMessage = '';
let phoneTotalChars = 0;
let phoneElapsedChars = 0;
let phoneIsGlitching = false;

// Счётчик наблюдения за Фокси
let foxyWatchTimer = 0;
const FOXY_WATCH_REDUCTION = 0.15; // Уменьшение шанса забега при наблюдении

// Уровень опасности для оверлея
let dangerLevel = 0; // 0 = нет, 1 = низкий, 2 = высокий

// Toast уведомления
let toastTimeout = null;

// ===================== ФУНКЦИИ ВЫБОРА НОЧИ =====================
function showNightSelectScreen() {
    document.getElementById('main-menu').classList.add('hidden');
    const screen = document.getElementById('night-select-screen');
    screen.classList.remove('hidden');
    renderNightCards();
}

function hideNightSelectScreen() {
    document.getElementById('night-select-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function renderNightCards() {
    const grid = document.getElementById('night-select-grid');
    grid.innerHTML = '';
    
    const difficultyLabels = {
        1: { label: 'ЛЁГКИЙ', class: 'difficulty-easy', stars: '★☆☆☆☆' },
        2: { label: 'НОРМАЛЬНЫЙ', class: 'difficulty-normal', stars: '★★☆☆☆' },
        3: { label: 'СРЕДНИЙ', class: 'difficulty-normal', stars: '★★★☆☆' },
        4: { label: 'СЛОЖНЫЙ', class: 'difficulty-hard', stars: '★★★★☆' },
        5: { label: 'ОЧЕНЬ СЛОЖНО', class: 'difficulty-hard', stars: '★★★★★' },
        6: { label: 'ХАРДКОР', class: 'difficulty-extreme', stars: '★★★★★' },
        7: { label: 'КОШМАР', class: 'difficulty-nightmare', stars: '★★★★★' }
    };
    
    for (let n = 1; n <= 7; n++) {
        const card = document.createElement('div');
        card.className = 'night-card';
        const isLocked = n > unlockedNights;
        const isBeaten = gameRecords[`night_${n}_beaten`];
        
        if (isLocked) card.classList.add('locked');
        if (isBeaten) card.classList.add('beaten');
        
        const diff = difficultyLabels[n];
        const bestTime = gameRecords[`night_${n}_best`];
        
        card.innerHTML = `
            ${isLocked ? '<i class="fas fa-lock night-card-lock"></i>' : ''}
            <div class="night-card-number">${n}</div>
            <div class="night-card-label">НОЧЬ</div>
            <div class="night-card-difficulty ${diff.class}">${diff.label}</div>
            <div class="night-card-stars">${diff.stars}</div>
            ${bestTime ? `<div class="night-card-best">⏱ Рекорд: ${bestTime}</div>` : ''}
        `;
        
        if (!isLocked) {
            card.addEventListener('click', () => {
                startNightFromSelect(n);
            });
        }
        
        grid.appendChild(card);
    }
}

function startNightFromSelect(n) {
    document.getElementById('night-select-screen').classList.add('hidden');
    night = n;
    startNewGame();
}

// ===================== НАСТРОЙКИ =====================

function showSettings() {
    document.getElementById('settings-overlay').classList.remove('hidden');
    _settingsLoad();
}

function _settingsLoad() {
    const s = gameSettings;

    // Мастер
    const ms = document.getElementById('volume-slider');
    if (ms) { ms.value = s.volume; _updateSliderGradient(ms); }
    _setVal('volume-value', s.volume + '%');
    _updateVolIcon(s.volume);
    _setChk('toggle-mute', s.volume === 0);

    // Каналы аудио
    _setSliderAndVal('vol-atmosphere',  'vol-atmosphere-val',  s.volAtmosphere);
    _setSliderAndVal('vol-menu',        'vol-menu-val',        s.volMenu);
    _setSliderAndVal('vol-sfx',         'vol-sfx-val',         s.volSfx);
    _setSliderAndVal('vol-jumpscare',   'vol-jumpscare-val',   s.volJumpscare);
    _setChk('toggle-phonecall',         s.phoneCall);
    _setChk('toggle-foxy-song',         s.foxySong);
    _setChk('toggle-kitchen-noise',     s.kitchenNoise);

    // Игра
    document.querySelectorAll('input[name="difficulty"]').forEach(r => { r.checked = r.value === s.difficulty; });
    _setChk('toggle-scanlines',  s.scanlines);
    _setChk('toggle-screenshake',s.screenShake);

    // Графика — пресет
    document.querySelectorAll('input[name="gfx-quality"]').forEach(r => { r.checked = r.value === s.gfxQuality; });
    document.querySelectorAll('.gfx-preset-card').forEach(c => c.classList.toggle('active', c.dataset.val === s.gfxQuality));
    _setChk('toggle-vignette',  s.vignette);
    _setChk('toggle-chromatic', s.chromatic);
    _setChk('toggle-grain',     s.grain);
    _setChk('toggle-shadows',   s.shadows);
    _setSliderAndVal('brightness-slider', 'brightness-value', s.brightness);
    _setSliderAndVal('contrast-slider',   'contrast-value',   s.contrast);

    // Управление
    _loadControlsTab();

    _settingsSwitchTab('audio');
}

function _setVal(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function _setChk(id, val)  { const el = document.getElementById(id); if (el) el.checked = !!val; }
function _setSliderAndVal(sliderId, valId, val) {
    const sl = document.getElementById(sliderId);
    if (sl) { sl.value = val; _updateSliderGradient(sl); }
    _setVal(valId, val + '%');
}

function _settingsSwitchTab(name) {
    document.querySelectorAll('.stab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.stab-panel').forEach(p => p.classList.toggle('active', p.id === 'stab-' + name));
}

function _updateSliderGradient(slider) {
    if (!slider) return;
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
}

function _updateVolIcon(val) {
    const el = document.getElementById('vol-icon');
    if (!el) return;
    el.textContent = val === 0 ? '🔇' : val < 40 ? '🔉' : '🔊';
}

function saveSettings() {
    const s = gameSettings;
    s.volume         = parseInt(document.getElementById('volume-slider')?.value ?? 70);

    s.volAtmosphere  = parseInt(document.getElementById('vol-atmosphere')?.value  ?? 50);
    s.volMenu        = parseInt(document.getElementById('vol-menu')?.value         ?? 55);
    s.volSfx         = parseInt(document.getElementById('vol-sfx')?.value          ?? 100);
    s.volJumpscare   = parseInt(document.getElementById('vol-jumpscare')?.value    ?? 100);
    s.phoneCall      = document.getElementById('toggle-phonecall')?.checked  ?? true;
    s.foxySong       = document.getElementById('toggle-foxy-song')?.checked  ?? true;
    s.kitchenNoise   = document.getElementById('toggle-kitchen-noise')?.checked ?? true;

    const diff = document.querySelector('input[name="difficulty"]:checked');
    if (diff) s.difficulty = diff.value;
    s.scanlines    = document.getElementById('toggle-scanlines')?.checked  ?? true;
    s.screenShake  = document.getElementById('toggle-screenshake')?.checked ?? true;

    const gfx = document.querySelector('input[name="gfx-quality"]:checked');
    if (gfx) s.gfxQuality = gfx.value;
    s.vignette   = document.getElementById('toggle-vignette')?.checked  ?? true;
    s.chromatic  = document.getElementById('toggle-chromatic')?.checked ?? true;
    s.grain      = document.getElementById('toggle-grain')?.checked     ?? true;
    s.shadows    = document.getElementById('toggle-shadows')?.checked   ?? false;
    s.brightness = parseInt(document.getElementById('brightness-slider')?.value ?? 100);
    s.contrast   = parseInt(document.getElementById('contrast-slider')?.value   ?? 110);

    applyScanlines();
    applyGraphicsSettings();
    applyAudioChannels();
    localStorage.setItem('fnaf_settings', JSON.stringify(s));
    document.getElementById('settings-overlay').classList.add('hidden');
}

function _settingsReset() {
    Object.assign(gameSettings, {
        volume:70, volAtmosphere:50, volMenu:55, volSfx:100, volJumpscare:100,
        phoneCall:true, foxySong:true, kitchenNoise:true,
        difficulty:'normal', scanlines:true, screenShake:true,
        gfxQuality:'medium', vignette:true, chromatic:true, grain:true,
        shadows:false, brightness:100, contrast:110
    });
    _settingsLoad();
    applyGraphicsSettings();
    applyAudioChannels();
}

function _initSettingsEvents() {
    // Вкладки
    document.querySelectorAll('.stab').forEach(btn => {
        btn.addEventListener('click', () => _settingsSwitchTab(btn.dataset.tab));
    });

    // Мастер громкость
    const masterSlider = document.getElementById('volume-slider');
    masterSlider?.addEventListener('input', e => {
        const v = parseInt(e.target.value);
        _setVal('volume-value', v + '%');
        _updateSliderGradient(e.target);
        _updateVolIcon(v);
        _setChk('toggle-mute', v === 0);
        gameSettings.volume = v;
        applyAudioChannels();
    });

    // Мут
    document.getElementById('toggle-mute')?.addEventListener('change', e => {
        const v = e.target.checked ? 0 : 70;
        if (masterSlider) { masterSlider.value = v; _updateSliderGradient(masterSlider); }
        _setVal('volume-value', v + '%');
        _updateVolIcon(v);
        gameSettings.volume = v;
        applyAudioChannels();
    });

    // Каналы — live
    [
        ['vol-atmosphere',  'vol-atmosphere-val',  'volAtmosphere'],
        ['vol-menu',        'vol-menu-val',        'volMenu'],
        ['vol-sfx',         'vol-sfx-val',         'volSfx'],
        ['vol-jumpscare',   'vol-jumpscare-val',   'volJumpscare'],
    ].forEach(([id, valId, key]) => {
        document.getElementById(id)?.addEventListener('input', e => {
            _setVal(valId, e.target.value + '%');
            _updateSliderGradient(e.target);
            gameSettings[key] = parseInt(e.target.value);
            applyAudioChannels();
        });
    });

    // Пресеты графики
    document.querySelectorAll('input[name="gfx-quality"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.gfx-preset-card').forEach(c => c.classList.toggle('active', c.dataset.val === radio.value));
            gameSettings.gfxQuality = radio.value;
            applyGraphicsSettings();
            _setChk('toggle-vignette',  gameSettings.vignette);
            _setChk('toggle-chromatic', gameSettings.chromatic);
            _setChk('toggle-grain',     gameSettings.grain);
            _setChk('toggle-shadows',   gameSettings.shadows);
            _setChk('toggle-scanlines', gameSettings.scanlines);
        });
    });

    // Слайдеры изображения — live
    document.getElementById('brightness-slider')?.addEventListener('input', e => {
        _setVal('brightness-value', e.target.value + '%');
        _updateSliderGradient(e.target);
        gameSettings.brightness = parseInt(e.target.value);
        applyGraphicsSettings();
    });
    document.getElementById('contrast-slider')?.addEventListener('input', e => {
        _setVal('contrast-value', e.target.value + '%');
        _updateSliderGradient(e.target);
        gameSettings.contrast = parseInt(e.target.value);
        applyGraphicsSettings();
    });

    // Переключатели графики — live
    ['toggle-vignette','toggle-chromatic','toggle-grain','toggle-shadows'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            gameSettings.vignette  = document.getElementById('toggle-vignette')?.checked;
            gameSettings.chromatic = document.getElementById('toggle-chromatic')?.checked;
            gameSettings.grain     = document.getElementById('toggle-grain')?.checked;
            gameSettings.shadows   = document.getElementById('toggle-shadows')?.checked;
            applyGraphicsSettings();
        });
    });

    // Кнопки
    document.getElementById('settings-close')?.addEventListener('click', saveSettings);
    document.getElementById('settings-close-x')?.addEventListener('click', () => {
        document.getElementById('settings-overlay').classList.add('hidden');
    });
    document.getElementById('settings-reset')?.addEventListener('click', _settingsReset);
    document.getElementById('settings-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'settings-overlay') document.getElementById('settings-overlay').classList.add('hidden');
    });
}

// ===================== ПРИМЕНЕНИЕ СКАНЛИНИЙ =====================
function applyScanlines() {
    const container = document.getElementById('game-container');
    if (!container) return;
    container.classList.toggle('scanlines', !!gameSettings.scanlines);
}

// ===================== ПРИМЕНЕНИЕ ГРАФИКИ =====================
function applyGraphicsSettings() {
    const q = gameSettings.gfxQuality;

    // --- Пресеты переопределяют индивидуальные опции ---
    if (q === 'low') {
        gameSettings.vignette  = false;
        gameSettings.chromatic = false;
        gameSettings.grain     = false;
        gameSettings.shadows   = false;
        gameSettings.scanlines = false;
    } else if (q === 'medium') {
        gameSettings.vignette  = true;
        gameSettings.chromatic = false;
        gameSettings.grain     = true;
        gameSettings.shadows   = false;
        gameSettings.scanlines = true;
    } else if (q === 'high') {
        gameSettings.vignette  = true;
        gameSettings.chromatic = true;
        gameSettings.grain     = true;
        gameSettings.shadows   = true;
        gameSettings.scanlines = true;
    }

    // --- Виньетка ---
    const vignette = document.getElementById('gfx-vignette');
    if (vignette) vignette.classList.toggle('gfx-hidden', !gameSettings.vignette);

    // --- Хроматическая аберрация ---
    const chromatic = document.getElementById('gfx-chromatic');
    if (chromatic) chromatic.classList.toggle('gfx-hidden', !gameSettings.chromatic);

    // --- Зернистость ---
    const grain = document.getElementById('gfx-grain');
    if (grain) grain.classList.toggle('gfx-hidden', !gameSettings.grain);

    // --- Динамические тени ---
    const shadows = document.getElementById('gfx-shadows');
    if (shadows) shadows.classList.toggle('gfx-hidden', !gameSettings.shadows);

    // --- Яркость и контрастность через CSS filter на #main-view ---
    const mainView = document.getElementById('main-view');
    if (mainView) {
        const b = gameSettings.brightness;
        const c = gameSettings.contrast;
        mainView.style.filter = `brightness(${b}%) contrast(${c}%)`;
    }

    // Применяем скан-линии
    applyScanlines();

    // Обновляем UI переключателей если панель открыта
    const togV = document.getElementById('toggle-vignette');
    if (togV) togV.checked = gameSettings.vignette;
    const togC = document.getElementById('toggle-chromatic');
    if (togC) togC.checked = gameSettings.chromatic;
    const togG = document.getElementById('toggle-grain');
    if (togG) togG.checked = gameSettings.grain;
    const togS = document.getElementById('toggle-shadows');
    if (togS) togS.checked = gameSettings.shadows;
    const togSc = document.getElementById('toggle-scanlines');
    if (togSc) togSc.checked = gameSettings.scanlines;
}

// ===================== ПРИМЕНЕНИЕ АУДИО КАНАЛОВ =====================
function applyAudioChannels() {
    const master = (gameSettings.volume || 70) / 100;
    const atm    = (gameSettings.volAtmosphere ?? 50)  / 100;
    const menu   = (gameSettings.volMenu        ?? 55)  / 100;
    const sfx    = (gameSettings.volSfx         ?? 100) / 100;
    const js     = (gameSettings.volJumpscare   ?? 100) / 100;

    const _setVol = (audio, vol) => { if (typeof audio !== 'undefined' && audio) audio.volume = Math.min(1, Math.max(0, vol)); };
    _setVol(atmosphericAudio,   master * atm);
    _setVol(menuAmbienceAudio,  master * menu);
    _setVol(cameraSwitchAudio,  master * sfx * 0.6);
    _setVol(doorPoundAudio,     master * sfx * 1.0);
    _setVol(phoneRingAudio,     master * sfx * 0.2);
    _setVol(victoryAudio,       master * js  * 0.8);
    if (!gameSettings.foxySong && typeof foxyRunAudio !== 'undefined' && foxyRunAudio)
        foxyRunAudio.volume = 0;
    if (!gameSettings.kitchenNoise && typeof kitchenNoiseAudio !== 'undefined' && kitchenNoiseAudio)
        kitchenNoiseAudio.volume = 0;
}

// ===================== СИСТЕМА УПРАВЛЕНИЯ =====================

const DEFAULT_KEYBINDS = {
    camera:         'c',
    leftDoor:       'a',
    rightDoor:      'd',
    leftFlash:      'f',
    rightFlash:     'g',
    cam_stage:      '1',
    'cam_west-hall':'2',
    cam_bathroom:   '3',
    cam_dining:     '4',
    cam_supply:     '5',
    cam_kitchen:    '6',
    cam_parts:      '7',
    'cam_east-hall':'8',
    cam_hall:       '9',
    cam_backstage:  '0'
};

const ACTION_LABELS = {
    camera:         'Камеры',
    leftDoor:       'Левая дверь',
    rightDoor:      'Правая дверь',
    leftFlash:      'Левый фонарь',
    rightFlash:     'Правый фонарь',
    cam_stage:      'CAM 1A · Сцена',
    'cam_west-hall':'CAM 1B · West Hall',
    cam_bathroom:   'CAM 1C · Туалеты',
    cam_dining:     'CAM 2A · Зал',
    cam_supply:     'CAM 2B · Склад',
    cam_kitchen:    'CAM 2C · Кухня',
    cam_parts:      'CAM 3A · П.Бухта',
    'cam_east-hall':'CAM 3B · East Hall',
    cam_hall:       'CAM 4A · Коридор',
    cam_backstage:  'CAM 3C · Закулисье'
};

let _capturingAction = null;
let _captureListener = null;

function _getKey(action) {
    return gameSettings.keybinds[action] || DEFAULT_KEYBINDS[action] || '';
}

function _formatKey(k) {
    if (!k) return '—';
    if (k === ' ') return 'Space';
    if (k === 'arrowup') return '↑';
    if (k === 'arrowdown') return '↓';
    if (k === 'arrowleft') return '←';
    if (k === 'arrowright') return '→';
    return k.toUpperCase();
}

function _loadControlsTab() {
    // Обновляем все kbd-метки из текущих keybinds
    document.querySelectorAll('.ctrl-key[data-key]').forEach(kbd => {
        const action = kbd.dataset.key;
        kbd.textContent = _formatKey(_getKey(action));
        kbd.classList.remove('ctrl-key-conflict');
    });
    _checkConflicts();
}

function _checkConflicts() {
    const used = {};
    Object.entries(gameSettings.keybinds).forEach(([action, key]) => {
        if (!key) return;
        const k = key.toLowerCase();
        if (used[k]) {
            // Конфликт — помечаем оба
            document.querySelectorAll(`.ctrl-key[data-key="${action}"], .ctrl-key[data-key="${used[k]}"]`)
                .forEach(el => el.classList.add('ctrl-key-conflict'));
        } else {
            used[k] = action;
        }
    });
}

function _startRebind(action) {
    if (_capturingAction) _cancelRebind();
    _capturingAction = action;

    const overlay = document.getElementById('ctrl-capture-overlay');
    const nameEl  = document.getElementById('ctrl-capture-action-name');
    overlay.classList.remove('hidden');
    nameEl.textContent = ACTION_LABELS[action] || action;

    _captureListener = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Escape') { _cancelRebind(); return; }

        // Запрещаем служебные клавиши
        const forbidden = ['tab', 'enter', 'shift', 'control', 'alt', 'meta', 'capslock'];
        if (forbidden.includes(e.key.toLowerCase())) return;

        const newKey = e.key.toLowerCase();
        gameSettings.keybinds[action] = newKey;

        // Обновляем метку
        const kbd = document.querySelector(`.ctrl-key[data-key="${action}"]`);
        if (kbd) kbd.textContent = _formatKey(newKey);

        _cancelRebind();
        _checkConflicts();
        localStorage.setItem('fnaf_settings', JSON.stringify(gameSettings));
    };

    document.addEventListener('keydown', _captureListener, { capture: true });
}

function _cancelRebind() {
    _capturingAction = null;
    document.getElementById('ctrl-capture-overlay')?.classList.add('hidden');
    if (_captureListener) {
        document.removeEventListener('keydown', _captureListener, { capture: true });
        _captureListener = null;
    }
}

function _resetControls() {
    gameSettings.keybinds = JSON.parse(JSON.stringify(DEFAULT_KEYBINDS));
    _loadControlsTab();
    localStorage.setItem('fnaf_settings', JSON.stringify(gameSettings));
}

function _initControlsEvents() {
    // Кнопки перебиндинга
    document.querySelectorAll('.ctrl-rebind-btn').forEach(btn => {
        btn.addEventListener('click', () => _startRebind(btn.dataset.action));
    });

    // Сброс
    document.getElementById('ctrl-reset-btn')?.addEventListener('click', _resetControls);

    // Отмена по клику на оверлей
    document.getElementById('ctrl-capture-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'ctrl-capture-overlay') _cancelRebind();
    });
}

function loadSettings() {
    const saved = localStorage.getItem('fnaf_settings');
    if (saved) {
        const parsed = JSON.parse(saved);
        const savedBinds = parsed.keybinds || {};
        delete parsed.keybinds;
        Object.assign(gameSettings, parsed);
        gameSettings.keybinds = Object.assign(
            JSON.parse(JSON.stringify(DEFAULT_KEYBINDS)),
            savedBinds
        );
    }
    applyGraphicsSettings();
    applyAudioChannels();
}

// ===================== ТЕЛЕФОННЫЙ ЗВОНОК =====================

function startPhoneCall(nightNum) {
    if (!gameSettings.phoneCall) return;

    const messages = phoneMessages[nightNum];
    if (!messages) return;

    // Сначала телефон звонит 2-3 раза, потом показываем виджет
    const ringCount = 1;
    let ringsPlayed = 0;

    function doRing() {
        if (!gameActive) return;
        if (typeof phoneRingAudio !== 'undefined' && phoneRingAudio) {
            phoneRingAudio.currentTime = 0;
            phoneRingAudio.play().catch(() => {});
        }
        ringsPlayed++;
        if (ringsPlayed < ringCount) {
            setTimeout(doRing, 1800);
        } else {
            setTimeout(() => beginPhoneConversation(nightNum, messages), 700);
        }
    }

    doRing();
}

function beginPhoneConversation(nightNum, messages) {
    if (!gameActive) return;

    phoneCallActive = true;
    phoneMessageIndex = 0;
    phoneElapsedChars = 0;
    phoneTotalChars = messages.reduce((sum, m) => {
        const clean = m.text.replace(/\[\.\.\.\]/g, '').replace(/\{\.\.\.\}/g, '').replace(/\*/g, '');
        return sum + clean.length;
    }, 0);

    const titleEl = document.getElementById('phone-caller-name');
    if (titleEl) {
        const names = { 1:'МЕНЕДЖЕР — ПЕРВАЯ СМЕНА', 2:'МЕНЕДЖЕР', 3:'МЕНЕДЖЕР', 4:'ТЕЛЕФОННЫЙ ПАРЕНЬ', 5:'ТЕЛЕФОННЫЙ ПАРЕНЬ — НОЧЬ 5', 6:'ТЕЛЕФОННЫЙ ПАРЕНЬ', 7:'НЕИЗВЕСТНЫЙ НОМЕР' };
        titleEl.textContent = names[nightNum] || 'НЕИЗВЕСТНЫЙ НОМЕР';
    }
    const nightBadge = document.getElementById('phone-night-badge');
    if (nightBadge) nightBadge.textContent = `НОЧЬ ${nightNum}`;

    document.getElementById('phone-call-overlay').classList.remove('hidden');
    scheduleNextMessage(messages);
}

function scheduleNextMessage(messages) {
    if (!phoneCallActive) return;

    if (phoneMessageIndex >= messages.length) {
        // Пауза после последнего сообщения перед закрытием
        setTimeout(() => endPhoneCall(), 1800);
        return;
    }

    const msg = messages[phoneMessageIndex];
    const delay = msg.delay || 0;

    phoneTimer = setTimeout(() => {
        if (!phoneCallActive) return;
        typeMessage(msg, messages);
    }, delay);
}

function typeMessage(msg, messages) {
    if (!phoneCallActive) return;

    const rawText = msg.text;
    const speed = msg.speed || 45;

    // Парсим текст на сегменты: обычный | пауза [...] | помеха {...} | выделение *...*
    const segments = parsePhoneText(rawText);

    const textEl = document.getElementById('phone-text');
    // Очищаем текст (новая реплика)
    textEl.innerHTML = '';

    // Добавляем разделитель если это не первое сообщение
    if (phoneMessageIndex > 0) {
        const br = document.createElement('br');
        textEl.appendChild(br);
    }

    // Создаём span для текущей реплики
    const lineSpan = document.createElement('span');
    lineSpan.className = 'phone-line';
    textEl.appendChild(lineSpan);

    playSegments(segments, lineSpan, speed, () => {
        // После завершения реплики — пауза и следующая
        phoneElapsedChars += rawText.replace(/\[\.\.\.]/g, '').replace(/\{\.\.\.}/g, '').replace(/\*/g, '').length;
        updatePhoneProgress();

        phoneMessageIndex++;
        const pause = msg.pause || 800;
        phoneTimer = setTimeout(() => scheduleNextMessage(messages), pause);
    });
}

// Парсит строку на сегменты
function parsePhoneText(text) {
    const segments = [];
    let i = 0;
    let current = '';

    while (i < text.length) {
        if (text.slice(i, i+5) === '[...]') {
            if (current) { segments.push({ type: 'text', content: current }); current = ''; }
            segments.push({ type: 'pause', duration: 850 });
            i += 5;
        } else if (text.slice(i, i+5) === '{...}') {
            if (current) { segments.push({ type: 'text', content: current }); current = ''; }
            segments.push({ type: 'glitch', duration: 400 });
            i += 5;
        } else if (text[i] === '*') {
            // Найти закрывающую *
            const end = text.indexOf('*', i + 1);
            if (end !== -1) {
                if (current) { segments.push({ type: 'text', content: current }); current = ''; }
                segments.push({ type: 'highlight', content: text.slice(i+1, end) });
                i = end + 1;
            } else {
                current += text[i]; i++;
            }
        } else {
            current += text[i]; i++;
        }
    }
    if (current) segments.push({ type: 'text', content: current });
    return segments;
}

// Последовательно воспроизводит сегменты
function playSegments(segments, container, speed, onDone) {
    let segIdx = 0;

    function nextSegment() {
        if (!phoneCallActive) return;
        if (segIdx >= segments.length) { onDone(); return; }

        const seg = segments[segIdx++];

        if (seg.type === 'pause') {
            phoneTimer = setTimeout(nextSegment, seg.duration);

        } else if (seg.type === 'glitch') {
            triggerPhoneGlitch();
            phoneTimer = setTimeout(nextSegment, seg.duration);

        } else if (seg.type === 'highlight') {
            typeChars(seg.content, container, speed * 0.8, true, nextSegment);

        } else { // text
            typeChars(seg.content, container, speed, false, nextSegment);
        }
    }

    nextSegment();
}

// Печатает символы в контейнер
function typeChars(text, container, speed, isHighlight, onDone) {
    let i = 0;
    let span = null;

    if (isHighlight) {
        span = document.createElement('span');
        span.className = 'phone-highlight';
        container.appendChild(span);
    }

    function tick() {
        if (!phoneCallActive) return;
        if (i >= text.length) { onDone(); return; }

        const char = text[i++];
        if (isHighlight) {
            span.textContent += char;
        } else {
            container.appendChild(document.createTextNode(char));
        }

        // Прокручиваем текст вниз
        const textEl = document.getElementById('phone-text');
        if (textEl) textEl.scrollTop = textEl.scrollHeight;

        phoneElapsedChars += 0.3;
        updatePhoneProgress();

        // Пауза на знаках препинания
        let delay = speed;
        if ('.!?'.includes(char)) delay = speed * 5;
        else if (',;:'.includes(char)) delay = speed * 2.5;

        phoneTimer = setTimeout(tick, delay);
    }

    tick();
}

function triggerPhoneGlitch() {
    phoneIsGlitching = true;
    const box = document.getElementById('phone-call-box');
    if (box) {
        box.classList.add('phone-glitching');
        setTimeout(() => {
            box.classList.remove('phone-glitching');
            phoneIsGlitching = false;
        }, 500);
    }
    // Звуковой глитч
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = (gameSettings.volume || 70) / 100 * 0.3;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start();
    } catch(e) {}
}

function updatePhoneProgress() {
    const fill = document.getElementById('phone-progress-fill');
    if (!fill) return;
    const pct = Math.min((phoneElapsedChars / Math.max(phoneTotalChars, 1)) * 100, 100);
    fill.style.width = pct + '%';
}

function endPhoneCall() {
    phoneCallActive = false;
    if (phoneTimer) clearTimeout(phoneTimer);
    phoneTimer = null;

    const overlay = document.getElementById('phone-call-overlay');
    if (overlay) {
        overlay.classList.add('phone-fade-out');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('phone-fade-out');
        }, 600);
    }
}

function skipPhoneCall() {
    endPhoneCall();
}

// ===================== ТРЕВОЖНЫЙ ОВЕРЛЕЙ =====================
function updateDangerOverlay() {
    const overlay = document.getElementById('danger-overlay');
    
    let maxDanger = 0;
    for (const animName in animatronics) {
        const anim = animatronics[animName];
        if (anim.location === 'office') {
            maxDanger = 2;
            break;
        }
        if (anim.progress > 80 || (animName === 'foxy' && (anim.stage === 'running' || anim.stage === 'attacking'))) {
            maxDanger = Math.max(maxDanger, 2);
        } else if (anim.progress > 50) {
            maxDanger = Math.max(maxDanger, 1);
        }
    }
    
    if (dangerLevel !== maxDanger) {
        dangerLevel = maxDanger;
        overlay.classList.remove('hidden', 'danger-low', 'danger-high');
        if (maxDanger === 1) overlay.classList.add('danger-low');
        else if (maxDanger === 2) overlay.classList.add('danger-high');
        else overlay.classList.add('hidden');
    }
}

// ===================== ТОСТ-УВЕДОМЛЕНИЕ =====================
// ===================== СИСТЕМА УВЕДОМЛЕНИЙ =====================
// Типы: 'danger' | 'warning' | 'info' | 'hint' | 'success'
// Подсказки (hint) показываются только если включён чит showHints

const NOTIF_ICONS = {
    danger:  'fas fa-skull',
    warning: 'fas fa-exclamation-triangle',
    info:    'fas fa-eye',
    hint:    'fas fa-lightbulb',
    success: 'fas fa-check',
};
const NOTIF_COLORS = {
    danger:  '#c0001a',
    warning: '#c07000',
    info:    '#005080',
    hint:    '#505000',
    success: '#005020',
};

let _notifId = 0;

function showNotif(message, type = 'warning', duration = 3000) {
    // Подсказки — только при включённом чите
    if (type === 'hint' && !(typeof cheats !== 'undefined' && cheats.showHints)) return;

    const panel = document.getElementById('notif-panel');
    if (!panel) return;

    // Не дублировать одно и то же сообщение если оно уже есть
    const existing = [...panel.querySelectorAll('.notif-text')].find(el => el.textContent === message);
    if (existing) {
        // Просто мигнуть существующим
        const card = existing.closest('.notif-card');
        card?.classList.add('notif-bump');
        setTimeout(() => card?.classList.remove('notif-bump'), 300);
        return;
    }

    // Лимит — не больше 5 уведомлений одновременно
    const cards = panel.querySelectorAll('.notif-card');
    if (cards.length >= 5) cards[0]?.remove();

    const id = ++_notifId;
    const card = document.createElement('div');
    card.className = `notif-card notif-${type}`;
    card.dataset.id = id;
    card.innerHTML = `<i class="${NOTIF_ICONS[type] || NOTIF_ICONS.info}"></i><span class="notif-text">${message}</span>`;

    panel.appendChild(card);

    // Авто-удаление
    setTimeout(() => {
        card.classList.add('notif-out');
        setTimeout(() => card.remove(), 350);
    }, duration);
}

// Совместимость — старый showToast теперь направляет в showNotif
function showToast(message, duration = 3000) {
    // Определяем тип по содержимому
    let type = 'warning';
    if (message.includes('🚨') || message.includes('⚡') || message.includes('ОТКРОЙ')) type = 'danger';
    else if (message.includes('✅') || message.includes('📷')) type = 'success';
    else if (message.includes('🌙') || message.includes('👁') || message.includes('🦊') || message.includes('ЧТО-ТО')) type = 'info';
    else if (message.includes('🚫') || message.includes('отступил') || message.includes('заметил') || message.includes('прошёл')) type = 'hint';

    showNotif(message, type, duration);
}


// ===================== ТРЯСКА ЭКРАНА =====================
function triggerScreenShake() {
    if (!gameSettings.screenShake) return;
    const container = document.getElementById('game-container');
    container.classList.add('screen-shake');
    setTimeout(() => container.classList.remove('screen-shake'), 400);
}

// ── Реалистичные эффекты ──

// Пульс угрозы + виньетка при аниматронике у двери
function updateThreatEffects() {
    const mainView = document.getElementById('main-view');
    const gameContainer = document.getElementById('game-container');
    if (!mainView || !gameContainer) return;

    let hasThreat = false;
    for (const animName in animatronics) {
        const anim = animatronics[animName];
        if (anim.location === 'office' && anim.behaviorState === 'waiting') {
            hasThreat = true; break;
        }
        if (animName === 'foxy' && (anim.stage === 'attacking')) {
            hasThreat = true; break;
        }
    }
    mainView.classList.toggle('threat-pulse', hasThreat);
    gameContainer.classList.toggle('danger-vignette', hasThreat);
}

// Мигание при низкой энергии
function updatePowerEffects() {
    const gc = document.getElementById('game-container');
    if (!gc) return;
    gc.classList.toggle('power-low', powerLevel <= 20 && powerLevel > 0);
}

// Статика на камере когда смотришь на Фокси в peeking
function updateCameraStaticEffect() {
    const cameraView = document.getElementById('camera-view');
    if (!cameraView) return;
    const watchingParts = cameraActive &&
        document.querySelector('.camera-sidebar-btn.active[data-room="parts"]');
    const foxy = animatronics.foxy;
    const foxyPeeking = foxy && foxy.stage === 'peeking' && foxy.peekTimer > 0;
    cameraView.classList.toggle('foxy-static', !!(watchingParts && foxyPeeking));
}

// Дрожание офиса при ударе Фокси
function triggerDoorImpact() {
    const office = document.getElementById('main-office');
    if (!office) return;
    office.classList.add('door-impact');
    setTimeout(() => office.classList.remove('door-impact'), 300);
}

// ── Эффекты камер ──

// Шум при переключении камеры
function triggerCameraSwitchNoise() {
    const cv = document.getElementById('camera-view');
    if (!cv) return;
    cv.classList.remove('switching');
    void cv.offsetWidth; // reflow
    cv.classList.add('switching');
    setTimeout(() => cv.classList.remove('switching'), 280);
}

// Случайный разрыв сигнала (раз в 20-60 сек)
let signalTearTimer = null;
function scheduleSignalTear() {
    if (signalTearTimer) return;
    signalTearTimer = setTimeout(() => {
        signalTearTimer = null;
        if (!cameraActive || !gameActive) { scheduleSignalTear(); return; }
        const cv = document.getElementById('camera-view');
        if (cv) {
            cv.classList.add('signal-tear');
            setTimeout(() => { cv.classList.remove('signal-tear'); scheduleSignalTear(); }, 300);
        } else {
            scheduleSignalTear();
        }
    }, (20 + Math.random() * 40) * 1000);
}

// Потеря сигнала при переключении (редко, 15% шанс)
function maybeSignalLoss() {
    if (Math.random() > 0.15) return;
    const cv = document.getElementById('camera-view');
    if (!cv) return;
    cv.classList.add('signal-loss');
    setTimeout(() => cv.classList.remove('signal-loss'), 650);
}

// Красная рамка если в текущей комнате есть угроза
function updateCamDangerFrame() {
    const cv = document.getElementById('camera-view');
    if (!cv || !cameraActive) { cv?.classList.remove('cam-danger'); return; }
    const activeCam = document.querySelector('.camera-sidebar-btn.active');
    const room = activeCam?.getAttribute('data-room');
    if (!room) { cv.classList.remove('cam-danger'); return; }
    let danger = false;
    for (const animName in animatronics) {
        const anim = animatronics[animName];
        if (anim.location === room &&
            (anim.progress > 70 || anim.behaviorState === 'attacking' ||
             (animName === 'foxy' && (anim.stage === 'running' || anim.stage === 'attacking')))) {
            danger = true; break;
        }
    }
    cv.classList.toggle('cam-danger', danger);
}

// Остановка таймера при конце игры
function stopCameraEffects() {
    if (signalTearTimer) { clearTimeout(signalTearTimer); signalTearTimer = null; }
    const cv = document.getElementById('camera-view');
    if (cv) cv.classList.remove('signal-tear', 'signal-loss', 'switching', 'cam-danger');
}

// ===================== НАБЛЮДЕНИЕ ЗА ФОКСИ =====================
function updateFoxyWatchEffect(currentRoom) {
    const indicator = document.getElementById('foxy-watch-indicator');
    if (!indicator) return;

    const foxy = animatronics.foxy;

    if (currentRoom === 'parts' && (foxy.stage === 'hiding' || foxy.stage === 'peeking')) {
        foxyWatchTimer++;
        // Каждые 3 секунды наблюдения снижают накопленный шанс забега на 15%
        if (foxyWatchTimer % 3 === 0) {
            foxy.runChance = Math.max(0, foxy.runChance - 0.06);
        }
        const pct = Math.round(foxy.runChance * 100);
        const stageText = foxy.stage === 'peeking' ? '⚠️ ФОКСИ ВЫСОВЫВАЕТСЯ!' : `👁 Наблюдение за Фокси (шанс атаки: ${pct}%)`;
        indicator.textContent = stageText;
        indicator.classList.add('visible');
        if (foxy.stage === 'peeking') {
            indicator.style.background = 'rgba(180,0,0,0.9)';
            indicator.style.borderColor = '#ff0000';
        } else {
            indicator.style.background = 'rgba(100,0,0,0.85)';
            indicator.style.borderColor = '#ff6666';
        }
    } else {
        foxyWatchTimer = 0;
        indicator.classList.remove('visible');
    }
}

// ===================== СОХРАНЕНИЕ РЕКОРДОВ =====================
function saveNightRecord(nightNum, survived, timeInGame) {
    const key_beaten = `night_${nightNum}_beaten`;
    const key_best = `night_${nightNum}_best`;
    
    if (survived) {
        gameRecords[key_beaten] = true;
        // Разблокировать следующую ночь
        if (nightNum >= unlockedNights && nightNum < 7) {
            unlockedNights = nightNum + 1;
            localStorage.setItem('fnaf_unlocked', unlockedNights.toString());
        }
    }
    
    // Лучшее время (для поражений — как долго продержался)
    const hours = Math.floor(timeInGame / 60);
    const mins = timeInGame % 60;
    const timeStr = `${hours}ч ${mins}м`;
    
    if (!gameRecords[key_best] || survived) {
        gameRecords[key_best] = timeStr;
    }
    
    localStorage.setItem('fnaf_records', JSON.stringify(gameRecords));
}

function updateMenuRecords() {
    const el = document.getElementById('menu-records');
    if (!el) return;
    
    const beaten = Object.keys(gameRecords).filter(k => k.endsWith('_beaten')).length;
    if (beaten > 0) {
        el.innerHTML = `🏆 Пройдено ночей: ${beaten}/7 &nbsp;|&nbsp; Разблокировано до ночи ${unlockedNights}`;
    }
    
    // Показать кнопку "Продолжить" если разблокированы ночи > 1
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn && unlockedNights > 1) {
        continueBtn.style.display = 'flex';
    }
}


// ===================== СИСТЕМА ЧИТОВ =====================

const cheats = {
    infinitePower:     false,
    slowAnimatronics:  false,
    seeAll:            false,
    maxSpeed:          false,
    autoDoors:         false,
    fastNight:         false,
    ghostMode:         false,
    goldenFreddyAlways:false,
    showHints:         false
};

let cheatsUnlocked = false;

function checkCheatsUnlocked() {
    // Доступны после прохождения 7й ночи
    cheatsUnlocked = !!gameRecords['night_7_beaten'];
    const btn = document.getElementById('cheats-btn');
    if (btn) btn.classList.toggle('hidden', !cheatsUnlocked);
}

function showCheatsScreen() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('cheats-screen').classList.remove('hidden');
    // Синхронизируем состояние чекбоксов
    document.querySelectorAll('.cheat-cb').forEach(cb => {
        const key = cb.id
            .replace('cheat-','')
            .replace('-cb','')
            .replace(/-([a-z])/g, (_,c) => c.toUpperCase());
        if (cheats[key] !== undefined) cb.checked = cheats[key];
        syncCheatCard(cb);
    });
}

function hideCheatsScreen() {
    document.getElementById('cheats-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function syncCheatCard(cb) {
    const card = cb.closest('.cheat-card');
    if (!card) return;
    const key = cb.id
        .replace('cheat-','')
        .replace('-cb','')
        .replace(/-([a-z])/g, (_,c) => c.toUpperCase());
    const isOn = cb.checked;
    card.classList.toggle('active', isOn);
    if (cheats[key] !== undefined) cheats[key] = isOn;

    // Взаимное исключение: slow ↔ maxSpeed
    if (key === 'slowAnimatronics' && isOn) {
        const ms = document.getElementById('cheat-max-speed-cb');
        if (ms) { ms.checked = false; cheats.maxSpeed = false; syncCheatCard(ms); }
    }
    if (key === 'maxSpeed' && isOn) {
        const sl = document.getElementById('cheat-slow-animatronics-cb');
        if (sl) { sl.checked = false; cheats.slowAnimatronics = false; syncCheatCard(sl); }
    }
    // ghostMode отключает maxSpeed
    if (key === 'ghostMode' && isOn) {
        const ms = document.getElementById('cheat-max-speed-cb');
        if (ms) { ms.checked = false; cheats.maxSpeed = false; syncCheatCard(ms); }
    }
}

function applyCheatsToGame() {
    // Показываем/скрываем бейдж в игре
    const badge = document.getElementById('cheat-mode-badge');
    const anyActive = Object.values(cheats).some(v => v);
    if (badge) badge.classList.toggle('hidden', !anyActive);
}

// Применяется один раз при старте игры — меняет AI-уровни
function applyCheatAI() {
    if (cheats.slowAnimatronics) {
        for (const k in animatronics) animatronics[k].ai = 1;
    }
    if (cheats.maxSpeed) {
        for (const k in animatronics) animatronics[k].ai = 20;
    }
}

// Вызывается каждый тик — применяет активные эффекты
function tickCheats() {
    // Бесконечная энергия
    if (cheats.infinitePower) {
        powerLevel = Math.max(powerLevel, 20);
    }

    // Авто-двери
    if (cheats.autoDoors) {
        const leftThreat = animatronics.bonnie.location === 'office' ||
                           animatronics.foxy.stage === 'running' ||
                           animatronics.foxy.stage === 'attacking';
        const rightThreat = animatronics.freddy.location === 'office' ||
                            animatronics.chica.location === 'office';
        if (leftThreat && !leftDoorClosed)  { leftDoorClosed  = true; updateButtonStatus(); }
        if (rightThreat && !rightDoorClosed) { rightDoorClosed = true; updateButtonStatus(); }
        // Открываем когда угроза прошла
        if (!leftThreat  && leftDoorClosed)  { leftDoorClosed  = false; updateButtonStatus(); }
        if (!rightThreat && rightDoorClosed) { rightDoorClosed = false; updateButtonStatus(); }
    }

    // Быстрая ночь — gameTime уже увеличивается 1/сек, просто добавим ещё 2
    if (cheats.fastNight) {
        gameTime = Math.min(gameTime + 2, 360);
    }

    // Золотой Фредди каждые 30 сек
    if (cheats.goldenFreddyAlways && gameTime % 30 === 0 && gameTime > 0) {
        if (!goldenFreddyVisible) triggerGoldenFreddy();
    }

    // Всевидящее oko — updateMapDots() сам показывает точки если seeAll включён
    if (cheats.seeAll) {
        updateMapDots();
    }
    // Показываем/скрываем панель аниматроников в HUD
    const hudAnim = document.getElementById('hud-animatronics');
    if (hudAnim) hudAnim.classList.toggle('visible', !!cheats.seeAll);
}

// Режим призрака — патч функции атаки
const _originalLaunchAttack = window.launchAttack;

// ── Инициализация событий экрана читов ──
document.addEventListener('DOMContentLoaded', () => {
    // Кнопка читов в меню
    document.getElementById('cheats-btn')?.addEventListener('click', showCheatsScreen);
    document.getElementById('cheats-back-btn')?.addEventListener('click', hideCheatsScreen);

    // Выбор ночи в экране читов
    document.getElementById('cheats-night-btns')?.addEventListener('click', e => {
        const btn = e.target.closest('.cheat-night-btn');
        if (!btn) return;
        document.querySelectorAll('.cheat-night-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCheatNight = btn.dataset.night;
    });

    // Кнопка играть с читами
    document.getElementById('cheats-play-btn')?.addEventListener('click', () => {
        if (selectedCheatNight === 'custom') {
            showCustomNightScreen();
        } else {
            hideCheatsScreen();
            night = parseInt(selectedCheatNight) || 1;
            startNewGame();
        }
    });

    // Чекбоксы читов
    document.querySelectorAll('.cheat-cb').forEach(cb => {
        cb.addEventListener('change', () => syncCheatCard(cb));
    });

    // ── Custom Night ──
    document.getElementById('cn-back-btn')?.addEventListener('click', () => {
        document.getElementById('custom-night-screen').classList.add('hidden');
        showCheatsScreen();
    });

    document.getElementById('cn-play-btn')?.addEventListener('click', () => {
        launchCustomNight();
    });

    // Ползунки
    ['freddy','bonnie','chica','foxy'].forEach(name => {
        const slider = document.getElementById('cn-' + name);
        const valEl  = document.getElementById('cn-' + name + '-val');
        if (!slider || !valEl) return;
        slider.addEventListener('input', () => {
            valEl.textContent = slider.value;
            customNightAI[name] = parseInt(slider.value);
            updateSliderGradient(slider);
        });
        updateSliderGradient(slider);
    });

    // Пресеты для каждого аниматроника
    document.querySelectorAll('.cn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const anim = btn.dataset.anim;
            const val  = parseInt(btn.dataset.val);
            setCustomAI(anim, val);
        });
    });

    // Глобальные пресеты
    document.getElementById('cn-preset-all0')?.addEventListener('click', () => {
        ['freddy','bonnie','chica','foxy'].forEach(a => setCustomAI(a, 0));
    });
    document.getElementById('cn-preset-allmax')?.addEventListener('click', () => {
        ['freddy','bonnie','chica','foxy'].forEach(a => setCustomAI(a, 20));
    });
    document.getElementById('cn-preset-night7')?.addEventListener('click', () => {
        setCustomAI('freddy', 12); setCustomAI('bonnie', 12);
        setCustomAI('chica', 12);  setCustomAI('foxy', 10);
    });
    document.getElementById('cn-preset-random')?.addEventListener('click', () => {
        ['freddy','bonnie','chica','foxy'].forEach(a =>
            setCustomAI(a, Math.floor(Math.random() * 21))
        );
    });

    // Проверяем разблокировку при загрузке
    checkCheatsUnlocked();
});

// ── Выбранная ночь в экране читов ──
let selectedCheatNight = '1';

// ── Custom Night AI ──
const customNightAI = { freddy: 0, bonnie: 0, chica: 0, foxy: 0 };
let isCustomNight = false;

// Сбрасывает все читы — вызывается при выходе в меню
function resetCheats() {
    for (const key in cheats) {
        cheats[key] = false;
    }
    // Сбрасываем чекбоксы в UI
    document.querySelectorAll('.cheat-cb').forEach(cb => {
        cb.checked = false;
        syncCheatCard(cb);
    });
    // Скрываем бейдж читов в игре
    const badge = document.getElementById('cheat-mode-badge');
    if (badge) badge.classList.add('hidden');
    // Сбрасываем выбранную ночь на 1
    selectedCheatNight = '1';
    document.querySelectorAll('.cheat-night-btn').forEach(b => b.classList.remove('active'));
    const firstBtn = document.querySelector('.cheat-night-btn[data-night="1"]');
    if (firstBtn) firstBtn.classList.add('active');
    // Сбрасываем кастомную ночь
    isCustomNight = false;
}

function showCustomNightScreen() {
    document.getElementById('cheats-screen').classList.add('hidden');
    document.getElementById('custom-night-screen').classList.remove('hidden');
}

function setCustomAI(anim, val) {
    customNightAI[anim] = val;
    const slider = document.getElementById('cn-' + anim);
    const valEl  = document.getElementById('cn-' + anim + '-val');
    if (slider) { slider.value = val; updateSliderGradient(slider); }
    if (valEl)  valEl.textContent = val;
}

function updateSliderGradient(slider) {
    const pct = (slider.value / 20) * 100;
    slider.style.background = `linear-gradient(to right, #ccaa00 0%, #ccaa00 ${pct}%, #1e1800 ${pct}%, #1e1800 100%)`;
}

function launchCustomNight() {
    isCustomNight = true;
    document.getElementById('custom-night-screen').classList.add('hidden');
    night = 8; // спец-номер для кастомной ночи
    startNewGame();
}

// Применяется при initGame если isCustomNight
function applyCustomNightAI() {
    if (!isCustomNight) return;
    for (const k in customNightAI) {
        if (animatronics[k]) animatronics[k].ai = customNightAI[k];
    }
}

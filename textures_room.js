class RoomTextureSystem {
    constructor() {
        this.textures = {
            rooms: {},
            animatronics: {},
            sprites: {},
            ui: {},
            effects: {}
        };
        
        this.loadingProgress = 0;
        this.isLoaded = false;
        this.texturePath = 'textures/rooms/';
        this.animatronicPath = 'textures/animatronics/';
        this.useSprites = true;
        
        this.roomColors = {
            'office':    '#1a1a1a',
            'hall':      '#2a1a1a',
            'kitchen':   '#2a2a1a',
            'stage':     '#1a1a2a',
            'parts':     '#1a2a2a',
            'bathroom':  '#2a1a2a',
            'dining':    '#2a1a0a',
            'supply':    '#1a1a0a',
            'west-hall': '#1a1a1a',
            'east-hall': '#1a1a1a',
            'backstage': '#0a0a0a'
        };
        
        this.init();
    }
    
    init() {
        this.createEffectTextures();
        this.preloadTextures();
    }
    
    createEffectTextures() {
        this.textures.effects = {
            'static': this.generateStaticEffect(),
            'scanLines': this.generateScanLinesEffect(),
            'noise': this.generateNoiseEffect(),
            'vignette': this.generateVignetteEffect()
        };
    }
    
    generateStaticEffect() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(128, 128);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30;
            data[i] = noise; data[i+1] = noise; data[i+2] = noise; data[i+3] = 20;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }
    
    generateScanLinesEffect() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 256; i += 4) ctx.fillRect(0, i, 256, 1);
        return canvas.toDataURL();
    }
    
    generateNoiseEffect() {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(64, 64);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 10;
            data[i] = noise; data[i+1] = noise; data[i+2] = noise; data[i+3] = 10;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL();
    }
    
    generateVignetteEffect() {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(128, 128, 50, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        return canvas.toDataURL();
    }
    
    preloadTextures() {
        const texturesToLoad = [
            { type: 'rooms', name: 'office',     file: 'office.png' },
            { type: 'rooms', name: 'hall',       file: 'hall.png' },
            { type: 'rooms', name: 'kitchen',    file: 'kitchen.png' },
            { type: 'rooms', name: 'stage',      file: 'stage.png' },
            { type: 'rooms', name: 'parts',      file: 'pirate_bay.jpg' },
            { type: 'rooms', name: 'bathroom',   file: 'bathroom.png' },
            { type: 'rooms', name: 'dining',     file: 'dining.jpg' },
            { type: 'rooms', name: 'supply',     file: 'supply.jpg' },
            { type: 'rooms', name: 'west-hall',  file: 'west_hall_b.jpg' },
            { type: 'rooms', name: 'east-hall',  file: 'east_hall_a.jpg' },
            { type: 'rooms', name: 'backstage',  file: 'parts.png' },
            { type: 'animatronics', name: 'freddy',        file: 'freddy_idle.png' },
            { type: 'animatronics', name: 'bonnie',        file: 'bonnie_idle.png' },
            { type: 'animatronics', name: 'chica',         file: 'chica_idle.png' },
            { type: 'animatronics', name: 'foxy',          file: 'foxy_idle.png' },
            { type: 'animatronics', name: 'golden-freddy', file: 'golden_freddy.png' }
        ];
        
        let loadedCount = 0;
        const totalTextures = texturesToLoad.length;
        
        const loadTexture = (texture) => {
            return new Promise((resolve) => {
                const img = new Image();
                const basePath = texture.type === 'animatronics' ? this.animatronicPath : this.texturePath;
                
                img.onload = () => {
                    this.textures[texture.type][texture.name] = {
                        image: img,
                        dataUrl: img.src,
                        width: img.width,
                        height: img.height,
                        loaded: true,
                        isSprite: false,
                        source: 'file'
                    };
                    loadedCount++;
                    this.loadingProgress = (loadedCount / totalTextures) * 100;
                    resolve(true);
                };
                
                img.onerror = () => {
                    loadedCount++;
                    this.loadingProgress = (loadedCount / totalTextures) * 100;
                    resolve(false);
                };
                
                img.src = basePath + texture.file;
                
                setTimeout(() => {
                    if (!img.complete) img.onerror(new Event('timeout'));
                }, 5000);
            });
        };
        
        const loadAll = async () => {
            for (const t of texturesToLoad) await loadTexture(t);
            this.isLoaded = true;
            this.fillMissingAnimatronics();
            if (typeof window.onRoomTexturesLoaded === 'function') {
                window.onRoomTexturesLoaded();
            }
        };
        
        loadAll();
    }
    
    fillMissingAnimatronics() {
        const list = ['freddy', 'bonnie', 'chica', 'foxy', 'golden-freddy'];
        list.forEach(animName => {
            if (!this.textures.animatronics[animName]) {
                this.textures.animatronics[animName] = {
                    dataUrl: this.generateAnimatronicSprite(animName),
                    isSprite: true, loaded: true, width: 80, height: 100
                };
            }
        });
    }
    
    generateAnimatronicSprite(animName) {
        const colors = {
            'freddy': '#8B0000', 'bonnie': '#00008B', 'chica': '#666600',
            'foxy': '#660000', 'golden-freddy': '#ffcc00'
        };
        const canvas = document.createElement('canvas');
        canvas.width = 80; canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = colors[animName] || '#333333';
        ctx.fillRect(0, 0, 80, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(animName.toUpperCase().replace('-', ' '), 40, 50);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, 70, 90);
        return canvas.toDataURL();
    }
    
    // ─── Метод для camera-* элементов ────────────────────────────────────────
    // Только гарантирует правильный background-image. НЕ меняет position.
    ensureCameraTexture(element, roomName) {
        if (!element) return;
        const existingBg = element.style.backgroundImage || '';
        // Если уже прописан путь к текстуре — ничего не делаем
        if (existingBg && existingBg.includes('textures/')) return;
        // Иначе ставим прямой путь
        element.style.backgroundImage = `url('textures/rooms/${roomName}.png')`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
    }
    
    // ─── Метод для room-* и прочих не-камерных элементов ────────────────────
    applyRoomTexture(element, roomName, options = {}) {
        if (!element || !element.style) return;
        
        const existingBg = element.style.backgroundImage || '';
        if (existingBg && existingBg.includes('textures/')) {
            element.classList.add('room-texture');
            element.classList.remove('room-sprite');
            return;
        }
        
        // Файл загружен — используем его
        const fileTexture = this.textures.rooms[roomName];
        if (fileTexture && fileTexture.loaded && !fileTexture.isSprite) {
            element.style.backgroundImage = `url("${fileTexture.dataUrl}")`;
        } else {
            // Прямой путь — браузер сам загрузит
            element.style.backgroundImage = `url('textures/rooms/${roomName}.png')`;
        }
        element.style.backgroundSize = options.size || 'cover';
        element.style.backgroundPosition = options.position || 'center';
        element.style.backgroundRepeat = 'no-repeat';
        element.classList.add('room-texture');
        element.classList.remove('room-sprite');
    }
    
    applyAnimatronicTexture(element, animName) {
        if (!element || !element.style) return;
        const imagePaths = {
            'freddy':        'textures/animatronics/freddy_idle.png',
            'bonnie':        'textures/animatronics/bonnie_idle.png',
            'chica':         'textures/animatronics/chica_idle.png',
            'foxy':          'textures/animatronics/foxy_idle.png',
            'golden-freddy': 'textures/animatronics/golden_freddy.png'
        };
        const src = imagePaths[animName] || imagePaths['freddy'];
        element.style.backgroundImage = `url("${src}")`;
        element.style.backgroundSize = 'contain';
        element.style.backgroundPosition = 'center bottom';
        element.style.backgroundRepeat = 'no-repeat';
    }
    
    // applyRoomEffects — только для room-* элементов, не для camera-*
    applyRoomEffects(element) {
        if (!element || !element.style) return;
        // Не трогаем position — оставляем как в CSS
        let effectsElement = element.querySelector('.room-effects');
        if (!effectsElement) {
            effectsElement = document.createElement('div');
            effectsElement.className = 'room-effects';
            effectsElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
            element.appendChild(effectsElement);
        }
        effectsElement.style.backgroundImage = `
            url("${this.textures.effects.static}"),
            url("${this.textures.effects.scanLines}"),
            url("${this.textures.effects.vignette}")
        `;
        effectsElement.style.backgroundSize = 'auto, auto, cover';
        effectsElement.style.backgroundBlendMode = 'overlay';
        effectsElement.style.opacity = '0.1';
        effectsElement.style.animation = 'roomStatic 0.1s infinite';
    }

    getRoomTexture(roomName) {
        if (this.textures.rooms[roomName] && this.textures.rooms[roomName].loaded) {
            return this.textures.rooms[roomName];
        }
        if (this.textures.sprites[roomName]) {
            return this.textures.sprites[roomName];
        }
        return { dataUrl: null, isSprite: false, loaded: false };
    }
    
    getAnimatronicTexture(animName) {
        if (this.textures.animatronics && this.textures.animatronics[animName]) {
            return this.textures.animatronics[animName];
        }
        return { dataUrl: this.generateAnimatronicSprite(animName), isSprite: true, loaded: true };
    }
    
    getRoomBackground(roomName) {
        const texture = this.getRoomTexture(roomName);
        if (texture && texture.dataUrl) return `url("${texture.dataUrl}")`;
        return `url('textures/rooms/${roomName}.png')`;
    }
    
    isFileTextureLoaded(roomName) {
        return this.textures.rooms[roomName] &&
               this.textures.rooms[roomName].loaded &&
               !this.textures.rooms[roomName].isSprite;
    }
    
    isSpriteUsed(roomName) {
        const texture = this.getRoomTexture(roomName);
        return texture && texture.isSprite;
    }
    
    getTextureInfo() {
        const info = { total: 0, fileTextures: 0, sprites: 0, rooms: {}, animatronics: {} };
        const rooms = ['office', 'hall', 'kitchen', 'stage', 'parts', 'bathroom',
                   'dining', 'supply', 'west-hall', 'east-hall', 'backstage'];
        const animList = ['freddy', 'bonnie', 'chica', 'foxy', 'golden-freddy'];
        rooms.forEach(room => {
            info.total++;
            if (this.isFileTextureLoaded(room)) { info.fileTextures++; info.rooms[room] = 'Файл'; }
            else { info.sprites++; info.rooms[room] = 'Путь'; }
        });
        animList.forEach(anim => {
            info.total++;
            if (this.textures.animatronics[anim] && !this.textures.animatronics[anim].isSprite) {
                info.fileTextures++; info.animatronics[anim] = 'Файл';
            } else {
                info.sprites++; info.animatronics[anim] = 'Спрайт';
            }
        });
        return info;
    }
    
    printLoadingReport() {
        const info = this.getTextureInfo();
        console.log('📊 Отчет о текстурах:', info);
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
        return `#${Math.max(0,Math.floor(r*(1-amount))).toString(16).padStart(2,'0')}${Math.max(0,Math.floor(g*(1-amount))).toString(16).padStart(2,'0')}${Math.max(0,Math.floor(b*(1-amount))).toString(16).padStart(2,'0')}`;
    }
    
    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
        return `#${Math.min(255,Math.floor(r+(255-r)*amount)).toString(16).padStart(2,'0')}${Math.min(255,Math.floor(g+(255-g)*amount)).toString(16).padStart(2,'0')}${Math.min(255,Math.floor(b+(255-b)*amount)).toString(16).padStart(2,'0')}`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.roomTextureSystem = new RoomTextureSystem();

    window.onRoomTexturesLoaded = function() {
        console.log('✅ Система текстур готова!');
        applyTexturesToAllElements();
    };

    const waitForTextures = setInterval(() => {
        if (window.roomTextureSystem && window.roomTextureSystem.isLoaded) {
            clearInterval(waitForTextures);
            window.onRoomTexturesLoaded();
        }
    }, 500);

    setTimeout(() => {
        clearInterval(waitForTextures);
        applyTexturesToAllElements();
    }, 4000);
});

function applyTexturesToAllElements() {
    if (!window.roomTextureSystem) return;
    
    const rooms = ['office', 'hall', 'kitchen', 'stage', 'parts', 'bathroom',
                   'dining', 'supply', 'west-hall', 'east-hall', 'backstage'];
    const animatronics = ['freddy', 'bonnie', 'chica', 'foxy', 'golden-freddy'];
    
    rooms.forEach(room => {
        // room-* : обычный элемент комнаты (может быть спрайт-заглушка — не критично)
        const roomElement = document.getElementById(`room-${room}`);
        if (roomElement) {
            window.roomTextureSystem.applyRoomTexture(roomElement, room, {
                size: 'cover', position: 'center', addEffects: false
            });
        }
        
        // camera-* : ТОЛЬКО гарантируем background-image, НЕ меняем position/display
        const cameraElement = document.getElementById(`camera-${room}`);
        if (cameraElement) {
            window.roomTextureSystem.ensureCameraTexture(cameraElement, room);
        }
    });
    
    animatronics.forEach(anim => {
        const enemyElement = document.getElementById(`enemy-${anim}`);
        if (enemyElement) {
            window.roomTextureSystem.applyAnimatronicTexture(enemyElement, anim);
        }
    });
}

window.applyRoomTextures = applyTexturesToAllElements;
window.getRoomTextureInfo = () => {
    if (window.roomTextureSystem) return window.roomTextureSystem.getTextureInfo();
    return { error: 'Система текстур не загружена' };
};

const style = document.createElement('style');
style.textContent = `
    @keyframes roomStatic {
        0%   { opacity: 0.05; }
        50%  { opacity: 0.15; }
        100% { opacity: 0.05; }
    }
    .room-texture { image-rendering: auto; }
    .room-sprite  { image-rendering: pixelated; }
    .room-effects { mix-blend-mode: overlay; }
`;
document.head.appendChild(style);

/* ==========================================================================
   ANTIGRAVITY TYPING - GAME ENGINE & CANVAS CONTROLLER (app.js)
   ========================================================================== */

// 1. SOUND SYSTEM SYNTHESIZER (Web Audio API - Completely Self-Contained)
class SoundSynth {
    constructor() {
        this.ctx = null; // Instantiated lazily on user gesture to bypass browser block policies
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playPew() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playExplosion() {
        this.init();
        if (!this.ctx) return;

        // Custom synth explosion using low frequency saw waves and bandpass sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.35);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(250, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    playDamage() {
        this.init();
        if (!this.ctx) return;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.45);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(185, this.ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(62, this.ctx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.45);
        osc2.stop(this.ctx.currentTime + 0.45);
    }

    playWarp() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.4);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }
}

const sfx = new SoundSynth();

// 2. PARALLAX BACKGROUND STARFIELD
class Star {
    constructor(width, height) {
        this.reset(width, height, true);
    }

    reset(width, height, randomizeY = false) {
        this.x = Math.random() * width;
        this.y = randomizeY ? Math.random() * height : -10;
        this.size = Math.random() * 1.8 + 0.5; // Star diameter
        this.speed = Math.random() * 0.8 + 0.2; // Star velocity
        this.alpha = Math.random() * 0.7 + 0.3; // Glow transparency
        
        // Dynamic pastel color values for stars
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(0, 240, 255, ',
            'rgba(138, 43, 226, ',
            'rgba(255, 0, 127, '
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
    }

    update(dt, width, height, isGravityOverride) {
        // Under normal gravity: Stars scroll downwards to simulate upwards flight
        // If gravity overridden: Stars scroll sideways/upwards
        if (isGravityOverride) {
            this.y += this.speed * 4 * dt * 60;
            this.x += Math.sin(this.y / 20) * 0.5 * dt * 60;
        } else {
            this.y += this.speed * dt * 60;
        }

        if (this.y > height) {
            this.reset(width, height, false);
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.colorPrefix + this.alpha + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 3. GLOWING BURST PARTICLES (Explosion Sparks)
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        
        // Polar coordinates spawn
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 1.5; // Upward drift bias
        
        this.size = Math.random() * 3 + 2;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
    }

    update(dt) {
        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        
        // Faint zero-gravity lift acceleration
        this.vy -= 0.02 * dt * 60;
        this.alpha -= this.decay * dt * 60;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 4. FLOAT-WORD CLASS WITH ZERO-G SINUSOIDAL SWAY PHYSICS
class FloatingWord {
    constructor(text, x, y, speed, scaleDifficulty) {
        this.text = text;
        this.baseX = x;
        this.x = x;
        this.y = y;
        
        // Scale speed with current game progress
        this.speed = (speed * (1 + scaleDifficulty * 0.5));
        
        // Sway vectors
        this.swayAmplitude = Math.random() * 15 + 15; // Pixels left/right
        this.swayFrequency = Math.random() * 0.0015 + 0.001; // Radians per frame
        this.swayPhase = Math.random() * Math.PI * 2; // Unique offset
        
        this.fontSize = Math.floor(Math.random() * 5) + 21; // 21px - 25px
        this.rotation = 0;
        this.rotSpeed = (Math.random() - 0.5) * 0.01;
        
        this.width = 0;
        this.height = this.fontSize;
        this.trailTimer = 0;
    }

    update(dt, time, isGravityOverride, canvasWidth) {
        this.trailTimer += dt;

        if (isGravityOverride) {
            // "Antigravity override" mode: standard gravity imported! 
            // Words tumble downwards and spin rapidly
            this.y += this.speed * 2.5 * dt * 60;
            this.rotation += this.rotSpeed * 10 * dt * 60;
            this.x = this.baseX + Math.sin(time * this.swayFrequency + this.swayPhase) * this.swayAmplitude * 2;
        } else {
            // Defy gravity: Float upwards
            this.y -= this.speed * dt * 60;
            this.rotation += this.rotSpeed * dt * 60;
            
            // Sinusoidal sway
            const sway = Math.sin(time * this.swayFrequency + this.swayPhase) * this.swayAmplitude;
            this.x = this.baseX + sway;
            
            // Constrain word within screen width borders
            const borderPadding = 60;
            if (this.x < borderPadding) this.x = borderPadding;
            if (this.x + this.width > canvasWidth - borderPadding) this.x = canvasWidth - borderPadding - this.width;
        }
    }

    draw(ctx, inputBuffer) {
        ctx.save();
        ctx.font = `bold ${this.fontSize}px 'Orbitron', sans-serif`;
        
        // Dynamically calculate width on first draw or if font changes
        if (!this.width) {
            this.width = ctx.measureText(this.text).width;
        }

        // Apply translations for rotation
        ctx.translate(this.x + this.width / 2, this.y - this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-(this.x + this.width / 2), -(this.y - this.height / 2));

        // Prefix character highlighting logic
        const startsWithPrefix = inputBuffer && this.text.startsWith(inputBuffer);
        
        // Draw backing drop-shadow glow
        ctx.shadowColor = startsWithPrefix ? 'rgba(0, 240, 255, 0.45)' : 'rgba(138, 43, 226, 0.25)';
        ctx.shadowBlur = startsWithPrefix ? 12 : 6;
        
        if (startsWithPrefix) {
            // Draw matching characters in Cyan
            const matchedText = this.text.substring(0, inputBuffer.length);
            const remainingText = this.text.substring(inputBuffer.length);
            
            ctx.fillStyle = '#00f0ff';
            ctx.fillText(matchedText, this.x, this.y);
            
            // Measure offset for remaining text
            const offset = ctx.measureText(matchedText).width;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
            ctx.shadowBlur = 5;
            ctx.fillText(remainingText, this.x + offset, this.y);
        } else {
            // Draw regular inactive words in crisp White
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.text, this.x, this.y);
        }

        ctx.restore();
    }

    getTrailPosition() {
        // Emit trail particles from bottom center of word
        return {
            x: this.x + this.width / 2,
            y: this.y + 4
        };
    }
}

// 5. CORE GAME CONTROLLER
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // State variables
        this.state = 'MENU';
        this.score = 0;
        this.timeRemaining = 60;
        this.shield = 100;
        
        // Typing trackers
        this.inputBuffer = '';
        this.correctKeystrokes = 0;
        this.totalKeystrokes = 0;
        this.wordsDetonated = 0;
        
        // Collections
        this.activeWords = [];
        this.stars = [];
        this.particles = [];
        this.escapedTexts = []; // Visual "-10%" floating text indicators
        
        // Timers & configs
        this.lastTime = 0;
        this.spawnTimer = 0;
        this.spawnDelay = 2200; // Time (ms) between word spawns
        this.timerIntervalId = null;
        this.screenShakeTime = 0;
        
        this.isGravityOverride = false;
        this.gravityOverrideTimer = 0;

        // Word Bank
        this.wordBank = [
            "antigravity", "singularity", "spacetime", "nebula", "quantum", "gravity", "orbit", "velocity", 
            "trajectory", "supernova", "payload", "weightless", "levitation", "thrust", "astronomy", "cosmos", 
            "galaxy", "stellar", "wormhole", "atmosphere", "constellation", "blackhole", "frictionless", "momentum", 
            "pythagoras", "einstein", "newton", "hawking", "telescope", "eclipse", "universe", "galileo", 
            "propulsion", "parsec", "teleportation", "dimension", "warp", "meteorite", "satellite", "darkmatter",
            "atmosphere", "astronaut", "asteroid", "aurora", "corona", "crater", "dust", "exoplanet", "flare",
            "fusion", "horizon", "interstellar", "magnet", "nuclear", "observatory", "photon", "pulsar",
            "radiation", "rocket", "solstice", "spectral", "spectrum", "vacuum", "vector", "zenith"
        ];

        // UI DOM bindings
        this.dom = {
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            gameover: document.getElementById('gameover-screen'),
            btnStart: document.getElementById('btn-start'),
            btnRestart: document.getElementById('btn-restart'),
            btnHome: document.getElementById('btn-home'),
            btnEasterMenu: document.getElementById('btn-easter-menu'),
            btnGravityLever: document.getElementById('btn-gravity-lever'),
            inputBuffer: document.getElementById('input-buffer'),
            valTimer: document.getElementById('val-timer'),
            valWpm: document.getElementById('val-wpm'),
            valAccuracy: document.getElementById('val-accuracy'),
            valIntegrity: document.getElementById('val-integrity'),
            integrityBar: document.getElementById('integrity-bar'),
            finalWpm: document.getElementById('final-wpm'),
            finalAccuracy: document.getElementById('final-accuracy'),
            finalWords: document.getElementById('final-words'),
            finalIntegrity: document.getElementById('final-integrity'),
            typingConsole: document.querySelector('.typing-console'),
            gameoverTitle: document.getElementById('gameover-title'),
            gameoverSub: document.getElementById('gameover-sub')
        };

        this.init();
    }

    init() {
        // Match canvas bounds
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Spawn Stars
        const numStars = 120;
        for (let i = 0; i < numStars; i++) {
            this.stars.push(new Star(this.canvas.width, this.canvas.height));
        }

        // Setup Events
        this.bindEvents();

        // Launch canvas render loop
        requestAnimationFrame((t) => this.loop(t));
    }

    resizeCanvas() {
        const container = document.getElementById('app-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    bindEvents() {
        // Launch Mission button
        this.dom.btnStart.addEventListener('click', () => {
            sfx.playWarp();
            this.startGame();
        });

        // Restart button
        this.dom.btnRestart.addEventListener('click', () => {
            sfx.playWarp();
            this.startGame();
        });

        // Back to Menu button
        this.dom.btnHome.addEventListener('click', () => {
            sfx.playClick();
            this.transitionState('MENU');
        });

        // Easter Egg Button on menu
        this.dom.btnEasterMenu.addEventListener('click', () => {
            this.triggerEasterEgg();
        });

        // Easter Egg Lever widget button
        this.dom.btnGravityLever.addEventListener('click', () => {
            this.triggerEasterEgg();
        });

        // Core global keyboard capturing
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    transitionState(newState) {
        this.state = newState;
        
        // Remove active class from all screens
        this.dom.menu.classList.remove('active');
        this.dom.game.classList.remove('active');
        this.dom.gameover.classList.remove('active');

        // Reset inputs
        this.inputBuffer = '';
        this.updateConsoleUI();

        if (newState === 'MENU') {
            this.dom.menu.classList.add('active');
        } else if (newState === 'PLAYING') {
            this.dom.game.classList.add('active');
        } else if (newState === 'GAMEOVER') {
            this.dom.gameover.classList.add('active');
        }
    }

    startGame() {
        // Reset metrics
        this.score = 0;
        this.timeRemaining = 60;
        this.shield = 100;
        this.inputBuffer = '';
        this.correctKeystrokes = 0;
        this.totalKeystrokes = 0;
        this.wordsDetonated = 0;
        this.activeWords = [];
        this.particles = [];
        this.escapedTexts = [];
        this.spawnTimer = 0;
        this.isGravityOverride = false;
        this.dom.btnGravityLever.classList.remove('lever-active');
        this.dom.btnGravityLever.querySelector('.lever-text').innerText = "GRAVITY OFF";

        // Draw initial DOM states
        this.updateStatsUI();
        this.transitionState('PLAYING');

        // Standard countdown timer ticker
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        this.timerIntervalId = setInterval(() => {
            if (this.state !== 'PLAYING') return;

            this.timeRemaining--;
            this.updateStatsUI();

            if (this.timeRemaining <= 0) {
                this.endGame(true); // Mission Completed
            }
        }, 1000);
    }

    endGame(success = false) {
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        sfx.playDamage();

        // Calculate final accuracy safely
        const finalAccVal = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
        
        // Populate stats inside scoreboard screen
        this.dom.finalWpm.innerText = this.dom.valWpm.innerText;
        this.dom.finalAccuracy.innerText = finalAccVal + '%';
        this.dom.finalWords.innerText = this.wordsDetonated;
        this.dom.finalIntegrity.innerText = this.shield + '%';

        // Adjust strings based on survival result
        if (success) {
            this.dom.gameoverTitle.innerText = "MISSION ACCOMPLISHED";
            this.dom.gameoverTitle.className = "highlight"; // Cyan glow
            this.dom.gameoverSub.innerText = "You survived the deep space flight and maintained orbit!";
        } else {
            this.dom.gameoverTitle.innerText = "MISSION TERMINATED";
            this.dom.gameoverTitle.className = "warning"; // Pink glow
            this.dom.gameoverSub.innerText = "Your shield integrity collapsed from orbital collisions!";
        }

        this.transitionState('GAMEOVER');
    }

    spawnWord() {
        const index = Math.floor(Math.random() * this.wordBank.length);
        const text = this.wordBank[index];
        
        // Position words uniformly across bottom of screen with borders
        const padding = 80;
        const spawnX = Math.random() * (this.canvas.width - padding * 2) + padding;
        const spawnY = this.canvas.height + 40; // Spawns just below screen edge
        
        // Slower base speed (0.6 - 1.2 px/frame) to allow comfortable typing
        const baseSpeed = Math.random() * 0.6 + 0.6;
        
        // Scaled difficulty coefficients over elapsed timer (0 to 1)
        const elapsedPercent = (60 - this.timeRemaining) / 60;
        
        const newWord = new FloatingWord(text, spawnX, spawnY, baseSpeed, elapsedPercent);
        this.activeWords.push(newWord);
    }

    handleKeyboard(e) {
        if (this.state !== 'PLAYING') return;

        const key = e.key;

        if (key === 'Escape') {
            this.inputBuffer = '';
            sfx.playClick();
            this.updateConsoleUI();
            return;
        }

        if (key === 'Backspace') {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
            sfx.playClick();
            this.updateConsoleUI();
            return;
        }

        // Trigger word validation on Enter or Space
        if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            this.validateWord();
            return;
        }

        // Standard letters typing capture (letters only)
        if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
            this.inputBuffer += key.toLowerCase();
            this.totalKeystrokes++;
            sfx.playClick();
            this.updateConsoleUI();

            // Easter Egg check: If they literal type "antigravity", trigger override!
            if (this.inputBuffer === "antigravity") {
                this.triggerEasterEgg();
                this.inputBuffer = '';
                this.updateConsoleUI();
            }
        }
    }

    validateWord() {
        if (!this.inputBuffer) return;

        let matchedIndex = -1;

        for (let i = 0; i < this.activeWords.length; i++) {
            if (this.activeWords[i].text === this.inputBuffer) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex !== -1) {
            // DETONATION SUCCESS
            const word = this.activeWords[matchedIndex];
            
            // Spawn Burst explosion sparks
            const colors = ['#39ff14', '#00f0ff', '#ffffff']; // Cyan and Acid-green spark palette
            const particleCount = 25;
            for (let k = 0; k < particleCount; k++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.particles.push(new Particle(word.x + word.width / 2, word.y - word.height / 2, color));
            }

            sfx.playExplosion();

            // Calculate metric indicators
            this.correctKeystrokes += word.text.length + 1; // Count characters typed + Space/Enter
            this.wordsDetonated++;
            
            // Detonate / Delete word
            this.activeWords.splice(matchedIndex, 1);
            this.inputBuffer = '';
            
            this.updateConsoleUI();
            this.updateStatsUI();
        } else {
            // Error typo flash buzz
            sfx.playClick();
        }
    }

    triggerEasterEgg() {
        this.isGravityOverride = !this.isGravityOverride;
        sfx.playWarp();

        if (this.isGravityOverride) {
            this.dom.btnGravityLever.classList.add('lever-active');
            this.dom.btnGravityLever.querySelector('.lever-text').innerText = "GRAVITY ON";
            
            // Trigger visual overlay impact warning
            this.triggerScreenShake(0.8);
            
            // Pop the XKCD Python gravity cartoon in a new tab!
            window.open('https://xkcd.com/353/', '_blank');
        } else {
            this.dom.btnGravityLever.classList.remove('lever-active');
            this.dom.btnGravityLever.querySelector('.lever-text').innerText = "GRAVITY OFF";
        }
    }

    triggerScreenShake(duration = 0.35) {
        this.screenShakeTime = duration;
        const app = document.getElementById('app-container');
        app.classList.add('screen-shake');
        
        // Remove class after animation resolves
        setTimeout(() => {
            app.classList.remove('screen-shake');
        }, duration * 1000);
    }

    updateConsoleUI() {
        // Update input buffer text
        this.dom.inputBuffer.innerText = this.inputBuffer.toUpperCase();
        
        // Check for Typos: If there is text in the buffer, check if it matches the prefix of *any* word.
        // If not, color the input box glowing red.
        if (this.inputBuffer) {
            const hasPrefixMatch = this.activeWords.some(w => w.text.startsWith(this.inputBuffer));
            if (!hasPrefixMatch) {
                this.dom.typingConsole.style.borderColor = 'var(--neon-pink)';
                this.dom.typingConsole.style.boxShadow = '0 0 25px rgba(255, 0, 127, 0.15), inset 0 0 10px rgba(255, 0, 127, 0.15)';
                this.dom.inputBuffer.style.color = 'var(--neon-pink)';
                this.dom.inputBuffer.style.textShadow = '0 0 15px rgba(255, 0, 127, 0.6)';
            } else {
                // Return to clean cyber cyan glow
                this.dom.typingConsole.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                this.dom.typingConsole.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.05), inset 0 0 15px rgba(0, 240, 255, 0.05)';
                this.dom.inputBuffer.style.color = 'var(--neon-cyan)';
                this.dom.inputBuffer.style.textShadow = '0 0 15px rgba(0, 240, 255, 0.6)';
            }
        } else {
            // Restore default
            this.dom.typingConsole.style.borderColor = 'rgba(0, 240, 255, 0.15)';
            this.dom.typingConsole.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.05), inset 0 0 15px rgba(0, 240, 255, 0.05)';
            this.dom.inputBuffer.style.color = 'var(--neon-cyan)';
        }
    }

    updateStatsUI() {
        // Draw HUD stats
        this.dom.valTimer.innerText = this.timeRemaining + 's';
        
        // Calculate WPM standardly
        const elapsedMinutes = (60 - this.timeRemaining) / 60;
        let wpmVal = 0;
        if (elapsedMinutes > 0) {
            wpmVal = Math.round((this.correctKeystrokes / 5) / elapsedMinutes);
        }
        this.dom.valWpm.innerText = wpmVal;
        
        // Calculate Accuracy standardly
        const accVal = this.totalKeystrokes > 0 ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100) : 100;
        this.dom.valAccuracy.innerText = accVal + '%';
        
        // Shield Integrity
        this.dom.valIntegrity.innerText = this.shield + '%';
        this.dom.integrityBar.style.width = this.shield + '%';
        
        // Adjust colors of shield health bar based on state
        if (this.shield <= 30) {
            this.dom.integrityBar.style.background = 'linear-gradient(90deg, #ff007f, #8a2be2)';
            this.dom.integrityBar.style.boxShadow = '0 0 15px rgba(255, 0, 127, 0.8)';
            this.dom.valIntegrity.style.color = 'var(--neon-pink)';
        } else if (this.shield <= 60) {
            this.dom.integrityBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff5500)';
            this.dom.integrityBar.style.boxShadow = '0 0 10px rgba(255, 170, 0, 0.5)';
            this.dom.valIntegrity.style.color = '#ffaa00';
        } else {
            this.dom.integrityBar.style.background = 'linear-gradient(90deg, var(--neon-cyan), #0072ff)';
            this.dom.integrityBar.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.5)';
            this.dom.valIntegrity.style.color = '#00f0ff';
        }
    }

    loop(time) {
        // Delta time mapping (seconds)
        let dt = (time - this.lastTime) / 1000;
        if (dt > 0.1) dt = 0.1; // Caps extreme delays on tab defocuses
        this.lastTime = time;

        this.update(dt, time);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt, time) {
        // Star Background ticks
        for (let star of this.stars) {
            star.update(dt, this.canvas.width, this.canvas.height, this.isGravityOverride);
        }

        // Burst particle ticks
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Float escaping visual labels ticks
        for (let i = this.escapedTexts.length - 1; i >= 0; i--) {
            this.escapedTexts[i].y -= 40 * dt; // Float text up
            this.escapedTexts[i].alpha -= 1.2 * dt; // Fade out
            if (this.escapedTexts[i].alpha <= 0) {
                this.escapedTexts.splice(i, 1);
            }
        }

        if (this.state === 'PLAYING') {
            // Difficulty modifier scales spawning cooldowns over remaining game timer (2.2s -> 1.0s)
            const elapsedPercent = (60 - this.timeRemaining) / 60;
            const dynamicSpawnDelay = this.spawnDelay - (elapsedPercent * 1200);

            // Spawner triggers
            this.spawnTimer += dt * 1000;
            if (this.spawnTimer >= dynamicSpawnDelay) {
                this.spawnWord();
                this.spawnTimer = 0;
            }

            // Word update ticks
            for (let i = this.activeWords.length - 1; i >= 0; i--) {
                const word = this.activeWords[i];
                word.update(dt, time, this.isGravityOverride, this.canvas.width);
                
                // Spawn faint bubble trail particles at dynamic rate
                if (word.trailTimer > 0.08 && !this.isGravityOverride) {
                    const pos = word.getTrailPosition();
                    // Faint purple trail sparks
                    this.particles.push(new Particle(pos.x, pos.y, 'rgba(138, 43, 226, 0.15)'));
                    word.trailTimer = 0;
                }

                // Check escape boundaries
                if (this.isGravityOverride) {
                    // Overridden: Escape is bottom edge
                    if (word.y > this.canvas.height + 40) {
                        this.activeWords.splice(i, 1);
                    }
                } else {
                    // Regular play: Escape is top boundary
                    if (word.y < 30) {
                        // Word escaped! Collapse integrity shield
                        this.shield = Math.max(0, this.shield - 10);
                        sfx.playDamage();
                        this.triggerScreenShake(0.3);
                        this.updateStatsUI();

                        // Spawn visual floating penalty indicator
                        this.escapedTexts.push({
                            x: word.x + (word.width ? word.width / 2 : 20),
                            y: 40,
                            text: '-10% SHIELD',
                            alpha: 1
                        });

                        // Delete word
                        this.activeWords.splice(i, 1);
                        this.updateConsoleUI(); // Typo border calculations reset

                        if (this.shield <= 0) {
                            this.endGame(false); // Collapsed defeat
                        }
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Star Backdrop
        for (let star of this.stars) {
            star.draw(this.ctx);
        }

        // 2. Draw Escape Penalty indicator floaters
        for (let textObj of this.escapedTexts) {
            this.ctx.save();
            this.ctx.globalAlpha = textObj.alpha;
            this.ctx.fillStyle = '#ff007f';
            this.ctx.shadowColor = '#ff007f';
            this.ctx.shadowBlur = 10;
            this.ctx.font = "bold 14px 'Orbitron', sans-serif";
            this.ctx.fillText(textObj.text, textObj.x - 40, textObj.y);
            this.ctx.restore();
        }

        // 3. Draw Words
        for (let word of this.activeWords) {
            word.draw(this.ctx, this.inputBuffer);
        }

        // 4. Draw Detonation particle sparks
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
    }
}

// Instantiate and launch the Game instance
window.addEventListener('load', () => {
    window.gameEngine = new Game();
});

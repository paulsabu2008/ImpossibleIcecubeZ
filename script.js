/**
 * =====================================================================
 * IMPOSSIBLE ICE CUBE 🧊 - GAME ENGINE
 * Vanilla JavaScript Arcade Physics, Web Audio Synthesizer, & AI Logic
 * =====================================================================
 */

'use strict';

// ---------------------------------------------------------------------
// 1. SOUND MANAGER (Web Audio API Synthesizer)
// ---------------------------------------------------------------------
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.initialized = true;
      this.startAmbientMusic();
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.muted;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, gainVal = 0.3, detune = 0) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (detune) osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  playSlide() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (_) {}
  }

  playTeleport() {
    if (this.muted || !this.ctx) return;
    try {
      // Warp whoosh pitch sweep up then down
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);

      // Chime sparkle
      setTimeout(() => {
        this.playTone(1200, 'triangle', 0.1, 0.15);
      }, 50);
    } catch (_) {}
  }

  playDecoy() {
    if (this.muted || !this.ctx) return;
    // Funny buzzer
    this.playTone(180, 'square', 0.22, 0.2);
    setTimeout(() => this.playTone(150, 'square', 0.25, 0.2), 80);
  }

  playExhausted() {
    if (this.muted || !this.ctx) return;
    // Bell chime indicating freezer is stunned/open
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sine', 0.35, 0.25), idx * 80);
    });
  }

  playPowerup() {
    if (this.muted || !this.ctx) return;
    // Sparkling arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.22), i * 65);
    });
  }

  playWin() {
    if (this.muted || !this.ctx) return;
    // Joyful arcade fanfare
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.45, 0.3);
      }, idx * 100);
    });
  }

  playGameOver() {
    if (this.muted || !this.ctx) return;
    // Sad downward slide
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(65, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.65);
    } catch (_) {}
  }

  playClick() {
    this.playTone(800, 'sine', 0.05, 0.15);
  }

  startAmbientMusic() {
    if (!this.ctx || this.bgmInterval) return;
    // Gentle icy synth arpeggio in pentatonic scale
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C, D, E, G, A, C
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const note = scale[this.bgmStep % scale.length];
      this.bgmStep = (this.bgmStep + 1 + Math.floor(Math.random() * 2)) % scale.length;
      
      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);
        g.gain.setValueAtTime(0.04, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
        osc.connect(g);
        g.connect(this.bgmGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
      } catch (_) {}
    }, 450);
  }
}

// ---------------------------------------------------------------------
// 2. PARTICLE FX ENGINE (Canvas 60fps)
// ---------------------------------------------------------------------
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.snowflakes = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.initCanvas();
    this.initSnow(60);
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initSnow(count) {
    this.snowflakes = [];
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  addTeleportBurst(x, y, color = '#00f0ff') {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 5 + 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        shape: Math.random() > 0.4 ? 'spark' : 'circle'
      });
    }
  }

  addDecoyPoof(x, y) {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 3,
        color: '#c084fc',
        alpha: 0.9,
        decay: 0.035,
        shape: 'smoke'
      });
    }
  }

  addWaterDrop(x, y) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 1.5 + 1,
      size: Math.random() * 2.5 + 1.5,
      color: '#38bdf8',
      alpha: 0.85,
      decay: 0.02,
      shape: 'drop'
    });
  }

  addVictoryConfetti(x, y) {
    const colors = ['#00f0ff', '#38ef7d', '#ffffff', '#fcd34d', '#38bdf8'];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        shape: 'rect',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw subtle ambient snow
    this.ctx.fillStyle = '#ffffff';
    for (let s of this.snowflakes) {
      s.y += s.speedY;
      s.x += s.speedX;
      if (s.y > this.height) {
        s.y = -5;
        s.x = Math.random() * this.width;
      }
      if (s.x > this.width) s.x = 0;
      if (s.x < 0) s.x = this.width;

      this.ctx.globalAlpha = s.alpha;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Update and draw burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.shape === 'rect' && p.rotation !== undefined) {
        p.rotation += p.vRot;
        p.vy += 0.12; // gravity
      } else if (p.shape === 'drop') {
        p.vy += 0.08;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        this.ctx.restore();
      } else if (p.shape === 'spark') {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.4, 0);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.4, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    this.ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------
// 3. MAIN GAME CONTROLLER
// ---------------------------------------------------------------------
class ImpossibleIceCubeGame {
  constructor() {
    // Sound & FX
    this.sound = new SoundManager();
    this.fxCanvas = document.getElementById('fxCanvas');
    this.particles = new ParticleEngine(this.fxCanvas);

    // DOM Elements
    this.arena = document.getElementById('arena');
    this.iceCube = document.getElementById('iceCube');
    this.cubeWrapper = document.getElementById('cubeWrapper');
    this.cubeShadow = document.getElementById('cubeShadow');
    this.cubePuddle = document.getElementById('cubePuddle');
    this.cubeFace = document.getElementById('cubeFace');
    this.cubeCracks = document.getElementById('cubeCracks');
    this.dragPulse = document.getElementById('dragPulse');
    this.freezer = document.getElementById('freezer');
    this.freezerScreen = document.getElementById('freezerScreen');
    this.freezerText = document.getElementById('freezerText');
    this.decoyFreezer = document.getElementById('decoyFreezer');
    this.teleportRing = document.getElementById('teleportRing');
    this.powerupEl = document.getElementById('powerup');
    this.powerupIcon = document.getElementById('powerupIcon');
    this.powerupBadge = document.getElementById('powerupBadge');
    this.heatwaveBanner = document.getElementById('heatwaveBanner');
    this.floatContainer = document.getElementById('floatingTextContainer');

    // HUD Elements
    this.hud = document.getElementById('gameHud');
    this.levelDisplay = document.getElementById('levelDisplay');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.bestScoreDisplay = document.getElementById('bestScoreDisplay');
    this.menuBestScore = document.getElementById('menuBestScore');
    this.meltFill = document.getElementById('meltFill');
    this.meltPercentDisplay = document.getElementById('meltPercentDisplay');
    this.dodgesDisplay = document.getElementById('dodgesDisplay');
    this.soundBtn = document.getElementById('soundBtn');
    this.soundIcon = document.getElementById('soundIcon');
    this.pauseBtn = document.getElementById('pauseBtn');

    // Modals
    this.menuScreen = document.getElementById('menuScreen');
    this.helpScreen = document.getElementById('helpScreen');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.victoryScreen = document.getElementById('victoryScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');

    // Victory Screen Elements
    this.winDeliveryScore = document.getElementById('winDeliveryScore');
    this.winIceBonus = document.getElementById('winIceBonus');
    this.winSpeedBonus = document.getElementById('winSpeedBonus');
    this.winRoundScore = document.getElementById('winRoundScore');

    // Game Over Elements
    this.finalScoreVal = document.getElementById('finalScoreVal');
    this.roundsSurvivedVal = document.getElementById('roundsSurvivedVal');
    this.overBestScoreVal = document.getElementById('overBestScoreVal');

    // Game State Variables
    this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'WON' | 'GAME_OVER'
    this.difficulty = 'normal'; // 'easy' | 'normal' | 'hard' | 'impossible'
    this.level = 1;
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('impossible_cube_best') || '0', 10);
    this.roundStartTime = 0;
    this.roundElapsed = 0;

    // Difficulty presets
    this.difficultyConfigs = {
      easy: { dodges: 2, meltTime: 32, decoyRate: 0, heatwaveRate: 0, proximity: 105 },
      normal: { dodges: 4, meltTime: 24, decoyRate: 0.25, heatwaveRate: 0.15, proximity: 115 },
      hard: { dodges: 6, meltTime: 18, decoyRate: 0.45, heatwaveRate: 0.35, proximity: 125 },
      impossible: { dodges: 8, meltTime: 13, decoyRate: 0.65, heatwaveRate: 0.55, proximity: 135 }
    };

    // Physics & Cube Entities
    this.cube = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      pointerId: null,
      radius: 34,
      friction: 0.92,
      spring: 0.24
    };

    // Freezer Entity
    this.freezerObj = {
      x: 0,
      y: 0,
      width: 90,
      height: 110,
      dodgesLeft: 3,
      isExhausted: false,
      isFrozenSolid: false,
      freezeTimer: 0,
      lastTeleportTime: 0
    };

    // Decoy Entity
    this.decoyObj = {
      active: false,
      x: 0,
      y: 0
    };

    // Power-up
    this.powerup = {
      active: false,
      type: 'freeze', // 'freeze' | 'icepack'
      x: 0,
      y: 0,
      radius: 24,
      spawnTimer: 0
    };

    // Melting dynamics
    this.integrity = 100; // 0 to 100
    this.baseMeltRate = 4.0; // percent per second
    this.isHeatwave = false;
    this.heatwaveTimer = 0;

    // Arena geometry
    this.arenaRect = { left: 0, top: 0, width: 800, height: 600 };

    // Loop
    this.lastTime = 0;
    this.animationFrameId = null;

    // Taunts
    this.taunts = [
      'TOO SLOW! 💨', 'NOPE! 😜', 'ALMOST! 😂', 'NICE TRY! 🥶',
      'MISSED ME! 🏃', 'COLD FEET? 🧊', 'NOT TODAY! 🚀', 'OVER HERE! 👋'
    ];

    this.init();
  }

  init() {
    this.updateBestScoreDisplay();
    this.setupEventListeners();
    this.updateArenaBounds();

    // Start 60fps render loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  updateBestScoreDisplay() {
    this.bestScoreDisplay.textContent = this.bestScore.toLocaleString();
    this.menuBestScore.textContent = this.bestScore.toLocaleString();
    this.overBestScoreVal.textContent = this.bestScore.toLocaleString();
  }

  setupEventListeners() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.particles.initCanvas();
      this.updateArenaBounds();
    });

    // Pointer Dragging for Ice Cube
    this.iceCube.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    // Prevent touch scrolling & unwanted selections
    this.arena.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // Menu Play & Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.sound.init();
        this.sound.playClick();
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
      });
    });

    document.getElementById('playBtn').addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      this.startGame();
    });

    document.getElementById('howToPlayBtn').addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      this.showModal(this.helpScreen);
    });

    document.getElementById('closeHelpBtn').addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      this.hideModal(this.helpScreen);
    });

    // HUD controls
    this.soundBtn.addEventListener('click', () => {
      this.sound.init();
      const isMuted = this.sound.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    this.pauseBtn.addEventListener('click', () => this.togglePause());

    // Pause Modal Buttons
    document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('restartPauseBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.hideModal(this.pauseScreen);
      this.startRound(this.level);
    });
    document.getElementById('menuPauseBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.goToMenu();
    });

    // Victory Screen Buttons
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.hideModal(this.victoryScreen);
      this.level++;
      this.startRound(this.level);
    });
    document.getElementById('winMenuBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.goToMenu();
    });

    // Game Over Buttons
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.hideModal(this.gameOverScreen);
      this.score = 0;
      this.level = 1;
      this.startRound(1);
    });
    document.getElementById('overMenuBtn').addEventListener('click', () => {
      this.sound.playClick();
      this.goToMenu();
    });

    // Keyboard controls
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space') {
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          this.togglePause();
        }
      } else if (e.code === 'KeyR') {
        if (this.state === 'PLAYING' || this.state === 'GAME_OVER' || this.state === 'PAUSED') {
          this.hideModal(this.pauseScreen);
          this.hideModal(this.gameOverScreen);
          this.startRound(this.level);
        }
      } else if (e.code === 'KeyM') {
        const isMuted = this.sound.toggleMute();
        this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  updateArenaBounds() {
    const rect = this.arena.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.arenaRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    } else {
      this.arenaRect = {
        left: 0,
        top: 0,
        width: Math.min(window.innerWidth - 24, 1100),
        height: Math.min(window.innerHeight - 100, 750)
      };
    }
  }

  showModal(modal) {
    modal.classList.remove('hidden');
    // Force reflow
    void modal.offsetWidth;
    modal.classList.add('active');
  }

  hideModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 250);
  }

  goToMenu() {
    this.state = 'MENU';
    this.hud.classList.add('hidden');
    this.hideModal(this.pauseScreen);
    this.hideModal(this.victoryScreen);
    this.hideModal(this.gameOverScreen);
    this.showModal(this.menuScreen);
    this.updateBestScoreDisplay();
  }

  startGame() {
    this.hideModal(this.menuScreen);
    this.score = 0;
    this.level = 1;
    this.hud.classList.remove('hidden');
    this.startRound(1);
  }

  startRound(lvl) {
    this.updateArenaBounds();
    this.state = 'PLAYING';
    this.level = lvl;
    this.levelDisplay.textContent = this.level;
    this.scoreDisplay.textContent = this.score.toLocaleString();
    this.roundStartTime = performance.now();
    this.roundElapsed = 0;

    // Config per difficulty & level
    const cfg = this.difficultyConfigs[this.difficulty];
    // Progression: slightly more dodges and slightly faster melt on higher rounds
    const levelDodgeBonus = Math.min(4, Math.floor((lvl - 1) / 2));
    this.freezerObj.dodgesLeft = cfg.dodges + (lvl === 1 ? 0 : levelDodgeBonus);
    if (lvl === 1 && this.difficulty === 'easy') {
      this.freezerObj.dodgesLeft = 1; // Pure tutorial round
    }

    this.freezerObj.isExhausted = false;
    this.freezerObj.isFrozenSolid = false;
    this.freezerObj.freezeTimer = 0;
    this.freezer.classList.remove('open', 'exhausted', 'frozen-solid');
    this.freezerText.textContent = 'STAY AWAY!';

    this.dodgesDisplay.textContent = this.freezerObj.dodgesLeft;

    // Integrity & melting setup
    this.integrity = 100;
    const baseSeconds = Math.max(9, cfg.meltTime - Math.min(8, (lvl - 1) * 1.5));
    this.baseMeltRate = 100 / baseSeconds;
    this.isHeatwave = false;
    this.heatwaveTimer = 0;
    this.heatwaveBanner.classList.add('hidden');

    // Reset powerup
    this.powerup.active = false;
    this.powerup.spawnTimer = Math.random() * 5 + 4; // spawn in 4-9s
    this.powerupEl.classList.add('hidden');

    // Reset decoy
    this.decoyObj.active = false;
    this.decoyFreezer.classList.add('hidden');

    // Position Cube safely on bottom center
    this.cube.x = this.arenaRect.width * 0.5;
    this.cube.y = this.arenaRect.height * 0.78;
    this.cube.targetX = this.cube.x;
    this.cube.targetY = this.cube.y;
    this.cube.vx = 0;
    this.cube.vy = 0;
    this.cube.isDragging = false;
    this.cube.pointerId = null;
    this.iceCube.classList.remove('dragging');
    this.cubeFace.className = 'cube-face';

    // Show drag pulse hint on round 1
    if (lvl === 1) {
      this.dragPulse.style.display = 'block';
    } else {
      this.dragPulse.style.display = 'none';
    }

    // Position Freezer on top center/random safe spot
    this.placeFreezerSafely();

    this.updateMeltDisplay();
    this.renderPositions();

    this.spawnFloatingText('READY... DRAG! 🧊', this.cube.x, this.cube.y - 60, '#00f0ff');
  }

  placeFreezerSafely() {
    const pad = 70;
    let attempts = 0;
    let newX, newY, dist;

    do {
      newX = pad + Math.random() * (this.arenaRect.width - pad * 2);
      newY = pad + Math.random() * (this.arenaRect.height * 0.65 - pad);
      const dx = newX - this.cube.x;
      const dy = newY - this.cube.y;
      dist = Math.hypot(dx, dy);
      attempts++;
    } while (dist < 180 && attempts < 20);

    this.freezerObj.x = newX;
    this.freezerObj.y = newY;
  }

  // -------------------------------------------------------------------
  // POINTER & DRAG CONTROLLER (Slippery Momentum & Physics)
  // -------------------------------------------------------------------
  onPointerDown(e) {
    if (this.state !== 'PLAYING') return;
    this.sound.resume();

    this.cube.isDragging = true;
    this.cube.pointerId = e.pointerId;
    this.iceCube.setPointerCapture(e.pointerId);
    this.iceCube.classList.add('dragging');
    this.dragPulse.style.display = 'none';

    this.updateTargetFromPointer(e);
    this.sound.playSlide();
  }

  onPointerMove(e) {
    if (!this.cube.isDragging || e.pointerId !== this.cube.pointerId) return;
    this.updateTargetFromPointer(e);
  }

  updateTargetFromPointer(e) {
    const arenaX = e.clientX - this.arenaRect.left;
    const arenaY = e.clientY - this.arenaRect.top;

    // Clamp within arena bounds
    const pad = this.cube.radius;
    this.cube.targetX = Math.max(pad, Math.min(this.arenaRect.width - pad, arenaX));
    this.cube.targetY = Math.max(pad, Math.min(this.arenaRect.height - pad, arenaY));
  }

  onPointerUp(e) {
    if (this.cube.isDragging && (!e || e.pointerId === this.cube.pointerId)) {
      this.cube.isDragging = false;
      try {
        if (this.cube.pointerId !== null) {
          this.iceCube.releasePointerCapture(this.cube.pointerId);
        }
      } catch (_) {}
      this.cube.pointerId = null;
      this.iceCube.classList.remove('dragging');
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.showModal(this.pauseScreen);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.hideModal(this.pauseScreen);
      this.lastTime = performance.now();
    }
  }

  // -------------------------------------------------------------------
  // TELEPORTATION & FREEZER AI
  // -------------------------------------------------------------------
  checkFreezerTeleport() {
    const dx = this.freezerObj.x - this.cube.x;
    const dy = this.freezerObj.y - this.cube.y;
    const dist = Math.hypot(dx, dy);

    // If freezer is exhausted OR frozen solid OR dodges depleted:
    if (this.freezerObj.isExhausted || this.freezerObj.isFrozenSolid || this.freezerObj.dodgesLeft <= 0) {
      // Gentle icy suction magnetic assist when close
      if (dist < 85 && dist > 1) {
        this.cube.vx += (dx / dist) * 0.9;
        this.cube.vy += (dy / dist) * 0.9;
      }
      // Reached freezer: WIN!
      if (dist < 56) {
        this.triggerWin();
      }
      return;
    }

    const cfg = this.difficultyConfigs[this.difficulty];
    const triggerRadius = cfg.proximity;

    // If cube is close to freezer and it can dodge:
    if (dist < triggerRadius) {
      if (this.freezerObj.dodgesLeft > 0) {
        this.performTeleport();
      }
    }
  }

  performTeleport() {
    const now = performance.now();
    // Cooldown check to prevent accidental multiple triggers within 250ms
    if (now - this.freezerObj.lastTeleportTime < 250) return;
    this.freezerObj.lastTeleportTime = now;

    this.freezerObj.dodgesLeft--;
    this.dodgesDisplay.textContent = this.freezerObj.dodgesLeft;

    const cfg = this.difficultyConfigs[this.difficulty];

    // Trigger teleport blast animation at old spot
    this.triggerTeleportBlast(this.freezerObj.x, this.freezerObj.y);
    this.sound.playTeleport();

    // Random Taunt
    const taunt = this.taunts[Math.floor(Math.random() * this.taunts.length)];
    this.freezerText.textContent = taunt;
    this.spawnFloatingText(taunt, this.freezerObj.x, this.freezerObj.y - 45, '#38bdf8');

    // Decoy check
    const shouldSpawnDecoy = Math.random() < cfg.decoyRate && this.freezerObj.dodgesLeft > 1;
    if (shouldSpawnDecoy) {
      this.spawnDecoy(this.freezerObj.x, this.freezerObj.y);
    }

    // Teleport to new safe location
    this.placeFreezerSafely();

    // Check if that was the last dodge!
    if (this.freezerObj.dodgesLeft <= 0) {
      this.exhaustFreezer();
    } else if (this.difficulty === 'impossible' && Math.random() < 0.35) {
      // Double quick-teleport mechanic on Impossible difficulty!
      setTimeout(() => {
        if (this.state === 'PLAYING' && this.freezerObj.dodgesLeft > 0) {
          this.triggerTeleportBlast(this.freezerObj.x, this.freezerObj.y);
          this.placeFreezerSafely();
          this.spawnFloatingText('DOUBLE BLINK! ⚡', this.freezerObj.x, this.freezerObj.y - 40, '#f59e0b');
        }
      }, 160);
    }
  }

  triggerTeleportBlast(x, y) {
    this.teleportRing.style.left = `${x}px`;
    this.teleportRing.style.top = `${y}px`;
    this.teleportRing.classList.remove('active');
    void this.teleportRing.offsetWidth; // Reflow
    this.teleportRing.classList.add('active');

    this.particles.addTeleportBurst(x, y);
    this.triggerScreenShake();
  }

  triggerScreenShake() {
    this.arena.classList.remove('screen-shake');
    void this.arena.offsetWidth;
    this.arena.classList.add('screen-shake');
    setTimeout(() => this.arena.classList.remove('screen-shake'), 320);
  }

  spawnDecoy(x, y) {
    this.decoyObj.active = true;
    this.decoyObj.x = x;
    this.decoyObj.y = y;
    this.decoyFreezer.style.left = `${x}px`;
    this.decoyFreezer.style.top = `${y}px`;
    this.decoyFreezer.classList.remove('hidden');

    this.sound.playDecoy();

    // Decoy vanishes with smoke after 2.5s or on collision
    setTimeout(() => {
      if (this.decoyObj.active) {
        this.dismissDecoy();
      }
    }, 2800);
  }

  dismissDecoy() {
    if (!this.decoyObj.active) return;
    this.particles.addDecoyPoof(this.decoyObj.x, this.decoyObj.y);
    this.decoyObj.active = false;
    this.decoyFreezer.classList.add('hidden');
  }

  exhaustFreezer() {
    this.freezerObj.isExhausted = true;
    this.freezer.classList.add('open', 'exhausted');
    this.freezerText.textContent = 'COME IN! 🥵';
    this.dodgesDisplay.textContent = '0 (TIRED!)';
    this.sound.playExhausted();
    this.spawnFloatingText('FREEZER IS TIRED! GET IN! 🏆', this.freezerObj.x, this.freezerObj.y - 50, '#38ef7d');
  }

  freezeFreezerSolid(duration = 3.5) {
    this.freezerObj.isFrozenSolid = true;
    this.freezerObj.freezeTimer = duration;
    this.freezer.classList.add('frozen-solid');
    this.freezerText.textContent = 'FROZEN SOLID! ❄️';
    this.sound.playPowerup();
    this.spawnFloatingText('FREEZER IMMOBILIZED! ❄️⚡', this.freezerObj.x, this.freezerObj.y - 50, '#00f0ff');
  }

  // -------------------------------------------------------------------
  // POWER-UPS & HAZARDS
  // -------------------------------------------------------------------
  updatePowerups(dt) {
    if (this.powerup.active) {
      // Check collision with ice cube
      const dx = this.powerup.x - this.cube.x;
      const dy = this.powerup.y - this.cube.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.cube.radius + this.powerup.radius) {
        this.collectPowerup();
      }
    } else {
      // Spawn timer countdown
      this.powerup.spawnTimer -= dt;
      if (this.powerup.spawnTimer <= 0) {
        this.spawnPowerup();
      }
    }

    // Freeze timer on freezer
    if (this.freezerObj.isFrozenSolid) {
      this.freezerObj.freezeTimer -= dt;
      if (this.freezerObj.freezeTimer <= 0) {
        this.freezerObj.isFrozenSolid = false;
        this.freezer.classList.remove('frozen-solid');
        this.freezerText.textContent = this.freezerObj.dodgesLeft > 0 ? 'UNFROZEN!' : 'COME IN! 🥵';
      }
    }

    // Heatwave sudden event
    const cfg = this.difficultyConfigs[this.difficulty];
    if (cfg.heatwaveRate > 0 && !this.isHeatwave) {
      if (Math.random() < cfg.heatwaveRate * 0.005) {
        this.triggerHeatwave();
      }
    }

    if (this.isHeatwave) {
      this.heatwaveTimer -= dt;
      if (this.heatwaveTimer <= 0) {
        this.isHeatwave = false;
        this.heatwaveBanner.classList.add('hidden');
      }
    }
  }

  spawnPowerup() {
    this.powerup.active = true;
    this.powerup.type = Math.random() < 0.6 ? 'freeze' : 'icepack';
    const pad = 60;
    this.powerup.x = pad + Math.random() * (this.arenaRect.width - pad * 2);
    this.powerup.y = pad + Math.random() * (this.arenaRect.height - pad * 2);

    this.powerupIcon.textContent = this.powerup.type === 'freeze' ? '❄️' : '🧊';
    this.powerupBadge.textContent = this.powerup.type === 'freeze' ? 'FREEZE!' : '+MELT TIME';

    this.powerupEl.style.left = `${this.powerup.x}px`;
    this.powerupEl.style.top = `${this.powerup.y}px`;
    this.powerupEl.classList.remove('hidden');

    this.sound.playTone(880, 'sine', 0.15, 0.15);
  }

  collectPowerup() {
    this.powerup.active = false;
    this.powerupEl.classList.add('hidden');
    this.powerup.spawnTimer = Math.random() * 8 + 8; // next spawn in 8-16s

    this.particles.addTeleportBurst(this.powerup.x, this.powerup.y, '#38ef7d');
    this.sound.playPowerup();

    if (this.powerup.type === 'freeze') {
      this.freezeFreezerSolid(3.5);
    } else {
      // Ice pack restores integrity
      this.integrity = Math.min(100, this.integrity + 30);
      this.updateMeltDisplay();
      this.spawnFloatingText('+30% ICE RESTORED! 🧊', this.cube.x, this.cube.y - 45, '#38ef7d');
    }
  }

  triggerHeatwave() {
    this.isHeatwave = true;
    this.heatwaveTimer = 3.5;
    this.heatwaveBanner.classList.remove('hidden');
    this.sound.playTone(220, 'sawtooth', 0.4, 0.3);
    this.triggerScreenShake();
  }

  // -------------------------------------------------------------------
  // WIN & GAME OVER CONDITIONS
  // -------------------------------------------------------------------
  triggerWin() {
    if (this.state !== 'PLAYING') return;
    this.state = 'WON';

    this.cubeFace.className = 'cube-face happy';
    this.sound.playWin();
    this.particles.addVictoryConfetti(this.freezerObj.x, this.freezerObj.y);

    const roundDurationSec = Math.max(1, (performance.now() - this.roundStartTime) / 1000);
    const deliveryScore = 500 * this.level;
    const iceBonus = Math.floor(this.integrity * 6);
    const speedBonus = Math.max(0, Math.floor((30 - roundDurationSec) * 20));
    const roundTotal = deliveryScore + iceBonus + speedBonus;

    this.score += roundTotal;
    this.scoreDisplay.textContent = this.score.toLocaleString();

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('impossible_cube_best', this.bestScore.toString());
      this.updateBestScoreDisplay();
    }

    // Populate victory screen
    this.winDeliveryScore.textContent = `+${deliveryScore}`;
    this.winIceBonus.textContent = `+${iceBonus} (${Math.round(this.integrity)}% left)`;
    this.winSpeedBonus.textContent = `+${speedBonus}`;
    this.winRoundScore.textContent = roundTotal.toLocaleString();

    setTimeout(() => {
      this.showModal(this.victoryScreen);
    }, 700);
  }

  triggerGameOver(reason = 'melted') {
    if (this.state !== 'PLAYING') return;
    this.state = 'GAME_OVER';

    this.sound.playGameOver();
    this.cubeFace.className = 'cube-face panicked';
    this.particles.addWaterDrop(this.cube.x, this.cube.y);
    this.particles.addWaterDrop(this.cube.x + 10, this.cube.y);
    this.particles.addWaterDrop(this.cube.x - 10, this.cube.y);

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('impossible_cube_best', this.bestScore.toString());
      this.updateBestScoreDisplay();
    }

    this.finalScoreVal.textContent = this.score.toLocaleString();
    this.roundsSurvivedVal.textContent = Math.max(0, this.level - 1).toString();
    this.overBestScoreVal.textContent = this.bestScore.toLocaleString();

    setTimeout(() => {
      this.showModal(this.gameOverScreen);
    }, 850);
  }

  // -------------------------------------------------------------------
  // VISUAL UPDATES & FLOATING TEXT
  // -------------------------------------------------------------------
  updateMeltDisplay() {
    const pct = Math.max(0, Math.min(100, this.integrity));
    this.meltPercentDisplay.textContent = `${Math.ceil(pct)}%`;
    this.meltFill.style.width = `${pct}%`;

    // Bar colors
    this.meltFill.classList.remove('warning', 'danger');
    if (pct < 30) {
      this.meltFill.classList.add('danger');
    } else if (pct < 60) {
      this.meltFill.classList.add('warning');
    }

    // Ice cube visual shrinkage and cracks
    const scale = 0.45 + (pct / 100) * 0.55; // 0.45 min scale to 1.0
    this.cubeWrapper.style.transform = `scale(${scale})`;

    // Cracks visibility
    this.cubeCracks.style.opacity = pct < 65 ? ((65 - pct) / 65).toString() : '0';

    // Face panic expressions
    if (pct < 35 || this.isHeatwave) {
      this.cubeFace.className = 'cube-face panicked';
    } else if (this.cubeFace.className !== 'cube-face happy') {
      this.cubeFace.className = 'cube-face';
    }

    // Water puddle underneath cube
    const puddleSize = (100 - pct) * 0.8;
    this.cubePuddle.style.width = `${puddleSize}px`;
    this.cubePuddle.style.height = `${puddleSize * 0.3}px`;
  }

  spawnFloatingText(msg, x, y, color = '#ffffff') {
    const el = document.createElement('div');
    el.className = 'float-msg';
    el.textContent = msg;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    if (color) el.style.color = color;
    this.floatContainer.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1100);
  }

  // -------------------------------------------------------------------
  // MAIN GAME TICK & 60 FPS ANIMATION LOOP
  // -------------------------------------------------------------------
  loop(time) {
    const dt = Math.min(0.06, (time - this.lastTime) / 1000); // capped delta time
    this.lastTime = time;

    // Background Particle rendering
    this.particles.updateAndDraw();

    if (this.state === 'PLAYING') {
      this.updatePhysics(dt);
      this.updateMelting(dt);
      this.updatePowerups(dt);
      this.checkFreezerTeleport();
      this.renderPositions();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  updatePhysics(dt) {
    if (this.cube.isDragging) {
      // Elastic spring tracking toward target with slight inertia
      const dx = this.cube.targetX - this.cube.x;
      const dy = this.cube.targetY - this.cube.y;
      this.cube.vx += dx * this.cube.spring;
      this.cube.vy += dy * this.cube.spring;
    }

    // Keyboard movement support (WASD & Arrow Keys)
    if (this.keys && !this.cube.isDragging) {
      const keySpeed = 1.35;
      if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.cube.vx -= keySpeed;
      if (this.keys['ArrowRight'] || this.keys['KeyD']) this.cube.vx += keySpeed;
      if (this.keys['ArrowUp'] || this.keys['KeyW']) this.cube.vy -= keySpeed;
      if (this.keys['ArrowDown'] || this.keys['KeyS']) this.cube.vy += keySpeed;
    }

    // Apply friction (slippery ice feel)
    this.cube.vx *= this.cube.friction;
    this.cube.vy *= this.cube.friction;

    this.cube.x += this.cube.vx;
    this.cube.y += this.cube.vy;

    // Bounds checking with bounce
    const pad = this.cube.radius;
    if (this.cube.x < pad) {
      this.cube.x = pad;
      this.cube.vx = -this.cube.vx * 0.4;
    } else if (this.cube.x > this.arenaRect.width - pad) {
      this.cube.x = this.arenaRect.width - pad;
      this.cube.vx = -this.cube.vx * 0.4;
    }

    if (this.cube.y < pad) {
      this.cube.y = pad;
      this.cube.vy = -this.cube.vy * 0.4;
    } else if (this.cube.y > this.arenaRect.height - pad) {
      this.cube.y = this.arenaRect.height - pad;
      this.cube.vy = -this.cube.vy * 0.4;
    }

    // Occasionally spawn water drip behind cube if moving or melting
    const speed = Math.hypot(this.cube.vx, this.cube.vy);
    if ((speed > 1.5 || this.integrity < 50) && Math.random() < 0.22) {
      const dropArenaX = this.arenaRect.left + this.cube.x;
      const dropArenaY = this.arenaRect.top + this.cube.y + 15;
      this.particles.addWaterDrop(dropArenaX, dropArenaY);
    }

    // Decoy collision check (if cube hits decoy, it pops!)
    if (this.decoyObj.active) {
      const dDx = this.decoyObj.x - this.cube.x;
      const dDy = this.decoyObj.y - this.cube.y;
      if (Math.hypot(dDx, dDy) < 55) {
        this.spawnFloatingText('FAKE DECOY! 💨👻', this.decoyObj.x, this.decoyObj.y - 30, '#c084fc');
        this.dismissDecoy();
      }
    }
  }

  updateMelting(dt) {
    let rate = this.baseMeltRate;
    if (this.isHeatwave) rate *= 3.0; // Heatwave triples rate!

    this.integrity -= rate * dt;
    this.updateMeltDisplay();

    if (this.integrity <= 0) {
      this.integrity = 0;
      this.triggerGameOver('melted');
    }
  }

  renderPositions() {
    this.iceCube.style.left = `${this.cube.x}px`;
    this.iceCube.style.top = `${this.cube.y}px`;

    this.freezer.style.left = `${this.freezerObj.x}px`;
    this.freezer.style.top = `${this.freezerObj.y}px`;
  }
}

// ---------------------------------------------------------------------
// 4. BOOTSTRAP INITIALIZATION ON DOM READY
// ---------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  window.game = new ImpossibleIceCubeGame();
});

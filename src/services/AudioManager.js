export class Sound {
  constructor(scale, tempo) {
    this.scale = scale;
    this.tempo = tempo;
  }
}

// src/services/AudioManager.js
class AudioManager {
  constructor() {
    this.ctx = null;
    this.oscillator = null; const savedStatus = localStorage.getItem('bgm_enabled');
    this.isPlaying = (savedStatus === 'true');
    // this.isPlaying = false;

    // 日式五聲音階 (D, Eb, G, A, Bb) - 營造和風感
    this.scale = [293.66, 311.13, 392.00, 440.00, 466.16];
    this.currentNote = 0;
    this.nextNoteTime = 0;
    this.tempo = 110; // BPM

  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const bgmBtn = document.getElementById('bgm-toggle');
    const bgmStatus = bgmBtn.querySelector('.status');

    if (this.isPlaying) this.startBGM();
 
    if (this.isPlaying) {
      bgmBtn.classList.add('playing');
      bgmStatus.textContent = 'BGM ON';
    } else {
      bgmBtn.classList.remove('playing');
      bgmStatus.textContent = 'BGM OFF';
    }

    bgmBtn.addEventListener('click', () => {
      const isPlaying = audioManager.toggle();

      if (isPlaying) {
        bgmBtn.classList.add('playing');
        bgmStatus.textContent = 'BGM ON';
      } else {
        bgmBtn.classList.remove('playing');
        bgmStatus.textContent = 'BGM OFF';
      }
    });
  }

  play8BitNote(freq, startTime, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square'; // 關鍵：方波產生 8-bit 感
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playPattern();
      this.nextNoteTime += 60.0 / this.tempo / 2; // 八分音符
    }
    this.timer = setTimeout(() => this.scheduler(), 25);
  }

  playPattern() {
    // 簡單的日式旋律邏輯
    const noteIndex = Math.floor(Math.random() * this.scale.length);
    const freq = this.scale[noteIndex];
    this.play8BitNote(freq, this.nextNoteTime, 0.2);
  }

  toggle() {
    if (this.isPlaying) {
      this.stopBGM();
    } else {
      this.startBGM();
    }

    // 將最新狀態存入 localStorage
    localStorage.setItem('bgm_enabled', this.isPlaying);

    return this.isPlaying;
  }

  // 拆分出啟動與停止邏輯，方便管理
  startBGM() {
    this.ctx.resume();
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
    this.isPlaying = true;
  }

  stopBGM() {
    clearTimeout(this.timer);
    this.isPlaying = false;
  }

  /**
 * 播放指定類型的音效
 * @param {Object} soundConfig - 包含 type 等資訊
 */
  play(soundConfig) {
    // if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const { type } = soundConfig;

    switch (type) {
      case 'EXPLOSION':
        this.playExplosionSound();
        break;
      case 'SELECT':
        this.playSelectSound();
        break;
      // 未來可以擴充更多類型
    }
  }

  /**
 * 8-bit 爆炸聲合成器
 */
  playExplosionSound() {
    const duration = 0.5;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // 1. 產生白噪音 (隨機亂數)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // 2. 加上低通濾波器 (讓聲音悶一點，更有爆炸感)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }
}

export const audioManager = new AudioManager();
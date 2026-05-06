// src/services/AudioManager.js
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.isPlaying = false;

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
    this.init();
    if (this.isPlaying) {
      clearTimeout(this.timer);
      this.isPlaying = false;
    } else {
      this.ctx.resume();
      this.nextNoteTime = this.ctx.currentTime;
      this.scheduler();
      this.isPlaying = true;
    }
    return this.isPlaying;
  }
}
import { Container, Graphics, Text } from 'pixi.js';
import { CONFIG } from '../CONST.js';
import { dictionary } from '../services/DictionaryManager.js';

export class TextInput {
  constructor(config = {}) {
    this.currentWord = '';
    this.typedIndex = 0;

    this.startTime = Date.now();
    this.lastInputTime = Date.now();
    this.combo = 0;
    this.maxCombo = 0;
    this.wpm = 0;
    this.topWpm = 0;
    this.typedChars = 0;
    this.totalActiveTime = 0;
    this.isPaused = true;
    this.totalInputs = 0;
    this.correctInputs = 0;
    this.accuracy = 100;
    this.totalDamage = 0;
    this.dps = 0;

    this.x = config.x || CONFIG.width / 2;
    this.y = CONFIG.groundY + 63;

    this.energy = 0;
    this.maxEnergy = config.maxEnergy || 50;
    this.isFrenzy = false;
    this.frenzyTimer = 0;
    this.frenzyDuration = 10;

    this._fetchNewWord();

    // Pixi objects
    this.container = new Container();
    this.bgGfx = new Graphics();     // dark floor background + energy bar
    this.letterGfx = new Graphics(); // letter highlight blocks (pixel font via rects)

    // Stats text objects
    this.comboText = new Text({ text: 'COMBO: 0', style: { fontFamily: 'Courier New', fontSize: 16, fill: '#ffffff' } });
    this.wpmText = new Text({ text: 'WPM: 0', style: { fontFamily: 'Courier New', fontSize: 16, fill: '#ffffff' } });
    this.accuracyText = new Text({ text: 'Accuracy: 100%', style: { fontFamily: 'Courier New', fontSize: 16, fill: '#ffffff' } });
    this.dpsText = new Text({ text: 'DPS: 0', style: { fontFamily: 'Courier New', fontSize: 16, fill: '#ffffff' } });

    const statsX = 10;
    const statsY = CONFIG.groundY + 40;
    this.comboText.x = statsX; this.comboText.y = statsY;
    this.wpmText.x = statsX; this.wpmText.y = statsY + 20;
    this.accuracyText.x = statsX; this.accuracyText.y = statsY + 40;
    this.dpsText.x = statsX; this.dpsText.y = statsY + 60;

    // Word letter texts — pool of Text objects, sized to max word length
    this.letterTexts = [];
    for (let i = 0; i < 30; i++) {
      const t = new Text({ text: '', style: { fontFamily: 'Courier New', fontSize: 40, fontWeight: 'bold', fill: '#555555' } });
      t.anchor.set(0.5, 1);
      t.visible = false;
      this.letterTexts.push(t);
    }

    this.container.addChild(this.bgGfx);
    this.container.addChild(this.letterGfx);
    this.letterTexts.forEach(t => this.container.addChild(t));
    this.container.addChild(this.comboText);
    this.container.addChild(this.wpmText);
    this.container.addChild(this.accuracyText);
    this.container.addChild(this.dpsText);
  }

  async _fetchNewWord() {
    this.currentWord = dictionary.getRandomWord();
    this.typedIndex = 0;
  }

  handleInput(char) {
    const now = Date.now();
    const expectedChar = this.currentWord[this.typedIndex];
    this.totalInputs++;

    if (char === expectedChar) {
      this.lastInputTime = now;
      this.correctInputs++;
      this.typedIndex++;
      this.typedChars++;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.updateAccuracy();
      if (!this.isFrenzy) {
        this.energy += 1;
        if (this.energy >= this.maxEnergy) this.triggerFrenzy();
      }
      if (this.typedIndex >= this.currentWord.length) {
        this._fetchNewWord();
        return this.isFrenzy ? 'WORD_COMPLETE_CRIT' : 'WORD_COMPLETE';
      }
      return 'CHAR_CORRECT';
    } else {
      this.combo = 0;
      this.updateAccuracy();
      if (!this.isFrenzy) {
        this.energy = Math.max(0, this.energy - 3);
      }
      return 'CHAR_WRONG';
    }
  }

  recordDamage(amount) { this.totalDamage += amount; }

  triggerFrenzy() {
    this.isFrenzy = true;
    this.frenzyTimer = this.frenzyDuration;
  }

  update() {
    this.updateStats();
    if (this.isFrenzy) {
      this.frenzyTimer -= 1 / 60;
      this.energy = (this.frenzyTimer / this.frenzyDuration) * this.maxEnergy;
      if (this.frenzyTimer <= 0) { this.isFrenzy = false; this.energy = 0; }
    }
  }

  updateStats() {
    const now = Date.now();
    const deltaTime = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;
    const totalSeconds = this.totalActiveTime / 1000;
    this.dps = Math.floor(this.totalDamage / totalSeconds) || 0;

    if (now - this.lastInputTime > 1000 && this.typedIndex === 0) {
      this.isPaused = true;
    } else {
      this.totalActiveTime += deltaTime;
      this.isPaused = false;
    }
    if (this.totalActiveTime <= 0) return;
    const minutes = this.totalActiveTime / 60000;
    this.wpm = Math.floor(this.typedChars / 5 / minutes) || 0;
    if (this.wpm > this.topWpm) this.topWpm = this.wpm;
  }

  updateAccuracy() {
    if (this.totalInputs > 0) {
      this.accuracy = parseFloat(((this.correctInputs / this.totalInputs) * 100).toFixed(1));
    }
  }

  draw() {
    this.bgGfx.clear();
    this.letterGfx.clear();

    // Dark floor background
    this.bgGfx.rect(0, CONFIG.groundY, CONFIG.width, CONFIG.height).fill('#0a0a0a');

    // Energy bar
    const barW = CONFIG.width;
    const barH = 10;
    const barX = 0;
    const barY = this.y - 60;
    this.bgGfx.rect(barX, barY, barW, barH).stroke({ color: '#333333', width: 1 });
    const energyColor = this.isFrenzy ? '#ff4500' : '#70c947';
    const fillW = (this.energy / this.maxEnergy) * barW;
    const fillX = CONFIG.width / 2 - fillW / 2;
    this.bgGfx.rect(fillX, barY, fillW, barH).fill(energyColor);
    if (this.isFrenzy) {
      this.bgGfx.rect(barX, barY, barW, barH).stroke({ color: '#ffffff', width: 2 });
    }

    // Word letters
    const word = this.currentWord;
    const letterSpacing = 28;
    const totalWidth = word.length * letterSpacing;
    const startX = this.x - totalWidth / 2 + letterSpacing / 2;

    // Hide excess letter slots
    this.letterTexts.forEach((t, i) => { t.visible = i < word.length; });

    for (let i = 0; i < word.length; i++) {
      const lt = this.letterTexts[i];
      lt.visible = true;
      lt.x = startX + i * letterSpacing;
      lt.y = this.y - 6;
      lt.text = (word[i] === ' ' && i < this.typedIndex) ? '_' : word[i];
      lt.style.fill = i < this.typedIndex ? '#70c947' : '#555555';
    }

    // Stats text
    this.comboText.text = `COMBO: ${this.combo}`;
    this.comboText.style.fill = this.combo > 10 ? '#ff4500' : '#ffffff';
    this.wpmText.text = `WPM: ${this.wpm}`;
    this.accuracyText.text = `Accuracy: ${this.accuracy}%`;
    this.dpsText.text = `DPS: ${this.dps}`;
  }
}

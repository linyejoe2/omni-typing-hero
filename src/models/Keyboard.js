import { Container, Graphics, Text } from 'pixi.js';
import { CONFIG } from '../CONST.js';
import { roundRectGfx } from '../util.js';

export class Keyboard {
  constructor() {
    this.keys = {};
    this.rows = [
      ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
      ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
      ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
      ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'FN', 'Ctrl'],
    ];

    this.upperAlphabet = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    this.loserAlphabet = 'qwertyuiopasdfghjklzxcvbnm';

    this.shiftMap = {
      '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
      '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
      '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|',
      ';': ':', "'": '"', ',': '<', '.': '>', '/': '?',
    };
    this.transMap = { Control: 'Ctrl', CapsLock: 'Caps', ' ': 'Space', Escepe: 'ESC' };

    const keyList = [...this.rows.flat(), ...this.upperAlphabet.split(''), ...Object.values(this.shiftMap)];
    keyList.forEach(char => { this.keys[char] = { pressed: false, animation: 0 }; });

    this.lastKeyPressed = null;
    this.isShift = false;
    this.isCaps = false;
    this.x = CONFIG.width / 2;
    this.y = CONFIG.groundY + 80;

    // Pixi objects
    this.container = new Container();
    this.gfx = new Graphics(); // for key backgrounds / borders
    this.container.addChild(this.gfx);

    // One Text per unique key label
    this.keyTextMap = {};
    const allLabels = new Set(this.rows.flat());
    allLabels.forEach(char => {
      const t = new Text({
        text: char,
        style: { fontFamily: 'Arial', fontSize: char.length > 1 ? 9 : 13, fontWeight: 'bold', fill: '#ffffff' },
      });
      t.anchor.set(0.5, 0.5);
      this.container.addChild(t);
      this.keyTextMap[char] = t;
    });

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!e.key) return;
      const key = e.key;
      const displayKey = key in this.transMap ? this.transMap[key] : key;
      if (this.keys[displayKey]) { this.keys[displayKey].pressed = true; this.keys[displayKey].animation = 1.0; }
      if (key === 'Shift') { this.isShift = true; return; }
      if (key === 'Tab') { e.preventDefault(); return; }
      if (key === 'Alt') { e.preventDefault(); return; }
      this.isCaps = e.getModifierState('CapsLock');
      const isChar = /^[ -~]+$/.test(key);
      if (key.length < 1 || isChar || key === 'Escape') {
        if (this.onKeyPress) { this.lastKeyPressed = key; this.onKeyPress(key); }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (!e.key) return;
      if (e.key === 'Shift') this.isShift = false;
      if (this.keys[e.key]) this.keys[e.key].pressed = false;
    });
  }

  getDisplayChar(char) {
    if (!this.isShift && !this.isCaps) return char;
    if (this.isShift && this.shiftMap[char]) return this.shiftMap[char];
    if (char.length === 1 && this.loserAlphabet.includes(char)) {
      return (this.isCaps !== this.isShift) ? char.toUpperCase() : char.toLowerCase();
    }
    return char;
  }

  update() {
    for (const char in this.keys) {
      if (this.keys[char].animation > 0) this.keys[char].animation -= 0.05;
    }
  }

  draw() {
    const keySize = 30;
    const spacing = 6;
    const specialWidths = {
      Backspace: 2.5, Tab: 1.5, Caps: 1.75, Enter: 2.25, Shift: 2.75, Space: 6,
      Win: 1.25, Alt: 1.25, Ctrl: 1.5, ESC: 1.25,
    };

    this.gfx.clear();

    // Hide all key texts first, then show/position used ones
    Object.values(this.keyTextMap).forEach(t => { t.visible = false; });

    this.rows.forEach((row, rIdx) => {
      let totalRowWidth = 0;
      row.forEach(char => { totalRowWidth += (keySize * (specialWidths[char] || 1)) + spacing; });
      totalRowWidth -= spacing;

      let currentX = this.x - totalRowWidth / 2;
      const y = this.y + rIdx * (keySize + spacing);

      row.forEach(rawChar => {
        const char = this.getDisplayChar(rawChar);
        const wMult = specialWidths[char] || specialWidths[rawChar] || 1;
        const currentW = keySize * wMult;
        const keyState = this.keys[char] || { animation: 0, pressed: false };

        // Background
        let bgColor = '#1a1a1a';
        if (char === 'Caps' && this.isCaps) bgColor = '#ff4500';
        roundRectGfx(this.gfx, currentX, y, currentW, keySize, 4, bgColor);

        // Highlight layer
        if (keyState.animation > 0) {
          roundRectGfx(this.gfx, currentX, y, currentW, keySize, 4, { color: '#ff4500', alpha: keyState.animation });
        }

        // Border
        roundRectGfx(this.gfx, currentX, y, currentW, keySize, 4, undefined, '#8b0000', 1);
        if (keyState.animation > 0) {
          roundRectGfx(this.gfx, currentX, y, currentW, keySize, 4, undefined, '#ffffff', 2);
        }

        // Key label text
        const textKey = this.keyTextMap[rawChar];
        if (textKey) {
          textKey.visible = true;
          textKey.x = currentX + currentW / 2;
          textKey.y = y + keySize / 2;
          textKey.text = char;
          textKey.style.fontSize = char.length > 1 ? 9 : 13;
        }

        currentX += currentW + spacing;
      });
    });
  }
}

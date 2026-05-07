import { CONFIG } from "../CONST.js";
import { roundRect } from "../util.js";

export class Keyboard {
  constructor() {
    // 1. 儲存按鍵狀態與動畫進度
    this.keys = {}; // 格式: { 'A': { pressed: false, alpha: 0 } }

    this.rows = [
      ["ESC", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"], // Row 0
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],       // Row 1
      ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],       // Row 2
      ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],        // Row 3
      ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],          // Row 4
      ["Ctrl", "Win", "Alt", "Space", "Alt", "FN", "Ctrl"]                         // Row 5
    ];

    this.upperAlphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";
    this.loserAlphabet = "qwertyuiopasdfghjklzxcvbnm";

    this.shiftMap = {
      "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
      "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
      "-": "_", "=": "+", "[": "{", "]": "}", "\\": "|",
      ";": ":", "'": '"', ",": "<", ".": ">", "/": "?"
    };

    this.transMap = {
      "Control": "Ctrl",
      "CapsLock": "Caps",
      " ": "Space",
      "Escepe": "ESC",
    }

    // // 初始化所有字母鍵與特殊鍵
    const keyList = [
      // 1. 鍵盤配置：直接拍平 (Row 0 ~ Row 5)
      ...this.rows.flat(),

      // 2. 大寫字母：拆解為獨立字元
      ...this.upperAlphabet.split(''),

      // 3. 符號映射：僅提取 Value (例如 !, @, #, $, ...)
      ...Object.values(this.shiftMap)
    ];
    keyList.forEach(char => {
      this.keys[char] = { pressed: false, animation: 0 };
    });

    this.lastKeyPressed = null;
    this.isShift = false;
    this.isCaps = false;

    // 視覺位置 (放在對戰區與鍵盤區中間)
    this.x = CONFIG.width / 2; // 假設畫布寬 800，置中為 400
    this.y = CONFIG.groundY + 80;

    // 3. 綁定事件監聽
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!e.key) return;
      let key = e.key;

      const displayKey = key in this.transMap ? this.transMap[key] : key;

      if (this.keys[displayKey]) {
        this.keys[displayKey].pressed = true;
        this.keys[displayKey].animation = 1.0; // 動態啟動 (1.0 代表 100% 亮度)
      }

      // 處理 Shift 邏輯
      if (key === "Shift") {
        this.isShift = true;
        return
      }

      if (key === "Tab") {
        e.preventDefault();
        return;
      }

      if (key === "Alt") {
        e.preventDefault();
        return;
      }

      this.isCaps = e.getModifierState("CapsLock");

      const isChar = /^[ -~]+$/.test(key);
      if (key.length < 1 || isChar || key == "Escape") {
        if (this.onKeyPress) {
          this.lastKeyPressed = key;
          this.onKeyPress(key);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!e.key) return;
      const char = e.key;

      if (char === "Shift") {
        this.isShift = false;
      }
      if (this.keys[char]) {
        this.keys[char].pressed = false;
      }
    });
  }

  getDisplayChar(char) {
    if (!this.isShift && !this.isCaps) return char

    // 處理數字與符號鍵 (僅受 Shift 影響)
    if (this.isShift && this.shiftMap[char]) {
      return this.shiftMap[char];
    }

    // 處理英文字母 (受 Shift 與 CapsLock 共同影響)
    if (char.length === 1 && this.loserAlphabet.includes(char)) {
      // 如果 Shift 和 CapsLock 同時開啟，會「負負得正」變回小寫
      const shouldUppercase = this.isCaps !== this.isShift;
      return shouldUppercase ? char.toUpperCase() : char.toLowerCase();
    }

    // 其他特殊按鍵 (ESC, Space 等) 直接回傳原文字
    return char;
  }

  /**
   * 更新動畫邏輯 (由 Scene 每一幀呼叫)
   */
  update() {
    // 讓按鍵按下的高亮特效隨時間淡出 (每幀減少 0.05)
    for (let char in this.keys) {
      if (this.keys[char].animation > 0) {
        this.keys[char].animation -= 0.05;
      }
    }
  }

  /**
   * 繪製虛擬鍵盤
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    ctx.save();
    ctx.textAlign = "center";

    const keySize = 30;
    const spacing = 6; // 稍微縮小間距，讓 80% 鍵盤不會太寬

    // 寬度定義表 (以 keySize 為單位的倍數)
    const specialWidths = {
      "Backspace": 2.5, "Tab": 1.5, "Caps": 1.75, "Enter": 2.25, "Shift": 2.75, "Space": 6,
      "Win": 1.25, "Alt": 1.25, "Ctrl": 1.5, "ESC": 1.25
    };

    this.rows.forEach((row, rIdx) => {
      // --- 步驟 A: 先計算這一行總寬度 (用於置中) ---
      let totalRowWidth = 0;
      row.forEach(char => {
        const wMult = specialWidths[char] || 1;
        totalRowWidth += (keySize * wMult) + spacing;
      });
      totalRowWidth -= spacing; // 扣掉最後一個間距

      let currentX = this.x - (totalRowWidth / 2);

      // F1-F12 那一行跟下面拉開一點距離
      // const yGap = (rIdx === 0) ? 15 : 0;
      const y = this.y + rIdx * (keySize + spacing);

      row.forEach(char => {
        char = this.getDisplayChar(char);

        const wMult = specialWidths[char] || 1;
        const currentW = keySize * wMult;
        const keyState = this.keys[char] || { animation: 0, pressed: false };

        // --- 1. 繪製背景 ---
        ctx.fillStyle = "#1a1a1a";
        // 如果是 CapsLock 且正在作用中，變色
        if (char === "Caps" && this.isCaps) ctx.fillStyle = "#ff4500";

        roundRect(ctx, currentX, y, currentW, keySize, 4, true, false);

        // --- 2. 繪製動畫高亮層 ---
        if (keyState.animation > 0) {
          ctx.fillStyle = `rgba(255, 69, 0, ${keyState.animation})`;
          roundRect(ctx, currentX, y, currentW, keySize, 4, true, false);
        }

        // --- 3. 繪製外框 ---
        ctx.strokeStyle = "#8b0000";
        ctx.lineWidth = 1;
        roundRect(ctx, currentX, y, currentW, keySize, 4, false, true);
        ctx.strokeStyle = `rgba(255, 255, 255, ${keyState.animation})`;
        ctx.lineWidth = 2;
        roundRect(ctx, currentX, y, currentW, keySize, 4, false, true);

        // --- 4. 繪製文字 ---
        ctx.fillStyle = "#fff";
        // 根據鍵位大小縮放字體
        const fontSize = char.length > 1 ? 10 : 14;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(char, currentX + currentW / 2, y + keySize / 2 + 5);

        // 累加 X 座標
        currentX += currentW + spacing;
      });
    });

    ctx.restore();
  }
}
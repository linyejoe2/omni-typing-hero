import { CONFIG } from "../CONST.js";

export class Keyboard {
  constructor() {
    // 1. 儲存按鍵狀態與動畫進度
    this.keys = {}; // 格式: { 'A': { pressed: false, alpha: 0 } }
    this.rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    this.lastKeyPressed = null;

    // 2. 初始化按鍵資料結構
    this.rows.join('').split('').forEach(char => {
      this.keys[char] = { pressed: false, animation: 0 };
    });


    // 視覺位置 (放在對戰區與鍵盤區中間)
    this.x = CONFIG.width / 2; // 假設畫布寬 800，置中為 400
    this.y = CONFIG.height * 0.7;

    // 3. 綁定事件監聽
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!e.key) return;
      const char = e.key.toUpperCase();
      if (this.keys[char]) {
        this.keys[char].pressed = true;
        this.keys[char].animation = 1.0; // 動態啟動 (1.0 代表 100% 亮度)
        this.lastKeyPressed = char;
      }
      if (this.onKeyPress) {
        this.onKeyPress(char);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!e.key) return;
      const char = e.key.toUpperCase();
      if (this.keys[char]) {
        this.keys[char].pressed = false;
      }
    });
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

    this.rows.forEach((row, rIdx) => {
      // 計算每一行置中的起始位置
      const keySize = 35;
      const spacing = 10;
      const totalWidth = row.length * (keySize + spacing);
      const xStart = (this.x) - (totalWidth / 2);
      const y = this.y + rIdx * (keySize + spacing); // 調整至畫面底部

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const keyState = this.keys[char];
        const x = xStart + i * (keySize + spacing);

        // --- 繪製按鍵背景 ---
        // 基礎顏色為深灰，當按下或有動畫殘影時轉為橙色
        const opacity = keyState.animation;
        ctx.fillStyle = `rgba(26, 26, 26, 1)`; // 基礎底色
        ctx.fillRect(x, y, keySize, keySize);

        // 動畫高亮層 (使用亮橙色)
        if (opacity > 0) {
          ctx.fillStyle = `rgba(255, 69, 0, ${opacity})`;
          ctx.fillRect(x, y, keySize, keySize);
        }

        // --- 繪製外框 ---
        ctx.strokeStyle = keyState.pressed ? "#ff4500" : "#8b0000";
        ctx.lineWidth = keyState.pressed ? 2 : 1;
        ctx.strokeRect(x, y, keySize, keySize);

        // --- 繪製文字 ---
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(char, x + keySize / 2, y + 23);
      }
    });
    ctx.restore();
  }
}
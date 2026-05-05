import { CONFIG } from "../CONST.js";

export class Keyboard {
  constructor() {
    // 1. 儲存按鍵狀態與動畫進度
    this.keys = {}; // 格式: { 'A': { pressed: false, alpha: 0 } }
    this.upperRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    this.lowerRows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    this.rows = this.lowerRows
    this.lastKeyPressed = null;



    this.isShift = false;
    this.isCaps = false;

    // 初始化所有字母鍵與特殊鍵
    const allChars = [...this.upperRows.join(''), ...this.lowerRows.join('')
      // ];
      , 'Shift', 'CapsLock'];
    allChars.forEach(char => {
      this.keys[char] = { pressed: false, animation: 0 };
    });


    // 視覺位置 (放在對戰區與鍵盤區中間)
    this.x = CONFIG.width / 2; // 假設畫布寬 800，置中為 400
    this.y = CONFIG.height * 0.75;

    // 3. 綁定事件監聽
    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (!e.key) return;
      const char = e.key;

      // 處理 Shift 邏輯
      if (char === "Shift") {
        this.isShift = true;
        this.updateKeyboardCase();
        return
      }

      // 處理 CapsLock 邏輯 (Toggle 開關)
      if (char === "CapsLock") {
        this.isCaps = !this.isCaps;
        this.updateKeyboardCase();
        return
      }

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
      const char = e.key;

      if (char === "Shift") {
        this.isShift = false;
      }
      if (this.keys[char]) {
        this.keys[char].pressed = false;
      }

      this.updateKeyboardCase();
    });
  }

  /**
 * 判斷當前應該顯示大寫還是小寫
 */
  updateKeyboardCase() {
    // 邏輯：Shift 與 CapsLock 異或 (XOR) 會決定大小寫
    // 如果 Shift 按住且 Caps 沒開 -> 大寫
    // 如果 Shift 沒按且 Caps 有開 -> 大寫
    // 如果 兩個都開 -> 小寫 (這是一般鍵盤行為)
    const isUpper = this.isShift !== this.isCaps;
    this.rows = isUpper ? this.upperRows : this.lowerRows;
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

    const keySize = 35;
    const spacing = 10;

    // --- 繪製 CapsLock 和 Shift (放在鍵盤左側) ---
    const specialKeys = [
      { char: "CapsLock", label: "Caps", yOff: 1, active: this.isCaps },
      { char: "Shift", label: "Shift", yOff: 2, active: this.isShift }
    ];

    specialKeys.forEach(sk => {
      const x = (this.x) - (this.rows[0].length * (keySize + spacing) / 2) - 60;
      const y = this.y + sk.yOff * (keySize + spacing);
      const state = this.keys[sk.char];

      // 背景與高亮
      ctx.fillStyle = sk.active ? "#ff4500" : "#1a1a1a";
      ctx.fillRect(x, y, 50, keySize);

      if (state.animation > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.animation * 0.3})`;
        ctx.fillRect(x, y, 50, keySize);
      }

      // 外框
      ctx.strokeStyle = state.pressed ? "#fff" : "#8b0000";
      ctx.strokeRect(x, y, 50, keySize);

      // 文字
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Arial";
      ctx.fillText(sk.label, x + 25, y + 23);
    });

    this.rows.forEach((row, rIdx) => {
      // 計算每一行置中的起始位置
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

        // --- 繪製外框 ---
        ctx.strokeStyle = "#8b0000";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, keySize, keySize);

        // 動畫高亮層 (使用亮橙色)
        if (opacity > 0) {
          ctx.fillStyle = `rgba(255, 69, 0, ${opacity})`;
          ctx.fillRect(x, y, keySize, keySize);

          ctx.strokeStyle = `rgba(255, 69, 0, ${opacity * 2})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, keySize, keySize);
        }


        // --- 繪製文字 ---
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Arial";
        ctx.fillText(char, x + keySize / 2, y + 23);
      }
    });
    ctx.restore();
  }
}
import { CONFIG } from "../CONST.js";
import { dictionary } from "../services/DictionaryManager.js";

export class TextInput {
  constructor(config = {}) {
    // this.wordList = ["START", "Fire Ball", "Magic", "Crystal", "Dragon", "Knight", "Castle", "OMNI", "Typing", "HERO"];
    // this.currentWord = this.wordList.shift();
    this.currentWord = "";
    this.typedIndex = 0;

    // 各種統計數值
    this.startTime = Date.now();
    this.lastInputTime = Date.now(); // 最後一次按鍵的時間
    this.combo = 0;
    this.maxCombo = 0;
    this.wpm = 0;
    this.topWpm = 0;
    this.typedChars = 0;      // 累計打對的字數（計算 WPM 用）
    this.totalActiveTime = 0; // 實際在打字的總毫秒數
    this.isPaused = true; // 預設暫停，直到第一次按鍵
    this.totalInputs = 0;      // 總按鍵次數 (正確 + 錯誤)
    this.correctInputs = 0;    // 正確按鍵次數
    this.accuracy = 100;       // 平均準確度 (%)
    this.totalDamage = 0;      // 累計傷害
    this.dps = 0;              // 每秒傷害

    // 視覺位置 (放在對戰區與鍵盤區中間)
    this.x = config.x || CONFIG.width / 2; // 假設畫布寬 800，置中為 400
    this.y = CONFIG.groundY + 63;

    // 初始獲取單字
    this._fetchNewWord();

    // 狂暴模式與能量條
    this.energy = 0;          // 0 ~ 100
    this.maxEnergy = config.maxEnergy || 50;
    this.isFrenzy = false;
    this.frenzyTimer = 0;     // 狂暴剩餘時間
    this.frenzyDuration = 10; // 持續 10 秒
  }

  /**
   * 獲取新單字
   * 你可以根據需求修改這個來源 (API 或 本地詞庫)
   */
  async _fetchNewWord() {// 從已經緩存好的字典中抽字
    this.currentWord = dictionary.getRandomWord();
    this.typedIndex = 0;
  }

  /**
   * 處理按鍵輸入邏輯
   * @param {string} char 按下的字元
   * @returns {string|boolean} 回傳結果類型供 Scene 觸發效果
   */
  handleInput(char) {
    const now = Date.now();
    const expectedChar = this.currentWord[this.typedIndex];

    // 無論對錯，總輸入次數都增加
    this.totalInputs++;

    if (char === expectedChar) {
      this.lastInputTime = now;

      this.correctInputs++; // 正確計數增加
      this.typedIndex++;
      this.typedChars++;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);

      // 計算準確度
      this.updateAccuracy();

      // 非狂暴模式下才增加能量
      if (!this.isFrenzy) {
        this.energy += 1; // 每對一字加 2%
        if (this.energy >= this.maxEnergy) {
          this.triggerFrenzy();
        }
      }

      // 檢查是否完成單字
      if (this.typedIndex >= this.currentWord.length) {
        this._fetchNewWord();
        // 如果在狂暴模式，回傳強化的攻擊訊號
        return this.isFrenzy ? "WORD_COMPLETE_CRIT" : "WORD_COMPLETE";
        // return "WORD_COMPLETE"; // 觸發攻擊
      }
      return "CHAR_CORRECT"; // 觸發小特效
    } else {
      this.combo = 0;

      // 計算準確度
      this.updateAccuracy();

      // 非狂暴模式下才減少能量
      if (!this.isFrenzy) {
        this.energy -= 3; // 每對一字加 2%
        this.energy = Math.max(0, this.energy);
        if (this.energy >= this.maxEnergy) {
          this.triggerFrenzy();
        }
      }
      return "CHAR_WRONG"; // 打錯字
    }
  }

  /**
 * 當 Hero 發射火球或造成傷害時，由外部調用此方法
 * @param {number} amount 傷害數值
 */
  recordDamage(amount) {
    this.totalDamage += amount;
  }

  triggerFrenzy() {
    this.isFrenzy = true;
    this.frenzyTimer = this.frenzyDuration;
  }

  update() {
    this.updateStats()

    if (this.isFrenzy) {
      // 狂暴模式：能量條慢慢消退
      this.frenzyTimer -= 1 / 60; // 假設 60 FPS
      this.energy = (this.frenzyTimer / this.frenzyDuration) * this.maxEnergy;

      if (this.frenzyTimer <= 0) {
        this.isFrenzy = false;
        this.energy = 0;
      }
    }
  }

  updateStats() {
    const now = Date.now();
    const deltaTime = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;

    const totalSeconds = this.totalActiveTime / 1000;

    // 2. 計算 DPS (總傷害 / 總有效秒數)
    this.dps = Math.floor(this.totalDamage / totalSeconds) || 0;

    // --- WPM 計算邏輯 ---
    // 如果距離上次輸入在一秒內，代表正在打字，累加有效時間
    if (now - this.lastInputTime < 1000) {
      this.totalActiveTime += deltaTime;
      this.isPaused = false;
    } else {
      this.isPaused = true; // 超過一秒沒動，進入暫停狀態
    }

    if (this.totalActiveTime <= 0) return;

    // 將有效毫秒數換算成分鐘
    const minutes = this.totalActiveTime / 60000;

    // 計算目前的 WPM
    this.wpm = Math.floor((this.typedChars / 5) / minutes) || 0;

    // 更新歷史最高 WPM
    if (this.wpm > this.topWpm) {
      this.topWpm = this.wpm;
    }
  }

  updateAccuracy() {
    if (this.totalInputs > 0) {
      this.accuracy = parseFloat(((this.correctInputs / this.totalInputs) * 100).toFixed(1));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, 600);
    ctx.textAlign = "center";
    ctx.font = "bold 40px 'Courier New'";

    let word = this.currentWord;
    const letterSpacing = 28;
    const totalWidth = word.length * letterSpacing;
    const startX = this.x - totalWidth / 2 + letterSpacing / 2;

    for (let i = 0; i < word.length; i++) {
      // 已打過的字用橘紅色，未打的用灰色
      ctx.fillStyle = i < this.typedIndex ? "#70c947" : "#555";

      // 加上一點文字陰影增加立體感
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;

      let t = word[i]
      if (word[i] == " " && i < this.typedIndex) t = "_"

      ctx.fillText(t, startX + i * letterSpacing, this.y - 6);
    }
    ctx.restore();

    this.drawStats(ctx);
    this.drawEnergyBar(ctx);
  }

  drawStats(ctx) {
    ctx.save();
    // 顯示在鍵盤左側 (參考你之前 Keyboard 的 x, y)
    const statsX = 10;
    const statsY = CONFIG.groundY + 40;

    ctx.textAlign = "left";
    ctx.font = "16px 'Courier New'";

    // Combo 數字
    ctx.fillStyle = this.combo > 10 ? "#ff4500" : "#fff";
    ctx.fillText(`COMBO: ${this.combo}`, statsX, statsY);

    // WPM 數字
    // ctx.fillStyle = this.isPaused ? "#555" : "#aaa";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`WPM: ${this.wpm}`, statsX, statsY + 20);

    // ctx.fillStyle = "#ffffff";
    // ctx.fillText(`TOP WPM: ${this.topWpm}`, statsX, statsY + 40);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Accuracy: ${this.accuracy}%`, statsX, statsY + 40);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`DPS: ${this.dps}`, statsX, statsY + 60);

    ctx.restore();
  }

  drawEnergyBar(ctx) {
    ctx.save();
    const barWidth = CONFIG.width;
    // const barWidth = 400
    const barHeight = 10;
    const centerX = CONFIG.width / 2;
    const centerY = this.y - 60; // 放在單字下方

    // 外框
    ctx.strokeStyle = "#333";
    ctx.strokeRect(centerX - barWidth / 2, centerY, barWidth, barHeight);

    // 能量條顏色：狂暴時變橘紅色
    ctx.fillStyle = this.isFrenzy ? "#ff4500" : "#70c947";

    // 計算長度（從中間往兩邊）
    const currentBarWidth = (this.energy / this.maxEnergy) * barWidth;
    ctx.fillRect(centerX - currentBarWidth / 2, centerY, currentBarWidth, barHeight);

    // 狂暴模式裝飾：發光效果
    if (this.isFrenzy) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff4500";
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(centerX - barWidth / 2, centerY, barWidth, barHeight);
    }
    ctx.restore();
  }
}
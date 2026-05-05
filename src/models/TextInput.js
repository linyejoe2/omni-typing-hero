import { CONFIG } from "../CONST.js";
import { fetchNewWord } from "../services/randomWordAPI.js";

export class TextInput {
  constructor(config = {}) {
    this.currentWord = "START";
    this.typedIndex = 0;
    this.isGameOver = false;

    // 視覺位置 (放在對戰區與鍵盤區中間)
    this.x = config.x || CONFIG.width / 2; // 假設畫布寬 800，置中為 400
    this.y = config.y || CONFIG.height * 0.65;

    // 初始獲取單字
    // this._fetchNewWord();
  }

  /**
   * 獲取新單字
   * 你可以根據需求修改這個來源 (API 或 本地詞庫)
   */
  async _fetchNewWord() {
    const words = ["FIREBALL", "MAGIC", "CRYSTAL", "DRAGON", "KNIGHT", "CASTLE", "POTION"];
    this.currentWord = await fetchNewWord() || words[Math.floor(Math.random() * words.length)];
    // this.currentWord = "a";
    this.typedIndex = 0;
  }

  /**
   * 處理按鍵輸入邏輯
   * @param {string} char 按下的字元
   * @returns {string|boolean} 回傳結果類型供 Scene 觸發效果
   */
  handleInput(char) {
    if (this.isGameOver) return "RESTART";

    const expectedChar = this.currentWord[this.typedIndex].toUpperCase();

    if (char === expectedChar) {
      this.typedIndex++;

      // 檢查是否完成單字
      if (this.typedIndex >= this.currentWord.length) {
        const finishedWord = this.currentWord;
        this._fetchNewWord();
        return "WORD_COMPLETE"; // 觸發攻擊
      }
      return "CHAR_CORRECT"; // 觸發小特效
    } else {
      return "CHAR_WRONG"; // 打錯字
    }
  }

  draw(ctx) {
    if (!this.isGameOver) {
      ctx.save();
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, CONFIG.groundY, CONFIG.width, 300);
      ctx.textAlign = "center";
      ctx.font = "bold 40px 'Courier New'";

      const word = this.currentWord;
      const letterSpacing = 28;
      const totalWidth = word.length * letterSpacing;
      const startX = this.x - totalWidth / 2 + letterSpacing / 2;

      for (let i = 0; i < word.length; i++) {
        // 已打過的字用橘紅色，未打的用灰色
        ctx.fillStyle = i < this.typedIndex ? "#ff4500" : "#555";

        // 加上一點文字陰影增加立體感
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;

        ctx.fillText(word[i], startX + i * letterSpacing, this.y);
      }
      ctx.restore();
    } else {
      // 死亡畫面遮罩
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = "#ff0000";
      ctx.font = "bold 60px 'Courier New'";
      ctx.textAlign = "center";
      ctx.fillText("戰死沙場", ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);

      ctx.fillStyle = "#fff";
      ctx.font = "20px 'Courier New'";
      ctx.fillText("按下任何鍵重新開始", ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
      ctx.restore();
    }
  }
}
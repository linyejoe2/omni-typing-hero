import { CONFIG } from "../CONST.js";
import { fetchNewWord } from "../services/randomWordAPI.js";

export class TextInput {
  constructor(config = {}) {
    this.wordList = ["START", "Fire Ball", "Magic", "Crystal", "Dragon", "Knight", "Castle", "OMNI", "Typing", "HERO"];
    this.currentWord = this.wordList.shift();
    this.typedIndex = 0;

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
    this.currentWord = this.wordList.shift();
    this.typedIndex = 0;
    while (this.wordList.length < 5) {
      this.wordList.push(await fetchNewWord());
    }
  }

  /**
   * 處理按鍵輸入邏輯
   * @param {string} char 按下的字元
   * @returns {string|boolean} 回傳結果類型供 Scene 觸發效果
   */
  handleInput(char) {
    const expectedChar = this.currentWord[this.typedIndex];

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
    ctx.save();
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, 300);
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

      ctx.fillText(t, startX + i * letterSpacing, this.y);
    }
    ctx.restore();
  }
}
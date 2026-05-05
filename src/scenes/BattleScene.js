import { Scene } from './BaseScene.js';
import { CONFIG } from '../CONST.js';
import { Kooni } from '../models/Monster/Kooni.js';
import { Mage } from '../models/Hero/Mage.js';
import { Keyboard } from '../models/Keyboard.js';
import { TextInput } from '../models/TextInput.js';
import { DamageNumber } from '../models/Effect/DamageNumber.js';

export class BattleScene extends Scene {
  constructor(canvas, charData) { // 建議把角色資料傳進來
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // 初始化該場景需要的資料
    this.charData = charData;

    // gamestate
    this.hearts = CONFIG.maxHearts;
    this.gold = 0;
    this.isGameOver = false;
    this.monster = { hp: CONFIG.monsterMaxHP, rage: 0 };
    this.currentWord = "";
    this.typedIndex = 0;
    this.lastKeyPressed = "";

    this.hero = this.createHero(charData);
    this.monster = new Kooni({
      hp: 100,
      x: 650,
      y: CONFIG.groundY - 20,
      rageThreshold: 5
    });
    this.monsterRebirthCountDown = 15;

    this.textInput = new TextInput();
    this.keyboard = new Keyboard();
    this.projectiles = []
    this.enemyProjectiles = []; // 存放所有 EnemyProjectile
    this.particles = []; // 存放拖尾與爆炸粒子
    this.damageNumbers = []; // 傷害數字

    this.shakeTime = 0; // 震動剩餘幀數
    this.shakeIntensity = 50; // 震動強度

    // 重要：連結鍵盤與輸入邏輯
    this.keyboard.onKeyPress = (char) => {
      const result = this.textInput.handleInput(char);

      if (result === "WORD_COMPLETE") {
        // 單字完成！英雄發動攻擊
        const projectile = this.hero.attack(this.monster.x, this.monster.y);
        if (projectile) this.projectiles.push(projectile);
      } else if (result === "RESTART") {
        this.resetGame();
      }
    };

  }

  createHero(data) {
    switch (data.job) {
      case 'MAGE': return new Mage(data);
      // case 'SWORDSMAN': return new Swordsman(data);
      default: return new Mage(data); // 預設
    }
  }

  // 1. 邏輯更新：處理物理、碰撞、計數
  update() {
    // 暫時留空，或在這裡呼叫 hero.update()
    // console.log("BattleScene Updating...");
    // console.log(this.shakeTime)

    this.monster.update();
    this.hero.update();
    this.keyboard.update();

    if (this.hero.hp <= 0) {
      this.textInput.isGameOver = true;
    }

    // 更新所有投射物的位移
    this.projectiles.forEach((p, index) => {
      const isHit = p.update(this.particles);
      if (isHit) {
        // this.shakeTime = 8; // 設定震動時間（約 0.13 秒）
        console.log("shakeTime", this.shakeTime)
        this.monster.takeDamage(p.damage, p.isCrit); // 怪物受傷

        this.damageNumbers.push(new DamageNumber(
          this.monster.damageNumberX,
          this.monster.damageNumberY,
          p.damage, // 確保 Fireball 有存這項資訊
          p.isCrit
        ));
      }
      if (!p.alive) this.projectiles.splice(index, 1);
    });

    // 2. 統一更新粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      // 修正判斷條件：生命值小於等於 0 就移除
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. 更新傷害數字
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      this.damageNumbers[i].update();
      if (this.damageNumbers[i].life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }

    // 震動倒數
    if (this.shakeTime > 0) {
      this.shakeTime--;
    }

    // 怪物重生
    if (this.monster.status == "DEAD") this.monsterRebirthCountDown--;
    if (this.monsterRebirthCountDown <= 0) {
      this.monster = new Kooni({
        hp: 100,
        x: 650,
        y: CONFIG.groundY - 20,
        rageThreshold: 5
      });
      this.monsterRebirthCountDown = 15;
    }
  }

  // 2. 畫面繪製：只負責畫圖
  // 為了符合 SceneManager 的 draw(ctx)，我們把參數統一
  draw(ctx) {
    // 1. 先清除整個畫布 (最重要，且要在 save 之前)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();

    this.drawUI(ctx);

    // 3. 如果正在震動，對整個畫布進行隨機偏移
    if (this.shakeTime > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(dx, dy);
    }

    // 1. 繪製背景與戰鬥區 (Hero, Monster)
    this.hero.draw(ctx);
    this.monster.draw(ctx);

    // 畫投射物
    this.projectiles.forEach(p => p.draw(ctx));

    this.damageNumbers.forEach(num => num.draw(ctx));

    // 畫粒子 (粒子通常在最上層，或是怪物後方，視你喜好決定順序)
    this.particles.forEach(p => p.draw(ctx));

    // 2. 繪製中間的打字區域
    this.textInput.draw(ctx);

    // 3. 繪製底部的虛擬鍵盤
    this.keyboard.draw(ctx);

    // 這裡你需要持有 hero, monster 等物件的引用才能畫出它們
    // 或者從 GameController 傳進來
    ctx.restore(); // --- 重要：結束後還原狀態，避免影響下一幀 ---
  }

  drawUI(ctx) {
    // 生命值 (心形)
    for (let i = 0; i < CONFIG.maxHearts; i++) {
      ctx.fillStyle = i < this.hearts ? "#ff4444" : "#333";
      // 畫一個簡單的像素心
      const hX = 30 + i * 35;
      const hY = 70;
      ctx.fillRect(hX, hY, 10, 10);
      ctx.fillRect(hX - 5, hY - 5, 10, 10);
      ctx.fillRect(hX + 5, hY - 5, 10, 10);
    }

    ctx.fillStyle = "#d4af37"; ctx.font = "20px 'Courier New'"; ctx.textAlign = "left";
    ctx.fillText(`KOBAN: ${this.charData.gold}`, 30, 40);

    // 怪物的血條與反擊條
    const bw = 200;
    // HP Bar
    ctx.fillStyle = "#333"; ctx.fillRect(550, 25, bw, 12);
    ctx.fillStyle = "#ff4500"; ctx.fillRect(550, 25, (Math.max(0, this.monster.hp / this.monster.maxHp)) * bw, 12);
    // Rage Bar (反擊值)
    ctx.fillStyle = "#222"; ctx.fillRect(550, 42, bw, 6);
    ctx.fillStyle = "#9400d3"; ctx.fillRect(550, 42, (Math.min(this.monster.rageThreshold, this.monster.rage / this.monster.rageThreshold)) * bw, 6);
    ctx.strokeStyle = "#d4af37"; ctx.strokeRect(550, 25, bw, 23);

    // 單字
    if (!this.isGameOver) {
      ctx.textAlign = "center"; ctx.font = "bold 40px 'Courier New'";
      const word = this.currentWord;
      const startX = 300 - (word.length * 28) / 2;
      for (let i = 0; i < word.length; i++) {
        ctx.fillStyle = i < this.typedIndex ? "#ff4500" : "#555";
        ctx.fillText(word[i], startX + i * 28, 380);
      }
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = "#ff0000"; ctx.font = "bold 60px 'Courier New'"; ctx.textAlign = "center";
      ctx.fillText("戰死沙場", 300, 250);
      ctx.fillStyle = "#fff"; ctx.font = "20px 'Courier New'";
      ctx.fillText("按下任何鍵重新開始", 300, 320);
    }

  }
}
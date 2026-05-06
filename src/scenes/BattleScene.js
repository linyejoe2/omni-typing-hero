import { Scene } from './BaseScene.js';
import { CONFIG } from '../CONST.js';
import { Kooni } from '../models/Monster/Kooni.js';
import { Mage } from '../models/Hero/Mage.js';
import { Keyboard } from '../models/Keyboard.js';
import { TextInput } from '../models/TextInput.js';
import { DamageNumber } from '../models/Effect/DamageNumber.js';
import { drawSword } from '../models/Icon/Sword.js';
import { drawCoin } from '../models/Icon/Coin.js';
import { EnemyFireball } from "../models/Projectile/EnemyFireball.js"

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
    this.gold = 0;
    this.isGameOver = false;
    this.restartTimer = 60;
    this.monster = { hp: CONFIG.monsterMaxHP, rage: 0 };

    this.hero = this.createHero();
    this.monster = this.createMonster();
    this.monsterRebirthCountDown = 15;

    this.textInput = new TextInput();
    this.keyboard = new Keyboard();
    this.projectiles = []
    this.enemyProjectiles = []; // 存放所有 EnemyProjectile
    this.particles = []; // 存放拖尾與爆炸粒子
    this.damageNumbers = []; // 傷害數字

    this.shakeTime = 0; // 震動剩餘幀數
    this.shakeIntensity = 5; // 震動強度

    // 重要：連結鍵盤與輸入邏輯
    this.keyboard.onKeyPress = (char) => {
      if (this.isGameOver) this.resetGame();

      const result = this.textInput.handleInput(char);

      if (result.includes("WORD_COMPLETE")) {
        // 單字完成！英雄發動攻擊
        const projectile = this.hero.attack(this.monster.x, this.monster.y, result === "WORD_COMPLETE_CRIT");
        if (projectile) this.projectiles.push(projectile);
      } else if (result === "CHAR_WRONG") {
        this.monster.penalizeMiss();
      }
    };

  }

  createHero() {
    const data = { ...this.charData, onDeath: this.onDeath.bind(this) };
    switch (data.job) {
      case 'MAGE': return new Mage(data);
      // case 'SWORDSMAN': return new Swordsman(data);
      default: return new Mage(data); // 預設
    }
  }

  createMonster() {
    return new Kooni({
      hp: 1000,
      x: 650,
      y: CONFIG.groundY - 20,
      rageThreshold: 50
    });
  }

  // 1. 邏輯更新：處理物理、碰撞、計數
  update() {
    // 暫時留空，或在這裡呼叫 hero.update()
    // console.log("BattleScene Updating...");
    // console.log(this.shakeTime)

    this.monster.update();
    this.hero.update();
    this.keyboard.update();
    this.textInput.update();

    if (this.monster.isAttacking) {
      this.monster.isAttacking = false;
      this.enemyProjectiles.push(new EnemyFireball(this.monster.x, this.monster.y - 30, this.hero.x, this.hero.y - 30));
    }

    // 更新所有投射物的位移
    this.projectiles.forEach((pj, index) => {
      const isHit = pj.update(this.particles);
      if (isHit) {
        // this.shakeTime = 8; // 設定震動時間（約 0.13 秒）
        this.monster.takeDamage(pj.damage, pj.isCrit); // 怪物受傷

        this.damageNumbers.push(new DamageNumber(
          this.monster.damageNumberX,
          this.monster.damageNumberY,
          pj.damage, // 確保 Fireball 有存這項資訊
          pj.isCrit
        ));
      }
      if (!pj.alive) this.projectiles.splice(index, 1);
    });

    // 更新所有敵人投射物的位移
    this.enemyProjectiles.forEach((pj, index) => {
      const isHit = pj.update(this.particles);
      if (isHit) {
        this.shakeTime = 8; // 設定震動時間（約 0.13 秒）
        const dmg = this.hero.takeDamage(this.monster.damage());

        this.damageNumbers.push(new DamageNumber(
          this.hero.x - 25,
          this.hero.y - 30,
          dmg
        ));
      }
      if (!pj.alive) this.enemyProjectiles.splice(index, 1);
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
      this.monster = this.createMonster();
      this.monsterRebirthCountDown = 15;
    }

    if (this.isGameOver && this.restartTimer) {
      this.restartTimer--
    }
  }

  // 2. 畫面繪製：只負責畫圖
  // 為了符合 SceneManager 的 draw(ctx)，我們把參數統一
  draw(ctx) {
    // 1. 先清除整個畫布 (最重要，且要在 save 之前)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();

    this.drawUI(ctx);

    // BattleScene.js -> draw()
    if (this.textInput.isFrenzy) {
      ctx.save();
      // 簡單的紅色覆蓋濾鏡
      ctx.fillStyle = "rgba(255, 69, 0, 0.15)";
      ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

      // 可以在畫面上隨機畫一些火粒子
      this.drawFrenzyParticles(ctx);
      ctx.restore();
    }

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
    this.enemyProjectiles.forEach(p => p.draw(ctx));

    // 繪製傷害數字
    this.damageNumbers.forEach(num => num.draw(ctx));

    // 畫粒子 (粒子通常在最上層，或是怪物後方，視你喜好決定順序)
    this.particles.forEach(p => p.draw(ctx));

    // 2. 繪製中間的打字區域
    this.textInput.draw(ctx);

    // 3. 繪製底部的虛擬鍵盤
    this.keyboard.draw(ctx);

    if (this.isGameOver) this.drawGameOver(ctx)

    ctx.restore(); // --- 重要：結束後還原狀態，避免影響下一幀 ---
  }

  drawUI(ctx) {
    // 血條 金錢
    const bw = 200;
    const bh = 16;
    const infoX = 50; // 與血條對齊
    const infoY = 25;  // Rage Bar 下方的起始高度

    ctx.fillStyle = "#333"; ctx.fillRect(infoX, infoY, bw, bh);
    ctx.fillStyle = "#ff3300"; ctx.fillRect(infoX, infoY, (Math.max(0, this.hero.hp / this.hero.maxHp)) * bw, bh);
    ctx.strokeStyle = "#d4af37"; ctx.strokeRect(infoX, infoY, bw, bh);
    // 繪製血量文字 (置中)
    ctx.save();
    ctx.fillStyle = "#fff"; // 文字顏色
    ctx.font = "bold 10px Arial"; // 根據 bh 調整字體大小
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 設定文字在血條的正中央
    const textX = infoX + bw / 2;
    const textY = infoY + bh / 2 + 1; // +1 是為了視覺上的微調補償
    const hpText = `${Math.ceil(this.hero.hp)} / ${this.hero.maxHp}`;

    // 選擇性：加上深色描邊讓數字更清晰 (防止在紅色背景下看不清楚)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeText(hpText, textX, textY);

    // 填充文字本體
    ctx.fillText(hpText, textX, textY);

    ctx.restore();

    drawCoin(ctx, infoX + 10, infoY + 30)
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px 'Courier New"; ctx.textAlign = "left";
    ctx.fillText(`GOLD: ${this.charData.gold}`, infoX + 30, infoY + 35);

    // 怪物的血條與反擊條
    const mInfoX = 550; // 與血條對齊
    const mInfoY = 58;  // Rage Bar 下方的起始高度
    // HP Bar
    ctx.fillStyle = "#333"; ctx.fillRect(mInfoX, 25, bw, bh);
    ctx.fillStyle = "#ff3300"; ctx.fillRect(mInfoX, 25, (Math.max(0, this.monster.hp / this.monster.maxHp)) * bw, bh);
    // Rage Bar (反擊值)
    ctx.fillStyle = "#222"; ctx.fillRect(mInfoX, 42, bw, 6);
    ctx.fillStyle = "#9400d3"; ctx.fillRect(mInfoX, 42, (Math.min(this.monster.rageThreshold, this.monster.rage / this.monster.rageThreshold)) * bw, 6);
    ctx.strokeStyle = "#d4af37"; ctx.strokeRect(mInfoX, 25, bw, 23);

    // 1. 繪製像素小劍圖示
    drawSword(ctx, mInfoX, mInfoY)

    // 2. 繪製攻擊力文字
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Courier New'";
    ctx.textAlign = "left";
    // 加上 "ATK" 字樣與數值，並稍微往右偏移避開圖示
    ctx.fillText(`ATK: ${this.monster._damage}`, mInfoX + 30, mInfoY + 10);
  }

  drawFrenzyParticles(ctx) {
    // 如果沒有粒子陣列，先初始化一個 (專門給狂暴模式用)
    if (!this.frenzyParticles) this.frenzyParticles = [];

    // 1. 每幀產生新粒子 (產生頻率可以根據需求調整)
    if (Math.random() > 0.4) {
      this.frenzyParticles.push({
        x: Math.random() * ctx.canvas.width,
        y: CONFIG.groundY + 20, // 從畫面底部下方一點點開始
        size: Math.random() * 6 + 4,
        speedY: Math.random() * -4 - 2, // 往上飄的速度
        speedX: (Math.random() - 0.5) * 2, // 輕微左右晃動
        life: 1.0, // 生命週期 1.0 -> 0
        colorType: Math.random() // 用來隨機分配顏色
      });
    }

    // 2. 更新與繪製
    ctx.save();
    for (let i = this.frenzyParticles.length - 1; i >= 0; i--) {
      const p = this.frenzyParticles[i];

      // 更新位置
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= 0.015; // 消失速度

      // 根據生命週期改變顏色 (亮黃 -> 橘紅 -> 深紅)
      let color;
      if (p.life > 0.6) {
        color = "#ffea00"; // 亮黃
      } else if (p.life > 0.3) {
        color = "#ff4500"; // 橘紅
      } else {
        color = "#8b0000"; // 深紅
      }

      // 繪製像素粒子
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      // 粒子越往上越小
      const currentSize = p.size * p.life;
      ctx.fillRect(p.x, p.y, currentSize, currentSize);

      // 移除死亡粒子
      if (p.life <= 0) {
        this.frenzyParticles.splice(i, 1);
      }
    }
    ctx.restore();
  }

  drawGameOver(ctx) {
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

  onDeath() {
    console.log("onDeath!")
    this.isGameOver = true;
    this.textInput = new TextInput();
    this.keyboard = new Keyboard();
  }

  resetGame() {
    if (this.restartTimer) return
    this.isGameOver = false;
    this.restartTimer = 60;
    this.hero = this.createHero();
    return
  }
}
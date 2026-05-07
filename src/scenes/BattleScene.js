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
import { FirebaseService } from '../services/firebase.js';
import { UI } from '../ui/index.js';
import { refreshLeaderboard } from '../ui/LeaderBoard.js';
import { roundRect } from '../util.js';

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

    this.finalStats = {};

    this.isPaused = true;
    this.newGame = true;

    refreshLeaderboard("Kooni")

    // 重要：連結鍵盤與輸入邏輯
    this.keyboard.onKeyPress = async (key) => {

      this.newGame = false;

      if (key === "Escape") {
        if (!this.isPaused) {
          this.pauseGame();
        } else {
          this.resumeGame();
        }
        return;
      }

      if (this.isPaused) {
        if (key === " ") {
          this.resumeGame();
        }
        return; // 暫停時不處理其他戰鬥按鍵
      }

      if (this.isGameOver) {
        // const charData = await FirebaseService.getCharacter(FirebaseService.auth.currentUser.uid);
        // UI.playerPanel.update(charData)
        this.resetGame()
        return
      };
      const result = this.textInput.handleInput(key);

      if (result.includes("WORD_COMPLETE")) {
        // 單字完成！英雄發動攻擊
        const projectile = this.hero.attack(this.monster.x, this.monster.y, result === "WORD_COMPLETE_CRIT");
        if (projectile) this.projectiles.push(projectile);
      } else if (result === "CHAR_WRONG") {
        this.monster.penalizeMiss();
      }
    };
  }

  updateFinalStats() {
    if (Object.keys(this.finalStats).length > 0) return
    this.finalStats = {
      monster: this.monster.name,
      nickname: this.charData.nickname,
      clear: this.monster.status == "DEAD",
      job: this.hero.job,
      gender: this.hero.gender,
      wpm: this.textInput.wpm,
      dps: this.textInput.dps,
      accuracy: Math.round(this.textInput.accuracy * 100) / 100,
      maxCombo: this.textInput.maxCombo,
      seconds: Math.round(this.textInput.totalActiveTime * 10) / 10000
    };
  }

  isGameCleared() {
    return this.monster.hp <= 0;
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
      hp: 250,
      x: 650,
      y: CONFIG.groundY - 20,
      rageThreshold: 50
    });
  }

  onDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.updateFinalStats()

    const user = FirebaseService.auth.currentUser;
    if (!user) return;

    FirebaseService.addBattleRecord(user.uid, this.finalStats);
  }

  onMonsterDie() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.updateFinalStats()

    const user = FirebaseService.auth.currentUser;
    if (!user) return;

    // 1. 執行畫面上提到的 "Save record into leaderboard"
    FirebaseService.addBattleRecord(user.uid, this.finalStats);

    // 2. 更新角色的生涯數據 (Max WPM 等)
    FirebaseService.updatePersonalBest(user.uid, this.finalStats);

    FirebaseService.updateLeaderboard(user.uid, this.finalStats);
  }

  resetGame() {
    if (this.restartTimer) return
    this.isGameOver = false;
    this.restartTimer = 60;
    this.hero = this.createHero();
    this.monster = this.createMonster();
    this.textInput = new TextInput();
    this.keyboard = new Keyboard();
    this.finalStats = {};
    this.isPaused = true;
    this.newGame = true;
    return
  }

  // 1. 邏輯更新：處理物理、碰撞、計數
  update() {
    if (this.isPaused) return;

    if (this.isGameOver && this.restartTimer) {
      this.restartTimer--
      return
    }

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
        this.textInput.recordDamage(pj.damage)

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

    // 怪物死亡
    if (this.monster.status == "DEAD") this.onMonsterDie()
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

    if (this.isPaused) this.drawPause(ctx)

    if (this.isGameOver) this.isGameCleared() ? this.drawGameClear(ctx) : this.drawGameOver(ctx)

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

  drawGameClear(ctx) {
    const { width, height } = ctx.canvas;

    // 1. 通關畫面全螢幕遮罩
    ctx.save();
    ctx.fillStyle = "rgba(63, 63, 63, 0.85)"; // 加深一點背景，讓卡片更突出
    ctx.fillRect(0, 0, width, height);

    // 2. 主標題
    ctx.fillStyle = "#62fd4e"; // 經典通關綠
    ctx.font = "bold 50px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(98, 253, 78, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("You beat the Kooni!", width / 2, height / 2 - 140);
    ctx.shadowBlur = 0; // 重置陰影

    this.drawCardData(ctx)

    ctx.font = "bold 30px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(98, 253, 78, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("You spend " + this.finalStats.seconds + "s", width / 2, height / 2 + 100);
    ctx.shadowBlur = 0; // 重置陰影

    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Courier New'";
    ctx.fillText("Press any key to search another Kooni", width / 2, height / 2 + 200);
    ctx.restore();
  }

  drawGameOver(ctx) {
    const { width, height } = ctx.canvas;

    // 死亡畫面遮罩
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 50px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(98, 253, 78, 0.5)";
    ctx.shadowBlur = 15;
    // ctx.fillText("戰死沙場", ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
    ctx.fillText("You DIE", width / 2, height / 2 - 140);
    ctx.shadowBlur = 0; // 重置陰影

    this.drawCardData(ctx)

    ctx.font = "bold 30px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(98, 253, 78, 0.5)";
    ctx.shadowBlur = 15;
    ctx.fillText("You fell after " + this.finalStats.seconds + "s", width / 2, height / 2 + 100);
    ctx.shadowBlur = 0; // 重置陰影

    ctx.fillStyle = "#d3d3d3";
    ctx.font = "12px 'Courier New'";
    ctx.fillText("Defeat the monster to record your score", width / 2, height / 2 + 150);

    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Courier New'";
    ctx.fillText("Press any key to resurrect", width / 2, height / 2 + 200);
    // ctx.fillText("按下任何鍵重新開始", ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    ctx.restore();
  }

  drawCardData(ctx) {
    const { width, height } = ctx.canvas;

    // 3. 繪製數據卡片 (Max Combo, WPM, DPS, Accuracy)
    const cardData = [
      { label: "MAX COMBO", value: this.finalStats.maxCombo, color: "#ffeb3b" },
      { label: "WPM", value: this.finalStats.wpm, color: "#03a9f4" },
      { label: "DPS", value: this.finalStats.dps, color: "#ff4500" },
      { label: "ACCURACY", value: `${this.finalStats.accuracy}%`, color: "#8bc34a" }
    ];

    const cardW = 140;
    const cardH = 100;
    const gap = 20;
    const totalW = (cardW * 4) + (gap * 3);
    let startX = (width - totalW) / 2;
    const cardY = height / 2 - 60;

    cardData.forEach((data, i) => {
      const x = startX + i * (cardW + gap);

      // 繪製卡片背景 (磨砂玻璃感)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      roundRect(ctx, x, cardY, cardW, cardH, 12, true, true);

      // 標籤文字
      ctx.font = "bold 14px 'Courier New'";
      ctx.fillStyle = "#aaa";
      ctx.fillText(data.label, x + cardW / 2, cardY + 35);

      // 數值文字
      ctx.font = "bold 28px 'Courier New'";
      ctx.fillStyle = data.color;
      ctx.fillText(data.value, x + cardW / 2, cardY + 75);
    });
  }

  pauseGame() {
    this.isPaused = true;
  }

  resumeGame() {
    this.isPaused = false;
  }

  handleMouseDown(e) {
    if (this.isPaused) {
      this.resumeGame();
    }
  }

  drawPause(ctx) {
    const width = CONFIG.width
    const height = CONFIG.height

    // 1. 背景遮罩 (使用深藍色或深紫色，與死亡的紅色區隔)
    ctx.save();
    ctx.fillStyle = "rgba(10, 10, 25, 0.85)";
    ctx.fillRect(0, 0, width, height);

    // 2. 標題：TIME STOPPED
    ctx.fillStyle = "#00d4ff"; // 魔法藍
    ctx.font = "bold 45px 'Courier New'";
    ctx.textAlign = "center";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 15;
    ctx.fillText(this.newGame ? "準備遊戲" : "暫停", width / 2, height / 2 - 100);
    ctx.shadowBlur = 0;

    // 3. 繪製 Tips 框
    const tipBoxW = 400;
    const tipBoxH = 80;
    const boxX = width / 2 - tipBoxW / 2;
    const boxY = height / 2 - 30;

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, tipBoxW, tipBoxH);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(boxX, boxY, tipBoxW, tipBoxH);

    const tipses = [
      "打字擊敗怪物",
      "中間綠色能量條集滿 = 狂暴",
      "按下 ESC 可以暫停"
    ]

    // 4. 顯示隨機 Tip (建議在進入暫停時先選定一個 index，避免 draw loop 每一幀都隨機換)
    ctx.fillStyle = "#d3d3d3";
    ctx.font = "14px 'Courier New'";
    // 假設你將選好的 tip 存在 this.currentTip
    // const tipText = "Tip: 保持節奏比單純求快更能提高 DPS。";
    tipses.forEach((tips, i) => {
      ctx.fillText(tips, width / 2, boxY + (25 + i * 20));
    })

    // 5. 繼續提示
    // 這裡做一個簡單的呼吸燈效果
    const alpha = Math.abs(Math.sin(Date.now() / 500));
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.font = "20px 'Courier New'";
    ctx.fillText(this.newGame ? "按下空白鍵開始戰鬥" : "按下空白鍵繼續", width / 2, height / 2 + 120);

    // ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    // ctx.font = "12px 'Courier New'";
    // ctx.fillText("(Click anywhere to continue)", width / 2, height / 2 + 150);

    ctx.restore();
  }
}
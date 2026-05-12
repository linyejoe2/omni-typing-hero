import { BaseHero } from './BaseHero.js';
import { HeavyShield } from '../Weapon/HeavyShield.js';

export class Defender extends BaseHero {
  constructor(data) {
    super(data);
    this.weapon = new HeavyShield();

    this.heroInfo = [
      "「不動如山的鐵壁，守護同伴的最強護盾。」",
      "職業介紹： 捨棄了靈活性與爆發力，換取極致的生存能力。在厚重的甲冑下，是魔物難以撼動的意志。",
      "戰鬥風格： 極致生存。雖然攻擊節奏較慢，但能承受極高傷害，靠韌性磨死對手。",
      "初始數值： 極高的 VIT 與 DEF，但 STR 與 CRI 成長極低。",
      "推薦人群： 享受「看著敵人打不動我」的玩家。"
    ];

    // 數值設定
    this.baseHpLevel = 6;
    this.baseAtkLevel = 1;
    this.baseCritRateLevel = 2;
    this.baseDefLevel = 6;
    this.baseEvaRateLevel = 0;

    this.growthRates = {
      hp: 10,
      atk: 1,
      crit: 0.002,
      def: 0.015,
      eva: 0.001
    };

    this.palette = {
      primary: "#7f8c8d",      // 深鋼灰
      light: "#bdc3c7",        // 亮鋼
      dark: "#2c3e50",         // 陰影
      skin: this.isFemale ? "#ffe0bd" : "#ffcc91",
      deco: this.isFemale ? "#e74c3c" : "#f1c40f",
      eye: "#2d3436"
    };

    this.updateFinalStats();

    if (import.meta.env.DEV) {
      console.log(`
      Debug: 目前屬性
      HP: ${this.hp}
      ATK: ${this.atk}
      CRI: ${this.critRate}
      DEF: ${this.def}
      EVA: ${this.evaRate}
      `)
    }
  }

  update() {
    super.update();
  }

  renderHero(ctx, xOffset = 0, yOffset = 0) {
    const isAttacking = this.state === 'ATTACKING';

    const time = Date.now();
    let xBreath = xOffset;
    let yBreath = yOffset;

    const config = {
      speed: 0.001,      // 基礎速率 (越大晃越快)
      range: 1.1,        // 晃動幅度 (越大晃越遠)
      chaos: 1.37        // 混亂因子 (用來錯開 X 和 Y 的頻率，建議用質數或不整除的數)
    };
    if (!isAttacking) {
      xBreath += Math.sin(time * config.speed) * config.range;
      yBreath += Math.sin(time * (config.speed * config.chaos) + Math.PI / 2) * config.range;
    }
    const bodyTilt = isAttacking ? -2 : 0;

    // --- 1. 後景裝飾 (性別差異) ---
    ctx.fillStyle = this.palette.deco;
    if (this.isFemale) {// --- 女性：動態長飄帶 ---
      const time = Date.now();
      const ribbonSegments = 5; // 將飄帶分成幾段畫，段數越多越平滑
      const segmentHeight = 35 / ribbonSegments;

      // 左右兩條飄帶
      [-16, 12].forEach(baseX => {
        for (let i = 0; i < ribbonSegments; i++) {
          /**
           * 核心公式說明：
           * 1. Math.sin(time * 0.005 + i * 0.5) : 
           *    i * 0.5 是相位差，讓飄帶下方比上方慢半拍，形成波浪感
           * 2. (i / ribbonSegments) * 6 : 
           *    幅度加成。頂端 (i=0) 幅度是 0，最末端幅度最大 (6px)
           */
          const waveX = Math.sin(time * 0.005 + i * 0.8) * (i / ribbonSegments) * 10;

          ctx.fillRect(
            baseX + xBreath + bodyTilt + waveX, // 加上波浪位移
            -35 + yBreath + (i * segmentHeight), // 每一段的高度位置
            4, // 寬度固定
            segmentHeight + 0.5 // 高度 (多 0.5 像素避免段與段之間的縫隙)
          );
        }
      });
    } else {
      // 男性：厚重的短披風底緣 (增加下盤重量感)
      ctx.fillRect(-24 + xOffset + bodyTilt, -10 + yOffset, 48, 6);
    }


    // --- 2. 身體主體 (盔甲) ---
    ctx.fillStyle = this.palette.primary;
    if (this.isFemale) {
      // 女性：稍微收腰的盔甲塊 (梯形拼接)
      ctx.beginPath();
      ctx.moveTo(-16 + xOffset + bodyTilt, -45 + yOffset);
      ctx.lineTo(16 + xOffset + bodyTilt, -45 + yOffset);
      ctx.lineTo(18 + xOffset + bodyTilt, 0 + yOffset);
      ctx.lineTo(-18 + xOffset + bodyTilt, 0 + yOffset);
      ctx.fill();
    } else {
      // 男性：正方形大塊盔甲 (厚實感)
      ctx.fillRect(-20 + xOffset + bodyTilt, -45 + yOffset, 40, 45);
    }

    // --- 3. 頭盔與裝飾 (性別差異最大處) ---
    ctx.fillStyle = this.palette.dark;
    ctx.fillRect(-10 + xOffset + bodyTilt, -52 + yOffset, 20, 22); // 加高頭盔

    // 頭盔頂部飾品
    ctx.fillStyle = this.palette.deco;
    if (this.isFemale) {
      // 女性：側邊的長翎毛 (Plume)
      ctx.fillRect(-5 + xOffset + bodyTilt, -60 + yOffset, 3, 10);
      ctx.fillRect(-8 + xOffset + bodyTilt, -58 + yOffset, 3, 8);
    } else {
      // 男性：頂部的橫向冠飾 (Crest)
      ctx.fillRect(-8 + xOffset + bodyTilt, -56 + yOffset, 16, 4);
    }

    // --- 4. 護目鏡 (共通) ---
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(-7 + xOffset + bodyTilt, -42 + yOffset, 14, 2);

    // --- 5. 繪製盾牌 ---
    if (this.weapon) {
      ctx.save();
      const shieldX = isAttacking ? 6 : 14; // 攻擊時盾牌往回拉
      ctx.translate(shieldX + xBreath, -20 + yBreath);
      this.weapon.renderWeapon(ctx);
      ctx.restore();
    }
  }

  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    // --- 背景：肩膀 ---
    ctx.fillStyle = this.palette.dark;
    if (this.isFemale) {
      // 女性：斜向護肩
      ctx.beginPath();
      ctx.moveTo(8, 64); ctx.lineTo(24, 45); ctx.lineTo(40, 45); ctx.lineTo(56, 64);
      ctx.fill();
    } else {
      // 男性：方正護肩
      ctx.fillRect(4, 48, 56, 16);
    }

    // --- 頭盔主體 ---
    ctx.fillStyle = this.palette.primary;
    ctx.fillRect(16, 12, 32, 36);

    // --- 頭盔頂飾 (關鍵區分) ---
    ctx.fillStyle = this.palette.deco;
    if (this.isFemale) {
      // 女性：長翎毛從頂部垂到側邊
      ctx.fillRect(30, 0, 6, 12);
      ctx.fillRect(36, 4, 4, 15);
      ctx.fillRect(40, 8, 4, 20);
    } else {
      // 男性：橫向的扇形冠飾
      ctx.fillRect(12, 6, 40, 6);
    }

    // --- 面罩視覺 ---
    ctx.fillStyle = "#1e272e";
    ctx.fillRect(16, 26, 32, 6); // 黑色視窗

    // 眼神光 (如果是女性可以用淺粉/紫色，男性用亮紅)
    ctx.fillStyle = this.isFemale ? "#ff99cc" : "#ff0000";
    ctx.fillRect(20, 28, 6, 2);
    ctx.fillRect(38, 28, 6, 2);
  }
}
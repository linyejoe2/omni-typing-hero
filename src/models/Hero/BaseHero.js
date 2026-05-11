import { CONFIG } from "../../CONST.js";

const rateMultiplier = {
  VIT: 20,
  STR: 3,
  CRI: 0.01,
  DEF: 0.002,
  AGI: 0.015
}

export const baseAttribute = {
  hp: 60,
  atk: 10,
  critRate: 0,
  def: 0,
  mRes: 0,
  evaRate: 0
}

export class BaseHero {
  constructor(data) {
    this.name = data.nickname || "冒險者";
    this.job = data.job;
    // this.gender = 'MALE'; // 'MALE' 或 'FEMALE'
    this.gender = data.gender; // 'MALE' 或 'FEMALE'
    this.isFemale = this.gender === 'FEMALE';

    // 座標與狀態
    this.x = 150;
    this.y = CONFIG.groundY - 20;
    this.state = 'IDLE'; // IDLE, ATTACKING, HURT
    this.opacity = 1.0;
    this.shakeTime = 0;

    // 根據性別設定像素裝飾色
    this.palette = {
      primary: "#6c5ce7",      // 深紫 (主色)
      light: "#a29bfe",        // 淺紫 (高光)
      dark: "#4834d4",         // 暗紫 (陰影)
      skin: this.isFemale ? "#ffe0bd" : "#ffcc91",         // 膚色
      skinShadow: "#ffcd94",   // 膚色陰影
      eye: "#2d3436",          // 眼睛
      deco: this.isFemale ? "#ff99cc" : "#99ccff",        // 裝飾紅/寶石
      hair: this.isFemale ? "#ff99cc" : "#788694"
    };

    // 基礎等級資訊
    this.level = data.level || 0;
    this.points = data.points || 0; // 剩餘可分配點數

    // 基礎屬性 (按照劍客設計 最平衡)
    this.baseHpLevel = 3;
    this.baseAtkLevel = 3;
    this.baseCritRateLevel = 3;
    this.baseDefLevel = 3;
    this.baseEvaRateLevel = 3;

    /**
     * 職業成長率 (Growth Rates)
     * 這是每個職業的「潛力值」。
     * 例如法師的 ATK 成長率高，而戰士的 HP 成長率高。
     */
    this.growthRates = {
      hp: 10,      // 每級固定增加的血量
      atk: 2,      // 每級固定增加的攻擊力
      crit: 0.01,  // 每級固定增加的爆擊率 (0.5%)
      def: 0.005,    // 每級固定增加的物防
      eva: 0.006    // 每級固定增加的閃避率 (0.5%)
    };

    // 2. 玩家手動分配的點數 (決定角色流派：如全敏流、血牛流)
    this.assignedPoints = data.assignedPoints || {
      STR: 0, // 力量
      CRI: 0, // 會心
      VIT: 0, // 體質
      DEF: 0, // 防禦
      AGI: 0  // 敏捷
    };

    this.onDeath = data.onDeath || (() => { console.warn("BaseHero.onDath() not implemented!") });

    // this.updateFinalStats();

    // // 重新計算後，確保當前血量補滿
    // this.hp = this.maxHp;
  }

  /**
   * 核心公式：最終數值 = 基礎 + (基礎加點 * 加點成長) + (等級 * 職業成長) + (分配點數 * 加點成長)
   */
  updateFinalStats() {
    this.hp += baseAttribute.hp + (this.baseHpLevel * rateMultiplier.VIT) (this.level * this.growthRates.hp) + (this.assignedPoints.VIT * rateMultiplier.VIT);
    this.atk += baseAttribute.atk + (this.baseAtkLevel * rateMultiplier.STR) + (this.level * this.growthRates.atk) + (this.assignedPoints.STR * rateMultiplier.STR);
    this.critRate += baseAttribute.critRate + (this.baseCritRateLevel * rateMultiplier.CRI) +  (this.level * this.growthRates.crit) + (this.assignedPoints.CRI * rateMultiplier.CRI);
    this.def += baseAttribute.def + (this.baseDefLevel * rateMultiplier.DEF) + (this.level * this.growthRates.def) + (this.assignedPoints.DEF * rateMultiplier.DEF);
    const rawEva = baseAttribute.evaRate + (this.level * this.growthRates.eva) + (this.assignedPoints.AGI * rateMultiplier.AGI);
    this.evaRate += Math.min(0.8, rawEva);
  }

  takeDamage(monsterAtk) {
    // 1. 閃避判定
    if (Math.random() < this.evaRate) {
      console.log("MISS! 閃避成功");
      return "MISS";
    }

    // 2. 減傷判定 (簡單公式：傷害 = 敵攻 * (1 - (我防))
    let finalDamage = Math.round(monsterAtk * (1 - (this.def)));
    if (finalDamage < 1) finalDamage = 1; // 保底傷害

    this.hp -= finalDamage;
    this.shakeTime = 15;

    if (this.hp <= 0) this.onDeath();
    return finalDamage;
  }

  /**
     * 統一攻擊邏輯
     * @param {number} targetX 目標 X 座標
     * @param {number} targetY 目標 Y 座標
     * @returns {Object|null} 回傳產生的投射物或攻擊數據
     */
  attack(targetX, targetY, FullCrit = false) {
    // 1. 檢查武器是否準備好 (Cooldown)
    if (!this.weapon || !this.weapon.canAttack()) return null;

    // 2. 計算基礎傷害與爆擊
    let finalDamage = (this.baseAtkLevel * this.weapon.damageMultiplier) + this.weapon.addDamage;
    let isCrit = Math.random() < this.critRate;
    if (FullCrit) isCrit = true;

    if (isCrit) {
      finalDamage *= 1.5; // 爆擊 1.5 倍傷害
      // console.log("💥 CRITICAL HIT!");
    }

    // 3. 觸發武器攻擊並獲取投射物
    // 這裡我們把計算好的傷害傳給武器，讓武器產生的 Fireball 帶有正確的數值
    const projectile = this.weapon.attack(
      this.x + 20, // 發射起始點微調
      this.y - 30,
      targetX,
      targetY - 30,
      finalDamage,
      isCrit
    );

    // 4. 觸發角色攻擊動作動畫狀態 (可選)
    this.state = 'ATTACKING';
    setTimeout(() => { if (this.state === 'ATTACKING') this.state = 'IDLE'; }, 200);

    return projectile;
  }

  update() {
    if (this.shakeTime > 0) this.shakeTime--;
  }

  // 提供給子類別覆寫的繪製基礎
  draw(ctx) {
    if (this.hp <= 0 && this.opacity > 0) this.opacity -= 0.05;

    ctx.save();
    let drawX = this.x;
    let drawY = this.y;

    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * 5;
    }

    ctx.translate(drawX, drawY);
    ctx.globalAlpha = this.opacity;

    this.renderHero(ctx); // 呼叫子類別的具體畫法

    ctx.restore();
  }

  /**
   * 外部呼叫的統一接口
   * @param {CanvasRenderingContext2D} ctx 
   */
  static renderAvatar(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    // 臉部
    ctx.fillStyle = '#ffe0bd';
    ctx.fillRect(20, 12, 24, 20);
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(24, 20, 4, 4);
    ctx.fillRect(36, 20, 4, 4);

    // 預設什麼都不畫，或畫一件白襯衫
    ctx.fillStyle = '#fff';
    ctx.fillRect(16, 32, 32, 24);
  }
}
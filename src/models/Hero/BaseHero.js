import { CONFIG } from "../../CONST.js";

export class BaseHero {
  constructor(data) {
    this.name = data.nickname || "冒險者";
    this.job = data.job;
    // this.gender = 'MALE'; // 'MALE' 或 'FEMALE'
    this.gender = data.gender; // 'MALE' 或 'FEMALE'

    // 座標與狀態
    this.x = 150;
    this.y = CONFIG.groundY - 20;
    this.state = 'IDLE'; // IDLE, ATTACKING, HURT
    this.opacity = 1.0;
    this.shakeTime = 0;

    // 根據性別設定像素裝飾色
    this.skinColor = "#ffdbac";
    this.decoColor = this.gender === 'FEMALE' ? "#ff99cc" : "#99ccff";

    // 基礎等級資訊
    this.level = data.level || 1;
    this.points = data.points || 0; // 剩餘可分配點數

    // 2. 玩家手動分配的點數 (決定角色流派：如全敏流、血牛流)
    this.assignedPoints = data.assignedPoints || {
      STR: 0, // 力量
      CRI: 0, // 會心
      VIT: 0, // 體質
      DEF: 0, // 防禦
      RES: 0, // 魔防
      AGI: 0  // 敏捷
    };

    /**
     * 職業成長率 (Growth Rates)
     * 這是每個職業的「潛力值」。
     * 例如法師的 ATK 成長率高，而戰士的 HP 成長率高。
     */
    this.growthRates = {
      atk: 2,      // 每級固定增加的攻擊力
      crit: 0.005,  // 每級固定增加的爆擊率 (0.5%)
      hp: 12,      // 每級固定增加的血量
      def: 1.2,    // 每級固定增加的物防
      res: 1.0,    // 每級固定增加的魔防
      eva: 0.005    // 每級固定增加的閃避率 (0.5%)
    };

    this.updateFinalStats();
  }

  /**
   * 核心公式：最終數值 = (基礎 + 等級成長) + (玩家配點加成)
   */
  updateFinalStats() {
    // --- 攻擊力計算 (STR 影響) ---
    // 公式：基礎 10 + (等級 * 成長) + (力量點數 * 3)
    this.maxAtk = 10 + (this.level * this.growthRates.atk) + (this.assignedPoints.STR * 3);

    // --- 爆擊率計算 (CRI 影響) ---
    // 公式：基礎 5% + (等級 * 成長) + (會心點數 * 1%)
    this.critRate = 0.05 + (this.level * this.growthRates.crit) + (this.assignedPoints.CRI * 0.01);

    // --- 最大生命值計算 (VIT 影響) ---
    // 公式：基礎 100 + (等級 * 成長) + (體質點數 * 20)
    this.maxHp = 100 + (this.level * this.growthRates.hp) + (this.assignedPoints.VIT * 20);

    // --- 物理/魔法防禦計算 (DEF/RES 影響) ---
    this.pDef = 5 + (this.level * this.growthRates.def) + (this.assignedPoints.DEF * 2);
    this.mRes = 5 + (this.level * this.growthRates.res) + (this.assignedPoints.RES * 2);

    // --- 閃避率計算 (AGI 影響) ---
    // 公式：基礎 3% + (等級 * 成長) + (敏捷點數 * 1.5%)
    // 設定上限 (Cap) 為 50% 避免無敵
    const rawEva = 0.03 + (this.level * this.growthRates.eva) + (this.assignedPoints.AGI * 0.015);
    this.evaRate = Math.min(0.5, rawEva);

    // 初始化當前血量
    if (!this.currentHp) this.currentHp = this.maxHp;
  }

  receiveAttack(monsterAtk) {
    // 1. 閃避判定
    if (Math.random() < this.maxEva) {
      console.log("MISS! 閃避成功");
      return "MISS";
    }

    // 2. 減傷判定 (簡單公式：傷害 = 敵攻 - 我防)
    let finalDamage = monsterAtk - this.maxDef;
    if (finalDamage < 1) finalDamage = 1; // 保底傷害

    this.currentHp -= finalDamage;
    this.shakeTime = 15;

    if (this.currentHp <= 0) this.onDeath();
    return finalDamage;
  }

  /**
     * 統一攻擊邏輯
     * @param {number} targetX 目標 X 座標
     * @param {number} targetY 目標 Y 座標
     * @returns {Object|null} 回傳產生的投射物或攻擊數據
     */
  attack(targetX, targetY) {
    // 1. 檢查武器是否準備好 (Cooldown)
    if (!this.weapon || !this.weapon.canAttack()) return null;

    // 2. 計算基礎傷害與爆擊
    let finalDamage = (this.maxAtk * this.weapon.damageMultiplier) + this.weapon.addDamage;
    const isCrit = Math.random() < this.critRate;

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
}
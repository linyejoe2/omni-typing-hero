import { BaseWeapon } from "./BaseWeapon.js";
import { HandAxe } from "../Projectile/HandAxe.js"; // 引入剛寫好的手斧

export class HeavyShield extends BaseWeapon {
  constructor() {
    // 雖然丟斧頭，但這依然是重盾手的武器
    super({ name: "重盾與投斧", type: "PHYSICAL", damageMultiplier: 1, addDamage: 0 });
    
    this.shieldColor = "#95a5a6"; // 鋼鐵灰
    this.edgeColor = "#3d4242";
    this.decoColor = "#f1c40f";  // 金色裝飾
  }

  /**
   * 覆寫 attack 方法
   * 重盾手不丟盾牌，而是從背後/腰間掏出手斧丟出去
   */
  attack(startX, startY, targetX, targetY, damage, isCrit) {
    if (!this.canAttack()) return null;

    this.lastAttackTime = Date.now();

    // 產生並回傳旋轉手斧
    return new HandAxe(startX, startY, targetX, targetY, damage, isCrit);
  }

  /**
   * 繪製角色手上的重盾
   * 繪製起點 (0,0) 為英雄手部
   */
  renderWeapon(ctx) {
    ctx.save();

    // 5. 特色：盾牌後方隱約露出的斧頭柄 (視覺彩蛋)
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(2, -30, 4, 10); // 露出的一截斧柄

    // 1. 盾牌主體 (大長方塊，帶有一點像素切角)
    ctx.fillStyle = this.shieldColor;
    ctx.fillRect(-10, -25, 20, 35); // 寬 20, 高 35

    // 2. 邊框裝飾
    ctx.strokeStyle = this.edgeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -25, 20, 35);

    // 3. 盾面裝飾 (十字形金屬塊)
    ctx.fillStyle = this.decoColor;
    ctx.fillRect(-8, -10, 16, 4); // 橫條
    ctx.fillRect(-2, -20, 4, 25); // 縱條

    // 4. 盾面反光 (增加金屬質感)
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(-6, -20, 3, 25);

    ctx.restore();
  }
}
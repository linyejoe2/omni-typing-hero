import { Fireball } from "../Projectile/Fireball.js";
import { BaseWeapon } from "./BaseWeapon.js";

export class MagicStaff extends BaseWeapon {
  constructor() {
    super({ name: "法杖", type: "MAGIC", damageMultiplier: 1.15, addDamage: 50 });

  }

  // 覆寫 attack 方法
  attack(startX, startY, targetX, targetY, damage, isCrit) {
    if (!this.canAttack()) return null;

    this.lastAttackTime = Date.now();

    // 武器「產生」了一個火球物件並回傳
    return new Fireball(startX, startY, targetX, targetY, damage, isCrit);
  }

  /**
   * 繪製像素法杖
   * 繪製起點 (0,0) 通常是在英雄的手部位置
   */
  renderWeapon(ctx) {
    // 1. 杖身 (長條像素塊)
    ctx.fillStyle = this.color;
    ctx.fillRect(0, -20, 4, 35); // 窄長的木頭柄

    // 2. 頂端裝飾 (十字托)
    ctx.fillStyle = "#5D4037"; // 深色木頭
    ctx.fillRect(-2, -22, 8, 4);

    // 3. 核心寶石 (會發光的像素塊)
    // 增加一個微弱的呼吸效果
    const pulse = Math.sin(Date.now() * 0.005) * 5;

    ctx.save();
    ctx.shadowBlur = 10 + pulse;
    ctx.shadowColor = this.gemColor;

    ctx.fillStyle = this.gemColor;
    ctx.fillRect(-2, -32 + (pulse * 0.2), 8, 8); // 寶石本體

    // 4. 寶石核心亮點
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, -30 + (pulse * 0.2), 3, 3);

    ctx.restore();

    // 5. 飄浮粒子 (法杖周圍的小魔力碎屑)
    this.drawMagicParticles(ctx, pulse);
  }

  drawMagicParticles(ctx, pulse) {
    ctx.fillStyle = "rgba(0, 212, 255, 0.6)";
    const time = Date.now() * 0.002;
    // 繪製三個環繞的小點
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * (Math.PI * 2 / 3));
      const px = Math.cos(angle) * 12;
      const py = -28 + Math.sin(angle) * 12;
      ctx.fillRect(px, py, 2, 2);
    }
  }
}
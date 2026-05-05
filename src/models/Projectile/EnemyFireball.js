import { Particle } from "./Particle.js";

/**
 * 敵人投射物類別 (由上往下掉落)
 */
export class EnemyFireball {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 12;
    this.alive = true;
    this.color = "#9932cc";

    // 計算向量
    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(particlePool) {
    this.x += this.vx;
    this.y += this.vy;

    // 產生紫色拖尾
    if (Math.random() > 0.5) {
      particlePool.push(new Particle(this.x, this.y, this.color, 0.3));
    }

    // 檢查是否抵達目標點 (距離小於閾值)
    const dx = this.x - this.targetX;
    const dy = this.y - this.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {
      this.triggerExplosion(particlePool); // 爆炸時也塞入池子
      this.alive = false;
      return true; // 代表觸發爆炸
    }
    return false;
  }

  draw(ctx) {
    // 紫色外框
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    // 白色中心
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
  }

  /**
     * 爆炸特效：將粒子產生到池中
     */
  triggerExplosion(particlePool) {
    for (let i = 0; i < 15; i++) {
      particlePool.push(new Particle(this.targetX, this.targetY, this.color, 1.2));
    }
  }
}
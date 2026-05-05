import { Particle } from "./Particle.js";



/**
 * 玩家火球類別
 */
export class Fireball {
  constructor(startX, startY, targetX, targetY, damage, isCrit) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 12;
    this.alive = true;
    this.damage = damage;
    this.isCrit = isCrit;
    this.color = "#ff4500";

    // 計算向量
    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  /**
   * @param {Array} particlePool 傳入遊戲整體的粒子陣列
   */
  update(particlePool) {
    this.x += this.vx;
    this.y += this.vy;

    // 產生拖尾粒子
    if (Math.random() > 0.3) {
      particlePool.push(new Particle(this.x, this.y, this.color, 0.5));
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
    ctx.fillStyle = this.color;
    // 像素風格火球 (稍微大一點的矩形)
    ctx.fillRect(this.x - 6, this.y - 6, 12, 12);
    // 加個核心白色
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
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
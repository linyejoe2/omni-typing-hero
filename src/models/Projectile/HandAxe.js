import { BloodParticle } from "./Particle";

export class HandAxe {
  constructor(startX, startY, targetX, targetY, damage, isCrit, curveHeight = 100) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.isCrit = isCrit;
    this.speed = 5;

    this.alive = true;
    this.rotation = 0;
    this.gravity = 0.1;

    // --- 拋物線核心邏輯 ---
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 設定總飛行時間（根據距離決定，距離越遠飛越久）
    const travelTime = dist / this.speed; // 8 是水平速度

    // 1. 水平速度向量 (固定不變)
    this.vx = dx / travelTime;

    // 2. 垂直速度 (包含拋物線升力)
    // 我們利用物理公式：y = v0t + 0.5at^2
    // 重力加速度 (可以調整這個值來改變拋物線的「重感」)

    // 計算為了要在 travelTime 時間點到達 targetY，所需的初速 vy
    // 公式推導：vy = (dy - 0.5 * gravity * travelTime^2) / travelTime
    this.vy = (dy - 0.5 * this.gravity * Math.pow(travelTime, 2)) / travelTime;
  }

  update(particlePool) {
    // 套用速度
    this.x += this.vx;
    this.y += this.vy;

    // 套用重力 (垂直速度會越來越大，導致往下墜)
    this.vy += this.gravity;

    this.rotation += 0.2;

    // 檢查是否接近目標點
    const dx = this.x - this.targetX;
    const dy = this.y - this.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 拋物線通常判斷「是否落地」或「是否接近目標」
    // 如果是拋物線，建議判斷當前 y 是否超過了 targetY (假設地板在 targetY)
    if (dist < 30 || (this.vy > 0 && this.y >= this.targetY)) {
      this.triggerBloodEffect(particlePool); // 爆炸時也塞入池子
      this.alive = false;
      if (typeof audioManager !== 'undefined') audioManager.play({ type: 'EXPLOSION' });
      return true;
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // ... 原有的繪製邏輯 (斧柄、斧刃) ...
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(-2, -5, 4, 15);
    ctx.fillStyle = "#bdc3c7";
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(12, -12); ctx.lineTo(12, 0); ctx.lineTo(0, -2);
    ctx.fill();

    ctx.restore();
  }

  /**
 * 噴血特效：沿著斧頭飛行的方向噴濺
 */
  triggerBloodEffect(particlePool) {
    // 噴發數量：暴擊噴更多
    const particleCount = this.isCrit ? 50 : 25;

    for (let i = 0; i < particleCount; i++) {
      // 傳入當前位置、當前斧頭速度(vx, vy)
      particlePool.push(new BloodParticle(
        this.x,
        this.y,
        this.vx,
        this.vy,
        this.isCrit
      ));
    }
  }
}
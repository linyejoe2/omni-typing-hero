import { BloodParticle } from './Particle.js';

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

    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const travelTime = dist / this.speed;

    this.vx = dx / travelTime;
    this.vy = (dy - 0.5 * this.gravity * Math.pow(travelTime, 2)) / travelTime;
  }

  update(particlePool) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.rotation += 0.2;

    const dx = this.x - this.targetX;
    const dy = this.y - this.targetY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30 || (this.vy > 0 && this.y >= this.targetY)) {
      this.triggerBloodEffect(particlePool);
      this.alive = false;
      return true;
    }
    return false;
  }

  /** @param {import('pixi.js').Graphics} gfx */
  draw(gfx) {
    // Apply rotation mathematically around the axe center
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    const rotatePoint = (px, py) => ({
      x: this.x + px * cos - py * sin,
      y: this.y + px * sin + py * cos,
    });

    // Handle (rect approximated as rotated rect)
    const h = rotatePoint(-2, -5);
    const hx = h.x; const hy = h.y;
    gfx.rect(hx, hy, 4, 15).fill('#5D4037');

    // Blade as polygon
    const b0 = rotatePoint(0, -8);
    const b1 = rotatePoint(12, -12);
    const b2 = rotatePoint(12, 0);
    const b3 = rotatePoint(0, -2);
    gfx.poly([b0.x, b0.y, b1.x, b1.y, b2.x, b2.y, b3.x, b3.y]).fill('#bdc3c7');
  }

  triggerBloodEffect(particlePool) {
    const count = this.isCrit ? 50 : 25;
    for (let i = 0; i < count; i++) {
      particlePool.push(new BloodParticle(this.x, this.y, this.vx, this.vy, this.isCrit));
    }
  }
}

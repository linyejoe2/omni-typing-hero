export class Particle {
  constructor(x, y, color, speedScale = 1) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 4 * speedScale;
    this.vy = (Math.random() - 0.5) * 4 * speedScale;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  /** @param {import('pixi.js').Graphics} gfx */
  draw(gfx) {
    gfx.rect(this.x, this.y, 4, 4).fill({ color: this.color, alpha: this.life });
  }
}

export class BloodParticle {
  constructor(x, y, vx, vy, isCrit) {
    this.x = x;
    this.y = y;
    const spread = isCrit ? 6 : 3;
    this.vx = (vx * 0.7 + (Math.random() - 0.5) * spread) * -1;
    this.vy = (vy * 0.7 + (Math.random() - 0.5) * spread) * -1;
    this.life = 1.0;
    this.decay = Math.random() * 0.04 + 0.02;
    this.gravity = 0.15;
    this.color = Math.random() < 0.5 ? '#ff0000' : '#8b0000';
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
  }

  /** @param {import('pixi.js').Graphics} gfx */
  draw(gfx) {
    if (this.life <= 0) return;
    gfx.rect(this.x, this.y, this.size, this.size).fill({ color: this.color, alpha: this.life });
  }
}

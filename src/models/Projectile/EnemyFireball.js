import { Particle } from './Particle.js';
import { audioManager } from '../../services/AudioManager.js';

export class EnemyFireball {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 12;
    this.alive = true;
    this.color = '#9932cc';

    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(particlePool) {
    this.x += this.vx;
    this.y += this.vy;

    if (Math.random() > 0.5) {
      particlePool.push(new Particle(this.x, this.y, this.color, 0.3));
    }

    const dx = this.x - this.targetX;
    const dy = this.y - this.targetY;
    if (Math.sqrt(dx * dx + dy * dy) < 30) {
      this.triggerExplosion(particlePool);
      this.alive = false;
      audioManager.play({ type: 'EXPLOSION' });
      return true;
    }
    return false;
  }

  /** @param {import('pixi.js').Graphics} gfx */
  draw(gfx) {
    gfx.rect(this.x - 8, this.y - 8, 16, 16).fill(this.color);
    gfx.rect(this.x - 3, this.y - 3, 6, 6).fill('#ffffff');
  }

  triggerExplosion(particlePool) {
    for (let i = 0; i < 15; i++) {
      particlePool.push(new Particle(this.targetX, this.targetY, this.color, 1.2));
    }
  }
}

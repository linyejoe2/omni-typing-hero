import { Particle } from './Particle.js';
import { audioManager } from '../../services/AudioManager.js';

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
    this.color = '#ff4500';

    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(particlePool) {
    this.x += this.vx;
    this.y += this.vy;

    if (Math.random() > 0.3) {
      particlePool.push(new Particle(this.x, this.y, this.color, 0.5));
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
    gfx.rect(this.x - 6, this.y - 6, 12, 12).fill(this.color);
    gfx.rect(this.x - 2, this.y - 2, 4, 4).fill('#ffffff');
  }

  triggerExplosion(particlePool) {
    for (let i = 0; i < 15; i++) {
      particlePool.push(new Particle(this.targetX, this.targetY, this.color, 1.2));
    }
  }
}

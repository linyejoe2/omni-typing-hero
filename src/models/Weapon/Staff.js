import { Fireball } from '../Projectile/Fireball.js';
import { BaseWeapon } from './BaseWeapon.js';

export class MagicStaff extends BaseWeapon {
  constructor() {
    super({ name: '法杖', type: 'MAGIC', damageMultiplier: 1, addDamage: 10 });
    this.gemColor = '#00d4ff';
  }

  attack(startX, startY, targetX, targetY, damage, isCrit) {
    if (!this.canAttack()) return null;
    this.lastAttackTime = Date.now();
    return new Fireball(startX, startY, targetX, targetY, damage, isCrit);
  }

  /** @param {import('pixi.js').Graphics} gfx */
  renderWeapon(gfx) {
    // Staff body
    gfx.rect(0, -20, 4, 35).fill(this.color);
    // Cross guard
    gfx.rect(-2, -22, 8, 4).fill('#5D4037');

    // Gem with pulsing size
    const pulse = Math.sin(Date.now() * 0.005) * 5;
    const gemY = -32 + pulse * 0.2;
    gfx.rect(-2, gemY, 8, 8).fill(this.gemColor);
    gfx.rect(0, gemY + 2, 3, 3).fill('#ffffff');

    // Orbiting magic particles
    const time = Date.now() * 0.002;
    for (let i = 0; i < 3; i++) {
      const angle = time + i * (Math.PI * 2 / 3);
      const px = Math.cos(angle) * 12;
      const py = -28 + Math.sin(angle) * 12;
      gfx.rect(px, py, 2, 2).fill({ color: '#00d4ff', alpha: 0.6 });
    }
  }
}

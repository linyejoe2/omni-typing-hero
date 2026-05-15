import { BaseWeapon } from './BaseWeapon.js';
import { HandAxe } from '../Projectile/HandAxe.js';

export class HeavyShield extends BaseWeapon {
  constructor() {
    super({ name: '重盾與投斧', type: 'PHYSICAL', damageMultiplier: 1, addDamage: 0 });
    this.shieldColor = '#95a5a6';
    this.edgeColor = '#3d4242';
    this.decoColor = '#f1c40f';
  }

  attack(startX, startY, targetX, targetY, damage, isCrit) {
    if (!this.canAttack()) return null;
    this.lastAttackTime = Date.now();
    return new HandAxe(startX, startY, targetX, targetY, damage, isCrit);
  }

  /** @param {import('pixi.js').Graphics} gfx */
  renderWeapon(gfx) {
    gfx.rect(2, -30, 4, 10).fill('#5D4037');                               // axe handle peek
    gfx.rect(-10, -25, 20, 35).fill(this.shieldColor);                     // shield body
    gfx.rect(-10, -25, 20, 35).stroke({ color: this.edgeColor, width: 2 }); // border
    gfx.rect(-8, -10, 16, 4).fill(this.decoColor);                         // cross h
    gfx.rect(-2, -20, 4, 25).fill(this.decoColor);                         // cross v
    gfx.rect(-6, -20, 3, 25).fill({ color: '#ffffff', alpha: 0.2 });       // reflection
  }
}

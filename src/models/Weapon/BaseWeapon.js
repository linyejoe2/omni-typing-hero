export class BaseWeapon {
  constructor(config = {}) {
    this.name = config.name || '普通武器';
    this.type = config.type || 'MELEE';
    this.damageMultiplier = config.damageMultiplier || 1;
    this.addDamage = config.addDamage || 0;
    this.cooldown = config.cooldown || 500;
    this.lastAttackTime = 0;
    this.color = config.color || '#ffffff';
    this.owner = null;
  }

  equip(hero) { this.owner = hero; }

  canAttack() {
    return Date.now() - this.lastAttackTime >= this.cooldown;
  }

  attack() {
    if (!this.canAttack()) return null;
    this.lastAttackTime = Date.now();
  }

  /** @param {import('pixi.js').Graphics} gfx */
  renderWeapon(gfx) {
    // overridden by subclasses
  }
}

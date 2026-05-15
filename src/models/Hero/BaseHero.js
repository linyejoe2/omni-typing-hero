import { Container, Graphics } from 'pixi.js';
import { CONFIG } from '../../CONST.js';

const rateMultiplier = { VIT: 10, STR: 3, CRI: 0.01, DEF: 0.002, AGI: 0.015 };

export const baseAttribute = { hp: 60, atk: 10, critRate: 0.02, def: 0, mRes: 0, evaRate: 0 };

export class BaseHero {
  constructor(data) {
    this.name = data.nickname || '冒險者';
    this.job = data.job;
    this.gender = data.gender;
    this.isFemale = this.gender === 'FEMALE';

    this.heroInfo = [
      '「攻守兼備的開拓者，戰場上的穩定核心。」',
      '職業介紹： 擁有最均衡的體質，適應各種戰鬥環境。',
      '戰鬥風格： 均衡型。',
      '初始數值： 體質與防禦適中，攻擊表現穩定。',
      '推薦人群： 喜歡紮實手感、追求穩定的玩家。',
    ];

    this.x = 150;
    this.y = CONFIG.groundY - 20;
    this.state = 'IDLE';
    this.opacity = 1.0;
    this.shakeTime = 0;

    this.palette = {
      primary: '#6c5ce7',
      light: '#a29bfe',
      dark: '#4834d4',
      skin: this.isFemale ? '#ffe0bd' : '#ffcc91',
      skinShadow: '#ffcd94',
      eye: '#2d3436',
      deco: this.isFemale ? '#ff99cc' : '#99ccff',
      hair: this.isFemale ? '#ff99cc' : '#788694',
    };

    this.level = data.level || 0;
    this.points = data.points || 0;
    this.baseHpLevel = 3;
    this.baseAtkLevel = 3;
    this.baseCritRateLevel = 3;
    this.baseDefLevel = 3;
    this.baseEvaRateLevel = 3;

    this.growthRates = { hp: 10, atk: 2, crit: 0.01, def: 0.005, eva: 0.006 };

    this.assignedPoints = data.assignedPoints || { STR: 0, CRI: 0, VIT: 0, DEF: 0, AGI: 0 };

    this.onDeath = data.onDeath || (() => { console.warn('BaseHero.onDeath() not implemented!'); });

    // Pixi display objects — hero body + weapon in separate containers
    this.container = new Container();
    this.gfx = new Graphics();

    this.weaponContainer = new Container();
    this.weaponGfx = new Graphics();
    this.weaponContainer.addChild(this.weaponGfx);

    this.container.addChild(this.gfx);
    this.container.addChild(this.weaponContainer);
  }

  updateFinalStats() {
    this.hp = baseAttribute.hp + (this.baseHpLevel * rateMultiplier.VIT) + (this.level * this.growthRates.hp) + (this.assignedPoints.VIT * rateMultiplier.VIT);
    this.atk = baseAttribute.atk + (this.baseAtkLevel * rateMultiplier.STR) + (this.level * this.growthRates.atk) + (this.assignedPoints.STR * rateMultiplier.STR);
    this.critRate = baseAttribute.critRate + (this.baseCritRateLevel * rateMultiplier.CRI) + (this.level * this.growthRates.crit) + (this.assignedPoints.CRI * rateMultiplier.CRI);
    this.def = baseAttribute.def + (this.baseDefLevel * rateMultiplier.DEF) + (this.level * this.growthRates.def) + (this.assignedPoints.DEF * rateMultiplier.DEF);
    const rawEva = baseAttribute.evaRate + (this.level * this.growthRates.eva) + (this.assignedPoints.AGI * rateMultiplier.AGI);
    this.evaRate = Math.min(0.8, rawEva);
    this.currentHp = this.hp;
  }

  takeDamage(monsterAtk) {
    if (Math.random() < this.evaRate) return 'MISS';
    let dmg = Math.round(monsterAtk * (1 - this.def));
    if (dmg < 1) dmg = 1;
    this.currentHp -= dmg;
    this.shakeTime = 15;
    if (this.currentHp <= 0) this.onDeath();
    return dmg;
  }

  attack(targetX, targetY, FullCrit = false) {
    if (!this.weapon || !this.weapon.canAttack()) return null;
    let finalDamage = (this.atk * this.weapon.damageMultiplier) + this.weapon.addDamage;
    let isCrit = Math.random() < this.critRate;
    if (FullCrit) isCrit = true;
    if (isCrit) finalDamage *= 1.5;

    const projectile = this.weapon.attack(this.x + 20, this.y - 30, targetX, targetY - 30, finalDamage, isCrit);
    this.state = 'ATTACKING';
    setTimeout(() => { if (this.state === 'ATTACKING') this.state = 'IDLE'; }, 200);
    return projectile;
  }

  update() {
    if (this.shakeTime > 0) this.shakeTime--;
    if (this.currentHp <= 0 && this.opacity > 0) this.opacity -= 0.05;
  }

  draw() {
    let drawX = this.x;
    let drawY = this.y;
    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * 5;
      drawY += (Math.random() - 0.5) * 5;
    }

    this.container.position.set(drawX, drawY);
    this.container.alpha = this.opacity;

    this.gfx.clear();
    this.weaponGfx.clear();
    this.renderHero(this.gfx);
  }

  renderHero(gfx) {
    // overridden by subclasses
  }

  // renderAvatar uses Canvas 2D — unchanged (called on a 2D ctx for panel thumbnails)
  renderAvatar(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffe0bd';
    ctx.fillRect(20, 12, 24, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(24, 20, 4, 4);
    ctx.fillRect(36, 20, 4, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(16, 32, 32, 24);
  }
}

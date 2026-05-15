import { BaseHero } from './BaseHero.js';
import { HeavyShield } from '../Weapon/HeavyShield.js';

export class Defender extends BaseHero {
  constructor(data) {
    super(data);
    this.weapon = new HeavyShield();

    this.heroInfo = [
      '「不動如山的鐵壁，守護同伴的最強護盾。」',
      '職業介紹： 捨棄了靈活性與爆發力，換取極致的生存能力。',
      '戰鬥風格： 極致生存。雖然攻擊節奏較慢，但能承受極高傷害，靠韌性磨死對手。',
      '初始數值： 極高的 VIT 與 DEF，但 STR 與 CRI 成長極低。',
      '推薦人群： 享受「看著敵人打不動我」的玩家。',
    ];

    this.baseHpLevel = 6;
    this.baseAtkLevel = 1;
    this.baseCritRateLevel = 2;
    this.baseDefLevel = 6;
    this.baseEvaRateLevel = 0;

    this.growthRates = { hp: 10, atk: 1, crit: 0.002, def: 0.015, eva: 0.001 };

    this.palette = {
      primary: '#7f8c8d',
      light: '#bdc3c7',
      dark: '#2c3e50',
      skin: this.isFemale ? '#ffe0bd' : '#ffcc91',
      deco: this.isFemale ? '#e74c3c' : '#f1c40f',
      eye: '#2d3436',
    };

    this.updateFinalStats();

    if (import.meta.env.DEV) {
      console.log(`Debug: HP:${this.hp} ATK:${this.atk} CRI:${this.critRate} DEF:${this.def} EVA:${this.evaRate}`);
    }
  }

  update() { super.update(); }

  /** @param {import('pixi.js').Graphics} gfx */
  renderHero(gfx) {
    const isAttacking = this.state === 'ATTACKING';
    const time = Date.now();
    const cfg = { speed: 0.001, range: 1.1, chaos: 1.37 };

    let xBreath = 0;
    let yBreath = 0;
    if (!isAttacking) {
      xBreath = Math.sin(time * cfg.speed) * cfg.range;
      yBreath = Math.sin(time * cfg.speed * cfg.chaos + Math.PI / 2) * cfg.range;
    }
    const bodyTilt = isAttacking ? -2 : 0;
    const p = this.palette;

    // Ribbons / cape
    gfx.rect(0, 0, 0, 0); // no-op to start path group
    if (this.isFemale) {
      const segs = 5;
      const segH = 35 / segs;
      for (const baseX of [-16, 12]) {
        for (let i = 0; i < segs; i++) {
          const waveX = Math.sin(time * 0.005 + i * 0.8) * (i / segs) * 10;
          gfx.rect(baseX + xBreath + bodyTilt + waveX, -35 + yBreath + i * segH, 4, segH + 0.5).fill(p.deco);
        }
      }
    } else {
      gfx.rect(-24 + bodyTilt, -10, 48, 6).fill(p.deco);
    }

    // Armor body
    if (this.isFemale) {
      gfx.moveTo(-16 + bodyTilt, -45).lineTo(16 + bodyTilt, -45).lineTo(18 + bodyTilt, 0).lineTo(-18 + bodyTilt, 0).closePath().fill(p.primary);
    } else {
      gfx.rect(-20 + bodyTilt, -45, 40, 45).fill(p.primary);
    }

    // Helmet
    gfx.rect(-10 + bodyTilt, -52, 20, 22).fill(p.dark);

    // Crest
    if (this.isFemale) {
      gfx.rect(-5 + bodyTilt, -60, 3, 10).fill(p.deco);
      gfx.rect(-8 + bodyTilt, -58, 3, 8).fill(p.deco);
    } else {
      gfx.rect(-8 + bodyTilt, -56, 16, 4).fill(p.deco);
    }

    // Visor
    gfx.rect(-7 + bodyTilt, -42, 14, 2).fill('#ff0000');

    // Shield/weapon
    if (this.weapon) {
      const shieldX = isAttacking ? 6 : 14;
      this.weaponContainer.position.set(shieldX + xBreath, -20 + yBreath);
      this.weaponContainer.rotation = 0;
      this.weapon.renderWeapon(this.weaponGfx);
    }
  }

  // renderAvatar stays Canvas 2D for panel thumbnails
  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);
    const p = this.palette;

    ctx.fillStyle = p.dark;
    if (this.isFemale) {
      ctx.beginPath(); ctx.moveTo(8, 64); ctx.lineTo(24, 45); ctx.lineTo(40, 45); ctx.lineTo(56, 64); ctx.fill();
    } else {
      ctx.fillRect(4, 48, 56, 16);
    }

    ctx.fillStyle = p.primary; ctx.fillRect(16, 12, 32, 36);

    ctx.fillStyle = p.deco;
    if (this.isFemale) {
      ctx.fillRect(30, 0, 6, 12); ctx.fillRect(36, 4, 4, 15); ctx.fillRect(40, 8, 4, 20);
    } else {
      ctx.fillRect(12, 6, 40, 6);
    }

    ctx.fillStyle = '#1e272e'; ctx.fillRect(16, 26, 32, 6);
    ctx.fillStyle = this.isFemale ? '#ff99cc' : '#ff0000';
    ctx.fillRect(20, 28, 6, 2); ctx.fillRect(38, 28, 6, 2);
  }
}

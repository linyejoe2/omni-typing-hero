import { BaseHero } from './BaseHero.js';
import { MagicStaff } from '../Weapon/Staff.js';

export class Mage extends BaseHero {
  constructor(data) {
    super(data);
    this.weapon = new MagicStaff();
    this.floatOffset = 0;

    this.heroInfo = [
      '「掌控混亂的玻璃大砲，毀滅只在彈指之間。」',
      '職業介紹： 精通奧術力量的賢者。雖然身質纖弱，但其釋放的破壞力足以瞬間扭轉戰局。',
      '戰鬥風格： 極致輸出。追求高爆擊與高攻擊，但在戰場上必須極力避免受傷。',
      '初始數值： 極高的 STR 與 CRI，但 HP 與 DEF 幾乎為零。',
      '推薦人群： 追求暴力美學、享受瞬間清場快感的「大數字」愛好者。',
    ];

    this.baseHpLevel = 0;
    this.baseAtkLevel = 6;
    this.baseCritRateLevel = 6;
    this.baseDefLevel = 0;
    this.baseEvaRateLevel = 3;

    this.growthRates = { hp: 5, atk: 4, crit: 0.02, def: 0.001, eva: 0.006 };

    this.palette = {
      primary: '#6c5ce7',
      light: '#a29bfe',
      dark: '#4834d4',
      skin: this.isFemale ? '#ffe0bd' : '#ffcc91',
      skinShadow: '#ffcd94',
      eye: '#2d3436',
      deco: this.isFemale ? '#ff99cc' : '#99ccff',
      hair: this.isFemale ? '#ff99cc' : '#788694',
      hairLight: this.isFemale ? '#ffb7db' : '#969696',
    };

    this.updateFinalStats();

    if (import.meta.env.DEV) {
      console.log(`Debug: HP:${this.hp} ATK:${this.atk} CRI:${this.critRate} DEF:${this.def} EVA:${this.evaRate}`);
    }
  }

  update() {
    super.update();
    this.floatOffset = Math.sin(Date.now() * 0.003) * 3;
  }

  /** @param {import('pixi.js').Graphics} gfx */
  renderHero(gfx) {
    const yOff = this.floatOffset;
    const p = this.palette;

    // Robe
    gfx.rect(-15, -45 + yOff, 30, 45).fill(p.primary);
    // Face
    gfx.rect(-10, -40 + yOff, 20, 15).fill(p.skin);

    // Gender details
    if (this.isFemale) {
      gfx.rect(-15, -42 + yOff, 5, 25).fill(p.deco);
      gfx.rect(10, -42 + yOff, 5, 25).fill(p.deco);
    } else {
      gfx.rect(-15, -42 + yOff, 5, 15).fill('#1c2630');
      gfx.rect(10, -42 + yOff, 5, 15).fill('#1c2630');
      gfx.rect(-3, -46 + yOff, 7, 4).fill(p.deco);
    }

    // Eyes
    gfx.rect(-5, -35 + yOff, 2, 2).fill(p.eye);
    gfx.rect(3, -35 + yOff, 2, 2).fill(p.eye);

    // Weapon
    if (this.weapon) {
      const weaponAngle = this.state === 'ATTACKING' ? 0.5 : 0;
      this.weaponContainer.position.set(15, -20 + yOff);
      this.weaponContainer.rotation = weaponAngle;
      this.weapon.renderWeapon(this.weaponGfx);
    }
  }

  // renderAvatar stays Canvas 2D for panel thumbnails
  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);
    const p = this.palette;

    ctx.fillStyle = p.dark; ctx.fillRect(8, 45, 48, 19);
    ctx.fillStyle = p.primary; ctx.fillRect(10, 48, 44, 16);

    ctx.fillStyle = p.skinShadow; ctx.fillRect(24, 40, 16, 8);
    ctx.fillStyle = p.skin; ctx.fillRect(18, 18, 28, 26);
    ctx.fillStyle = p.skinShadow; ctx.fillRect(41, 18, 5, 26);

    if (this.isFemale) {
      ctx.fillStyle = p.hair; ctx.fillRect(14, 18, 6, 40); ctx.fillRect(44, 18, 6, 40);
      ctx.fillStyle = p.hairLight; ctx.fillRect(14, 20, 2, 15);
    }

    ctx.fillStyle = p.primary;
    ctx.fillRect(12, 12, 40, 6);
    ctx.beginPath(); ctx.moveTo(18, 12); ctx.lineTo(32, 0); ctx.lineTo(46, 12); ctx.fill();

    ctx.fillStyle = p.eye; ctx.fillRect(24, 30, 3, 5); ctx.fillRect(37, 30, 3, 5);
    ctx.fillStyle = 'rgba(253,121,174,0.3)'; ctx.fillRect(21, 36, 4, 2); ctx.fillRect(39, 36, 4, 2);

    ctx.fillStyle = p.deco; ctx.fillRect(30, 8, 4, 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(30, 8, 1.5, 1.5);
  }
}

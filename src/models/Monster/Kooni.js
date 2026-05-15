import { Container, Graphics } from 'pixi.js';

export class Kooni {
  constructor(config = {}) {
    this.name = '小鬼';
    this.maxHp = config.hp || 100;
    this.hp = this.maxHp;
    this._damage = 10;
    this.damageBuzz = 5;

    this.x = config.x || 650;
    this.y = config.y || 280;
    this.rotation = 0;
    this.opacity = 1.0;

    this.status = 'ALIVE';
    this.shakeTime = 0;
    this.shakeIntensity = 50;
    this.floatOffset = 0;
    this.damageNumberX = this.x + 25;
    this.damageNumberY = this.y - 30;

    this.isAttacking = false;
    this.rage = 0;
    this.rageThreshold = config.rageThreshold || 50;
    this.autoRageTimer = 0;
    this.autoRageInterval = 10;
    this.autoRageAmount = 1;
    this.rageAdder = 10;

    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
  }

  damage() {
    return Math.round(this._damage + (1 - Math.random() * 2) * this.damageBuzz);
  }

  takeDamage(damage) {
    if (this.status === 'DEAD') return;
    this.hp -= damage;
    this.rage += 1;
    this.shakeTime = 8;
    if (this.hp <= 0) this.status = 'DYING';
  }

  penalizeMiss() {
    if (this.status !== 'ALIVE') return;
    this.rage += this.rageAdder;
  }

  attack() {
    this.rage = 0;
    this.isAttacking = true;
  }

  update() {
    if (this.status === 'DEAD') return;

    if (this.status === 'DYING') {
      this.opacity -= 0.02;
      this.rotation += 0.1;
      if (this.opacity <= 0) { this.status = 'DEAD'; this.opacity = 0; }
      return;
    }

    if (this.status === 'ALIVE') {
      this.autoRageTimer++;
      if (this.autoRageTimer >= this.autoRageInterval) {
        this.rage += this.autoRageAmount;
        this.autoRageTimer = 0;
      }
      if (this.rage > this.rageThreshold) {
        this.rage = this.rageThreshold;
        this.attack();
      }
    }

    if (this.shakeTime > 0) this.shakeTime--;
    this.floatOffset = Math.sin(Date.now() * 0.005) * 5;
  }

  draw() {
    if (this.status === 'DEAD') { this.container.visible = false; return; }
    this.container.visible = true;

    let drawX = this.x;
    let drawY = this.y + this.floatOffset;
    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * this.shakeIntensity;
      drawY += (Math.random() - 0.5) * this.shakeIntensity;
    }

    this.container.position.set(drawX, drawY);
    this.container.rotation = this.rotation;
    this.container.alpha = this.opacity;

    // Rage glow — approximate with a colored outline
    const glowStroke = this.rage >= this.rageThreshold * 0.7
      ? { color: '#9400d3', width: Math.min(8, (this.rage - this.rageThreshold * 0.7) * 0.5) }
      : null;

    this.gfx.clear();

    // Body
    this.gfx.rect(-24, -48, 48, 48).fill('#8b0000');
    if (glowStroke) this.gfx.rect(-24, -48, 48, 48).stroke(glowStroke);

    // Horns
    this.gfx.moveTo(-16, -48).lineTo(-24, -64).lineTo(-8, -48).closePath().fill('#ffffff');
    this.gfx.moveTo(16, -48).lineTo(24, -64).lineTo(8, -48).closePath().fill('#ffffff');

    // Eyes
    this.gfx.rect(-12, -35, 8, 8).fill('#ffffff');
    this.gfx.rect(4, -35, 8, 8).fill('#ffffff');
    this.gfx.rect(-12, -31, 4, 4).fill('#000000');
    this.gfx.rect(4, -31, 4, 4).fill('#000000');

    // Mouth
    const isEnraged = this.rage >= this.rageThreshold - 1;
    this.gfx.rect(-6, -18, 12, isEnraged ? 6 : 2).fill(isEnraged ? '#ff0000' : '#000000');
  }

  // renderAvatar stays Canvas 2D for panel/leaderboard thumbnails
  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);
    const palette = {
      body: '#8b0000', bodyShadow: '#5a0000', bodyLight: '#b22222',
      horn: '#ffffff', hornShadow: '#bdc3c7',
      eye: '#ffffff', eyeInner: '#000000', mouth: '#000000',
      bg: 'rgba(148,0,211,0.1)',
    };

    ctx.fillStyle = palette.bg;
    ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = palette.bodyShadow; ctx.fillRect(10, 50, 44, 14);
    ctx.fillStyle = palette.body; ctx.fillRect(14, 52, 36, 12);

    ctx.fillStyle = palette.bodyShadow; ctx.fillRect(16, 16, 32, 36);
    ctx.fillStyle = palette.body; ctx.fillRect(20, 16, 28, 36);
    ctx.fillStyle = palette.bodyLight; ctx.fillRect(20, 16, 28, 4);

    const drawHorn = (x, isRight) => {
      ctx.fillStyle = palette.hornShadow;
      ctx.beginPath();
      if (!isRight) { ctx.moveTo(x, 16); ctx.lineTo(x - 12, 0); ctx.lineTo(x + 10, 16); }
      else { ctx.moveTo(x, 16); ctx.lineTo(x + 12, 0); ctx.lineTo(x - 10, 16); }
      ctx.fill();
      ctx.fillStyle = palette.horn;
      ctx.beginPath();
      if (!isRight) { ctx.moveTo(x + 2, 16); ctx.lineTo(x - 6, 4); ctx.lineTo(x + 6, 16); }
      else { ctx.moveTo(x - 2, 16); ctx.lineTo(x + 6, 4); ctx.lineTo(x - 6, 16); }
      ctx.fill();
    };
    drawHorn(22, false); drawHorn(42, true);

    ctx.fillStyle = palette.eye; ctx.fillRect(24, 28, 6, 10); ctx.fillRect(38, 28, 6, 10);
    ctx.fillStyle = palette.eyeInner; ctx.fillRect(25, 33, 4, 4); ctx.fillRect(39, 33, 4, 4);
    ctx.fillStyle = palette.mouth; ctx.fillRect(27, 44, 14, 3);
    ctx.fillStyle = 'rgba(255,0,0,0.4)'; ctx.fillRect(27, 43, 14, 1);
    ctx.fillStyle = palette.bodyShadow; ctx.fillRect(22, 22, 2, 2); ctx.fillRect(40, 40, 2, 2);
  }
}

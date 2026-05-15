import { Container, Graphics } from 'pixi.js';

export class Oni {
  constructor(config = {}) {
    this.name = '惡鬼';
    this.maxHp = config.hp || 220;
    this.hp = this.maxHp;
    this._damage = 18;
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
    this.rageThreshold = config.rageThreshold || 30;
    this.autoRageTimer = 0;
    this.autoRageInterval = 10;
    this.autoRageAmount = 1;
    this.rageAdder = 10;

    this.container = new Container();
    this.kanaboContainer = new Container();
    this.kanaboGfx = new Graphics();
    this.kanaboContainer.addChild(this.kanaboGfx);
    this.gfx = new Graphics();

    // Kanabo drawn behind body
    this.container.addChild(this.kanaboContainer);
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
    this.container.alpha = this.state === 'ATTACKING' ? 0.8 : this.opacity;

    // Rage glow approximated as colored stroke
    const glowStroke = this.rage >= this.rageThreshold * 0.7
      ? { color: '#ff4500', width: Math.min(10, (this.rage - this.rageThreshold * 0.7) * 0.8) }
      : null;

    this.drawKanabo();

    this.gfx.clear();
    this.gfx.rect(-32, -64, 64, 64).fill('#8b0000');
    if (glowStroke) this.gfx.rect(-32, -64, 64, 64).stroke(glowStroke);

    // Horns
    this.gfx.moveTo(-20, -64).lineTo(-35, -85).lineTo(-5, -64).closePath().fill('#f4f6f7');
    this.gfx.moveTo(20, -64).lineTo(35, -85).lineTo(5, -64).closePath().fill('#f4f6f7');

    // Gold eyes
    this.gfx.rect(-18, -45, 10, 10).fill('#f1c40f');
    this.gfx.rect(8, -45, 10, 10).fill('#f1c40f');
    this.gfx.rect(-14, -41, 4, 4).fill('#000000');
    this.gfx.rect(10, -41, 4, 4).fill('#000000');

    // Mouth and fangs
    const isEnraged = this.rage >= this.rageThreshold - 1;
    this.gfx.rect(-12, -22, 24, isEnraged ? 10 : 4).fill(isEnraged ? '#ff0000' : '#1a1a1a');
    this.gfx.rect(-10, -25, 4, 8).fill('#ffffff');
    this.gfx.rect(6, -25, 4, 8).fill('#ffffff');
  }

  drawKanabo() {
    this.kanaboGfx.clear();

    if (this.state === 'ATTACKING') {
      this.kanaboContainer.rotation = Math.PI * 0.8;
      this.kanaboContainer.position.set(0, -20);
    } else {
      this.kanaboContainer.rotation = -Math.PI * 0.2;
      this.kanaboContainer.position.set(40, -40);
    }

    this.kanaboGfx.rect(-6, -60, 12, 70).fill('#2c3e50');
    for (let i = 0; i < 5; i++) {
      this.kanaboGfx.rect(-8, -55 + i * 12, 3, 3).fill('#bdc3c7');
      this.kanaboGfx.rect(5, -50 + i * 12, 3, 3).fill('#bdc3c7');
    }
    this.kanaboGfx.rect(-7, 10, 14, 4).fill('#f1c40f');
  }

  // renderAvatar stays Canvas 2D for panel/leaderboard thumbnails
  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);
    const p = {
      skin: '#c0392b', skinShadow: '#7b241c', skinLight: '#e74c3c',
      horn: '#f4f6f7', hornShadow: '#bdc3c7',
      eye: '#f1c40f', fang: '#ffffff', hair: '#2c3e50',
      bg: 'rgba(192,57,43,0.2)',
    };

    ctx.fillStyle = p.bg; ctx.beginPath(); ctx.arc(32, 32, 30, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = p.hair; ctx.fillRect(10, 15, 44, 25);
    ctx.fillStyle = '#1a252f'; ctx.fillRect(12, 10, 8, 8); ctx.fillRect(44, 10, 8, 8);

    ctx.fillStyle = p.skinShadow; ctx.fillRect(6, 50, 52, 14);

    ctx.fillStyle = p.skinShadow; ctx.fillRect(14, 18, 36, 36);
    ctx.fillStyle = p.skin; ctx.fillRect(18, 20, 32, 32);
    ctx.fillStyle = p.skinLight; ctx.fillRect(20, 20, 28, 4);

    const drawOniHorn = (x, isRight) => {
      ctx.fillStyle = p.hornShadow;
      ctx.beginPath();
      if (!isRight) { ctx.moveTo(x, 20); ctx.lineTo(x - 8, 2); ctx.lineTo(x + 12, 20); }
      else { ctx.moveTo(x, 20); ctx.lineTo(x + 8, 2); ctx.lineTo(x - 12, 20); }
      ctx.fill();
      ctx.fillStyle = p.horn;
      ctx.fillRect(isRight ? x - 4 : x, 8, 4, 8);
    };
    drawOniHorn(20, false); drawOniHorn(44, true);

    ctx.fillStyle = p.eye; ctx.fillRect(22, 30, 8, 6); ctx.fillRect(36, 30, 8, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(25, 32, 2, 2); ctx.fillRect(39, 32, 2, 2);

    ctx.fillStyle = '#000'; ctx.fillRect(24, 44, 18, 4);
    ctx.fillStyle = p.fang; ctx.fillRect(25, 42, 3, 5); ctx.fillRect(38, 42, 3, 5);
    ctx.fillStyle = p.skinShadow; ctx.fillRect(30, 26, 6, 2);
  }
}

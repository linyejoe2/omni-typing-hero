import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { CONFIG } from '../CONST.js';
import { Kooni } from '../models/Monster/Kooni.js';
import { Keyboard } from '../models/Keyboard.js';
import { TextInput } from '../models/TextInput.js';
import { DamageNumber } from '../models/Effect/DamageNumber.js';
import { drawSword } from '../models/Icon/Sword.js';
import { drawCoin } from '../models/Icon/Coin.js';
import { EnemyFireball } from '../models/Projectile/EnemyFireball.js';
import { FirebaseService } from '../services/firebase.js';
import { refreshLeaderboard } from '../ui/LeaderBoard.js';
import { roundRectGfx } from '../util.js';
import { elementManager } from '../ui/ElementManager.js';
import { heroGenerator } from '../models/Hero/heroGenerator.js';
import { playerPanel } from '../ui/PlayerPanel.js';
import { Oni } from '../models/Monster/Oni.js';

export class BattleScene extends BaseScene {
  constructor(canvas, charData) {
    super();
    // canvas is now the Pixi app — kept for compatibility but not used for drawing
    this.charData = charData;

    this.gold = 0;
    this.isGameOver = false;
    this.restartTimer = 60;
    this.shakeTime = 0;
    this.shakeIntensity = 5;
    this.finalStats = {};
    this.isPaused = true;
    this.newGame = true;
    this.frenzyParticles = [];

    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.damageNumbers = [];

    // ── Pixi container hierarchy ────────────────────────────────────────
    this.container = new Container();

    this.bgGfx = new Graphics();          // frenzy overlay
    this.entityLayer = new Container();   // hero + monster
    this.projectileGfx = new Graphics();  // all projectiles (cleared each frame)
    this.particleGfx = new Graphics();    // all particles (cleared each frame)
    this.damageLayer = new Container();   // DamageNumber Text objects
    this.uiGfx = new Graphics();          // HP bars, gold, ATK
    this.overlayGfx = new Graphics();     // pause / game-over / clear overlay

    this.container.addChild(this.bgGfx);
    this.container.addChild(this.entityLayer);
    this.container.addChild(this.projectileGfx);
    this.container.addChild(this.particleGfx);
    this.container.addChild(this.damageLayer);
    this.container.addChild(this.uiGfx);

    // UI texts (persistent, updated each frame)
    this._buildUITexts();

    // Overlay texts (persistent, toggled visible)
    this._buildOverlay();

    // Entities
    this.hero = this.createHero();
    this.monster = this.createMonster();
    this.textInput = new TextInput();
    this.keyboard = new Keyboard();

    this._addEntityContainers();
    // Overlay must always be topmost — move it after entities
    this.container.addChild(this.overlayContainer);

    refreshLeaderboard('Kooni', this.charData.job);

    // Keyboard → game input
    this.keyboard.onKeyPress = async (key) => {
      this.newGame = false;
      if (key === 'Escape') {
        this.isPaused ? this.resumeGame() : this.pauseGame();
        return;
      }
      if (this.isPaused) { if (key === ' ') this.resumeGame(); return; }
      if (this.isGameOver) { this.resetGame(); return; }

      const result = this.textInput.handleInput(key);
      if (result.includes('WORD_COMPLETE')) {
        const projectile = this.hero.attack(this.monster.x, this.monster.y, result === 'WORD_COMPLETE_CRIT');
        if (projectile) this.projectiles.push(projectile);
      } else if (result === 'CHAR_WRONG') {
        this.monster.penalizeMiss();
      }
    };
  }

  _buildUITexts() {
    const makeText = (str, size, color = '#ffffff', align = 'left') =>
      new Text({ text: str, style: { fontFamily: 'Courier New', fontSize: size, fontWeight: 'bold', fill: color, align } });

    this.heroHpText = makeText('', 10, '#ffffff', 'center');
    this.heroHpText.anchor.set(0.5, 0.5);

    this.goldText = makeText('GOLD: 0', 14);

    this.monsterAtkText = makeText('ATK: ?', 14);

    [this.heroHpText, this.goldText, this.monsterAtkText].forEach(t => this.container.addChild(t));
  }

  _buildOverlay() {
    this.overlayContainer = new Container();
    this.overlayContainer.visible = false;
    this.container.addChild(this.overlayContainer);

    this.overlayBgGfx = new Graphics();
    this.overlayContainer.addChild(this.overlayBgGfx);

    const centered = (str, size, color = '#ffffff') => {
      const t = new Text({ text: str, style: { fontFamily: 'Courier New', fontSize: size, fontWeight: 'bold', fill: color, align: 'center' } });
      t.anchor.set(0.5, 0.5);
      return t;
    };

    // Pause overlay
    this.pauseTitleText = centered('', 45, '#00d4ff');
    this.pauseTipsText = centered('', 14, '#d3d3d3');
    this.pauseHintText = centered('', 20, '#ffffff');

    // Game-over / game-clear title
    this.endTitleText = centered('', 50, '#ffffff');
    this.endTimeText = centered('', 30, '#62fd4e');
    this.endHintText = centered('', 20, '#ffffff');
    this.endHintText2 = centered('', 12, '#d3d3d3');

    // Stat card texts (4 cards)
    this.cardTexts = [0, 1, 2, 3].map(() => ({
      label: centered('', 14, '#aaaaaa'),
      value: centered('', 28, '#ffffff'),
    }));

    [
      this.pauseTitleText, this.pauseTipsText, this.pauseHintText,
      this.endTitleText, this.endTimeText, this.endHintText, this.endHintText2,
      ...this.cardTexts.flatMap(c => [c.label, c.value]),
    ].forEach(t => this.overlayContainer.addChild(t));
  }

  _addEntityContainers() {
    this.entityLayer.addChild(this.monster.container);
    this.entityLayer.addChild(this.hero.container);
    this.container.addChild(this.textInput.container);
    this.container.addChild(this.keyboard.container);
  }

  in() {
    elementManager.showScreen('gameScreen');
    elementManager.showPanel();
    playerPanel.update(this.charData);
  }

  updateFinalStats() {
    if (Object.keys(this.finalStats).length > 0) return;
    this.finalStats = {
      monster: this.monster.name,
      nickname: this.charData.nickname,
      clear: this.monster.status === 'DEAD',
      job: this.hero.job,
      gender: this.hero.gender,
      wpm: this.textInput.wpm,
      dps: this.textInput.dps,
      accuracy: Math.round(this.textInput.accuracy * 100) / 100,
      maxCombo: this.textInput.maxCombo,
      seconds: Math.round(this.textInput.totalActiveTime * 10) / 10000,
    };
  }

  isGameCleared() { return this.monster.hp <= 0; }

  createHero() { return heroGenerator({ ...this.charData, onDeath: this.onDeath.bind(this) }); }

  createMonster() {
    return new Oni({ x: 650, y: CONFIG.groundY - 20, rageThreshold: 50 });
  }

  onDeath() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.updateFinalStats();
    const user = FirebaseService.auth.currentUser;
    if (!user) return;
    FirebaseService.addBattleRecord(user.uid, this.finalStats);
  }

  onMonsterDie() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.updateFinalStats();
    const user = FirebaseService.auth.currentUser;
    if (!user) return;
    FirebaseService.addBattleRecord(user.uid, this.finalStats);
    FirebaseService.updatePersonalBest(user.uid, this.finalStats);
    FirebaseService.updateLeaderboard(user.uid, this.finalStats);
  }

  resetGame() {
    if (this.restartTimer) return;
    this.isGameOver = false;
    this.restartTimer = 60;

    // Remove old entity containers
    this.entityLayer.removeChildren();
    this.container.removeChild(this.textInput.container);
    this.container.removeChild(this.keyboard.container);
    this.damageLayer.removeChildren();

    this.hero = this.createHero();
    this.monster = this.createMonster();
    this.textInput = new TextInput();
    this.keyboard = new Keyboard();
    this.finalStats = {};
    this.isPaused = true;
    this.newGame = true;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.particles = [];
    this.damageNumbers = [];
    this.frenzyParticles = [];

    this._addEntityContainers();
    this.container.addChild(this.overlayContainer); // keep overlay on top
  }

  update() {
    if (this.isPaused) return;
    if (this.isGameOver && this.restartTimer) { this.restartTimer--; return; }

    this.monster.update();
    this.hero.update();
    this.keyboard.update();
    this.textInput.update();

    // Projectiles
    this.projectiles.forEach((pj, i) => {
      const isHit = pj.update(this.particles);
      if (isHit) {
        this.monster.takeDamage(pj.damage, pj.isCrit);
        this.textInput.recordDamage(pj.damage);
        const dn = new DamageNumber(this.monster.damageNumberX, this.monster.damageNumberY, pj.damage, pj.isCrit);
        dn.getDisplayObjects().forEach(obj => this.damageLayer.addChild(obj));
        this.damageNumbers.push(dn);
      }
      if (!pj.alive) this.projectiles.splice(i, 1);
    });

    this.enemyProjectiles.forEach((pj, i) => {
      const isHit = pj.update(this.particles);
      if (isHit) {
        this.shakeTime = 8;
        const dmg = this.hero.takeDamage(this.monster.damage());
        const dn = new DamageNumber(this.hero.x - 25, this.hero.y - 30, dmg);
        dn.getDisplayObjects().forEach(obj => this.damageLayer.addChild(obj));
        this.damageNumbers.push(dn);
      }
      if (!pj.alive) this.enemyProjectiles.splice(i, 1);
    });

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    // Damage numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      this.damageNumbers[i].update();
      if (this.damageNumbers[i].life <= 0) {
        this.damageNumbers[i].getDisplayObjects().forEach(obj => this.damageLayer.removeChild(obj));
        this.damageNumbers.splice(i, 1);
      }
    }

    if (this.shakeTime > 0) this.shakeTime--;
    if (this.monster.status === 'DEAD') this.onMonsterDie();
  }

  draw() {
    const W = CONFIG.width;
    const H = CONFIG.height;

    // Screen shake — offset the whole scene container
    if (this.shakeTime > 0) {
      this.container.x = (Math.random() - 0.5) * this.shakeIntensity;
      this.container.y = (Math.random() - 0.5) * this.shakeIntensity;
    } else {
      this.container.x = 0;
      this.container.y = 0;
    }

    // Background effects (frenzy overlay + frenzy particles)
    this.bgGfx.clear();
    if (this.textInput.isFrenzy) {
      this.bgGfx.rect(0, 0, W, H).fill({ color: '#ff4500', alpha: 0.15 });
      this._drawFrenzyParticles();
    }

    // Draw entities
    this.hero.draw();
    this.monster.draw();

    // Projectiles + particles onto shared Graphics (cleared each frame)
    this.projectileGfx.clear();
    this.projectiles.forEach(p => p.draw(this.projectileGfx));
    this.enemyProjectiles.forEach(p => p.draw(this.projectileGfx));

    this.particleGfx.clear();
    this.particles.forEach(p => p.draw(this.particleGfx));

    // TextInput + Keyboard draw their own containers
    this.textInput.draw();
    this.keyboard.draw();

    // UI (HP bars, gold, ATK)
    this._drawUI();

    // Overlays (pause / game-over / game-clear)
    if (this.isPaused) {
      this._drawPause(W, H);
    } else if (this.isGameOver) {
      if (this.isGameCleared()) this._drawGameClear(W, H);
      else this._drawGameOver(W, H);
    } else {
      this.overlayContainer.visible = false;
    }
  }

  _drawFrenzyParticles() {
    if (Math.random() > 0.4) {
      this.frenzyParticles.push({
        x: Math.random() * CONFIG.width,
        y: CONFIG.groundY + 20,
        size: Math.random() * 6 + 4,
        speedY: Math.random() * -4 - 2,
        speedX: (Math.random() - 0.5) * 2,
        life: 1.0,
      });
    }
    for (let i = this.frenzyParticles.length - 1; i >= 0; i--) {
      const p = this.frenzyParticles[i];
      p.x += p.speedX; p.y += p.speedY; p.life -= 0.015;
      const color = p.life > 0.6 ? '#ffea00' : p.life > 0.3 ? '#ff4500' : '#8b0000';
      const sz = p.size * p.life;
      this.bgGfx.rect(p.x, p.y, sz, sz).fill({ color, alpha: p.life });
      if (p.life <= 0) this.frenzyParticles.splice(i, 1);
    }
  }

  _drawUI() {
    const bw = 200;
    const bh = 16;
    const infoX = 50;
    const infoY = 25;

    this.uiGfx.clear();

    // Hero HP bar
    this.uiGfx.rect(infoX, infoY, bw, bh).fill('#333333');
    this.uiGfx.rect(infoX, infoY, Math.max(0, this.hero.currentHp / this.hero.hp) * bw, bh).fill('#ff3300');
    this.uiGfx.rect(infoX, infoY, bw, bh).stroke({ color: '#d4af37', width: 1 });

    this.heroHpText.x = infoX + bw / 2;
    this.heroHpText.y = infoY + bh / 2 + 1;
    this.heroHpText.text = `${Math.ceil(this.hero.currentHp)} / ${this.hero.hp}`;

    // Gold icon + text
    drawCoin(this.uiGfx, infoX + 10, infoY + 30);
    this.goldText.x = infoX + 30;
    this.goldText.y = infoY + 26;
    this.goldText.text = `GOLD: ${this.charData.gold}`;

    // Monster HP + rage bars
    const mInfoX = 550;
    const mInfoY = 58;
    this.uiGfx.rect(mInfoX, 25, bw, bh).fill('#333333');
    this.uiGfx.rect(mInfoX, 25, Math.max(0, this.monster.hp / this.monster.maxHp) * bw, bh).fill('#ff3300');
    this.uiGfx.rect(mInfoX, 42, bw, 6).fill('#222222');
    this.uiGfx.rect(mInfoX, 42, Math.min(1, this.monster.rage / this.monster.rageThreshold) * bw, 6).fill('#9400d3');
    this.uiGfx.rect(mInfoX, 25, bw, 23).stroke({ color: '#d4af37', width: 1 });

    drawSword(this.uiGfx, mInfoX, mInfoY);
    this.monsterAtkText.x = mInfoX + 30;
    this.monsterAtkText.y = mInfoY;
    this.monsterAtkText.text = `ATK: ${this.monster._damage}`;
  }

  _showOverlay(bgColor, bgAlpha = 0.85) {
    this.overlayContainer.visible = true;
    this.overlayBgGfx.clear();
    this.overlayBgGfx.rect(0, 0, CONFIG.width, CONFIG.height).fill({ color: bgColor, alpha: bgAlpha });

    // Hide all overlay texts first
    [
      this.pauseTitleText, this.pauseTipsText, this.pauseHintText,
      this.endTitleText, this.endTimeText, this.endHintText, this.endHintText2,
      ...this.cardTexts.flatMap(c => [c.label, c.value]),
    ].forEach(t => { t.visible = false; });
  }

  _drawPause(W, H) {
    this._showOverlay('#0a0a19');

    this.pauseTitleText.visible = true;
    this.pauseTitleText.x = W / 2; this.pauseTitleText.y = H / 2 - 100;
    this.pauseTitleText.text = this.newGame ? '準備遊戲' : '暫停';
    this.pauseTitleText.style.fill = '#00d4ff';

    // Tips box (draw on overlay gfx)
    const tipBoxW = 400; const tipBoxH = 110;
    const boxX = W / 2 - tipBoxW / 2; const boxY = H / 2 - 40;
    this.overlayBgGfx.rect(boxX, boxY, tipBoxW, tipBoxH).fill({ color: '#ffffff', alpha: 0.05 });
    this.overlayBgGfx.rect(boxX, boxY, tipBoxW, tipBoxH).stroke({ color: '#444444', width: 2 });

    const tips = ['打字擊敗怪物', '打錯字會激怒怪物', '中間綠色能量條集滿 = 狂暴', '按下 ESC 可以暫停'];
    this.pauseTipsText.visible = true;
    this.pauseTipsText.x = W / 2; this.pauseTipsText.y = boxY + tipBoxH / 2;
    this.pauseTipsText.text = tips.join('\n');

    this.pauseHintText.visible = true;
    this.pauseHintText.x = W / 2; this.pauseHintText.y = H / 2 + 120;
    const alpha = Math.abs(Math.sin(Date.now() / 500));
    this.pauseHintText.alpha = alpha;
    this.pauseHintText.text = this.newGame ? '按下空白鍵開始戰鬥' : '按下空白鍵繼續';
  }

  _drawCardData(W, H) {
    const stats = this.finalStats;
    const cardData = [
      { label: 'MAX COMBO', value: stats.maxCombo, color: '#ffeb3b' },
      { label: 'WPM', value: stats.wpm, color: '#03a9f4' },
      { label: 'DPS', value: stats.dps, color: '#ff4500' },
      { label: 'ACCURACY', value: `${stats.accuracy}%`, color: '#8bc34a' },
    ];

    const cardW = 140; const cardH = 100; const gap = 20;
    const totalW = cardW * 4 + gap * 3;
    const startX = (W - totalW) / 2;
    const cardY = H / 2 - 60;

    cardData.forEach((data, i) => {
      const x = startX + i * (cardW + gap);
      roundRectGfx(this.overlayBgGfx, x, cardY, cardW, cardH, 12,
        { color: '#ffffff', alpha: 0.1 }, { color: '#ffffff', alpha: 0.2 });

      this.cardTexts[i].label.visible = true;
      this.cardTexts[i].label.x = x + cardW / 2;
      this.cardTexts[i].label.y = cardY + 35;
      this.cardTexts[i].label.text = data.label;

      this.cardTexts[i].value.visible = true;
      this.cardTexts[i].value.x = x + cardW / 2;
      this.cardTexts[i].value.y = cardY + 75;
      this.cardTexts[i].value.text = String(data.value);
      this.cardTexts[i].value.style.fill = data.color;
    });
  }

  _drawGameClear(W, H) {
    this._showOverlay('#3f3f3f');

    this.endTitleText.visible = true;
    this.endTitleText.x = W / 2; this.endTitleText.y = H / 2 - 140;
    this.endTitleText.text = 'You beat the Kooni!';
    this.endTitleText.style.fill = '#62fd4e';

    this._drawCardData(W, H);

    this.endTimeText.visible = true;
    this.endTimeText.x = W / 2; this.endTimeText.y = H / 2 + 100;
    this.endTimeText.text = `You spend ${this.finalStats.seconds}s`;
    this.endTimeText.style.fill = '#62fd4e';

    this.endHintText.visible = true;
    this.endHintText.x = W / 2; this.endHintText.y = H / 2 + 200;
    this.endHintText.text = 'Press any key to search another Kooni';
  }

  _drawGameOver(W, H) {
    this._showOverlay('#000000', 0.8);

    this.endTitleText.visible = true;
    this.endTitleText.x = W / 2; this.endTitleText.y = H / 2 - 140;
    this.endTitleText.text = 'You DIE';
    this.endTitleText.style.fill = '#ff0000';

    this._drawCardData(W, H);

    this.endTimeText.visible = true;
    this.endTimeText.x = W / 2; this.endTimeText.y = H / 2 + 100;
    this.endTimeText.text = `You fell after ${this.finalStats.seconds}s`;
    this.endTimeText.style.fill = '#62fd4e';

    this.endHintText2.visible = true;
    this.endHintText2.x = W / 2; this.endHintText2.y = H / 2 + 150;
    this.endHintText2.text = 'Defeat the monster to record your score';

    this.endHintText.visible = true;
    this.endHintText.x = W / 2; this.endHintText.y = H / 2 + 200;
    this.endHintText.text = 'Press any key to resurrect';
  }

  pauseGame() { this.isPaused = true; }
  resumeGame() { this.isPaused = false; }
  handleMouseDown() { if (this.isPaused) this.resumeGame(); }
}

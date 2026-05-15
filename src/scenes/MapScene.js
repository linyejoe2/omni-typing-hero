import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { monsterGenerator } from '../models/Monster/monsterGenerator.js';
import { elementManager } from '../ui/ElementManager.js';
import { BattleScene } from './BattleScene.js';
import { sceneManager } from './SceneManager.js';
import { CONFIG } from '../CONST.js';

export class MapScene {
  constructor(app, charData) {
    this.app = app; // Pixi Application
    this.charData = charData;

    this.regions = [
      { id: 'newbie_village', name: '廢棄洋館', img: './assets/maps/house.png', monsters: ['殭屍', '吸血鬼', '生化兵器', '三角頭'], monsterInstanses: [], desc: '適合初學者練習打字速度。', unlocked: true },
      { id: 'japan_city', name: '不祥神社', img: './assets/maps/Jinja.png', monsters: ['Kooni', 'Tengu', 'Oni'], monsterInstanses: [], desc: '充滿和風氣息，字數長度中等。', unlocked: true },
    ];
    this.selectedIdx = 0;

    // Pixi container
    this.container = new Container();
    this.gfx = new Graphics();
    this.textContainer = new Container();
    this.mapSprite = null;

    this.container.addChild(this.gfx);
    this.container.addChild(this.textContainer);
  }

  async init() {
    console.log('進入世界地圖...');

    for (const region of this.regions) {
      for (const name of region.monsters) {
        region.monsterInstanses.push(monsterGenerator(name));
      }
    }

    const canvas = this.app.canvas;
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CONFIG.width / rect.width;
      const scaleY = CONFIG.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      this.hoveredRegion = this.getRegionAt(x, y);
    });
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CONFIG.width / rect.width;
      const scaleY = CONFIG.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      this.onClick(x, y);
    });

    await this._loadMapSprite();
  }

  async _loadMapSprite() {
    const region = this.regions[this.selectedIdx];
    try {
      const texture = await Assets.load(region.img);
      if (this.mapSprite) this.container.removeChild(this.mapSprite);
      this.mapSprite = new Sprite(texture);
      this.mapSprite.x = 280; this.mapSprite.y = 20;
      this.mapSprite.width = 490; this.mapSprite.height = 280;
      this.container.addChildAt(this.mapSprite, 1);
    } catch (_) {
      // Map image not found — draw placeholder
    }
  }

  in() {
    elementManager.showScreen('gameScreen');
    elementManager.showPanel();
  }

  update() {}

  getRegionAt(x, y) {
    return this.regions.find(r => r.x && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
  }

  onClick(x, y) {
    if (x < 250) {
      const idx = Math.floor((y - 100) / 60);
      if (idx >= 0 && idx < this.regions.length) this.selectedIdx = idx;
    }
    if (x > 550 && x < 750 && y > 520 && y < 570) {
      const region = this.regions[this.selectedIdx];
      if (region.unlocked) sceneManager.switchTo(new BattleScene(this.app, this.charData));
    }
  }

  draw() {
    const W = CONFIG.width; const H = CONFIG.height;
    const current = this.regions[this.selectedIdx];
    this.gfx.clear();
    this.textContainer.removeChildren();

    // Background
    this.gfx.rect(0, 0, W, H).fill('#1e1e1e');

    // Sidebar
    this.gfx.rect(0, 0, 250, H).fill({ color: '#ffffff', alpha: 0.05 });
    this.gfx.rect(249, 0, 1, H).stroke({ color: '#ffffff', width: 1 });

    const title = new Text({ text: '選擇冒險區域', style: { fontFamily: 'Courier New', fontSize: 20, fontWeight: 'bold', fill: '#e67e22' } });
    title.x = 30; title.y = 45; this.textContainer.addChild(title);

    this.regions.forEach((r, i) => {
      const y = 100 + i * 60;
      const isSelected = this.selectedIdx === i;
      if (isSelected) this.gfx.rect(0, y, 250, 50).fill({ color: '#e67e22', alpha: 0.3 });
      const label = new Text({ text: r.name, style: { fontFamily: 'Courier New', fontSize: 16, fill: r.unlocked ? (isSelected ? '#ffffff' : '#aaaaaa') : '#555555' } });
      label.x = 40; label.y = y + 16; this.textContainer.addChild(label);
    });

    // Map preview placeholder (sprite drawn separately if loaded)
    if (!this.mapSprite) this.gfx.rect(280, 20, 490, 280).fill('#000000');

    // Monster preview area
    this.gfx.rect(280, 320, 490, 180).fill({ color: '#ffffff', alpha: 0.1 });
    const mTitle = new Text({ text: '出現怪獸：', style: { fontFamily: 'Courier New', fontSize: 14, fill: '#f1c40f' } });
    mTitle.x = 300; mTitle.y = 330; this.textContainer.addChild(mTitle);

    const count = current.monsters.length;
    current.monsterInstanses.forEach((monster, i) => {
      const cx = 280 + (490 / count) * (i + 0.5);
      const cy = 410;

      // Render avatar to offscreen canvas, show as placeholder rect
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 64; offCanvas.height = 64;
      const offCtx = offCanvas.getContext('2d');
      monster.renderAvatar(offCtx);

      this.gfx.rect(cx - 32, cy - 32, 64, 64).fill('#e74c3c');

      const nameLabel = new Text({ text: monster.name, style: { fontFamily: 'Courier New', fontSize: 12, fill: '#ffffff', align: 'center' } });
      nameLabel.anchor.set(0.5, 0); nameLabel.x = cx; nameLabel.y = cy + 38;
      this.textContainer.addChild(nameLabel);
    });

    // Action button
    const btnColor = current.unlocked ? '#e67e22' : '#333333';
    const btnTextColor = current.unlocked ? '#ffffff' : '#777777';
    this.gfx.rect(550, 520, 200, 50).fill(btnColor);
    const btnLabel = new Text({ text: current.unlocked ? '進入區域' : '尚未解鎖', style: { fontFamily: 'Courier New', fontSize: 18, fontWeight: 'bold', fill: btnTextColor } });
    btnLabel.x = 570; btnLabel.y = 535; this.textContainer.addChild(btnLabel);
  }
}

import { Container, Graphics } from 'pixi.js';
import { MagicStaff } from './Weapon/Staff.js';

export class Hero {
  constructor(data) {
    this.name = data.nickname;
    this.job = data.job;
    this.gender = data.gender;
    this.hp = 3;
    this.x = 150;
    this.y = 300;
    this.originX = 150;
    this.state = 'IDLE';
    this.color = this.getJobColor();
    this.weapon = new MagicStaff();

    this.container = new Container();
    this.gfx = new Graphics();
    this.container.addChild(this.gfx);
  }

  getJobColor() {
    const colors = { SWORDSMAN: '#e74c3c', mage: '#3498db', ARCHER: '#2ecc71', TANKER: '#95a5a6' };
    return colors[this.job] || '#ffffff';
  }

  update() {
    if (this.job === 'SWORDSMAN') {
      if (this.state === 'ATTACKING') {
        this.x += 25;
        if (this.x >= 550) this.state = 'RETURNING';
      } else if (this.state === 'RETURNING') {
        this.x -= 10;
        if (this.x <= this.originX) { this.x = this.originX; this.state = 'IDLE'; }
      }
    }
  }

  draw() {
    this.container.position.set(this.x, this.y);
    this.gfx.clear();
    this.gfx.rect(-20, -60, 40, 60).fill(this.color);
    this.gfx.rect(-10, -55, 20, 10).fill(this.gender === 'FEMALE' ? '#ff9999' : '#9999ff');
  }
}

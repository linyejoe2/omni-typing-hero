import { Text } from 'pixi.js';

export class DamageNumber {
  constructor(x, y, value, isCrit = false) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y - 20;
    this.value = value;
    this.isCrit = isCrit;

    this.life = 1.0;
    this.velocity = -2;
    this.opacity = 1.0;

    const color = isCrit ? '#ff9900' : '#ffffff';
    const fontSize = isCrit ? 30 : 18;

    this.text = new Text({
      text: String(value),
      style: {
        fontFamily: 'Courier New',
        fontSize,
        fontWeight: isCrit ? '900' : 'bold',
        fill: color,
        stroke: { color: isCrit ? '#ff0000' : '#000000', width: 3 },
        align: 'center',
      },
    });
    this.text.anchor.set(0.5, 1);
    this.text.x = this.x;
    this.text.y = this.y;

    if (isCrit) {
      this.critLabel = new Text({
        text: 'CRITICAL!',
        style: { fontFamily: 'Arial', fontSize: 12, fontWeight: 'bold', fill: '#ff9900', align: 'center' },
      });
      this.critLabel.anchor.set(0.5, 1);
    }
  }

  update() {
    this.y += this.velocity;
    this.velocity *= 0.95;
    this.life -= 0.01;
    this.opacity = this.life;

    this.text.x = this.x;
    this.text.y = this.y;
    this.text.alpha = this.opacity;

    if (this.critLabel) {
      this.critLabel.x = this.x;
      this.critLabel.y = this.y - this.text.style.fontSize;
      this.critLabel.alpha = this.opacity;
    }
  }

  /** Returns all Pixi display objects owned by this damage number. */
  getDisplayObjects() {
    return this.critLabel ? [this.text, this.critLabel] : [this.text];
  }
}

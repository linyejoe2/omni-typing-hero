import { BaseHero } from './BaseHero.js';
import { MagicStaff } from '../Weapon/Staff.js';

export class Mage extends BaseHero {
  constructor(data) {
    super(data);
    this.color = "#3498db"; // 法師主色：藍色
    this.weapon = new MagicStaff();
    this.floatOffset = 0;

    /**
    * 職業成長率 (Growth Rates)
    * 這是每個職業的「潛力值」。
    * 例如法師的 ATK 成長率高，而戰士的 HP 成長率高。
    */
    this.growthRates = {
      atk: 3,      // 每級固定增加的攻擊力
      crit: 0.005,  // 每級固定增加的爆擊率 (0.5%)
      hp: 5,      // 每級固定增加的血量
      def: 0.2,    // 每級固定增加的物防
      res: 0.5,    // 每級固定增加的魔防
      eva: 0.005    // 每級固定增加的閃避率 (0.5%)
    };
  }

  update() {
    super.update();
    // 法師特有的浮空呼吸感
    this.floatOffset = Math.sin(Date.now() * 0.003) * 3;
  }

  renderHero(ctx) {
    const yOff = this.floatOffset;

    // 1. 法袍 (身體)
    ctx.fillStyle = this.color;
    ctx.fillRect(-15, -45 + yOff, 30, 45);

    // 2. 臉部
    ctx.fillStyle = this.skinColor;
    ctx.fillRect(-10, -40 + yOff, 20, 15);

    // 3. 性別差異特徵
    ctx.fillStyle = this.decoColor;
    if (this.gender === 'FEMALE') {
      // 女法師：長髮裝飾或蝴蝶結
      ctx.fillRect(-15, -42 + yOff, 5, 25);
      ctx.fillRect(10, -42 + yOff, 5, 25);
    } else {
      // 男法師：斗篷領口或簡單帽子
      ctx.fillRect(-15, -45 + yOff, 30, 5);
    }

    // 4. 眼睛
    ctx.fillStyle = "#000";
    ctx.fillRect(-5, -35 + yOff, 2, 2);
    ctx.fillRect(3, -35 + yOff, 2, 2);

    // 5. 繪製武器 (法杖)
    if (this.weapon) {
      ctx.save();
      ctx.translate(15, -20 + yOff);
      const weaponAngle = (this.state === 'ATTACKING') ? 0.5 : 0;
      ctx.rotate(weaponAngle);
      this.weapon.renderWeapon(ctx);
      ctx.restore();
    }
  }
}
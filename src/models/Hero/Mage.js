import { BaseHero } from './BaseHero.js';
import { MagicStaff } from '../Weapon/Staff.js';

export class Mage extends BaseHero {
  constructor(data) {
    super(data);
    this.weapon = new MagicStaff();
    this.floatOffset = 0;

    // 基礎屬性
    this.maxAtk = 25;
    this.maxHp = 80;
    this.critRate = 0.05;
    this.pDef = 10;
    this.mRes = 10;
    this.evaRate = 0.03;

    // 根據性別設定像素裝飾色
    this.palette = {
      primary: "#6c5ce7",      // 深紫 (主色)
      light: "#a29bfe",        // 淺紫 (高光)
      dark: "#4834d4",         // 暗紫 (陰影)
      skin: this.isFemale ? "#ffe0bd" : "#ffcc91",         // 膚色
      skinShadow: "#ffcd94",   // 膚色陰影
      eye: "#2d3436",          // 眼睛
      deco: this.isFemale ? "#ff99cc" : "#99ccff",        // 裝飾紅/寶石
      hair: this.isFemale ? "#ff99cc" : "#788694",
      hairLight: this.isFemale ? "#ffb7db" : "#969696",
    };

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
      eva: 0.006    // 每級固定增加的閃避率 (0.5%)
    };

    this.updateFinalStats();

    // 重新計算後，確保當前血量補滿
    this.hp = this.maxHp;
  }

  update() {
    super.update();
    // 法師特有的浮空呼吸感
    this.floatOffset = Math.sin(Date.now() * 0.003) * 3;
  }

  renderHero(ctx) {
    const yOff = this.floatOffset;

    // 1. 法袍 (身體)
    ctx.fillStyle = this.palette.primary;
    ctx.fillRect(-15, -45 + yOff, 30, 45);

    // 2. 臉部
    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(-10, -40 + yOff, 20, 15);

    // 3. 性別差異特徵
    if (this.gender === 'FEMALE') {
      // 女法師：長髮裝飾或蝴蝶結
      ctx.fillStyle = this.palette.deco;
      ctx.fillRect(-15, -42 + yOff, 5, 25);
      ctx.fillRect(10, -42 + yOff, 5, 25);
    } else {
      // 男法師：斗篷領口或簡單帽子
      ctx.fillStyle = "#1c2630";
      ctx.fillRect(-15, -42 + yOff, 5, 15);
      ctx.fillRect(10, -42 + yOff, 5, 15);
      ctx.fillStyle = this.palette.deco;
      ctx.fillRect(-3, -46 + yOff, 7, 4);
    }

    // 4. 眼睛
    ctx.fillStyle = this.palette.eye;
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

  /**
   * 外部呼叫的統一接口
   * @param {CanvasRenderingContext2D} ctx 
   */
  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    // 雖然是 64x64，但我們用更小的數值來畫，增加精緻度
    // 想像現在座標系是 0-64，我們可以用 0.5 甚至 0.2 為單位

    // --- 1. 後景披風/法袍底 (肩膀) ---
    ctx.fillStyle = this.palette.dark;
    ctx.fillRect(8, 45, 48, 19); // 肩膀輪廓

    ctx.fillStyle = this.palette.primary;
    ctx.fillRect(10, 48, 44, 16); // 主色填充

    // --- 2. 臉部與頸部 ---
    // 頸部陰影
    ctx.fillStyle = this.palette.skinShadow;
    ctx.fillRect(24, 40, 16, 8);

    // 臉部主體
    ctx.fillStyle = this.palette.skin;
    ctx.fillRect(18, 18, 28, 26);

    // 臉部側面陰影 (增加立體感)
    ctx.fillStyle = this.palette.skinShadow;
    ctx.fillRect(41, 18, 5, 26);

    // --- 3. 法師特徵：髮型與帽子 ---
    if (this.gender === 'FEMALE') {
      // 精緻長髮
      ctx.fillStyle = this.palette.hair;
      ctx.fillRect(14, 18, 6, 40); // 左髮
      ctx.fillRect(44, 18, 6, 40); // 右髮
      // 髮絲高光
      ctx.fillStyle = this.palette.hairLight;
      ctx.fillRect(14, 20, 2, 15);
    }

    // 法師尖帽 (簡約精緻風)
    ctx.fillStyle = this.palette.primary;
    // 帽緣
    ctx.fillRect(12, 12, 40, 6);
    // 帽身 (梯形感)
    ctx.beginPath();
    ctx.moveTo(18, 12);
    ctx.lineTo(32, 0);
    ctx.lineTo(46, 12);
    ctx.fill();

    // --- 4. 五官細節 ---
    // 眼睛 (加入一點神采)
    ctx.fillStyle = this.palette.eye;
    ctx.fillRect(24, 30, 3, 5); // 左眼
    ctx.fillRect(37, 30, 3, 5); // 右眼

    // 腮紅 (點綴)
    ctx.fillStyle = "rgba(253, 121, 174, 0.3)";
    ctx.fillRect(21, 36, 4, 2);
    ctx.fillRect(39, 36, 4, 2);

    // --- 5. 寶石裝飾 ---
    ctx.fillStyle = this.palette.deco;
    ctx.fillRect(30, 8, 4, 4); // 帽子上的寶石
    // 寶石閃光
    ctx.fillStyle = "#fff";
    ctx.fillRect(30, 8, 1.5, 1.5);
  }
}
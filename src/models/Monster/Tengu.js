export class Tengu {
  constructor(config = {}) {
    // 基礎屬性
    this.name = "天狗"
    this.maxHp = config.hp || 150;
    this.hp = this.maxHp;
    this._damage = 15;
    this.damageBuzz = 5;
    // this.mDamage = 5;

    // 變換屬性 (Transform)
    this.x = config.x || 650;
    this.y = config.y || 280;
    this.rotation = 0;
    this.opacity = 1.0;

    // 狀態與特效
    this.status = 'ALIVE'; // ALIVE, HURT, DYING, DEAD
    this.shakeTime = 0;
    this.shakeIntensity = 50; // 震動強度
    this.floatOffset = 0; // 用於平滑浮動效果
    this.damageNumberX = this.x + 25;
    this.damageNumberY = this.y - 30;

    // 怒氣增長相關
    this.isAttacking = false;
    this.rage = 0;
    this.rageThreshold = config.rageThreshold || 50;
    this.autoRageTimer = 0;
    this.autoRageInterval = 10; // 每 60 幀 (約 1 秒) 增加一次
    this.autoRageAmount = 1;    // 每次增加量
    this.rageAdder = 10
  }

  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    const palette = {
      skin: "#d32f2f",        // 天狗經典紅臉
      skinShadow: "#b71c1c",  // 臉部與鼻子陰影
      noseLight: "#f44336",   // 鼻子高光
      hat: "#1a1a1a",         // 黑色兜巾 (Tokin)
      hatDeco: "#f1c40f",     // 帽子上的金色裝飾
      hair: "#ffffff",        // 白色長髮/鬃毛
      hairShadow: "#bdc3c7",  // 頭髮陰影
      eye: "#ffffff",
      eyeInner: "#000000",
      bg: "rgba(255, 215, 0, 0.1)" // 金色神祕氣息背景
    };

    // --- 0. 背景裝飾 ---
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    // --- 1. 白色長髮 (後景) ---
    ctx.fillStyle = palette.hairShadow;
    ctx.fillRect(12, 20, 40, 40); // 後髮輪廓
    ctx.fillStyle = palette.hair;
    ctx.fillRect(14, 22, 36, 38);

    // --- 2. 臉部主體 ---
    // 肩膀/法衣
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(10, 50, 44, 14);

    // 臉部 (稍微偏右，為鼻子留空間)
    ctx.fillStyle = palette.skinShadow;
    ctx.fillRect(18, 18, 28, 32);
    ctx.fillStyle = palette.skin;
    ctx.fillRect(20, 18, 26, 32);

    // --- 3. 標誌性的長鼻子 (立體核心) ---
    // 鼻子底部陰影
    ctx.fillStyle = palette.skinShadow;
    ctx.fillRect(28, 30, 24, 10);
    // 鼻子主體
    ctx.fillStyle = palette.skin;
    ctx.fillRect(28, 28, 22, 8);
    // 鼻子頂部高光
    ctx.fillStyle = palette.noseLight;
    ctx.fillRect(28, 28, 22, 2);

    // --- 4. 黑色兜巾 (帽子) ---
    ctx.fillStyle = palette.hat;
    ctx.fillRect(26, 10, 12, 10); // 小黑帽主體
    // 金色繫帶/裝飾
    ctx.fillStyle = palette.hatDeco;
    ctx.fillRect(26, 18, 12, 2);
    ctx.fillRect(31, 10, 2, 4);

    // --- 5. 五官細節 ---
    // 威嚴的眼睛 (斜眼看著玩家)
    ctx.fillStyle = palette.eye;
    ctx.fillRect(23, 24, 6, 4); // 左眼
    ctx.fillStyle = palette.eyeInner;
    ctx.fillRect(25, 24, 3, 4);

    // 鬍鬚/鬢角 (增加長者/神明的感覺)
    ctx.fillStyle = palette.hair;
    ctx.fillRect(18, 35, 4, 15); // 左鬢
    ctx.fillRect(42, 35, 4, 15); // 右鬢

    // 眉毛 (憤怒的倒八字)
    ctx.fillStyle = palette.hat;
    ctx.beginPath();
    ctx.moveTo(22, 22); ctx.lineTo(30, 25); ctx.stroke();
  }
}
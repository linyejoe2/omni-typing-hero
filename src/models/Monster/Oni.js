export class Oni {
  constructor(config = {}) {
    // 基礎屬性
    this.name = "惡鬼"
    this.maxHp = config.hp || 220;
    this.hp = this.maxHp;
    this._damage = 18;
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
    this.rageThreshold = config.rageThreshold || 30;
    this.autoRageTimer = 0;
    this.autoRageInterval = 10; // 每 60 幀 (約 1 秒) 增加一次
    this.autoRageAmount = 1;    // 每次增加量
    this.rageAdder = 10
  }

  damage() {
    const r = 1 - (Math.random() * 2)
    return Math.round(this._damage + r * this.damageBuzz)
  }

  /**
   * 處理受傷
   * @param {number} damage 傷害值
   * @param {boolean} isCrit 
   */
  takeDamage(damage, isCrit) {
    if (this.status === 'DEAD') return;

    this.hp -= damage;
    this.rage += 1;
    this.shakeTime = 15; // 觸發受傷震動

    if (this.hp <= 0) {
      this.status = 'DYING';
    }
    this.shakeTime = 8;
  }

  /**
   * 外部呼叫：打錯字時大幅增加怒氣
   */
  penalizeMiss() {
    if (this.status !== 'ALIVE') return;
    this.rage += this.rageAdder; // 打錯字一次加 15 (可根據平衡調整)
    // this.shakeTime = 5; // 怪物興奮地抖動一下
    // console.log("怪物嘲諷：打錯字啦！怒氣上升！");
  }

  attack() {
    // 怒氣滿了後的行為，例如清空怒氣並對玩家造成傷害
    // console.log("怪物發動反擊！");
    this.rage = 0;
    this.isAttacking = true;
  }

  /**
   * 每幀更新邏輯
   */
  update() {

    if (this.status === 'DEAD') return;

    // 1. 處理死亡淡出
    if (this.status === 'DYING') {
      this.opacity -= 0.02;
      this.rotation += 0.1;
      if (this.opacity <= 0) {
        this.status = 'DEAD';
        this.opacity = 0;
      }
      return;
    }

    if (this.status === 'ALIVE') {
      // 1. 隨時間慢慢增加怒氣
      this.autoRageTimer++;
      if (this.autoRageTimer >= this.autoRageInterval) {
        this.rage += this.autoRageAmount;
        this.autoRageTimer = 0;
      }

      // 2. 確保怒氣不超過閾值 (除非你要觸發反擊)
      if (this.rage > this.rageThreshold) {
        this.rage = this.rageThreshold;
        this.attack(); // 這裡可以觸發反擊邏輯
      }
    }

    // 2. 處理震動倒數
    if (this.shakeTime > 0) {
      this.shakeTime--;
    }

    // 3. 基礎平滑浮動動畫
    this.floatOffset = Math.sin(Date.now() * 0.005) * 5;
  }

  draw(ctx) {
    if (this.status === 'DEAD') return;

    ctx.save();

    // 基礎座標偏移
    let drawX = this.x;
    let drawY = this.y + this.floatOffset;

    // --- 1. 處理瞬移與攻擊特效 ---
    // 假設攻擊時 state === 'ATTACKING'，我們讓它閃爍或留下殘影
    if (this.state === 'ATTACKING') {
      ctx.globalAlpha = 0.8; // 攻擊時稍微半透明增加速度感
      // 畫一個簡單的殘影
      ctx.fillStyle = "rgba(192, 57, 43, 0.3)";
      ctx.fillRect(drawX - this.x * 0.1 - 32, drawY - 64, 64, 64);
    } else {
      ctx.globalAlpha = this.opacity;
    }

    // 處理震動
    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * this.shakeIntensity;
      drawY += (Math.random() - 0.5) * this.shakeIntensity;
    }

    ctx.translate(drawX, drawY);
    ctx.rotate(this.rotation);

    // --- 2. 怒氣發光預警 ---
    if (this.rage >= (this.rageThreshold * 0.7)) {
      ctx.shadowBlur = (this.rage - (this.rageThreshold * 0.7)) * 5;
      ctx.shadowColor = "#ff4500"; // 惡鬼用橘紅色火光
    }

    // --- 3. 繪製狼牙棒 (武器層) ---
    this.drawKanabo(ctx);

    // --- 4. 身體 (比小鬼更寬大的紅方塊) ---
    ctx.fillStyle = "#8b0000";
    ctx.fillRect(-32, -64, 64, 64); // 64x64 的龐大身軀

    // --- 5. 粗壯的角 ---
    ctx.fillStyle = "#f4f6f7";
    // 左角
    ctx.beginPath();
    ctx.moveTo(-20, -64); ctx.lineTo(-35, -85); ctx.lineTo(-5, -64);
    ctx.fill();
    // 右角
    ctx.beginPath();
    ctx.moveTo(20, -64); ctx.lineTo(35, -85); ctx.lineTo(5, -64);
    ctx.fill();

    // --- 6. 五官 (金眼與獠牙) ---
    // 金色瞳孔
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(-18, -45, 10, 10); // 左眼
    ctx.fillRect(8, -45, 10, 10);   // 右眼
    ctx.fillStyle = "#000";
    ctx.fillRect(-14, -41, 4, 4);   // 瞳孔
    ctx.fillRect(10, -41, 4, 4);   // 瞳孔

    // 嘴巴與獠牙
    const isEnraged = this.rage >= this.rageThreshold - 1;
    ctx.fillStyle = isEnraged ? "#ff0000" : "#1a1a1a";
    ctx.fillRect(-12, -22, 24, isEnraged ? 10 : 4); // 巨口

    ctx.fillStyle = "#fff";
    ctx.fillRect(-10, -25, 4, 8); // 左獠牙
    ctx.fillRect(6, -25, 4, 8);  // 右獠牙

    ctx.restore();
  }

  /**
   * 繪製狼牙棒
   */
  drawKanabo(ctx) {
    ctx.save();

    // 如果在攻擊狀態，棒子向下揮動
    if (this.state === 'ATTACKING') {
      ctx.rotate(Math.PI * 0.8); // 揮擊角度
      ctx.translate(0, -20);
    } else {
      ctx.rotate(-Math.PI * 0.2); // 平時扛在肩後的角度
      ctx.translate(40, -40);
    }

    // 棒身 (深黑色長方塊)
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(-6, -60, 12, 70);

    // 狼牙刺 (像素點)
    ctx.fillStyle = "#bdc3c7";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-8, -55 + i * 12, 3, 3); // 左側刺
      ctx.fillRect(5, -50 + i * 12, 3, 3);  // 右側刺
    }

    // 握柄圓環
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(-7, 10, 14, 4);

    ctx.restore();
  }

  renderAvatar(ctx) {
    const size = 64;
    ctx.clearRect(0, 0, size, size);

    const palette = {
      skin: "#c0392b",        // 比小鬼更暗沉的赤鬼紅
      skinShadow: "#7b241c",  // 深邃肌肉陰影
      skinLight: "#e74c3c",   // 額頭與臉頰高光
      horn: "#f4f6f7",        // 象牙白色的角
      hornShadow: "#bdc3c7",
      eye: "#f1c40f",         // 惡鬼經典的金黃色瞳孔
      fang: "#ffffff",        // 獠牙
      hair: "#2c3e50",        // 濃密的黑髮
      bg: "rgba(192, 57, 43, 0.2)" // 血色氣息背景
    };

    // --- 0. 背景裝飾 ---
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    // --- 1. 濃密亂髮 (後景) ---
    ctx.fillStyle = palette.hair;
    ctx.fillRect(10, 15, 44, 25); // 爆炸頭輪廓
    // 髮絲細節
    ctx.fillStyle = "#1a252f";
    ctx.fillRect(12, 10, 8, 8);
    ctx.fillRect(44, 10, 8, 8);

    // --- 2. 寬厚肩膀 ---
    ctx.fillStyle = palette.skinShadow;
    ctx.fillRect(6, 50, 52, 14); // 惡鬼肩膀極寬

    // --- 3. 臉部主體 (方正且充滿力量) ---
    // 整體輪廓
    ctx.fillStyle = palette.skinShadow;
    ctx.fillRect(14, 18, 36, 36);
    // 受光面
    ctx.fillStyle = palette.skin;
    ctx.fillRect(18, 20, 32, 32);
    // 高光 (額頭)
    ctx.fillStyle = palette.skinLight;
    ctx.fillRect(20, 20, 28, 4);

    // --- 4. 粗壯雙角 (更厚實、稍微向內彎) ---
    const drawOniHorn = (x, isRight) => {
      ctx.fillStyle = palette.hornShadow;
      ctx.beginPath();
      if (!isRight) {
        ctx.moveTo(x, 20); ctx.lineTo(x - 8, 2); ctx.lineTo(x + 12, 20);
      } else {
        ctx.moveTo(x, 20); ctx.lineTo(x + 8, 2); ctx.lineTo(x - 12, 20);
      }
      ctx.fill();

      ctx.fillStyle = palette.horn;
      ctx.fillRect(isRight ? x - 4 : x, 8, 4, 8); // 角的中段高光
    };
    drawOniHorn(20, false);
    drawOniHorn(44, true);

    // --- 5. 五官：黃金眼與獠牙 ---
    // 金色凶光
    ctx.fillStyle = palette.eye;
    ctx.fillRect(22, 30, 8, 6); // 左眼
    ctx.fillRect(36, 30, 8, 6); // 右眼
    ctx.fillStyle = "#000";
    ctx.fillRect(25, 32, 2, 2); // 瞳孔
    ctx.fillRect(39, 32, 2, 2);

    // 寬大嘴巴與獠牙
    ctx.fillStyle = "#000";
    ctx.fillRect(24, 44, 18, 4); // 嘴巴縫隙

    // 獠牙 (從下往上突出的感覺)
    ctx.fillStyle = palette.fang;
    ctx.fillRect(25, 42, 3, 5); // 左牙
    ctx.fillRect(38, 42, 3, 5); // 右牙

    // 臉部皺紋 (增加憤怒感)
    ctx.fillStyle = palette.skinShadow;
    ctx.fillRect(30, 26, 6, 2); // 眉心皺紋
  }
}
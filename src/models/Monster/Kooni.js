/**
 * 怪物類別: Kooni (小鬼)
 */
export class Kooni {
  constructor(config = {}) {
    // 基礎屬性
    this.name = "Kooni"
    this.maxHp = config.hp || 100;
    this.hp = this.maxHp;
    this._damage = 10;
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

  /**
   * 繪製怪物
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (this.status === 'DEAD') return

    ctx.save();

    // 基礎座標偏移 (包含平滑浮動)
    let drawX = this.x;
    let drawY = this.y + this.floatOffset;

    // 處理震動 (Hurt Shake)
    if (this.shakeTime > 0) {
      drawX += (Math.random() - 0.5) * this.shakeIntensity;
      drawY += (Math.random() - 0.5) * this.shakeIntensity;
    }

    ctx.translate(drawX, drawY);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.opacity;

    // 怒氣

    // --- 視覺特效 (發光預警) ---
    if (this.rage >= (this.rageThreshold * 0.7)) {
      ctx.shadowBlur = (this.rage - (this.rageThreshold * 0.7)) * 3;
      ctx.shadowColor = "#9400d3";
    }

    // 1. 身體 (深紅像素塊)
    ctx.fillStyle = "#8b0000";
    ctx.fillRect(-24, -48, 48, 48);

    // 2. 角 (白色像素三角形)
    ctx.fillStyle = "#fff";
    // 左角
    ctx.beginPath();
    ctx.moveTo(-16, -48); ctx.lineTo(-24, -64); ctx.lineTo(-8, -48);
    ctx.fill();
    // 右角
    ctx.beginPath();
    ctx.moveTo(16, -48); ctx.lineTo(24, -64); ctx.lineTo(8, -48);
    ctx.fill();

    // 3. 臉 (眼睛)
    ctx.fillStyle = "#fff";
    ctx.fillRect(-12, -35, 8, 8); // 左眼眶
    ctx.fillRect(4, -35, 8, 8);   // 右眼眶

    ctx.fillStyle = "#000";
    ctx.fillRect(-12, -31, 4, 4);  // 左瞳孔
    ctx.fillRect(4, -31, 4, 4);   // 右瞳孔

    // 4. 嘴巴 (怒氣值達到閾值時變為紅色大口)
    const isEnraged = this.rage >= this.rageThreshold - 1;
    ctx.fillStyle = isEnraged ? "#ff0000" : "#000";
    const mouthHeight = isEnraged ? 6 : 2;
    ctx.fillRect(-6, -18, 12, mouthHeight);

    ctx.restore();
  }
}
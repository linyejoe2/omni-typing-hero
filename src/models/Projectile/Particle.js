/**
 * 基礎粒子效果 (輔助類別)
 * 用於在 Projectile 更新時產生碎屑
 */
export class Particle {
    constructor(x, y, color, speedScale = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 4 * speedScale;
        this.vy = (Math.random() - 0.5) * 4 * speedScale;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1.0;
    }
}

export class BloodParticle {
    constructor(x, y, vx, vy, isCrit) {
        this.x = x;
        this.y = y;
        // 核心邏輯：目標方向速度 + 隨機擴散速度
        const spread = isCrit ? 6 : 3; // 暴擊時噴得更散
        this.vx = (vx * 0.7 + (Math.random() - 0.5) * spread) * -1;
        this.vy = (vy * 0.7 + (Math.random() - 0.5) * spread) * -1;
        
        this.life = 1.0;
        this.decay = Math.random() * 0.04 + 0.02;
        this.gravity = 0.15; // 血液會往下掉
        // this.color = isCrit ? "#ff0000" : "#8b0000"; // 暴擊鮮紅，普通暗紅
        this.color = Math.random() < 0.5 ? "#ff0000" : "#8b0000";
        this.size = Math.random() * 3 + 2; 
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // 加上重力感
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        // 畫成長方形或點
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}
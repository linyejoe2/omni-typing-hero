/**
 * 敵人投射物類別 (由上往下掉落)
 */
export class EnemyProjectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = 8;
        this.alive = true;
    }

    update(particlePool, canvasHeight = 500) {
        this.y += this.vy;

        // 產生紫色拖尾
        if (Math.random() > 0.5) {
            particlePool.push(new Particle(this.x, this.y, "#9932cc", 0.3));
        }

        // 擊中玩家區域判定 (超過畫面底部)
        if (this.y > canvasHeight) {
            this.alive = false;
            return "HIT_PLAYER"; // 回傳事件類型給 SceneManager 處理扣血或震動
        }
        return null;
    }

    draw(ctx) {
        // 紫色外框
        ctx.fillStyle = "#9400d3";
        ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
        // 白色中心
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
    }
}
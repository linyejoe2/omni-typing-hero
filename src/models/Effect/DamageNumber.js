export class DamageNumber {
    constructor(x, y, value, isCrit = false) {
        this.x = x + (Math.random() - 0.5) * 20; // 稍微隨機偏移，避免數字重疊
        this.y = y - 20;
        // this.value = Math.floor(value);
        this.value = value;
        this.isCrit = isCrit;
        
        this.life = 1.0;         // 生命週期 (1.0 -> 0)
        this.velocity = -2;      // 向上飄的速度
        this.opacity = 1.0;
        
        // 根據是否爆擊設定樣式
        this.color = isCrit ? "#ff9900" : "#ffffff";
        this.strokeStyle = isCrit ? "#ff0000" : "#000000";
        this.fontSize = isCrit ? 24 * 1.25 : 18; // 爆擊放大 1.25 倍
        this.fontWeight = isCrit ? "900" : "bold";
    }

    update() {
        this.y += this.velocity; // 向上移動
        this.velocity *= 0.95;   // 模擬阻力，越飄越慢
        this.life -= 0.01;       // 存在約 50 幀
        this.opacity = this.life;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeStyle; // 加上黑邊，確保在任何背景都看得清楚
        ctx.lineWidth = 3;
        ctx.textAlign = "center";
        ctx.font = `${this.fontWeight} ${this.fontSize}px 'Courier New'`;

        // 繪製描邊
        ctx.strokeText(this.value, this.x, this.y);
        // 繪製文字
        ctx.fillText(this.value, this.x, this.y);

        // 如果是爆擊，加個小裝飾（可選）
        if (this.isCrit) {
            ctx.font = "bold 12px Arial";
            ctx.fillText("CRITICAL!", this.x, this.y - this.fontSize);
        }

        ctx.restore();
    }
}
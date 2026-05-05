import { MagicStaff } from "./Weapon/Staff.js";

export class Hero {
    constructor(data) {
        this.name = data.nickname;
        this.job = data.job;
        this.gender = data.gender;
        this.hp = 3;
        this.x = 150;
        this.y = 300;
        this.originX = 150;
        this.state = 'IDLE'; // IDLE, ATTACKING, RETURNING
        this.color = this.getJobColor();
        this.weapon = new MagicStaff(); // 初始化武器
    }

    getJobColor() {
        const colors = { SWORDSMAN: '#e74c3c', MAGE: '#3498db', ARCHER: '#2ecc71', TANKER: '#95a5a6' };
        return colors[this.job] || '#fff';
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // 繪製角色像素主體
        ctx.fillStyle = this.color;
        ctx.fillRect(-20, -60, 40, 60);
        // 簡單區分性別 (例如裝飾顏色)
        ctx.fillStyle = this.gender === 'FEMALE' ? '#ff9999' : '#9999ff';
        ctx.fillRect(-10, -55, 20, 10);
        ctx.restore();
    }
}
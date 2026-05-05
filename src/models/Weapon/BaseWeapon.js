export class BaseWeapon {
    constructor(config = {}) {
        // 基礎屬性
        this.name = config.name || "普通武器";
        this.type = config.type || "MELEE"; // MELEE, RANGED, MAGIC
        this.damageMultiplier = config.damageMultiplier || 1;
        this.addDamage = config.addDamage || 0;
        this.cooldown = config.cooldown || 500; // 毫秒
        this.lastAttackTime = 0;
        
        // 視覺屬性
        this.color = config.color || "#fff";
        this.owner = null; // 指向持有的 Hero 實體
    }

    // 連結武器到角色
    equip(hero) {
        this.owner = hero;
    }

    // 檢查冷卻時間
    canAttack() {
        const now = Date.now();
        return now - this.lastAttackTime >= this.cooldown;
    }

    // 攻擊主邏輯 (由子類別覆寫具體行為)
    attack() {
        if (!this.canAttack()) return null;
        
        this.lastAttackTime = Date.now();
    }

    // 繪製武器外觀 (如果有需要獨立於角色繪製)
    draw(ctx, x, y, angle = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        this.renderWeapon(ctx);
        ctx.restore();
    }

    renderWeapon(ctx) {
        // 由子類別定義具體的像素形狀
    }
}
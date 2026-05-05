export function drawSword(ctx, x, y) {
    ctx.fillStyle = "#aaa"; // 劍身 (銀灰色)
    ctx.fillRect(x + 4, y + 4, 12, 4); // 橫向的劍刃
    let region = new Path2D();
    region.moveTo(x + 16, y + 4);
    region.lineTo(x + 16, y + 8);
    region.lineTo(x + 20, y + 6);
    region.closePath();
    ctx.fill(region, "evenodd"); // 劍尖
    ctx.fillStyle = "#8b4513"; // 劍柄 (木褐色)
    ctx.fillRect(x, y + 4, 4, 4);
    ctx.fillStyle = "#d4af37"; // 護手 (金色)
    ctx.fillRect(x + 4, y + 2, 2, 8);
}
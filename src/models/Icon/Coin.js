export function drawCoin(ctx, x, y, radiusX = 8, radiusY = 6) {
  ctx.save();

  // 1. 繪製底部陰影/厚度 (深咖啡色)
  // 稍微往下方偏移 2px，製造厚度感
  ctx.beginPath();
  ctx.fillStyle = "#8B4513";
  ctx.ellipse(x, y + 2, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. 繪製金幣側邊 (深金色)
  ctx.beginPath();
  ctx.fillStyle = "#DAA520";
  ctx.ellipse(x, y + 1, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. 繪製金幣正面 (亮金色)
  ctx.beginPath();
  ctx.fillStyle = "#FFD700";
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. 繪製內圈裝飾線 (讓它看起來像有刻紋)
  ctx.beginPath();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 2;
  // 繪製一個縮小版的內圈橢圓
  ctx.ellipse(x, y, radiusX * 0.7, radiusY * 0.7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 5. 加上高光 (左上角白色反光)
  ctx.beginPath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  // 在左上方畫一個小小的斜橢圓
  ctx.ellipse(x - radiusX * 0.4, y - radiusY * 0.4, radiusX * 0.3, radiusY * 0.2, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
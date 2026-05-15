/**
 * Rounded rect for Canvas 2D (used by avatar rendering which stays on 2D ctx).
 */
export function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Rounded rect for Pixi v8 Graphics.
 */
export function roundRectGfx(gfx, x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 1) {
  if (fillColor !== undefined) {
    gfx.roundRect(x, y, width, height, radius).fill(fillColor);
  }
  if (strokeColor !== undefined) {
    gfx.roundRect(x, y, width, height, radius).stroke({ color: strokeColor, width: strokeWidth });
  }
}

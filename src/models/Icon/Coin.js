/** @param {import('pixi.js').Graphics} gfx */
export function drawCoin(gfx, x, y, radiusX = 8, radiusY = 6) {
  gfx.ellipse(x, y + 2, radiusX, radiusY).fill('#8B4513');          // shadow
  gfx.ellipse(x, y + 1, radiusX, radiusY).fill('#DAA520');          // side
  gfx.ellipse(x, y, radiusX, radiusY).fill('#FFD700');              // face
  gfx.ellipse(x, y, radiusX * 0.7, radiusY * 0.7)
    .stroke({ color: '#B8860B', width: 2 });                        // inner ring
  gfx.ellipse(x - radiusX * 0.4, y - radiusY * 0.4, radiusX * 0.3, radiusY * 0.2)
    .fill({ color: '#ffffff', alpha: 0.5 });                        // highlight
}

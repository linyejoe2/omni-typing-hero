/** @param {import('pixi.js').Graphics} gfx */
export function drawSword(gfx, x, y) {
  gfx.rect(x + 4, y + 4, 12, 4).fill('#aaaaaa');         // blade
  gfx.poly([x + 16, y + 4, x + 16, y + 8, x + 20, y + 6]).fill('#aaaaaa'); // tip
  gfx.rect(x, y + 4, 4, 4).fill('#8b4513');              // handle
  gfx.rect(x + 4, y + 2, 2, 8).fill('#d4af37');          // guard
}

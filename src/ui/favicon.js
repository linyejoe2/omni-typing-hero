export function generateFavicon(onFire = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // 1. 繪製外圈 O (加上一點厚度感)
  ctx.fillStyle = onFire ? '#FF4500' : '#FFD700';
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a'; // 挖空中心
  ctx.beginPath();
  ctx.arc(16, 16, 10, 0, Math.PI * 2);
  ctx.fill();

  // 2. 繪製像素鍵盤 (位於中心)
  ctx.fillStyle = '#ffffff';
  // 繪製 3x2 的鍵盤顆粒
  const keyWidth = 4;
  const keyHeight = 3;
  const startX = 10;
  const startY = 13;

  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      // 讓其中一格變色（例如代表 Enter 鍵）
      ctx.fillStyle = (r === 1 && c === 2) ? '#FF4500' : '#E0E0E0';
      ctx.fillRect(
        startX + c * (keyWidth + 1),
        startY + r * (keyHeight + 1),
        keyWidth,
        keyHeight
      );
    }
  }

  // 3. 將 Canvas 轉換為 Link 標籤
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.href = canvas.toDataURL();
  document.getElementsByTagName('head')[0].appendChild(link);
}
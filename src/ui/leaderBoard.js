import { FirebaseService } from "../services/firebase.js";
import { heroGenerator } from "../models/Hero/heroGenerater.js";

export async function refreshLeaderboard(monsterId) {
  const listEl = document.getElementById('lb-list');
  listEl.innerHTML = '<div class="loading">Loading...</div>';

  const records = await FirebaseService.getLeaderboard(monsterId);
  listEl.innerHTML = ''; // 清空讀取中文字

  records.forEach((data, index) => {
    const row = document.createElement('div');
    row.className = 'lb-row';

    // 格式化日期：2026/5/6 12:11
    const date = data.updatedAt ? data.updatedAt.toDate() : new Date();
    const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

    // 建立頭像 Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'avatar-mini';
    canvas.width = 64;  // 內部解析度
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const hero = heroGenerator(data)
    hero.renderAvatar(ctx);

    row.innerHTML = `
<div class="col-rank">${index + 1}</div>
<div class="col-player">
    <div class="canvas-container"></div>
    <div>
        <strong>${data.nickname || 'Unknown'}</strong>
        <span class="timestamp">${dateStr}</span>
    </div>
</div>
<div class="col-time">${data.seconds}s</div>
<div class="col-stats">
    DPS: ${data.dps}<br>
    WPM: ${data.wpm}<br>
    ACC: ${data.accuracy}%
</div>
        `;

    // 將 Canvas 插入對應位置
    row.querySelector('.canvas-container').appendChild(canvas);
    listEl.appendChild(row);
  });
}
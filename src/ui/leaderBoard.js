import { FirebaseService } from "../services/firebase.js";
import { heroGenerator } from "../models/Hero/heroGenerater.js";

let _allRecords = [];
let _currentJob = null;
let _showAllJobs = false;

const toggleBtn = document.getElementById('btn-all-jobs');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    _showAllJobs = !_showAllJobs;
    toggleBtn.classList.toggle('active', _showAllJobs);
    _renderRecords();
  });
}

export async function refreshLeaderboard(monsterId, currentJob) {
  if (currentJob) _currentJob = currentJob;

  const listEl = document.getElementById('lb-list');
  listEl.innerHTML = '<div class="loading">Loading...</div>';

  _allRecords = await FirebaseService.getLeaderboard(monsterId);
  _renderRecords();
}

function _renderRecords() {
  const listEl = document.getElementById('lb-list');
  const records = _showAllJobs
    ? _allRecords
    : _allRecords.filter(r => r.job === _currentJob);

  listEl.innerHTML = '';

  records.forEach((data, index) => {
    const row = document.createElement('div');
    row.className = 'lb-row';

    const date = data.updatedAt ? data.updatedAt.toDate() : new Date();
    const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;

    const canvas = document.createElement('canvas');
    canvas.className = 'avatar-mini';
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    heroGenerator(data).renderAvatar(ctx);

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

    row.querySelector('.canvas-container').appendChild(canvas);
    listEl.appendChild(row);
  });
}

import { Mage } from "../models/Hero/Mage.js";

export class PlayerPanel {
  constructor() {
    this.container = document.getElementById('playerPanel');
    this.avatarCtx = document.getElementById('avatarCanvas').getContext('2d');
    this.setupTabs();
  }

  setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  update(data) {
    document.getElementById('panel-nickname').textContent = data.nickname;
    document.getElementById('panel-job-lv').textContent = `Lv.${data.level} ${data.job}`;
    document.getElementById('stat-avg-wpm').textContent = data.avgWpm || 0;
    document.getElementById('stat-max-wpm').textContent = data.maxWpm || 0;
    document.getElementById('stat-max-combo').textContent = data.maxCombo || 0;

    // 更新屬性內文
    const attrPane = document.getElementById('tab-attr');
    attrPane.innerHTML = `
            <div class="attr-item">STR: ${data.stats?.STR || 0}</div>
            <div class="attr-item">CRI: ${data.stats?.CRI || 0}</div>
            <div class="attr-item">VIT: ${data.stats?.VIT || 0}</div>
            <div class="attr-item">DEF: ${data.stats?.DEF || 0}</div>
            <div class="attr-item">RES: ${data.stats?.RES || 0}</div>
            <div class="attr-item">AGI: ${data.stats?.AGI || 0}</div>
        `;

    this._drawHeroAvatar(data)
  }

  _drawHeroAvatar(data) {
    switch (data.job) {
      case 'MAGE':
        return (new Mage(data)).renderAvatar(this.avatarCtx);
      default:
        return (new Mage(data)).renderAvatar(this.avatarCtx);
    }
  }
}
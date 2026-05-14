import { Defender } from "../models/Hero/Defender.js";
import { heroGenerator } from "../models/Hero/heroGenerater.js";
import { Mage } from "../models/Hero/Mage.js";
import { FirebaseService } from "../services/firebase.js";
import { canvasManager } from "./CanvasManager.js";

export class PlayerPanel {
  constructor() {
    this.element;
    this.avatarCtx;
    this.initSettingsTab();
    this.setupTabs();
  }

  init() {
    this.element = document.getElementById('playerPanel');
    this.avatarCtx = canvasManager.get("avatarCanvas");
  }

  initSettingsTab() {
    const btnReborn = document.getElementById('btn-reborn');
    if (btnReborn) {
      btnReborn.addEventListener('click', async () => {
        if (confirm("確定要轉生嗎？\n職業與性別將會重置，讓你重新選擇。\n統計資訊則會保留。")) {
          try {
            const uid = FirebaseService.currentUser?.uid;
            if (uid) await FirebaseService.resetCharacterJob(uid);
            window.location.reload();
          } catch (err) {
            alert("轉生失敗，請稍後再試");
          }
        }
      });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        // 彈出確認視窗，增加點代入感
        if (confirm("確定要離開這個冒險世界嗎？")) {
          try {
            await FirebaseService.logout();

            // 登出後的處理：通常是重整頁面回到登入選單
            window.location.reload();

            // 或者如果你是單頁面應用 (SPA)：
            // showLoginScreen(); 
          } catch (err) {
            alert("登出失敗，請稍後再試");
          }
        }
      });
    }
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
    document.getElementById('stat-avg-wpm').textContent = data.wpm || 0;
    document.getElementById('stat-max-wpm').textContent = data.maxWpm || 0;
    document.getElementById('stat-accuracy').textContent = data.accuracy || 0;
    document.getElementById('stat-total-kills').textContent = data.totalKills || 0;
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
    const hero = heroGenerator(data)
    hero.renderAvatar(this.avatarCtx)

    // return (new Mage(data)).renderAvatar(this.avatarCtx)
  }
}

export const playerPanel = new PlayerPanel();
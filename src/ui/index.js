import { ScreenManager } from './ScreenManager.js';
import { PlayerPanel } from './PlayerPanel.js';

class UIBase {
    constructor() {
        this.screens = new ScreenManager();
        this.playerPanel = new PlayerPanel();
    }

    // 重新封裝原本的 showScreen
    showScreen(id) {
        this.screens.show(id);
    }

    // 獲取所有輸入框資料
    getInputs() {
        return {
            email: document.getElementById('email').value,
            pass: document.getElementById('password').value,
            nickname: document.getElementById('nickname').value,
            job: document.getElementById('job-select').value,
            gender: document.getElementById('gender-select').value
        };
    }

    // 綁定按鈕事件的捷徑
    on(id, event, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    }
}

export const UI = new UIBase();
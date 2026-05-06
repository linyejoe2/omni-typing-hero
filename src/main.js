import { UI } from './ui.js';
import { BattleScene } from './scenes/BattleScene.js';
import { SceneManager } from './scenes/SceneManager.js';
import { FirebaseService } from './services/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { CONFIG } from './CONST.js';
import { AudioManager } from './services/AudioManager.js';

const sceneManager = new SceneManager();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

function gameLoop() {
  // 1. 處理邏輯
  sceneManager.update();

  // 2. 渲染畫面
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
  sceneManager.draw(ctx);

  requestAnimationFrame(gameLoop);
}

class App {
  constructor() {
    this.initEventListeners();
    this.checkAuthState();

    const audio = new AudioManager();
    const bgmBtn = document.getElementById('bgm-toggle');
    const bgmStatus = bgmBtn.querySelector('.status');

    bgmBtn.addEventListener('click', () => {
      const isPlaying = audio.toggle();

      if (isPlaying) {
        bgmBtn.classList.add('playing');
        bgmStatus.textContent = 'BGM ON';
      } else {
        bgmBtn.classList.remove('playing');
        bgmStatus.textContent = 'BGM OFF';
      }
    });
  }

  // 監聽 Firebase 登入狀態
  checkAuthState() {
    onAuthStateChanged(FirebaseService.auth, async (user) => {
      if (user) {
        console.log("用戶已登入:", user.email);
        await this.handlePostLogin(user.uid);
      } else {
        UI.showScreen('auth-screen');
      }
    });
  }

  // 登入後的處理邏輯
  async handlePostLogin(uid) {
    try {
      const charData = await FirebaseService.getCharacter(uid);

      if (charData) {
        // 如果有角色資訊，直接進入遊戲
        console.log("發現角色，啟動遊戲...");
        this.startActualGame(charData);
      } else {
        // 沒有角色資訊，跳轉到創建頁面
        console.log("無角色資訊，前往創建頁面");
        UI.showScreen('char-creator');
      }
    } catch (error) {
      console.error("檢查角色失敗:", error);
    }
  }

  initEventListeners() {
    // 登入按鈕
    document.getElementById('btn-login').addEventListener('click', async () => {
      const { email, pass } = UI.getInputs();
      try {
        await FirebaseService.login(email, pass);
      } catch (e) { alert("登入失敗: " + e.message); }
    });

    // 註冊按鈕
    document.getElementById('btn-signup').addEventListener('click', async () => {
      const { email, pass } = UI.getInputs();
      try {
        await FirebaseService.signUp(email, pass);
        alert("註冊成功！");
      } catch (e) { alert("註冊失敗: " + e.message); }
    });

    // 創建角色並開始按鈕
    document.getElementById('btn-start').addEventListener('click', async () => {
      const { nickname, job, gender } = UI.getInputs();
      if (!nickname) return alert("請輸入名稱");

      const charData = {
        nickname,
        job,
        gender,
        level: 1,
        gold: 0,
        createdAt: new Date()
      };

      const user = FirebaseService.auth.currentUser;
      if (user) {
        await FirebaseService.saveCharacter(user.uid, charData);
        this.startActualGame(charData);
      }
    });
  }

  startActualGame(charData) {
    UI.showScreen('game-screen');
    sceneManager.switchTo(new BattleScene(canvas, charData));
    gameLoop();
    console.log("遊戲開始！角色：", charData.nickname);
  }
}

function _check_fps() {
  let frameCount = 0;
  let lastCheck = performance.now();
  let currentFPS = 0;
  let remainCheck = 5;

  function monitorFPS() {
    if (remainCheck < 0) return
    frameCount++;
    const now = performance.now();

    if (now - lastCheck >= 1000) {
      currentFPS = frameCount;
      remainCheck--;
      console.log(`目前瀏覽器 FPS: ${currentFPS}`);
      frameCount = 0;
      lastCheck = now;
    }
    requestAnimationFrame(monitorFPS);
  }
  monitorFPS();
}

_check_fps()

// 啟動應用
new App();
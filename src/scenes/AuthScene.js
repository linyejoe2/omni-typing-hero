import { FirebaseService } from '../services/firebase.js';
import { UI } from '../ui/index.js';
import { BattleScene } from './BattleScene.js';
import { CreatorScene } from './CreatorScene.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { sceneManager } from './SceneManager.js';

export class AuthScene {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.authScreen = document.getElementById('authScreen');
    this.loginBtn = document.getElementById('btn-login');
    this.signupBtn = document.getElementById('btn-signup');
    this.createCharacterBtn = document.getElementById('btn-start');

    // 綁定 this 避免 Event Listener 指向錯誤
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  // 當 SceneManager 切換到此場景時觸發
  init() {
    this.authScreen.style.display = 'flex'; // 顯示登入畫面
    this.loginBtn.addEventListener('click', this.handleLogin);
    this.signupBtn.addEventListener('click', this.handleSignUp);
    this.createCharacterBtn.addEventListener('click', this.handleCreate);

    this.checkAuthState()
  }

  // 監聽 Firebase 登入狀態
  checkAuthState() {
    onAuthStateChanged(FirebaseService.auth, async (user) => {
      if (user) {
        console.log("用戶已登入:", user.email);
        await this.handlePostLogin(user.uid);
      }
    });
  }

  startActualGame(charData) {
    UI.showScreen('game');
    sceneManager.switchTo(new BattleScene(canvas, charData));
    UI.playerPanel.update(charData);
    console.log("遊戲開始！角色：", charData.nickname);
  }

  // 登入後的處理邏輯
  async handlePostLogin(uid) {
    try {
      const charData = await FirebaseService.getCharacter(uid);
      if (charData) {
        startActualGame(charData)
      } else {
        // 無角色資訊，切換到 CreatorScene
        UI.showScreen('creator');
        sceneManager.switchTo(new CreatorScene());
      }
    } catch (error) {
      console.error("檢查角色失敗:", error);
    }
  }

  async handleLogin() {
    const { email, pass } = UI.getInputs();
    try {
      const user = await FirebaseService.login(email, pass);
      const charData = await FirebaseService.getCharacter(user.uid);

      if (charData) {
        // 直接透過 sceneManager 切換，這會自動觸發當前場景的 exit()
        sceneManager.switchTo(new BattleScene(canvas, charData));
      } else {
        sceneManager.switchTo(new CreatorScene(canvas));
      }
    } catch (err) {
      alert("登入失敗: " + err.message);
    }
  }

  async handleSignUp() {
    const { email, pass } = UI.getInputs();
    try {
      await FirebaseService.signUp(email, pass);
      alert("註冊成功，請登入！");
    } catch (e) {
      alert("註冊失敗: " + e.message);
    }
  }

  async handleCreate() {
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
  }

  update() {
    // 登入畫面通常不需要每幀更新邏輯，除非你有畫 Canvas 背景
  }

  draw(ctx) {
    // 如果想在 HTML 底下畫一些像素風的背景動畫，可以在這裡寫
  }

  // 當 SceneManager 切換離開此場景時觸發
  exit() {
    this.authScreen.style.display = 'none'; // 隱藏 HTML
    this.loginBtn.removeEventListener('click', this.handleLogin);
    this.signupBtn.removeEventListener('click', this.handleSignUp);
  }
}
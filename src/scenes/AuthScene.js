import { FirebaseService } from '../services/firebase.js';
import { BattleScene } from './BattleScene.js';
import { CreatorScene } from './CreatorScene.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { sceneManager } from './SceneManager.js';
import { canvasManager } from '../ui/CanvasManager.js';
import { playerPanel } from '../ui/PlayerPanel.js';
import { BaseScene } from './BaseScene.js';
import { elementManager } from '../ui/ElementManager.js';

export class AuthScene extends BaseScene {
  constructor() {
    super();
    this.canvas = canvasManager.get("gameCanvas");
    this.authScreen = document.getElementById('authScreen');

    this.emailInput = document.getElementById("email");
    this.passInput = document.getElementById("password");

    this.loginBtn = document.getElementById('btn-login');
    this.signupBtn = document.getElementById('btn-signup');
    this.createCharacterBtn = document.getElementById('btn-start');

    // 綁定 this 避免 Event Listener 指向錯誤
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  // 當 SceneManager 切換到此場景時觸發
  init() {
    this.loginBtn.addEventListener('click', this.handleLogin);
    this.signupBtn.addEventListener('click', this.handleSignUp);

    this.checkAuthState()
  }

  in() {
    elementManager.showScreen('authScreen')
    elementManager.hidePanel()
  }

  // 監聽 Firebase 登入狀態
  checkAuthState() {
    onAuthStateChanged(FirebaseService.auth, async (user) => {
      if (user) {
        console.log("用戶已登入:", user.email);
        FirebaseService.currentUser = user;
        await this.handlePostLogin(user.uid);
      }
    });
  }

  // 登入後的處理邏輯
  async handlePostLogin(uid) {
    try {
      const charData = await FirebaseService.getCharacter(uid);
      if (charData && charData.job) {
        sceneManager.switchTo(new BattleScene(this.canvas, charData));
        playerPanel.update(charData);
        console.log("遊戲開始！角色：", charData.nickname);
      } else {
        sceneManager.switchTo(new CreatorScene(charData));
      }
    } catch (error) {
      console.error("檢查角色失敗:", error);
    }
  }

  async handleLogin() {
    try {
      const user = await FirebaseService.login(this.emailInput.value, this.passInput.value);
      const charData = await FirebaseService.getCharacter(user.uid);

      if (charData) {
        // 直接透過 sceneManager 切換，這會自動觸發當前場景的 exit()
        sceneManager.switchTo(new BattleScene(this.canvas, charData));
      } else {
        sceneManager.switchTo(new CreatorScene(charData));
      }
    } catch (err) {
      if (err.message.indexOf("invalid-credential") !== -1) {
        return alert("錯誤的帳號/密碼！")
      }
      alert("登入失敗: " + err.message);
    }
  }

  async handleSignUp() {
    try {
      await FirebaseService.signUp(this.emailInput.value, this.passInput.value);
      alert("註冊成功，請登入！");
    } catch (e) {
      if (e.message.indexOf("email-already-in-use") !== -1) {
        alert("此信箱已被使用！")
        return
      }
      alert("註冊失敗: " + e.message);
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
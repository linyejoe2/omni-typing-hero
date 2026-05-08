import { FirebaseService } from '../services/firebase.js';
import { UI } from '../ui/index.js';
import { BattleScene } from './BattleScene.js';
import { sceneManager } from './SceneManager.js';

export class CreatorScene {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.creatorScreen = document.getElementById('creatorScreen'); // 確保 HTML 有這個 ID
    this.startBtn = document.getElementById('btn-start');

    this.handleCreate = this.handleCreate.bind(this);
  }

  init() {
    console.log("進入角色創建場景");
    // 顯示創建角色的 UI
    if (this.creatorScreen) {
      this.creatorScreen.style.display = 'flex';
    }

    this.startBtn.addEventListener('click', this.handleCreate);
  }

  async handleCreate() {
    const { nickname, job, gender } = UI.getInputs();
    if (!nickname) return alert("請輸入冒險者名稱");

    const charData = {
      nickname,
      job,
      gender,
      level: 1,
      gold: 0,
      hp: 100, // 初始血量
      exp: 0,
      createdAt: new Date()
    };

    const user = FirebaseService.auth.currentUser;
    if (user) {
      try {
        // 1. 儲存到 Firebase
        await FirebaseService.saveCharacter(user.uid, charData);
        console.log("角色創建成功！");

        // 2. 切換到戰鬥場景 (或其他初始場景)
        // 注意：這裡傳入 charData 讓 BattleScene 初始化
        sceneManager.switchTo(new BattleScene(canvas));

        // 3. 更新全域 UI 狀態
        UI.playerPanel.update(charData);
      } catch (error) {
        alert("角色儲存失敗: " + error.message);
      }
    }
  }

  update() {
    // 如果有 Canvas 背景動畫（例如角色預覽旋轉），在這裡更新
  }

  draw(ctx) {
    // 可以在 Canvas 畫一些帥氣的角色職業立繪或背景
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px 'Press Start 2P', cursive"; // 假設你有像素字體
    ctx.fillText("CREATE YOUR HERO", 50, 50);
  }

  exit() {
    // 隱藏 UI 並移除監聽，避免重複執行
    if (this.creatorScreen) {
      this.creatorScreen.style.display = 'none';
    }
    this.startBtn.removeEventListener('click', this.handleCreate);
    console.log("離開角色創建場景");
  }
}
import { FirebaseService } from '../services/firebase.js';
import { UI } from '../ui/index.js';
import { BattleScene } from './BattleScene.js';
import { sceneManager } from './SceneManager.js';
import { canvasManager } from '../ui/CanvasManager.js';
import { Mage } from '../models/Hero/Mage.js';
import { baseAttributeLevelList } from '../models/Hero/BaseHero.js';

export class CreatorScene {
  constructor() {
    this.canvas = canvasManager.get("creatorCanvas");
    this.creatorScreen = document.getElementById('creatorScreen'); // 確保 HTML 有這個 ID
    this.startBtn = document.getElementById('btn-start');
    this.jobDefaultAttributeList = document.getElementById("jobDefaultAttributeList");
    this.charData = {
      nickname,
      job: "mage",
      gender: "male",
      level: 1,
      gold: 0,
      hp: 100, // 初始血量
      exp: 0,
      createdAt: new Date()
    };

    this.previewHero = new Mage(this.charData);

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

    const user = FirebaseService.auth.currentUser;
    if (user) {
      try {
        // 1. 儲存到 Firebase
        await FirebaseService.saveCharacter(user.uid, this.charData);
        console.log("角色創建成功！");

        // 2. 切換到戰鬥場景 (或其他初始場景)
        // 注意：這裡傳入 charData 讓 BattleScene 初始化
        sceneManager.switchTo(new BattleScene(canvas));

        // 3. 更新全域 UI 狀態
        UI.playerPanel.update(this.charData);
      } catch (error) {
        alert("角色儲存失敗: " + error.message);
      }
    }
  }

  update() {
    // 如果有 Canvas 背景動畫（例如角色預覽旋轉），在這裡更新
    this.previewHero.update();


    this.jobDefaultAttributeList.innerHTML = `
            <div>VIT: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel / baseAttributeLevelList.hp[4]}%;"></div></div>
            <div>STR: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel || 0}%;"></div></div>
            <div>CRI: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel || 0}%;"></div></div>
            <div>DEF: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel || 0}%;"></div></div>
            <div>RES: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel || 0}%;"></div></div>
            <div>AGI: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseHpLevel || 0}%;"></div></div>
    `
  }

  draw(_) {
    this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    this.canvas.save();
    this.drawHeroPreview()
    this.canvas.restore();
  }

  drawHeroPreview() {
    return (this.previewHero).renderHero(this.canvas, this.canvas.canvas.width / 2, this.canvas.canvas.height / 2 + 30);
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
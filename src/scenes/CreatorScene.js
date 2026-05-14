import { FirebaseService } from '../services/firebase.js';
import { BattleScene } from './BattleScene.js';
import { sceneManager } from './SceneManager.js';
import { canvasManager } from '../ui/CanvasManager.js';
import { Mage } from '../models/Hero/Mage.js';
import { heroGenerator } from '../models/Hero/heroGenerater.js';
import { playerPanel } from '../ui/PlayerPanel.js';
import { elementManager as EM } from '../ui/ElementManager.js';

export class CreatorScene {
  constructor(charData) {
    this.canvas = canvasManager.get("creatorCanvas");
    this.creatorScreen = document.getElementById('creatorScreen'); // 確保 HTML 有這個 ID
    this.startBtn = document.getElementById('btn-start');
    this.nicknameInput = document.getElementById("nickname");
    this.jobSelect = document.getElementById("jobSelect");
    this.genderSelect = document.getElementById("genderSelect");
    this.jobDefaultAttributeList = document.getElementById("jobDefaultAttributeList"); this.heroInfoCard = document.getElementById("heroInfo");
    this.charData = {
      ...charData,
      nickname: charData?.nickname || "",
      job: this.jobSelect.value,
      gender: "MALE",
      level: 1,
      gold: charData?.gold ||0,
      hp: 100, // 初始血量
      exp: 0,
      createdAt: new Date()
    };

    this.updatePreviewHero()
    this.handleCreate = this.handleCreate.bind(this);
  }

  in() {
    EM.showScreen('creatorScreen')
    EM.hidePanel()
  }

  init() {
    console.log("進入角色創建場景");

    if (this.charData && this.charData.nickname) {
      this.nicknameInput.value = this.charData.nickname;
      this.updatePreviewHero();
      this.nicknameInput.classList.add('hidden')
    }

    this.startBtn.addEventListener('click', this.handleCreate);
    this.genderSelect.addEventListener('change', (e) => {
      this.charData.gender = e.target.value;
      this.updatePreviewHero()
    });
    this.jobSelect.addEventListener('change', (e) => {
      this.charData.job = e.target.value;
      this.updatePreviewHero()
    });
    this.nicknameInput.addEventListener('input', (e) => {
      this.charData.nickname = e.target.value;
      this.updatePreviewHero()
    });
  }

  updatePreviewHero() {
    this.previewHero = heroGenerator(this.charData)
  }

  async handleCreate() {
    if (!this.nicknameInput.value) return alert("請輸入冒險者名稱");

    const user = FirebaseService.auth.currentUser;
    if (user) {
      try {
        // 1. 儲存到 Firebase
        await FirebaseService.saveCharacter(user.uid, this.charData);
        console.log("角色創建成功！");

        // 2. 切換到戰鬥場景 (或其他初始場景)
        // 注意：這裡傳入 charData 讓 BattleScene 初始化
        sceneManager.switchTo(new BattleScene(this.canvas, this.charData));

        // 3. 更新全域 UI 狀態
        playerPanel.update(this.charData);
      } catch (error) {
        alert("角色儲存失敗: " + error.message);
      }
    }
  }

  update() {
    // 如果有 Canvas 背景動畫（例如角色預覽旋轉），在這裡更新
    this.previewHero.update();


    this.jobDefaultAttributeList.innerHTML = `
            <div style="display: flex; align-items: center"><div>VIT: </div><div class="progress-bar"><div class="progress-fill" style="width: ${(this.previewHero.baseHpLevel / 6) * 100}%;"></div></div></div>
            <div style="display: flex; align-items: center"><div>STR: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseAtkLevel / 6 * 100}%;"></div></div></div>
            <div style="display: flex; align-items: center"><div>CRI: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseCritRateLevel / 6 * 100}%;"></div></div></div>
            <div style="display: flex; align-items: center"><div>DEF: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseDefLevel / 6 * 100}%;"></div></div></div>
            <div style="display: flex; align-items: center"><div>AGI: </div><div class="progress-bar"><div class="progress-fill" style="width: ${this.previewHero.baseEvaRateLevel / 6 * 100}%;"></div></div></div>
    `

    this.updateHeroInfoCard()
  }

  updateHeroInfoCard() {
    // 清空內容
    this.heroInfoCard.innerHTML = "";

    // 1. 處理標語 (第一筆)
    const quote = document.createElement("span");
    quote.className = "hero-quote";
    quote.innerText = this.previewHero.heroInfo[0];
    this.heroInfoCard.appendChild(quote);

    // 2. 處理中間的三個標籤 (介紹、風格、數值)
    // for (let i = 1; i <= 3; i++) {
    for (let i = 1; i <= 1; i++) {
      const section = document.createElement("div");
      section.className = "hero-section";

      // 拆分冒號前後的文字
      const [label, content] = this.previewHero.heroInfo[i].split("：");
      section.innerHTML = `<span class="hero-label" style="color: ${this.previewHero.palette.deco}">${label}：</span>${content}`;
      this.heroInfoCard.appendChild(section);
    }

    // // 3. 處理最後一個 (推薦人群)
    // const recommend = document.createElement("div");
    // recommend.className = "hero-recommend";
    // recommend.innerText = this.previewHero.heroInfo[4];
    // this.heroInfoCard.appendChild(recommend);
  }

  draw(_) {
    this.canvas.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
    this.canvas.save();
    this.drawHeroPreview()
    this.drawHeroName()
    this.canvas.restore();
  }

  drawHeroPreview() {
    return (this.previewHero).renderHero(this.canvas, this.canvas.canvas.width / 2, this.canvas.canvas.height / 2 + 40);
  }

  drawHeroName() {
    this.canvas.fillStyle = "#ffffff";
    this.canvas.textAlign = "center";
    this.canvas.font = "10px 'Courier New'";
    this.canvas.fillText(`${this.charData.nickname}`, this.canvas.canvas.width / 2, 20);
  }

  exit() {
    this.startBtn.removeEventListener('click', this.handleCreate);
    console.log("離開角色創建場景");
  }
}
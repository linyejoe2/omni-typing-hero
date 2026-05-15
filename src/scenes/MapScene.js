import { monsterGenerator } from "../models/Monster/monsterGenerator";
import { elementManager } from "../ui/ElementManager";
import { BattleScene } from "./BattleScene";
import { sceneManager } from "./SceneManager";

export class MapScene {
  constructor(canvas, charData) {
    this.ctx = canvas;
    this.charData = charData;

    // 擴充區域資料，加入圖庫與怪物
    this.regions = [
      {
        id: 'newbie_village',
        name: '廢棄洋館',
        img: './assets/maps/house.png',
        monsters: ['殭屍', '吸血鬼', '生化兵器', '三角頭'],
        monsterInstanses: [],
        desc: '適合初學者練習打字速度。',
        unlocked: true
      },
      {
        id: 'japan_city',
        name: '不祥神社',
        img: './assets/maps/Jinja.png',
        monsters: ['Kooni', "Tengu", "Oni"],
        monsterInstanses: [],
        desc: '充滿和風氣息，字數長度中等。',
        unlocked: true
      },
      // {
      //   id: 'china_city',
      //   name: '龍脈古城 - 皇宮',
      //   img: './assets/maps/china.jpg',
      //   monsters: ['兵馬俑', '石獅子', '年獸'],
      //   desc: '難度較高，出現大量成語或長句。',
      //   unlocked: false
      // }
    ];

    this.selectedIdx = 0; // 當前選擇的區域
  }

  init() {
    console.log("進入世界地圖...");

    for (let i = 0; i < this.regions.length; i++) {
      for (let j = 0; j < this.regions[i].monsters.length; j++) {
        this.regions[i].monsterInstanses.push(monsterGenerator(this.regions[i].monsters[j]));
      }
    }

    document.addEventListener('mousemove', (e) => {
      const canvas = this.ctx.canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.hoveredRegion = this.getRegionAt(x, y); // 這會觸發 draw 中的高亮效果
    });

    window.addEventListener('mousedown', (e) => {
      const canvas = this.ctx.canvas
      const rect = canvas.getBoundingClientRect();

      // 1. 計算點擊相對於 Canvas 元素的原始位移
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // 2. 透過 (解析度 / 顯示尺寸) 進行等比例縮放
      const x = clientX * (canvas.width / rect.width);
      const y = clientY * (canvas.height / rect.height);

      this.onClick(x, y);
    });
    // 如果有 HTML UI 覆蓋物，記得在這裡隱藏或顯示
  }

  in() {
    elementManager.showScreen('gameScreen')
    elementManager.showPanel()
  }

  update() { }

  // 碰撞偵測輔助函數
  getRegionAt(x, y) {
    return this.regions.find(r =>
      x >= r.x && x <= r.x + r.w &&
      y >= r.y && y <= r.y + r.h
    );
  }

  onClick(x, y) {
    console.log(`x: ${x}, y: ${y}`)
    // 點擊左側列表的判定
    if (x < 250 && x > 0) {
      const itemHeight = 60;
      const clickedIdx = Math.floor((y - 100) / itemHeight);
      if (clickedIdx >= 0 && clickedIdx < this.regions.length) {
        this.selectedIdx = clickedIdx;
        // audioManager.play('click'); // 播放切換音效
      }
    }

    // 點擊「進入區域」按鈕 (右下角)
    if (x > 550 && x < 750 && y > 520 && y < 570) {
      const region = this.regions[this.selectedIdx];
      if (region.unlocked) {
        sceneManager.switchTo(new BattleScene(this.ctx, this.charData));
      }
    }
  }

  draw(ctx) {
    const { width, height } = ctx.canvas;
    const current = this.regions[this.selectedIdx];

    // 1. 繪製深色背景
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);

    // 2. 左側列表區域 (Glassmorphism)
    this.drawSidebar(ctx);

    // 3. 右側區域
    this.drawMapPreview(ctx, current);
    this.drawMonsterPreview(ctx, current);
    this.drawActionArea(ctx, current);
  }

  drawSidebar(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, 250, 600);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(249, 0, 1, 600);

    ctx.fillStyle = '#e67e22';
    ctx.font = "bold 20px 'Courier New'";
    ctx.fillText("選擇冒險區域", 30, 60);

    this.regions.forEach((r, i) => {
      const y = 100 + i * 60;
      const isSelected = this.selectedIdx === i;

      if (isSelected) {
        ctx.fillStyle = 'rgba(230, 126, 34, 0.3)';
        ctx.fillRect(0, y, 250, 50);
      }

      ctx.fillStyle = r.unlocked ? (isSelected ? '#fff' : '#aaa') : '#555';
      ctx.font = "16px 'Courier New'";
      ctx.fillText(`${r.unlocked ? '' : '🔒 '}${r.name}`, 40, y + 32);
    });
  }

  drawMapPreview(ctx, region) {
    // 右上示意圖
    ctx.fillStyle = '#000';
    ctx.fillRect(280, 20, 490, 280); // 預留位置給 jpg

    const img = new Image();
    img.src = region.img;

    // 繪製文字 placeholder (之後你直接 ctx.drawImage(this.mapImg, 280, 50, 490, 280))
    ctx.drawImage(img, 100, 0, 1200, 768, 280, 20, 490, 280);
  }

  drawMonsterPreview(ctx, region) {
    const boxX = 280;
    const boxY = 320;
    const boxW = 490;
    const boxH = 180;

    // 1. 繪製背景框
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // 2. 標題
    ctx.fillStyle = '#f1c40f';
    ctx.font = "14px 'Courier New'";
    ctx.textAlign = 'left';
    ctx.fillText("出現怪獸：", boxX + 20, boxY + 30);

    // 3. 平均分配怪物位置
    // 將寬度分為 3 份，每份的中心點座標為：
    // 第一個：boxX + (1/6 * boxW)
    // 第二個：boxX + (3/6 * boxW)
    // 第三個：boxX + (5/6 * boxW)
    const count = region.monsters.length;

    region.monsters.forEach((m, i) => {
      let monster = region.monsterInstanses[i]
      // if (i >= 3) return
      // 計算每個怪物的中心 X 座標
      const centerX = boxX + (boxW / count) * (i + 0.5);
      const centerY = boxY + 90; // 框框高度的一半稍微偏下一點

      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(centerX - 32, centerY - 32, 64, 64)

      ctx.save()
      ctx.translate(centerX - 32, centerY - 32);
      monster.renderAvatar(ctx)
      ctx.restore()

      // 裝飾性的圓環 (增加層次感)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 怪獸名稱
      ctx.fillStyle = 'white';
      ctx.font = "12px 'Courier New'";
      ctx.textAlign = 'center';
      ctx.fillText(monster.name, centerX, centerY + 55);
    });

    // 恢復對齊設定，避免影響後續繪圖
    ctx.textAlign = 'left';
  }

  drawActionArea(ctx, region) {
    // 進入按鈕
    if (region.unlocked) {
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(550, 520, 200, 50);
      ctx.fillStyle = 'white';
      ctx.font = "bold 18px 'Courier New'";
      ctx.fillText("進入區域", 610, 552);
    } else {
      ctx.fillStyle = '#333';
      ctx.fillRect(550, 520, 200, 50);
      ctx.fillStyle = '#777';
      ctx.fillText("尚未解鎖", 610, 552);
    }
  }
}
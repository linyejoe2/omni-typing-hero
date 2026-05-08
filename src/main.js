import { UI } from './ui/index.js';
import { BattleScene } from './scenes/BattleScene.js';
import { sceneManager } from './scenes/SceneManager.js';
import { FirebaseService } from './services/firebase.js';
import { CONFIG } from './CONST.js';
import { audioManager } from './services/AudioManager.js';
import { generateFavicon } from './ui/favicon.js';
import { AuthScene } from './scenes/AuthScene.js';
import { CreatorScene } from './scenes/CreatorScene.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;

class GameLoop {
  constructor() {
    this.fps = 60;
    this.fpsInterval = 1000 / this.fps;
    this.then = Date.now();
  }

  start() {
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const now = Date.now();
    const elapsed = now - this.then;

    // 如果距離上次執行超過了 16.67ms
    if (elapsed > this.fpsInterval) {
      // 校正 then 時間（扣除溢出的毫秒數，讓計時更精準）
      this.then = now - (elapsed % this.fpsInterval);

      // 執行遊戲邏輯與渲染
      this._loop();
    }
  }

  _loop() {
    // 1. 處理邏輯
    sceneManager.update();

    // 2. 渲染畫面
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    sceneManager.draw(ctx);
  }
}

class App {
  constructor() {
    this.game = new GameLoop();

    sceneManager.switchTo(new AuthScene());

    audioManager.init();
    this.game.start();
    generateFavicon();
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
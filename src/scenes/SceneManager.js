import { CONFIG } from "../CONST";

export class SceneManager {

  constructor() {
    console.log("create SceneManager")
    this.currentScene = null;
  }

  // 切換場景，並傳入角色資料
  switchTo(sceneInstance) {
    if (this.currentScene && this.currentScene.exit) {
      this.currentScene.exit();
    }
    this.currentScene = sceneInstance;
    if (this.currentScene.init) {
      this.currentScene.init();
    }
    this.currentScene.in()
  }

  // 這是由 Game Loop 持續呼叫的入口
  update() {
    if (this.currentScene) this.currentScene.update();
  }

  draw(ctx) {
    ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
    if (this.currentScene) this.currentScene.draw(ctx);
  }
}

export const sceneManager = new SceneManager();
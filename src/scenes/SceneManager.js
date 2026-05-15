export class SceneManager {
  constructor() {
    this.currentScene = null;
    this.app = null;
  }

  init(app) {
    this.app = app;
  }

  switchTo(sceneInstance) {
    if (this.currentScene) {
      if (this.currentScene.exit) this.currentScene.exit();
      // Remove previous scene's Pixi container from stage
      if (this.currentScene.container && this.app) {
        this.app.stage.removeChild(this.currentScene.container);
      }
    }

    this.currentScene = sceneInstance;

    // Add new scene's Pixi container to stage (if it has one)
    if (this.currentScene.container && this.app) {
      this.app.stage.addChild(this.currentScene.container);
    }

    if (this.currentScene.init) this.currentScene.init();
    this.currentScene.in();
  }

  update() {
    if (this.currentScene) this.currentScene.update();
  }

  draw() {
    if (this.currentScene) this.currentScene.draw();
  }
}

export const sceneManager = new SceneManager();

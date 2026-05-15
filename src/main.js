import { sceneManager } from './scenes/SceneManager.js';
import { audioManager } from './services/AudioManager.js';
import { generateFavicon } from './ui/favicon.js';
import { AuthScene } from './scenes/AuthScene.js';
import { canvasManager } from './ui/CanvasManager.js';
import { playerPanel } from './ui/PlayerPanel.js';
import { elementManager } from './ui/ElementManager.js';

async function main() {
  await canvasManager.init(['gameCanvas', 'avatarCanvas', 'creatorCanvas']);

  const app = canvasManager.getApp();
  sceneManager.init(app);

  elementManager.init();
  playerPanel.init();

  sceneManager.switchTo(new AuthScene());

  audioManager.init();
  generateFavicon();

  app.ticker.add(() => {
    sceneManager.update();
    sceneManager.draw();
  });
}

main();

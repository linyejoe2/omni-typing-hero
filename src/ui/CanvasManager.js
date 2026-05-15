import { Application } from 'pixi.js';
import { CONFIG } from '../CONST.js';

class CanvasManager {
  constructor() {
    this.app = null;
    this.contexts = {}; // 2D contexts for non-game canvases (avatar, creator)
  }

  async init(ids) {
    // Game canvas → Pixi takes over
    const gameCanvas = document.getElementById('gameCanvas');
    this.app = new Application();
    await this.app.init({
      canvas: gameCanvas,
      width: CONFIG.width,
      height: CONFIG.height,
      background: 0x1e1e1e,
      resolution: 2,
      antialias: false,
    });

    // Other canvases stay as Canvas 2D
    for (const id of ids) {
      if (id === 'gameCanvas') continue;
      const el = document.getElementById(id);
      if (!el) { console.error(`Canvas ${id} not found`); continue; }
      this.contexts[id] = el.getContext('2d');
    }
  }

  /** Returns Pixi app for gameCanvas, 2D ctx for others. */
  get(id) {
    if (id === 'gameCanvas') return this.app;
    return this.contexts[id];
  }

  getApp() { return this.app; }
}

export const canvasManager = new CanvasManager();

class CanvasManager {
  constructor() {
    this.canvases = {};
    this.contexts = {};
  }

  // 初始化特定的 Canvas
  init(ids) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) return console.error(`Canvas ${id} not found`);

      this.canvases[id] = el;
      this.contexts[id] = el.getContext('2d');
    }
  }

  // 獲取 Context
  get(id) {
    return this.contexts[id];
  }

  // 統一處理 Resize 邏輯
  resizeAll() {
    Object.values(this.canvases).forEach(canvas => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}

export const canvasManager = new CanvasManager();
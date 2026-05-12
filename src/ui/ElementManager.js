class ElementManager {
  constructor() {
    this.screens = {};
  }

  init() {
    this.screens = {
      authScreen: document.getElementById('authScreen'),
      creatorScreen: document.getElementById('creatorScreen'),
      gameScreen: document.getElementById('gameScreen')
    };
  }

  showScreen(screenId) {
    Object.values(this.screens).forEach(el => el.classList.add('hidden'));
    if (this.screens[screenId]) {
      this.screens[screenId].classList.remove('hidden');
    }
  }
}

export const elementManager = new ElementManager();
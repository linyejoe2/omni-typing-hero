class ElementManager {
  constructor() {
    this.screens = {};
    this.element = {};
  }

  init() {
    this.screens = {
      authScreen: document.getElementById('authScreen'),
      creatorScreen: document.getElementById('creatorScreen'),
      gameScreen: document.getElementById('gameScreen')
    };
    this.element = {
      playerPanel: document.getElementById('playerPanel'),
      leaderboardPanel: document.getElementById('leaderboardPanel'),
    }
  }

  showElement(elementId) {
    if (this.element[elementId]) {
      this.element[elementId].classList.remove('hidden');
    }
  }

  hideElement(elementId) {
    if (this.element[elementId]) {
      this.element[elementId].classList.add('hidden');
    }
  }

  showScreen(screenId) {
    Object.values(this.screens).forEach(el => el.classList.add('hidden'));
    if (this.screens[screenId]) {
      this.screens[screenId].classList.remove('hidden');
    }
  }

  hidePanel() {
    this.element.playerPanel.classList.add('hidden')
    this.element.leaderboardPanel.classList.add('hidden')
  }

  showPanel() {
    this.element.playerPanel.classList.remove('hidden')
    this.element.leaderboardPanel.classList.remove('hidden')
  }
}

export const elementManager = new ElementManager();
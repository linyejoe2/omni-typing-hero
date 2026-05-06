export class ScreenManager {
    constructor() {
        this.screens = {
            auth: document.getElementById('auth-screen'),
            creator: document.getElementById('char-creator'),
            game: document.getElementById('game-screen')
        };
    }

    show(screenKey) {
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        if (this.screens[screenKey]) {
            this.screens[screenKey].classList.remove('hidden');
        }
    }
}
export class ScreenManager {
    constructor() {
        this.screens = {
            auth: document.getElementById('authScreen'),
            creator: document.getElementById('charCreatorScreen'),
            game: document.getElementById('gameScreen')
        };
    }

    show(screenKey) {
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        if (this.screens[screenKey]) {
            this.screens[screenKey].classList.remove('hidden');
        }
    }
}
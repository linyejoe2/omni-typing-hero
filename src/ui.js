export const UI = {
    screens: {
        auth: document.getElementById('auth-screen'),
        creator: document.getElementById('char-creator'),
        game: document.getElementById('game-screen')
    },

    showScreen(screenId) {
        // 隱藏所有畫面
        Object.values(this.screens).forEach(el => el.classList.add('hidden'));
        // 顯示目標畫面 (假設 CSS 有定義 .hidden { display: none; })
        if (screenId === 'auth-screen') this.screens.auth.classList.remove('hidden');
        if (screenId === 'char-creator') this.screens.creator.classList.remove('hidden');
        if (screenId === 'game-screen') this.screens.game.classList.remove('hidden');
    },

    getInputs() {
        return {
            email: document.getElementById('email').value,
            pass: document.getElementById('password').value,
            nickname: document.getElementById('nickname').value,
            job: document.getElementById('job-select').value,
            gender: document.getElementById('gender-select').value
        };
    }
};
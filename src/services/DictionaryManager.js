import { fetchNewWordFromFile } from "../services/randomWordAPI.js";

class DictionaryManager {
    constructor() {
        this.words = [];
        this.isReady = false;

        this.init()
    }

    async init() {
        this.words = await fetchNewWordFromFile('Oxford 5000.txt');
        this.isReady = true;
    }

    getRandomWord() {
        if (!this.isReady) return "LOADING";
        return this.words[Math.floor(Math.random() * this.words.length)];
    }
}

export const dictionary = new DictionaryManager();
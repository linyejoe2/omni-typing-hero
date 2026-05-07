import { fetchNewWordFromFile } from "../services/randomWordAPI.js";

class DictionaryManager {
  constructor() {
    this.words = [];
    this.isReady = false;

    this.init()
  }

  async init() {
    this.words = await fetchNewWordFromFile('Oxford 5000.txt');
    // this.words = await fetchNewWordFromFile('cl100k_base_vocab.json');
    this.isReady = true;
  }

  getRandomWord() {
    if (!this.isReady) return "LOADING";
    let word = this.words[Math.floor(Math.random() * this.words.length)];
    word = word.trim()

    const isSafe = /^[ -~]+$/.test(word);
    if (word.length < 0 || !isSafe) return this.getRandomWord()

    return word;
  }
}

export const dictionary = new DictionaryManager();
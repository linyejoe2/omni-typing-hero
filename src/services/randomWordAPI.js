/**
 * 邏輯函數
 */
export async function fetchNewWord() {
  try {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
    const data = await response.json();
    return data[0].toUpperCase();
  } catch (e) {
    return "ERR!";
  }
}
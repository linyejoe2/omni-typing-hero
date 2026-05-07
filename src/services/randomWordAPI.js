/**
 * 邏輯函數
 */
export async function fetchNewWord() {
  try {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
    const data = await response.json();
    return data[0];
  } catch (e) {
    return "ERR!";
  }
}

/**
 * 從指定文件讀取所有單字並回傳陣列
 * @param {string} fileName 文件路徑
 * @returns {Promise<string[]>}
 */
export async function fetchNewWordFromFile(fileName) {
    try {
        const response = await fetch(`./assets/${fileName}`);
        if (!response.ok) throw new Error("無法讀取單字檔");
        
        if (fileName.includes("txt")) {
        const text = await response.text();
        
        // 分割行，並清理每行末尾的 \r 或空白，同時過濾掉空行
        const words = text.split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0);
            
        return words;
        } else {
        const data = await response.json();
        return Object.values(data);
        }
    } catch (error) {
        console.error("載入單字表出錯:", error);
        return ["HERO", "MAGIC", "BATTLE"]; // 發生錯誤時的備用單字
    }
}
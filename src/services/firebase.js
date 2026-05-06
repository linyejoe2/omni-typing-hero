import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, getDocs, where, orderBy, limit
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZaCBVpGAfGRMOvAlXuCIBUpn9dpGhPRc",
  authDomain: "omni-typing-hero.firebaseapp.com",
  projectId: "omni-typing-hero",
  storageBucket: "omni-typing-hero.firebasestorage.app",
  messagingSenderId: "313167084269",
  appId: "1:313167084269:web:8c717f720846ae61beeae4",
  measurementId: "G-0SLSZVTPLR"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const FirebaseService = {
  currentUser: null,
  auth,
  // 註冊
  async signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  async login(email, pass) {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    this.currentUser = res.user;
    return res.user;
  },
  async logout() {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      console.log("👋 已成功登出世界");
    } catch (error) {
      console.error("登出時發生錯誤:", error);
      throw error;
    }
  },
  // 獲取角色資料
  async getCharacter(uid) {
    const docRef = doc(db, "characters", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  },
  async saveCharacter(uid, data) {
    await setDoc(doc(db, "characters", uid), data);
  },

  /**
   * 儲存單場戰鬥紀錄
   */
  async addBattleRecord(uid, stats) {
    try {
      const recordsRef = collection(db, "battle_records");
      await addDoc(recordsRef, {
        uid: uid,
        monster: stats.monster,
        nickname: stats.nickname,
        clear: stats.clear,
        job: stats.job,
        wpm: stats.wpm,
        dps: stats.dps,
        accuracy: stats.accuracy,
        maxCombo: stats.maxCombo,
        timeUsed: stats.seconds,
        timestamp: serverTimestamp() // 使用伺服器時間最準確
      });
      console.log("⚔️ 戰鬥紀錄已存入資料庫");
    } catch (e) {
      console.error("存檔紀錄失敗:", e);
    }
  },

  /**
     * 更新個人生涯最高紀錄
     * 只有當新數據超過舊數據時才更新
     */
  async updatePersonalBest(uid, stats) {
    const charRef = doc(db, "characters", uid);
    const charSnap = await getDoc(charRef);

    if (!charSnap.exists()) return;

    const currentData = charSnap.data();
    const updateData = {};

    // 比較並決定是否更新最高紀錄
    updateData.maxWpm = Math.max(currentData.maxWpm || 0, stats.wpm);
    if (stats.dps > (currentData.maxDps || 0)) updateData.maxDps = stats.dps;
    if (stats.maxCombo > (currentData.maxCombo || 0)) updateData.maxCombo = stats.maxCombo;

    if (currentData.accuracy) {
      updateData.accuracy = (currentData.accuracy + stats.accuracy) / 2;
    } else {
      updateData.accuracy = stats.accuracy
    }

    if (currentData.wpm) {
      updateData.wpm = (currentData.wpm + stats.wpm) / 2;
    } else updateData.wpm = stats.wpm

    // 累計總擊殺數
    updateData.totalKills = (currentData.totalKills || 0) + 1;

    // 如果有任何需要更新的項，才發送請求
    try {
      if (Object.keys(updateData).length > 0) {
        await updateDoc(charRef, updateData);
        console.log("🏆 個人成就已刷新！");
      }
    } catch (e) {
      console.error("個人資料更新失敗:", e);
    }
  },

  async updateLeaderboard(uid, stats) {
    try {
      // 這裡我們用 uid 作為 Document ID，這樣同一個人只會有一筆資料
      const recordId = `${uid}_${stats.monster}`;
      const lbRef = doc(db, "leaderboards", recordId);
      const lbSnap = await getDoc(lbRef);

      // 只有當這次的 WPM 超過排行榜上的紀錄時才更新
      // 或是你可以根據你的規則 (例如：比 DPS)
      const shouldUpdate = !lbSnap.exists() || stats.seconds > lbSnap.data().seconds;

      if (shouldUpdate) {
        await setDoc(lbRef, {
          uid: uid,
          monster: stats.monster,
          nickname: stats.nickname,
          wpm: stats.wpm,
          dps: stats.dps,
          seconds: stats.seconds,
          accuracy: stats.accuracy,
          job: stats.job, // 存入職業，排行榜可以顯示精緻的大頭貼！
          updatedAt: serverTimestamp()
        });
        console.log("🏅 已刷新排行榜名次！");
      }
    } catch (e) {
      console.error("排行榜更新失敗", e);
    }
  },

  /**
     * 獲取排行榜前 100 名 (按秒數升序，越小越快)
     */
  async getLeaderboard(monsterId) {
    try {
      const lbRef = collection(db, "leaderboards");
      // 增加 where 條件：只撈出這隻怪物的紀錄
      const q = query(
        lbRef,
        where("monster", "==", monsterId),
        orderBy("seconds", "asc"),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("讀取排行榜失敗", e);
      return [];
    }
  }
};
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
    // 獲取角色資料
    async getCharacter(uid) {
        const docRef = doc(db, "characters", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },
    async saveCharacter(uid, data) {
        await setDoc(doc(db, "characters", uid), data);
    }
};
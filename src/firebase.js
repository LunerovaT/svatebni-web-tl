import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Veřejné identifikátory projektu — v pořádku mít je v kódu (nejsou to hesla).
// Skutečná ochrana dat je řešená přes Firestore security rules (viz README).
const firebaseConfig = {
  apiKey: "AIzaSyBEBgBly3NrTauDOheGe5n09U9LK5UeTQQ",
  authDomain: "svatbadetektivka.firebaseapp.com",
  projectId: "svatbadetektivka",
  storageBucket: "svatbadetektivka.firebasestorage.app",
  messagingSenderId: "952646640734",
  appId: "1:952646640734:web:8acf190018bf52d99680cf",
  measurementId: "G-CR8VWJ7PXT",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // přihlášení organizátorů (admin, úkoly)

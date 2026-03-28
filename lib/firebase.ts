import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const fbConf = {
  apiKey: "AIzaSyCdfYQeAiBMfAPsBGuzS7qWIoi_u3CaSvE",
  authDomain: "tahfidzqu-7c937.firebaseapp.com",
  projectId: "tahfidzqu-7c937",
  storageBucket: "tahfidzqu-7c937.firebasestorage.app",
  messagingSenderId: "596320735782",
  appId: "1:596320735782:web:340387094ff61f31fecce7",
  databaseURL:
    "https://tahfidzqu-7c937-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(fbConf);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const safeId = "tahfidzqu-v2";

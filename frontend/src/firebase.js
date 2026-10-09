import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzf2i2QZAEG1DKE1aGYQoaiT_oiWOhe9E",
  authDomain: "vigil-68f0e.firebaseapp.com",
  projectId: "vigil-68f0e",
  storageBucket: "vigil-68f0e.firebasestorage.app",
  messagingSenderId: "780593466380",
  appId: "1:780593466380:web:7b9e969e091a11c7357229",
  measurementId: "G-7250JREYHT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

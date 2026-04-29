import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAX4Y54v5LmYwFq3aMdYMUnRtxmD_NsjVk",
  authDomain: "sticker-task-frances.firebaseapp.com",
  projectId: "sticker-task-frances",
  storageBucket: "sticker-task-frances.firebasestorage.app",
  messagingSenderId: "949555133621",
  appId: "1:949555133621:web:1c0d0c7bd10e5d07bd92fc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUZNYfE8gf80CB0kDAUU2hTI3NEiJf4Pk",
  authDomain: "github-issue-filter.firebaseapp.com",
  projectId: "github-issue-filter",
  storageBucket: "github-issue-filter.firebasestorage.app",
  messagingSenderId: "185447298153",
  appId: "1:185447298153:web:20292da7a89296ea1c5ef8",
  measurementId: "G-4XZ5WRDPG6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

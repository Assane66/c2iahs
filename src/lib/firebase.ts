// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAW7n8Nx5shqlyotFdSXj3ROj7IkfBiR-8",
  authDomain: "admin-ecole-8ede0.firebaseapp.com",
  projectId: "admin-ecole-8ede0",
  storageBucket: "admin-ecole-8ede0.appspot.com",
  messagingSenderId: "49049419465",
  appId: "1:49049419465:web:865451625612fd424e9718"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

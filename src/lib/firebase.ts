
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBs3CYE-_Q0b8OtZBUMaMce1_HGroJzJlc",
  authDomain: "studio-6606960671-aec7a.firebaseapp.com",
  projectId: "studio-6606960671-aec7a",
  storageBucket: "studio-6606960671-aec7a.appspot.com",
  messagingSenderId: "683542047691",
  appId: "1:683542047691:web:2f9960b0fad238a3fea44e"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function createSecondaryAuthUser(email: string, pass: string) {
  const secondaryAppName = "SecondaryAppAuth";
  let secondaryApp = getApps().find((a) => a.name === secondaryAppName);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }
  const secondaryAuth = getAuth(secondaryApp);
  const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
  await signOut(secondaryAuth);
  return userCred.user;
}

export { app, auth, db, firebaseConfig };


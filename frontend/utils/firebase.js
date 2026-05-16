// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "kidwave.firebaseapp.com",
  projectId: "kidwave",
  storageBucket: "kidwave.firebasestorage.app",
  messagingSenderId: "239144639739",
  appId: "1:239144639739:web:a1998050ffaef50bcaa45e",
  measurementId: "G-Y4CTQL9ET2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth,provider}
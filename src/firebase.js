// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCw40QpKPbnceBxYnfNYO3XkPU_DEKjUWU",
  authDomain: "realmoedas.firebaseapp.com",
  projectId: "realmoedas",
  storageBucket: "realmoedas.firebasestorage.app",
  messagingSenderId: "76105891653",
  appId: "1:76105891653:web:fe9c819eacb31ece5a882c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
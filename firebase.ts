
// FIX: Changed firebase/app to @firebase/app to fix module resolution errors.
import { initializeApp } from "@firebase/app";
// FIX: Changed firebase/firestore to @firebase/firestore to fix module resolution errors.
import { getFirestore } from "@firebase/firestore";
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import { getAuth } from "@firebase/auth";
import { getStorage } from "@firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHrSzqddBLdPZsOnsaerl-cSKwcIsEoac",
  authDomain: "astrosage-panel.firebaseapp.com",
  projectId: "astrosage-panel",
  storageBucket: "astrosage-panel.appspot.com",
  messagingSenderId: "368568840993",
  appId: "1:368568840993:web:e8894c0f4ba6f5f10d4460",
  measurementId: "G-B3QFBV8SPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);

export { db, auth, storage };

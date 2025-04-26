import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Your Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
apiKey: "AIzaSyBh2qsx4GxNyisrD7sldPaJFvE0NGTJ1JY",
authDomain: "my-ecommerce-app-f9be0.firebaseapp.com",
databaseURL: "https://my-ecommerce-app-f9be0-default-rtdb.asia-southeast1.firebasedatabase.app/",
projectId: "my-ecommerce-app-f9be0",
storageBucket: "my-ecommerce-app-f9be0.firebasestorage.app",
messagingSenderId: "555368906857",
appId: "1:555368906857:web:6fa2a98b1c8f7dd96ee2f8",
measurementId: "G-9R22WJ550N", 
}



const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);


let auth
try {
  auth = getAuth(app)
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}

const db = getFirestore(app)
const storage = getStorage(app)

export { auth, db, storage }


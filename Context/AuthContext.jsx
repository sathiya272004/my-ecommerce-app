"use client"

import { createContext, useState, useEffect } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  FacebookAuthProvider,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { app, auth, db } from "../firebase/config"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as Facebook from "expo-auth-session/providers/facebook"

WebBrowser.maybeCompleteAuthSession()

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Google Auth
  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    clientId: "11497138227-ellrem0f91jle2fudmv7hnee0ec7s01v.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
  })

  // Facebook Auth
  const [fbRequest, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: "YOUR_FACEBOOK_APP_ID",
  })

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        setUser(user)

        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "user")
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              displayName: user.displayName || "",
              photoURL: user.photoURL || "",
              role: "user",
              createdAt: serverTimestamp(),
            })
            setUserRole("user")
          }
        } catch (error) {
          console.error("Error getting user role:", error)
          setUserRole("user") // Default to user role
        }
      } else {
        // User is signed out
        setUser(null)
        setUserRole(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle Google sign-in
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params
      const credential = GoogleAuthProvider.credential(id_token)
      signInWithCredential(auth, credential).catch((error) => {
        console.error("Google sign in error:", error)
      })
    }
  }, [googleResponse])

  // Handle Facebook sign-in
  useEffect(() => {
    if (fbResponse?.type === "success") {
      const { access_token } = fbResponse.params
      const credential = FacebookAuthProvider.credential(access_token)
      signInWithCredential(auth, credential).catch((error) => {
        console.error("Facebook sign in error:", error)
      })
    }
  }, [fbResponse])

  // Register with email and password
  const register = async (email, password, displayName) => {
    try {
      setIsLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, { displayName })

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName,
        photoURL: "",
        role: "user",
        createdAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const logout = async () => {
    try {
      setIsLoading(true)
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      await promptGoogleAsync()
    } catch (error) {
      console.error("Google sign in error:", error)
    }
  }

  // Facebook sign in
  const signInWithFacebook = async () => {
    try {
      await promptFacebookAsync()
    } catch (error) {
      console.error("Facebook sign in error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        signInWithGoogle,
        signInWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


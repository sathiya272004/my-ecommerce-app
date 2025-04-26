"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { AuthProvider } from "../Context/AuthContext"
import { CartProvider } from "../Context/CartContext"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a delay
    const hideSplash = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await SplashScreen.hideAsync()
    }

    hideSplash()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{
              headerShown: true,
              headerTitle: "Product Details",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </CartProvider>
    </AuthProvider>
  )
}


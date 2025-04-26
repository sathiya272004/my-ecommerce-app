"use client"
import { Stack } from "expo-router"
import { useAuth } from "../../hooks/useAuth"
import { Redirect } from "expo-router"

export default function AuthLayout() {
  const { isAuthenticated, isLoading, userRole } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return null
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    if (userRole === "admin") {
      return <Redirect href="/(admin)/dashboard" />
    }
    return <Redirect href="/(tabs)/home" />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f8f8f8" },
      }}
    />
  )
}



import { Tabs } from "expo-router"
import { Colors } from "../../constants/Colors"
import Ionicons from "@expo/vector-icons/Ionicons"
import useAuth from "../../hooks/useAuth"
import { Redirect } from "expo-router"


export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading screen while checking authentication
  if (isLoading) {
    return null
  }

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.PRIMARY, tabBarInactiveTintColor: "#888", tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 }, headerStyle: { backgroundColor: Colors.PRIMARY }, headerTintColor: "#fff", headerTitleStyle: { fontWeight: "bold" } }}>
      <Tabs.Screen name="home" options={{ title: "Home", tabBarLabel: "Home", tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={24} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarLabel: "Search", tabBarIcon: ({ color }) => <Ionicons name="search-sharp" size={24} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarLabel: "Cart", tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile", tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} />
      <Tabs.Screen name="categories/[categoryId]" options={{ href: null }} />
      <Tabs.Screen name="product/[productId]" options={{ href: null }} />
      <Tabs.Screen name="add-address" options={{ href: null }} />
      <Tabs.Screen name="shipping" options={{ href: null }} />
      <Tabs.Screen name="select-address" options={{ href: null }} />
    </Tabs>

  )
}

"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Colors } from "../../constants/Colors"
import { useAuth } from "../../hooks/useAuth"
import Button from "../../components/ui/Button"
import { fetchOrders } from "../../services/api"
import { uploadProfileImage } from "../../services/storage"
import { formatDate } from "../../utils/helpers"

export default function ProfileScreen() {
  const router = useRouter()
  const { user, isAuthenticated, userRole, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const ordersData = await fetchOrders(user.uid)
      setOrders(ordersData)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.push("/splash")
        },
      },
    ])
  }

  const handlePickImage = async () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to update your profile picture")
      return
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to upload images")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingImage(true)
        await uploadProfileImage(result.assets[0].uri, user.uid)
        setUploadingImage(false)
        Alert.alert("Success", "Profile picture updated successfully")
      }
    } catch (error) {
      console.error("Error updating profile picture:", error)
      Alert.alert("Error", "Failed to update profile picture")
      setUploadingImage(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={Colors.MUTED} />
          <Text style={styles.guestTitle}>Not Logged In</Text>
          <Text style={styles.guestSubtitle}>Please login to view your profile</Text>
          <Button title="Login" onPress={() => router.push("/(auth)/login")} style={styles.loginButton} />
          <Button
            title="Register"
            onPress={() => router.push("/(auth)/register")}
            variant="outline"
            style={styles.registerButton}
          />
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: user.photoURL || "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={handlePickImage} disabled={uploadingImage}>
            {uploadingImage ? (
              <Ionicons name="sync" size={16} color="#fff" />
            ) : (
              <Ionicons name="camera" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user.displayName || "User"}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        {userRole === "admin" && (
          <TouchableOpacity style={styles.adminButton} onPress={() => router.push("/(admin)/dashboard")}>
            <Ionicons name="settings" size={16} color="#fff" />
            <Text style={styles.adminButtonText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Shipping Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyOrdersText}>No orders yet</Text>
          </View>
        ) : (
          orders.slice(0, 3).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>

              <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
              <Text style={styles.orderTotal}>Total: ${order.totalAmount?.toFixed(2) || "0.00"}</Text>

              <TouchableOpacity style={styles.viewOrderButton}>
                <Text style={styles.viewOrderText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {orders.length > 0 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Orders</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.PRIMARY} style={styles.menuIcon} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.MUTED} />
        </TouchableOpacity>
      </View>

      <Button title="Logout" onPress={handleLogout} variant="outline" style={styles.logoutButton} />
    </ScrollView>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case "Processing":
      return "#f39c12"
    case "Shipped":
      return "#3498db"
    case "Delivered":
      return "#2ecc71"
    case "Cancelled":
      return "#e74c3c"
    default:
      return "#7f8c8d"
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginTop: 20,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.MUTED,
    marginBottom: 30,
    textAlign: "center",
  },
  loginButton: {
    marginBottom: 15,
    width: "80%",
  },
  registerButton: {
    width: "80%",
  },
  header: {
    backgroundColor: Colors.CARD,
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PRIMARY,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.CARD,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.MUTED,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 15,
  },
  adminButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  section: {
    backgroundColor: Colors.CARD,
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.BORDER,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT,
  },
  emptyOrders: {
    padding: 20,
    alignItems: "center",
  },
  emptyOrdersText: {
    fontSize: 16,
    color: Colors.MUTED,
  },
  orderItem: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.MUTED,
  },
  orderStatus: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  orderStatusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.TEXT,
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 15,
    color: Colors.TEXT,
    marginBottom: 10,
  },
  viewOrderButton: {
    alignSelf: "flex-end",
  },
  viewOrderText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  viewAllText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    margin: 20,
  },
})


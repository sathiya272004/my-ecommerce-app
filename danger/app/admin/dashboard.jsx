"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "../../firebase/config"
import { formatCurrency } from "../../utils/helpers"

const SideNavbar = () => {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const widthAnim = new Animated.Value(expanded ? 200 : 60)

  const toggleSidebar = () => {
    setExpanded(!expanded)
    Animated.timing(widthAnim, {
      toValue: expanded ? 60 : 200,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const actions = [
    { name: "add-circle", text: "Add Product", route: "add-product" },
    { name: "list", text: "Manage Products", route: "manage-products" },
    { name: "grid", text: "Category", route: "admincategory" },
    { name: "receipt", text: "View Orders", route: "orders" },
  ]

  return (
    <Animated.View style={[styles.sidebar, { width: widthAnim }]}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <Ionicons name={expanded ? "chevron-back" : "menu"} size={30} color={Colors.PRIMARY} />
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => {
              router.push(action.route)
              if (!expanded) toggleSidebar() // Expand if collapsed
            }}
          >
            <Ionicons name={action.name} size={24} color={Colors.PRIMARY} />
            {expanded && <Text style={styles.actionButtonText}>{action.text}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch order count
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        const ordersCount = ordersSnapshot.size

        // Fetch product count
        const productsSnapshot = await getDocs(collection(db, "products"))
        const productsCount = productsSnapshot.size

        // Fetch user count
        const usersSnapshot = await getDocs(collection(db, "users"))
        const usersCount = usersSnapshot.size

        // Calculate total revenue
        let revenue = 0
        ordersSnapshot.forEach((doc) => {
          const orderData = doc.data()
          if (orderData.totalAmount) {
            revenue += orderData.totalAmount
          }
        })

        setStats({
          totalOrders: ordersCount,
          totalProducts: productsCount,
          totalUsers: usersCount,
          totalRevenue: revenue,
        })

        // Fetch recent orders
        const recentOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5))
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery)

        const recentOrdersList = []
        recentOrdersSnapshot.forEach((doc) => {
          recentOrdersList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()) : new Date(),
          })
        })

        setRecentOrders(recentOrdersList)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <View style={styles.container}>
      <SideNavbar />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to the admin panel</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cart" size={30} color={Colors.PRIMARY} />
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cube" size={30} color={Colors.SECONDARY} />
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="people" size={30} color={Colors.ACCENT} />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash" size={30} color="#27ae60" />
            <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        <View style={styles.recentOrdersContainer}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent orders to display</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {recentOrders.map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.orderStatusText}>{order.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.orderCustomer}>
                    <Ionicons name="person" size={16} color="#666" /> {order.customerName || "Customer"}
                  </Text>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
                    <Text style={styles.orderTotal}>{formatCurrency(order.totalAmount)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    flexDirection: "row",
    backgroundColor: Colors.BACKGROUND,
  },
  sidebar: {
    height: "100%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: "column",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#fff",
    shadowColor: "rgb(65, 99, 129)",
    shadowOffset: { width: 8, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
    marginLeft: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.MUTED,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.MUTED,
  },
  recentOrdersContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  ordersList: {
    minHeight: 100,
  },
  emptyContainer: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.MUTED,
    fontSize: 16,
  },
  orderItem: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
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
  orderCustomer: {
    fontSize: 15,
    color: Colors.TEXT,
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.TEXT,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
})


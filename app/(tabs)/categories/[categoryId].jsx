import { useEffect, useState } from "react"
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { getDocs, collection, query, where } from "firebase/firestore"
import { db } from "../../../firebase/config"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"



export default function CategoryProductsScreen() {
  const { categoryId, categoryName } = useLocalSearchParams() // Get both id and name
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, "products"), where("category", "==", categoryName))
        const querySnapshot = await getDocs(q)
        const fetchedProducts = []
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() })
        })
        setProducts(fetchedProducts)
        setError(null)
      } catch (error) {
        console.error("Error loading products:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (categoryName) {
      fetchCategoryProducts()
    }
  }, [categoryName])

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        router.push(`/product/${item.id}`)
      }}
    >
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: categoryName || "Category Products",
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>No products found in this category</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
    
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", margin: 10 },
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { fontSize: 14, color: "#555" },
  errorText: { color: "red", textAlign: "center", margin: 20 },
  emptyText: { textAlign: "center", margin: 20, fontSize: 16, color: "#666" },
  loader: { marginTop: 20 },
})

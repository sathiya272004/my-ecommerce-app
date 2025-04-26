// File: app/(tabs)/CartScreen.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../firebase/config';
import { fetchCartItems, updateCartItemQuantity, removeCartItem, fetchProductDetails } from '../../services/api';
import { fetchUserAddresses, consoleUserAddresses } from '../../services/api'; // you'll create this

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItemsData();
  }, []);

  const fetchCartItemsData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const items = await fetchCartItems(userId);
      const cartWithProductDetails = await Promise.all(items.map(async (item) => {
        const product = await fetchProductDetails(item.productId);
        return { ...item, product };
      }));

      setCartItems(cartWithProductDetails);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !itemId || newQty < 1) return;
      await updateCartItemQuantity(userId, itemId, newQty);
      fetchCartItemsData();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !itemId) return;

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCartItem(userId, itemId);
              fetchCartItemsData();
            } catch (error) {
              console.error('Error deleting cart item:', error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    if (!item.product) return null;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.product?.images?.[0] }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name}>{item.product?.name}</Text>
          <Text style={styles.price}>₹{item.product?.offerPrice || item.product?.price}</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
              <AntDesign name="minuscircleo" size={20} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
              <AntDesign name="pluscircleo" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
          <Feather name="trash-2" size={22} color="#d00" />
        </TouchableOpacity>
      </View>
    );
  };

  const goToCheckout = async () => {
    try {
      const addresses = await fetchUserAddresses();
  
      if (addresses.length === 0) {
        router.push('add-address');
      } else {
        router.push('select-address'); // Or show a modal with addresses
      }
    } catch (error) {
      console.error('Error checking address:', error);
    }
  };
  
  

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Cart</Text>
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <TouchableOpacity style={styles.checkoutButton} onPress={goToCheckout}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  empty: { textAlign: 'center', fontSize: 18, marginTop: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { marginTop: 4, color: '#444' },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  quantity: { fontSize: 16, marginHorizontal: 8 },
  checkoutButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#007aff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

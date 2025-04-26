import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase/config';
import { fetchUserAddresses, fetchCartItems, fetchProductDetails } from '../../services/api';

export default function SelectAddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not logged in");

      const [addressData, cartData] = await Promise.all([
        fetchUserAddresses(),
        fetchCartItems(userId)
      ]);

      setAddresses(addressData);

      // Fetch product details for each cart item
      const detailedCart = await Promise.all(
        cartData.map(async (item) => {
          const product = await fetchProductDetails(item.productId);
          return product ? { ...item, product } : item;
        })
      );

      setCartItems(detailedCart);
      calculateTotal(detailedCart);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    let subtotal = 0;
  
    items.forEach(item => {
      const price = item.product?.offerPrice || item.product?.price || 0;
      subtotal += item.quantity * price;
    });
  
    const tax = subtotal * 0.18; // 18% tax
    const shipping = subtotal > 999 ? 0 : 40;
    const total = subtotal + tax + shipping;
  
    setTotals({ subtotal, tax, shipping, total });
    AsyncStorage.setItem('checkout_total', JSON.stringify({ subtotal, tax, shipping, total }));
  };
  

  const handleProceed = () => {
    if (!selectedAddressId) {
      Alert.alert("Please select a shipping address.");
      return;
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    router.push({
      pathname: 'payment',
      params: { addressId: selectedAddress.id }
    });
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Your Cart</Text>

      {cartItems.map((item, index) => (
        <View key={item.id} style={styles.cartItem}>
          <Image source={{ uri: item.product?.images?.[0] }} style={styles.productImage} />
          <View>
            <Text style={styles.productName}>{item.product?.product_title}</Text>
            <Text>Qty: {item.quantity}</Text>
            <Text>Price: ₹{item.product?.offerPrice || item.product?.price}</Text>
            {/* <Text>Total: ₹{item.quantity * item.product?.product_price}</Text> */}
          </View>
        </View>
      ))}

      <View style={styles.breakdown}>
        <Text>Subtotal: ₹{totals.subtotal.toFixed(2)}</Text>
        <Text>Tax (18%): ₹{totals.tax.toFixed(2)}</Text>
        <Text>Shipping: ₹{totals.shipping.toFixed(2)}</Text>
        <Text style={styles.total}>Total: ₹{totals.total.toFixed(2)}</Text>
      </View>


      <Text style={styles.heading}>Select Shipping Address</Text>

      {addresses.length === 0 ? (
        <Text style={styles.empty}>No addresses found.</Text>
      ) : (
        <Picker
          selectedValue={selectedAddressId}
          onValueChange={(itemValue) => setSelectedAddressId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Address --" value={null} />
          {addresses.map((addr) => (
            <Picker.Item
              key={addr.id}
              label={`${addr.name} - ${addr.city}, ${addr.state}`}
              value={addr.id}
            />
          ))}
        </Picker>
      )}

      <TouchableOpacity style={styles.confirmButton} onPress={handleProceed}>
        <Text style={styles.confirmText}>Continue to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  cartItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  breakdown: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  total: {
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0a84ff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#0a84ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

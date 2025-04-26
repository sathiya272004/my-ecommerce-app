// app/(tabs)/shipping.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { createOrder } from '../../services/api';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

export default function ShippingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addressId, subtotal, total } = params;
  
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [address, setAddress] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Cash on Delivery
  
  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Montserrat_600SemiBold,
    Montserrat_700Bold
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!auth.currentUser) return;
        
        // Fetch selected address
        if (addressId) {
          const addressRef = doc(db, 'users', auth.currentUser.uid, 'addresses', addressId);
          const addressSnap = await getDoc(addressRef);
          if (addressSnap.exists()) {
            setAddress({ id: addressSnap.id, ...addressSnap.data() });
          }
        }
        
        // Fetch cart items
        const cartRef = collection(db, 'users', auth.currentUser.uid, 'cart');
        const cartSnapshot = await getDocs(cartRef);
        
        const items = [];
        const productPromises = [];

        cartSnapshot.forEach(doc => {
          const cartItem = { id: doc.id, ...doc.data() };
          items.push(cartItem);
          
          // Fetch product details for each cart item
          const productPromise = getDoc(doc.ref.firestore.doc(`products/${cartItem.productId}`))
            .then(productDoc => {
              if (productDoc.exists()) {
                const productData = productDoc.data();
                return { ...cartItem, product: { id: productDoc.id, ...productData } };
              }
              return cartItem;
            });
          
          productPromises.push(productPromise);
        });

        const itemsWithProducts = await Promise.all(productPromises);
        setCartItems(itemsWithProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load checkout information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [addressId]);

  const placeOrder = async () => {
    if (!address) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    
    try {
      setProcessingOrder(true);
      
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.product?.name || 'Unknown Product',
        price: item.product?.offerPrice || item.product?.price || 0,
        quantity: item.quantity,
        size: item.size,
        image: item.product?.images?.[0] || null
      }));
      
      // Create order object
      const orderData = {
        userId: auth.currentUser.uid,
        items: orderItems,
        address: {
          id: address.id,
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
          type: address.type || 'Home'
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'paid'
        },
        subtotal: parseFloat(subtotal),
        shipping: 40, // Fixed shipping cost
        total: parseFloat(total),
        status: 'Processing',
        createdAt: serverTimestamp()
      };
      
      // Create the order in Firestore
      const orderId = await createOrder(orderData);
      
      // Clear cart after successful order
      for (const item of cartItems) {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'cart', item.id));
      }
      
      // Navigate to order confirmation
      router.replace({
        pathname: '/(tabs)/order-confirmation',
        params: { orderId }
      });
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place your order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Montserrat_700Bold' }]}>
          Checkout
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Delivery Address
          </Text>
          
          {address ? (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={[styles.addressType, { fontFamily: 'Poppins_600SemiBold' }]}>
                  {address.type || 'Address'}
                </Text>
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => router.push('/(tabs)/cart')}
                >
                  <Text style={[styles.changeText, { fontFamily: 'Poppins_500Medium' }]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.addressName, { fontFamily: 'Poppins_500Medium' }]}>
                {address.name}
              </Text>
              
              <Text style={[styles.addressDetails, { fontFamily: 'Poppins_400Regular' }]}>
                {address.street}, {address.city}, {address.state} {address.pincode}
              </Text>
              
              <Text style={[styles.addressPhone, { fontFamily: 'Poppins_400Regular' }]}>
                Phone: {address.phone}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/(tabs)/cart')}
            >
              <Text style={[styles.addAddressText, { fontFamily: 'Poppins_500Medium' }]}>
                Select Delivery Address
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#007bff" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Order Items
          </Text>
          
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { fontFamily: 'Poppins_500Medium' }]}>
                  {item.product?.name}
                </Text>
                <Text style={[styles.productMeta, { fontFamily: 'Poppins_400Regular' }]}>
                  Size: {item.size} • Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.productPrice, { fontFamily: 'Poppins_600SemiBold' }]}>
                ₹{(item.product?.offerPrice || item.product?.price || 0) * item.quantity}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Payment Method
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[
                styles.radioButton,
                paymentMethod === 'cod' && styles.radioButtonSelected
              ]}>
                {paymentMethod === 'cod' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <FontAwesome name="money" size={20} color="#4CAF50" style={styles.paymentIcon} />
              <Text style={[styles.paymentText, { fontFamily: 'Poppins_500Medium' }]}>
                Cash on Delivery
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.paymentOption,
              paymentMethod === 'online' && styles.selectedPayment
            ]}
            onPress={() => setPaymentMethod('online')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[
                styles.radioButton,
                paymentMethod === 'online' && styles.radioButtonSelected
              ]}>
                {paymentMethod === 'online' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <MaterialIcons name="payment" size={20} color="#2196F3" style={styles.paymentIcon} />
              <Text style={[styles.paymentText, { fontFamily: 'Poppins_500Medium' }]}>
                Online Payment
              </Text>
            </View>
            <Text style={[styles.comingSoon, { fontFamily: 'Poppins_400Regular' }]}>
              Coming Soon
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Order Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: 'Poppins_400Regular' }]}>
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { fontFamily: 'Poppins_500Medium' }]}>
              ₹{subtotal}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: 'Poppins_400Regular' }]}>
              Shipping
            </Text>
            <Text style={[styles.summaryValue, { fontFamily: 'Poppins_500Medium' }]}>
              ₹40
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontFamily: 'Poppins_600SemiBold' }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { fontFamily: 'Poppins_700Bold' }]}>
              ₹{total}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={placeOrder}
          disabled={processingOrder || !address}
        >
          {processingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={[styles.placeOrderText, { fontFamily: 'Poppins_600SemiBold' }]}>
                Place Order
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressType: {
    fontSize: 16,
  },
  changeButton: {
    padding: 4,
  },
  changeText: {
    fontSize: 14,
    color: '#007bff',
  },
  addressName: {
    fontSize: 16,
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addAddressButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addAddressText: {
    fontSize: 16,
    color: '#007bff',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 14,
    color: '#666',
  },
  productPrice: {
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPayment: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
  },
  comingSoon: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
  },
});
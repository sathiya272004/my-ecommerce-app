// src/screens/ManageOrders.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
// import { db } from '../services/firebaseConfig';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const querySnapshot = await getDocs(collection(db, 'orders'));
//       const orderList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setOrders(orderList);
//     };

//     fetchOrders();
//   }, []);

//   const handleUpdateStatus = async (id, newStatus) => {
//     await updateDoc(doc(db, 'orders', id), { status: newStatus });
//     setOrders(orders.map(order => (order.id === id ? { ...order, status: newStatus } : order)));
//   };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Text>{item.customerName} - ₹{item.totalPrice}</Text>
            <Text>Status: {item.status}</Text>
            <TouchableOpacity onPress={() => handleUpdateStatus(item.id, 'Shipped')}>
              <Text style={styles.shipButton}>Mark as Shipped</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 },
  shipButton: { color: 'blue', fontWeight: 'bold' }
});

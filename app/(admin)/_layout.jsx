import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
  // const { isAuthenticated, userRole, isLoading } = useAuth();
  
  // // Show loading screen while checking authentication
  // if (isLoading) {
  //   return null;
  // }
  
  // // Redirect non-admin users
  // if (!isAuthenticated || userRole !== 'admin') {
  //   return <Redirect href="/(auth)/login" />;
  // }
  
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: "Admin Dashboard",
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="add-product" 
        options={{ 
          title: "Add Product",
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="manage-products" 
        options={{ 
          title: "Manage Products",
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          title: "Orders",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
// app/(tabs)/add-address.js
import React, { useState } from 'react';
import {  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { addAddress } from '../../services/api';

export default function AddAddressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addressType, setAddressType] = useState('Home');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Load fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Montserrat_700Bold
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDefault = () => {
    setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }));
  };

  const validateForm = () => {
    const { name, phone, street, city, state, pincode } = formData;
    
    if (!name.trim()) return 'Please enter your full name';
    if (!phone.trim()) return 'Please enter your phone number';
    if (phone.trim().length !== 10) return 'Please enter a valid 10-digit phone number';
    if (!street.trim()) return 'Please enter your street address';
    if (!city.trim()) return 'Please enter your city';
    if (!state.trim()) return 'Please enter your state';
    if (!pincode.trim()) return 'Please enter your pincode';
    if (pincode.trim().length !== 6) return 'Please enter a valid 6-digit pincode';
    
    return null;
  };

  const saveAddress = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
  
    try {
      setLoading(true);
  
      await addAddress({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        isDefault: formData.isDefault,
        type: addressType,
      });
  
      Alert.alert('Success', 'Address added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
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
          Add New Address
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Address Type */}
          <Text style={[styles.sectionTitle, { fontFamily: 'Poppins_600SemiBold' }]}>
            Address Type
          </Text>
          
          <View style={styles.addressTypes}>
            <TouchableOpacity 
              style={[
                styles.typeButton,
                addressType === 'Home' && styles.selectedType
              ]}
              onPress={() => setAddressType('Home')}
            >
              <Ionicons 
                name="home-outline" 
                size={20} 
                color={addressType === 'Home' ? '#fff' : '#000'} 
              />
              <Text style={[
                styles.typeText, 
                { fontFamily: 'Poppins_500Medium' },
                addressType === 'Home' && styles.selectedTypeText
              ]}>
                Home
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.typeButton,
                addressType === 'Work' && styles.selectedType
              ]}
              onPress={() => setAddressType('Work')}
            >
              <Ionicons 
                name="briefcase-outline" 
                size={20} 
                color={addressType === 'Work' ? '#fff' : '#000'} 
              />
              <Text style={[
                styles.typeText, 
                { fontFamily: 'Poppins_500Medium' },
                addressType === 'Work' && styles.selectedTypeText
              ]}>
                Work
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.typeButton,
                addressType === 'Other' && styles.selectedType
              ]}
              onPress={() => setAddressType('Other')}
            >
              <Ionicons 
                name="location-outline" 
                size={20} 
                color={addressType === 'Other' ? '#fff' : '#000'} 
              />
              <Text style={[
                styles.typeText, 
                { fontFamily: 'Poppins_500Medium' },
                addressType === 'Other' && styles.selectedTypeText
              ]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Contact Information */}
          <Text style={[styles.sectionTitle, { fontFamily: 'Poppins_600SemiBold' }]}>
            Contact Information
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
              Full Name
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
              Phone Number
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={[styles.sectionTitle, { fontFamily: 'Poppins_600SemiBold' }]}>
            Address Details
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
              Street Address
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
              placeholder="House no., Building, Street, Area"
              value={formData.street}
              onChangeText={(text) => handleChange('street', text)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
              City
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
              placeholder="Enter your city"
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
                State
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
                placeholder="Enter state"
                value={formData.state}
                onChangeText={(text) => handleChange('state', text)}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { fontFamily: 'Poppins_500Medium' }]}>
                Pincode
              </Text>
              <TextInput
                style={[styles.input, { fontFamily: 'Poppins_400Regular' }]}
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChangeText={(text) => handleChange('pincode', text)}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>
          
          {/* Default Address */}
          <TouchableOpacity 
            style={styles.defaultContainer}
            onPress={toggleDefault}
          >
            <View style={[
              styles.checkbox,
              formData.isDefault && styles.checkboxSelected
            ]}>
              {formData.isDefault && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={[styles.defaultText, { fontFamily: 'Poppins_500Medium' }]}>
              Set as default address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.saveText, { fontFamily: 'Poppins_600SemiBold' }]}>
              Save Address
            </Text>
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
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 16,
  },
  addressTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 4,
  },
  selectedType: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  typeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  selectedTypeText: {
    color: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  defaultText: {
    fontSize: 16,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
});
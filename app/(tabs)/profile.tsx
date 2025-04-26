import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile, fetchUserProfile } from '../../services/api'; // You’ll define these
import { auth } from '../../firebase/config'; // Make sure Firebase is configured properly

export default function EditProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await fetchUserProfile(auth.currentUser.uid);
      setDisplayName(data.displayName || '');
      setEmail(data.email || '');
      setImage(data.photoURL || null);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!displayName || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(auth.currentUser.uid, { displayName, email }, image);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Select Profile Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSubmit} style={styles.updateButton}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Update Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5,
    marginBottom: 15,
  },
  imagePicker: {
    height: 150, width: 150, borderRadius: 75, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginVertical: 15,
  },
  image: { height: 150, width: 150, borderRadius: 75 },
  updateButton: {
    backgroundColor: '#007BFF', padding: 15, borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

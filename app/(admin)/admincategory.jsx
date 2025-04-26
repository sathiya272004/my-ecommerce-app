import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addCategory, fetchCategories, deleteCategory, updateCategory } from '../../services/api';
import Button from '../../components/ui/Button';

export default function ManageCategoriesScreen() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !image) {
      Alert.alert('Error', 'Please enter a category name and select an image.');
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        await updateCategory(editId, { name, image });
        Alert.alert('Success', 'Category updated successfully!');
      } else {
        await addCategory({ name, image });
        Alert.alert('Success', 'Category added successfully!');
      }
      setName('');
      setImage(null);
      setEditId(null);
      loadCategories();
    } catch (error) {
      Alert.alert('Error', 'Failed to save category.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      Alert.alert('Success', 'Category deleted successfully!');
      loadCategories();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete category.');
      console.error('Error:', error);
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setName(category.name);
    setImage(category.image);
  };

  return (
    <ScrollView style={styles.container}>
  <Text style={styles.header}>{editId ? 'Edit Category' : 'Add Category'}</Text>

  <TextInput 
    style={styles.input} 
    placeholder='Category Name' 
    value={name} 
    onChangeText={setName} 
  />

  <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
    {image ? (
      <Image source={{ uri: image }} style={styles.image} />
    ) : (
      <Text>Select Image</Text>
    )}
  </TouchableOpacity>

  <TouchableOpacity 
    onPress={handleSubmit} 
    style={editId ? styles.updateButton : styles.addButton}
  >
    <Text style={styles.buttonText}>
      {editId ? 'Update Category' : 'Add Category'}
    </Text>
  </TouchableOpacity>

  <Text style={styles.header}>Categories</Text>

  {categories.map((category) => (
    <View key={category.id} style={styles.categoryCard}>
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      
      <View style={styles.categoryTextContainer}>
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(category)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(category.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ))}
</ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ecf0f1', // Light grayish-blue background
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 14,
    color: '#1e272e', // Dark navy for strong contrast
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#95afc0', // Soft blue-gray
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff', // Pure white for clarity
  },
  imagePicker: {
    padding: 12,
    backgroundColor: '#f9ca24', // Yellowish background for selection
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e056fd', // Purple border for a stylish look
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  categoryImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#27ae60', // Green border for consistency
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#30336b', // Deep blue for strong readability
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#0984e3', // Vibrant blue for Edit
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#d63031', // Bright red for Delete
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
  },
  addButton: {
    backgroundColor: '#6c5ce7', // Purple for Add Category
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
  },
  updateButton: {
    backgroundColor: '#fd79a8', // Soft pink for Update Category
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


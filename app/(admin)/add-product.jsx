import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { addProduct } from '../../services/api';

export default function AddProductScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [stockS, setStockS] = useState('');
  const [stockM, setStockM] = useState('');
  const [stockL, setStockL] = useState('');
  const [stockXL, setStockXL] = useState('');
  const [stockXXL, setStockXXL] = useState('');
  const [stockXXXL, setStockXXXL] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !category || images.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one image.');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        name,
        description,
        price: parseFloat(price),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        category,
        images,
        isFeatured,
        isTrending,
        additionalInfo,
        quantity_s: parseInt(stockS) || 0,
        quantity_m: parseInt(stockM) || 0,
        quantity_l: parseInt(stockL) || 0,
        quantity_xl: parseInt(stockXL) || 0,
        quantity_xxl: parseInt(stockXXL) || 0,
        quantity_xxxl: parseInt(stockXXXL) || 0,
      };

      await addProduct(productData);

      Alert.alert('Success', 'Product added successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(admin)/manage-products'),
        },
      ]);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Add New Product</Text>

        <Input label="Product Name" placeholder="Enter product name" value={name} onChangeText={setName} />
        <Input
          label="Description"
          placeholder="Enter product description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
        <Input
          label="Price (₹)"
          placeholder="Enter original price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        <Input
          label="Offer Price (₹)"
          placeholder="Enter discounted price"
          value={offerPrice}
          onChangeText={setOfferPrice}
          keyboardType="numeric"
        />
        <Input label="Category" placeholder="Enter product category" value={category} onChangeText={setCategory} />

        <Text style={styles.subTitle}>Stock by Size</Text>
        <Input label="Small (S)" value={stockS} onChangeText={setStockS} keyboardType="numeric" />
        <Input label="Medium (M)" value={stockM} onChangeText={setStockM} keyboardType="numeric" />
        <Input label="Large (L)" value={stockL} onChangeText={setStockL} keyboardType="numeric" />
        <Input label="XL" value={stockXL} onChangeText={setStockXL} keyboardType="numeric" />
        <Input label="XXL" value={stockXXL} onChangeText={setStockXXL} keyboardType="numeric" />
        <Input label="XXXL" value={stockXXXL} onChangeText={setStockXXXL} keyboardType="numeric" />

        <Input
          label="Additional Info"
          placeholder="Optional notes or features..."
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Product Images</Text>
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                <Text style={styles.removeImageBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Text style={styles.addImageBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Add Product" onPress={handleSubmit} loading={loading} />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isFeatured && styles.toggleActive]}
            onPress={() => setIsFeatured(!isFeatured)}
          >
            <Text style={styles.toggleText}>Featured</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, isTrending && styles.toggleActive]}
            onPress={() => setIsTrending(!isTrending)}
          >
            <Text style={styles.toggleText}>Trending</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ecf0f1',
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#2d3436',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#2d3436',
  },
  textArea: {
    minHeight: 80,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e056fd',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#d63031',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  removeImageBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addImageBtn: {
    width: 110,
    height: 110,
    borderWidth: 2,
    borderColor: '#74b9ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtnText: {
    fontSize: 40,
    color: '#74b9ff',
  },
  buttonContainer: {
    marginTop: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  toggleButton: {
    backgroundColor: '#dfe6e9',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleActive: {
    backgroundColor: '#00cec9',
  },
  toggleText: {
    color: '#2d3436',
    fontWeight: '600',
  },
});

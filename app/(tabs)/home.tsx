import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchProducts, getFeaturedProducts, getTrendingProducts } from '../../services/api'; // your API function
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFonts,  Poppins_600SemiBold,} from '@expo-google-fonts/poppins';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetchedCategories = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() });
        });
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
  

  
    fetchCategories(); // Call the async function
  }, []);
  

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.length > 1) {
      const res = await searchProducts(text); // your API
      setResults(res);
    } else {
      setResults([]);
    }
  };

  const fetchData = async () => {
    try {
      const featured = await getFeaturedProducts();
      const trending = await getTrendingProducts();
      const catSnap = await getDocs(collection(db, 'categories'));

      const fetchedCategories = [];
      catSnap.forEach((doc) => {
        fetchedCategories.push({ id: doc.id, ...doc.data() });
      });

      setFeaturedProducts(featured);
      setTrendingProducts(trending);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  fetchData();


  const handleSelect = (item) => {
    setSearchText(item.name);
    setResults([]);
    // Optional: navigation.navigate('ProductDetails', { item });
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        router.push({
          pathname: '/product/[productId]',
          params: { productId: item.id },
        })
      }
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
    </TouchableOpacity>
  );
  


  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.category}
      onPress={() =>
        router.push({
          pathname: '/categories/[categoryId]',
          params: { categoryId: item.id, categoryName: item.name },
        })
      }
      
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <ScrollView style={styles.container}>

      <View style={styles.searchWrapper}>
        <TextInput placeholder="Search product..." style={styles.input} value={searchText} onChangeText={handleSearch}  />
        <Ionicons name="search" size={24} color="gray" />
      </View>

      {results.length > 0 && (
        <FlatList data={results} keyExtractor={(item) => item.id} style={styles.dropdown} renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList data={categories} horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />

      <Text style={styles.sectionTitle}>Featured Products</Text>
      <FlatList
        data={featuredProducts}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />

      <Text style={styles.sectionTitle}>Trending Products</Text>
      <FlatList
        data={trendingProducts}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 40,
    // backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 50,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    color: 'gray',
  },
  sectionTitle: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    color: '#4A4A4A',
    marginTop: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
 
  category: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  productCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
});

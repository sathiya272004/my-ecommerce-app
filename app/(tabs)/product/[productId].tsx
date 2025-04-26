import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Share, StatusBar} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../firebase/config';
import { AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import { 
  useFonts, 
  Poppins_400Regular, 
  Poppins_500Medium, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import { addToCart } from '../../../services/api';

const { width } = Dimensions.get('window');

const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Montserrat_400Regular,
    Montserrat_600SemiBold
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct(docSnap.data());
          
          // Check if product is in favorites
          if (auth.currentUser) {
            const favRef = doc(db, 'users', auth.currentUser.uid, 'favorites', productId);
            const favSnap = await getDoc(favRef);
            setIsFavorite(favSnap.exists());
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const toggleFavorite = async () => {
    if (!auth.currentUser) {
      // Redirect to login if not authenticated
      router.push('/(auth)/login');
      return;
    }
    
    setFavoriteLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      const favRef = doc(db, 'users', userId, 'favorites', productId);
      
      if (isFavorite) {
        // Remove from favorites
        await deleteDoc(favRef);
      } else {
        // Add to favorites
        await setDoc(favRef, {
          productId,
          name: product.name,
          price: product.price,
          offerPrice: product.offerPrice || null,
          image: product.images[0],
          addedAt: new Date()
        });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this amazing product: ${product.name} - ${product.description}`,
        url: product.images[0], // This works on iOS, for Android you might need a different approach
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      router.push('/(auth)/login');
      return;
    }
  
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
  
    try {
      const cartData = {
        userId: auth.currentUser.uid,
        productId: productId,
        productName: product.name,
        productImage: product.images[0],
        selectedSize,
        quantity,
        price: product.offerPrice || product.price,
      };
  
      await addToCart(cartData);
      alert(`Added ${quantity} ${product.name} (Size: ${selectedSize}) to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Something went wrong while adding to cart.");
    }
  };
  
  
  
  if (!fontsLoaded) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={[styles.loadingText, { fontFamily: 'Poppins_400Regular' }]}>
          Loading product...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#e74c3c" />
        <Text style={[styles.errorText, { fontFamily: 'Poppins_500Medium' }]}>
          Product not found
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { fontFamily: 'Poppins_400Regular' }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const infoPoints = product.additionalInfo
    ? product.additionalInfo.split('.').filter(item => item.trim() !== '')
    : [];

  const sizeOptions = [
    { label: 'S', key: 'quantity_s' },
    { label: 'M', key: 'quantity_m' },
    { label: 'L', key: 'quantity_l' },
    { label: 'XL', key: 'quantity_xl' },
    { label: 'XXL', key: 'quantity_xxl' },
    { label: 'XXXL', key: 'quantity_xxxl' },
  ];

  const discount = product.offerPrice 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#e91e63" />
            ) : (
              <AntDesign 
                name={isFavorite ? "heart" : "hearto"} 
                size={24} 
                color={isFavorite ? "#e91e63" : "#000"} 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onScroll={(e) => {
              const contentOffset = e.nativeEvent.contentOffset.x;
              const index = Math.round(contentOffset / width);
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} />
            )}
          />
          
          {/* Image Indicators */}
          {product.images.length > 1 && (
            <View style={styles.indicators}>
              {product.images.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.indicator, 
                    index === activeImageIndex && styles.activeIndicator
                  ]} 
                />
              ))}
            </View>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={[styles.discountText, { fontFamily: 'Poppins_600SemiBold' }]}>
                {discount}% OFF
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Product Name and Price */}
          <Text style={[styles.name, { fontFamily: 'Montserrat_600SemiBold' }]}>
            {product.name}
          </Text>

          {product.offerPrice ? (
            <View style={styles.priceRow}>
              <Text style={[styles.offer, { fontFamily: 'Poppins_700Bold' }]}>
                ₹{product.offerPrice}
              </Text>
              <Text style={[styles.strike, { fontFamily: 'Poppins_400Regular' }]}>
                ₹{product.price}
              </Text>
              <View style={styles.savingBadge}>
                <Text style={[styles.savingText, { fontFamily: 'Poppins_500Medium' }]}>
                  Save ₹{product.price - product.offerPrice}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.price, { fontFamily: 'Poppins_700Bold' }]}>
              ₹{product.price}
            </Text>
          )}

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
              Description
            </Text>
            <Text style={[styles.description, { fontFamily: 'Poppins_400Regular' }]}>
              {product.description}
            </Text>
          </View>

          {/* Additional Info */}
          <TouchableOpacity 
            style={styles.infoToggleContainer}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Text style={[styles.infoToggle, { fontFamily: 'Montserrat_600SemiBold' }]}>
              Additional Info
            </Text>
            <AntDesign name={showInfo ? "up" : "down"} size={16} color="#007bff" />
          </TouchableOpacity>

          {showInfo && infoPoints.length > 0 && (
            <View style={styles.infoBox}>
              {infoPoints.map((p, i) => (
                <View key={i} style={styles.infoPoint}>
                  <View style={styles.bulletPoint} />
                  <Text style={[styles.infoText, { fontFamily: 'Poppins_400Regular' }]}>
                    {p.trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Size Selection */}
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Select Size
          </Text>
          <View style={styles.sizes}>
            {sizeOptions.map(size => (
              product[size.key] > 0 && (
                <TouchableOpacity
                  key={size.label}
                  style={[
                    styles.sizeButton,
                    selectedSize === size.label && styles.selectedSize
                  ]}
                  onPress={() => setSelectedSize(size.label)}
                >
                  <Text style={[
                    styles.sizeText,
                    { fontFamily: 'Poppins_500Medium' },
                    selectedSize === size.label && styles.selectedSizeText
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              )
            ))}
          </View>

          {/* Quantity Selection */}
          <Text style={[styles.sectionTitle, { fontFamily: 'Montserrat_600SemiBold' }]}>
            Quantity
          </Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <AntDesign name="minus" size={18} color="#000" />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { fontFamily: 'Poppins_600SemiBold' }]}>
              {quantity}
            </Text>
            <TouchableOpacity 
              style={styles.qtyButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <AntDesign name="plus" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartBtn}  onPress={handleAddToCart}    >
          <AntDesign name="shoppingcart" size={20} color="#fff" />
          <Text style={[styles.cartText, { fontFamily: 'Poppins_600SemiBold' }]}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  image: { 
    width, 
    height: 400, 
    resizeMode: 'cover' 
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 16,
    width: '100%',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#e91e63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
  },
  content: { 
    padding: 20,
  },
  name: { 
    fontSize: 24, 
    marginBottom: 12,
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    gap: 10,
  },
  offer: { 
    fontSize: 22, 
    color: '#e91e63',
  },
  strike: { 
    fontSize: 16, 
    color: '#888', 
    textDecorationLine: 'line-through',
  },
  price: { 
    fontSize: 22, 
    marginBottom: 16,
  },
  savingBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savingText: {
    color: '#007bff',
    fontSize: 12,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: { 
    fontSize: 15, 
    color: '#555', 
    lineHeight: 22,
  },
  infoToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  infoToggle: { 
    fontSize: 16, 
    color: '#007bff',
  },
  infoBox: { 
    backgroundColor: '#f8f9fa', 
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 20,
  },
  infoPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007bff',
    marginTop: 8,
    marginRight: 8,
  },
  infoText: { 
    fontSize: 14, 
    color: '#444',
    flex: 1,
    lineHeight: 20,
  },
  sizes: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
    marginBottom: 20,
  },
  sizeButton: {
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8,
    paddingHorizontal: 16, 
    paddingVertical: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedSize: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sizeText: { 
    fontSize: 14, 
    color: '#000',
  },
  selectedSizeText: { 
    color: '#fff',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { 
    fontSize: 16,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  cartBtn: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cartText: { 
    color: '#fff', 
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProductDetail;
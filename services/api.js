  import {  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, } from "firebase/firestore"
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { db, auth } from "../firebase/config"
  // import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

  // Products
  export const fetchProducts = async (categoryId = null, limit = 50) => {
    try {
      let productsQuery
  
      if (categoryId) {
        productsQuery = query(
          collection(db, "products"),
          where("categoryId", "==", categoryId),
          orderBy("createdAt", "desc"),
          limit(limit),
        )
      } else {
        productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(limit))
      }
  
      const querySnapshot = await getDocs(productsQuery)
  
      const products = []
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        })
      })
  
      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  }
  
  export const fetchProductById = async (id) => {
    try {
      const docRef = doc(db, "products", id)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      } else {
        throw new Error("Product not found")
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  }
  
  export const addProduct = async (productData) => {
    try {
      // Add timestamp
      const dataWithTimestamp = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
  
      const docRef = await addDoc(collection(db, "products"), dataWithTimestamp)
      return {
        id: docRef.id,
        ...productData,
      }
    } catch (error) {
      console.error("Error adding product:", error)
      throw error
    }
  }
  
  export const updateProduct = async (id, productData) => {
    try {
      const productRef = doc(db, "products", id)
  
      // Add updated timestamp
      const dataWithTimestamp = {
        ...productData,
        updatedAt: serverTimestamp(),
      }
  
      await updateDoc(productRef, dataWithTimestamp)
  
      return {
        id,
        ...productData,
      }
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }
  
  export const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }
  
  // Categories
  export const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories")
      const querySnapshot = await getDocs(categoriesRef)
  
      const categories = []
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        })
      })
  
      return categories
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }
  
  export const addCategory = async (categoryData) => {
    try {
      // Add timestamp
      const dataWithTimestamp = {
        ...categoryData,
        createdAt: serverTimestamp(),
      }
  
      const docRef = await addDoc(collection(db, "categories"), dataWithTimestamp)
      return {
        id: docRef.id,
        ...categoryData,
      }
    } catch (error) {
      console.error("Error adding category:", error)
      throw error
    }
  }

  export const updateCategory = async (categoryId, updatedData) => {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        ...updatedData,
        updatedAt: new Date(),
      });
  
      return { id: categoryId, ...updatedData };
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  };
  
  export const deleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "categories", id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }
  
  
  // Orders
  export const fetchOrders = async (userId = null) => {
    try {
      const ordersRef = collection(db, "orders")
      let q
  
      if (userId) {
        // Get orders for specific user
        q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))
      } else {
        // Get all orders (admin)
        q = query(ordersRef, orderBy("createdAt", "desc"))
      }
  
      const querySnapshot = await getDocs(q)
  
      const orders = []
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date if it exists
          createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()) : new Date(),
        })
      })
  
      return orders
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }
  
  export const createOrder = async (orderData) => {
    try {
      // Add timestamp
      const dataWithTimestamp = {
        ...orderData,
        status: "Processing",
        createdAt: serverTimestamp(),
      }
  
      const docRef = await addDoc(collection(db, "orders"), dataWithTimestamp)
      return {
        id: docRef.id,
        ...orderData,
      }
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }
  
  export const updateOrderStatus = async (id, status) => {
    try {
      const orderRef = doc(db, "orders", id)
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      })
  
      return { success: true }
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }
  
  // User profile
  export const fetchUserProfile = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    } else {
      throw new Error('User not found');
    }
  };
  
  // export const updateUserProfile = async (uid, data, imageUri) => {
  //   try {
  //     let photoURL = data.photoURL || null;
  
  //     if (imageUri && !imageUri.startsWith('https://')) {
  //       const response = await fetch(imageUri);
  //       const blob = await response.blob();
  //       const imageRef = ref(storage, `profile_images/${uid}.jpg`);
  //       await uploadBytes(imageRef, blob);
  //       photoURL = await getDownloadURL(imageRef);
  //     }
  
  //     const userRef = doc(db, 'users', uid);
  //     await updateDoc(userRef, {
  //       displayName: data.displayName,
  //       email: data.email,
  //       photoURL,
  //       updatedAt: serverTimestamp(),
  //     });
  
  //     return true;
  //   } catch (error) {
  //     console.error('Profile update failed:', error);
  //     throw error;
  //   }
  // };

  export const updateUserProfile = async (uid, photoURL) => {
    try {
      const userRef = doc(db, 'users', uid); // use UID as document ID
      await updateDoc(userRef, {
        photoURL: photoURL,
        updatedAt: serverTimestamp(),
      });
  
      console.log('User profile photo updated successfully');
    } catch (error) {
      console.error('Error updating user photo URL:', error);
      throw error;
    }
  };
  
  // Check if user is admin
  export const isUserAdmin = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        return userDoc.data().role === "admin"
      }
      return false
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }
  


  // Users api
export const searchProducts = async (text) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('name', '>=', text), where('name', '<=', text + '\uf8ff'));

    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getFeaturedProducts = async () => {
  const q = query(collection(db, 'products'), where('isFeatured', '==', true));
  const querySnapshot = await getDocs(q);
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
};

export const getTrendingProducts = async () => {
  const q = query(collection(db, 'products'), where('isTrending', '==', true));
  const querySnapshot = await getDocs(q);
  const products = [];
  querySnapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() });
  });
  return products;
};

export const addToCart = async (cartData) => {
  try {
    const dataWithTimestamp = {
      ...cartData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'carts'), dataWithTimestamp);

    return {
      id: docRef.id,
      ...cartData,
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCartByUser = async (userId) => {
  try {
    const q = query(collection(db, 'carts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const cartItems = [];
    querySnapshot.forEach((doc) => {
      cartItems.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return cartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

export const fetchCartItems = async (userId) => {
  const q = query(collection(db, 'carts'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchProductDetails = async (productId) => {
  const docRef = doc(db, 'products', productId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const itemRef = doc(db, 'carts', itemId);
  await updateDoc(itemRef, { quantity });
};

export const removeCartItem = async (userId, itemId) => {
  const itemRef = doc(db, 'carts', itemId);
  await deleteDoc(itemRef);
};

export const addAddress = async (addressData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const addressWithMeta = {
      ...addressData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'addresses'), addressWithMeta);

    return {
      id: docRef.id,
      ...addressData,
    };
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const fetchUserAddresses = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    const addressesRef = collection(db, 'users', userId, 'addresses');
    const snapshot = await getDocs(addressesRef);

    const addresses = [];
    snapshot.forEach(doc => {
      addresses.push({ id: doc.id, ...doc.data() });
    });

    return addresses;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
};






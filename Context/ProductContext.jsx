import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
        
        // Fetch all products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
        
        // Fetch featured products
        const featuredQuery = query(
          collection(db, 'products'),
          where('featured', '==', true),
          limit(10)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProducts(featuredData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProductById = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        return { id: productDoc.id, ...productDoc.data() };
      } else {
        throw new Error('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      throw err;
    }
  };

  const getProductsByCategory = async (categoryId) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('categoryId', '==', categoryId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      console.error('Error fetching products by category:', err);
      throw err;
    }
  };

  const searchProducts = async (searchTerm) => {
    try {
      // In a real app, you would use a proper search solution like Algolia
      // This is a simple client-side search for demonstration
      const searchTermLower = searchTerm.toLowerCase();
      return products.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower))
      );
    } catch (err) {
      console.error('Error searching products:', err);
      throw err;
    }
  };

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        categories, 
        featuredProducts, 
        loading, 
        error,
        getProductById,
        getProductsByCategory,
        searchProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
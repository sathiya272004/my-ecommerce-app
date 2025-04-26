import { useContext } from 'react';
import { ProductContext } from '../Context/ProductContext';

export default function useProducts() {
  return useContext(ProductContext);
}
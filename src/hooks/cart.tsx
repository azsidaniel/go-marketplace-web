import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsFromStorage) {
        setProducts(JSON.parse(productsFromStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const exitentProduct = products.find(each => each.id === product.id);

      if (!exitentProduct) {
        const productAddedquantity = { ...product, quantity: 1 };
        const newArrWithAddedProduct = [...products, productAddedquantity];
        setProducts(newArrWithAddedProduct);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newArrWithAddedProduct),
        );

        return;
      }

      const quantityIncremented = products.map(each => {
        if (each.id === product.id) {
          const itemAddedQuantity = { ...each, quantity: each.quantity + 1 };
          return itemAddedQuantity;
        }
        return each;
      });
      setProducts(quantityIncremented);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(quantityIncremented),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProducts = products.map(each => {
        if (each.id === id) {
          const itemAddedQuantity = { ...each, quantity: each.quantity + 1 };
          return itemAddedQuantity;
        }
        return each;
      });

      setProducts(incrementProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const chosenItem = products.find(each => each.id === id);

      if (chosenItem && chosenItem.quantity === 1) {
        const newProducts = products.filter(each => each.id !== id);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
        return;
      }

      const decrementedItens = products.map(each => {
        if (each.id === id) {
          const itemAddedQuantity = { ...each, quantity: each.quantity - 1 };
          return itemAddedQuantity;
        }
        return each;
      });

      setProducts(decrementedItens);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(decrementedItens),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

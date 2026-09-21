import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  product_id: string;
  product_name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  selected_perfumes?: string[];
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (product_id: string, variant: string) => void;
  updateQuantity: (product_id: string, variant: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "scent-of-time-cart";

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.variant === item.variant
      );
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id && i.variant === item.variant
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    toast({
      title: "Item added to cart successfully.",
      description: `${item.product_name} — ${item.variant}`,
    });
  };

  const removeFromCart = (product_id: string, variant: string) => {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.variant === variant)));
  };

  const updateQuantity = (product_id: string, variant: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(product_id, variant);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === product_id && i.variant === variant ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

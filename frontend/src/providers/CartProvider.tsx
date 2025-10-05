import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { CartItem, MenuItem } from "../types/orders";

interface CartState {
  items: CartItem[];
  restaurantId?: string;
  restaurantName?: string;
}

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { menuItem: MenuItem; quantity?: number; notes?: string };
    }
  | { type: "REMOVE_ITEM"; payload: { menuItemId: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { menuItemId: string; quantity: number };
    }
  | { type: "UPDATE_NOTES"; payload: { menuItemId: string; notes: string } }
  | { type: "CLEAR_CART" }
  | {
      type: "SET_RESTAURANT";
      payload: { restaurantId: string; restaurantName: string };
    };

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  setRestaurant: (restaurantId: string, restaurantName: string) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isFromSameRestaurant: (restaurantId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { menuItem, quantity = 1, notes } = action.payload;

      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          notes: notes || updatedItems[existingItemIndex].notes,
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { menuItem, quantity, notes }],
        restaurantId: state.restaurantId || menuItem.restaurantId,
        restaurantName: state.restaurantName || menuItem.restaurant?.name,
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.menuItem.id !== action.payload.menuItemId
        ),
      };

    case "UPDATE_QUANTITY": {
      const { menuItemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.menuItem.id !== menuItemId),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item
        ),
      };
    }

    case "UPDATE_NOTES":
      return {
        ...state,
        items: state.items.map((item) =>
          item.menuItem.id === action.payload.menuItemId
            ? { ...item, notes: action.payload.notes }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        items: [],
        restaurantId: undefined,
        restaurantName: undefined,
      };

    case "SET_RESTAURANT":
      return {
        ...state,
        restaurantId: action.payload.restaurantId,
        restaurantName: action.payload.restaurantName,
      };

    default:
      return state;
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    restaurantId: undefined,
    restaurantName: undefined,
  });

  const addItem = (menuItem: MenuItem, quantity = 1, notes?: string) => {
    dispatch({ type: "ADD_ITEM", payload: { menuItem, quantity, notes } });
  };

  const removeItem = (menuItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { menuItemId } });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { menuItemId, quantity } });
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    dispatch({ type: "UPDATE_NOTES", payload: { menuItemId, notes } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const setRestaurant = (restaurantId: string, restaurantName: string) => {
    dispatch({
      type: "SET_RESTAURANT",
      payload: { restaurantId, restaurantName },
    });
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return state.items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  };

  const isFromSameRestaurant = (restaurantId: string) => {
    return !state.restaurantId || state.restaurantId === restaurantId;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        setRestaurant,
        getItemCount,
        getSubtotal,
        isFromSameRestaurant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

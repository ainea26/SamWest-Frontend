"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { BookingItem } from "@/types/booking";
import type { Product } from "@/types/product";

const STORAGE_KEY = "samwest-booking";
const MAX_QUANTITY = 99;

type BookingContextValue = {
  items: BookingItem[];
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  isHydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearBooking: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

type BookingProviderProps = {
  children: ReactNode;
};

const BookingContext = createContext<BookingContextValue | undefined>(
  undefined,
);

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

function isValidBookingItem(value: unknown): value is BookingItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<BookingItem>;

  return Boolean(
    item.product &&
    typeof item.product === "object" &&
    typeof item.product.id === "number" &&
    typeof item.product.name === "string" &&
    typeof item.product.slug === "string" &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0,
  );
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [items, setItems] = useState<BookingItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedBooking = window.localStorage.getItem(STORAGE_KEY);

      if (savedBooking) {
        const parsedBooking: unknown = JSON.parse(savedBooking);

        if (Array.isArray(parsedBooking)) {
          const validItems = parsedBooking
            .filter(isValidBookingItem)
            .map((item) => ({
              ...item,
              quantity: normalizeQuantity(item.quantity),
            }));

          setItems(validItems);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Booking remains available in memory if storage is unavailable.
    }
  }, [isHydrated, items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (!product.is_available) {
      return;
    }

    const amountToAdd = normalizeQuantity(quantity);

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                product,
                quantity: normalizeQuantity(item.quantity + amountToAdd),
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          product,
          quantity: amountToAdd,
        },
      ];
    });

    setIsDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId),
      );

      return;
    }

    const normalizedQuantity = normalizeQuantity(quantity);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: normalizedQuantity,
            }
          : item,
      ),
    );
  }, []);

  const clearBooking = useCallback(() => {
    setItems([]);
    setIsDrawerOpen(false);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((currentValue) => !currentValue);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = Number.parseFloat(item.product.price);

        return total + (Number.isFinite(price) ? price : 0) * item.quantity;
      }, 0),
    [items],
  );

  const contextValue = useMemo<BookingContextValue>(
    () => ({
      items,
      totalItems,
      totalPrice,
      isDrawerOpen,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearBooking,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      items,
      totalItems,
      totalPrice,
      isDrawerOpen,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearBooking,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider.");
  }

  return context;
}

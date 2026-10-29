"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { MOCK_PRODUCTS, MOCK_RATINGS } from "@/data/mock";

const StoreContext = createContext(null);
const VISITOR_KEY = "icebomb-visitor";

let memoryId = null;
const subscribe = () => () => {};
const getServerVisitorId = () => null;

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    memoryId ??= crypto.randomUUID();
    return memoryId;
  }
}

// Nur Client-State: Produkte und Bewertungen gehen beim Neuladen verloren.
export function StoreProvider({ children }) {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [ratings, setRatings] = useState(MOCK_RATINGS);
  const visitorId = useSyncExternalStore(subscribe, getVisitorId, getServerVisitorId);

  const addProduct = useCallback((product) => {
    const id = `neu-${crypto.randomUUID()}`;
    setProducts((prev) => [{ ...product, id, isNew: true }, ...prev]);
    return id;
  }, []);

  // Ersetzt die bisherige Bewertung dieses Besuchers für das Produkt.
  const rateProduct = useCallback(
    (productId, values) => {
      if (!visitorId) return;
      setRatings((prev) => [
        ...prev.filter((r) => !(r.productId === productId && r.visitorId === visitorId)),
        { productId, visitorId, values },
      ]);
    },
    [visitorId],
  );

  const value = useMemo(
    () => ({ products, ratings, visitorId, addProduct, rateProduct }),
    [products, ratings, visitorId, addProduct, rateProduct],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

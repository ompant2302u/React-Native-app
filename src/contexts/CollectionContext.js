// src/contexts/CollectionContext.js
//
// Single source of truth for all meals.
// - toggleFavourite: flips favourite flag and saves to AsyncStorage immediately
// - addMeal: prepends a new meal with a unique id
// - removeMeal: removes by id
// - updateMeal: partial update by id
// - favourites: memoised list of meals where favourite === true

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SEED_ITEMS from "../data/seed";

const STORAGE_KEY = "@meal_collection_v2";

const CollectionContext = createContext(null);

export function CollectionProvider({ children }) {
  const [meals, setMeals] = useState(SEED_ITEMS);
  const [loaded, setLoaded] = useState(false);

  // ── Load from AsyncStorage on first mount ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMeals(parsed);
          }
        }
      } catch (e) {
        console.warn("CollectionContext: load error", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // ── Persist to AsyncStorage whenever meals change (after first load) ──
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(meals)).catch((e) =>
      console.warn("CollectionContext: save error", e)
    );
  }, [meals, loaded]);

  // ── Actions ───────────────────────────────────────────────────────────

  const toggleFavourite = useCallback((id) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, favourite: !m.favourite } : m))
    );
  }, []);

  const addMeal = useCallback((mealData) => {
    const newMeal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source: "mine",
      favourite: false,
      ...mealData,
    };
    setMeals((prev) => [newMeal, ...prev]);
    return newMeal.id;
  }, []);

  const removeMeal = useCallback((id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateMeal = useCallback((id, updates) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  // Memoised so FavouritesScreen doesn't rerender on unrelated meal changes
  const favourites = useMemo(
    () => meals.filter((m) => m.favourite === true),
    [meals]
  );

  const value = useMemo(
    () => ({ meals, favourites, loaded, toggleFavourite, addMeal, removeMeal, updateMeal }),
    [meals, favourites, loaded, toggleFavourite, addMeal, removeMeal, updateMeal]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollection must be used within CollectionProvider");
  return ctx;
}

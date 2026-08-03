// src/contexts/CollectionContext.js

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

function cloneSeedItems() {
  return Array.isArray(SEED_ITEMS)
    ? SEED_ITEMS.map((meal) => ({
        ...meal,
        favourite: Boolean(meal.favourite),
      }))
    : [];
}

export function CollectionProvider({ children }) {
  const [meals, setMeals] = useState(cloneSeedItems);
  const [loaded, setLoaded] = useState(false);

  /*
   * Load meals from AsyncStorage.
   * An empty saved array is respected, so deleted meals
   * do not return after restarting the application.
   */
  useEffect(() => {
    let active = true;

    async function loadMeals() {
      try {
        const savedValue =
          await AsyncStorage.getItem(STORAGE_KEY);

        if (!active) {
          return;
        }

        if (savedValue !== null) {
          const parsedValue = JSON.parse(savedValue);

          if (Array.isArray(parsedValue)) {
            setMeals(parsedValue);
          }
        }
      } catch (error) {
        console.warn(
          "CollectionContext load error:",
          error
        );
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    loadMeals();

    return () => {
      active = false;
    };
  }, []);

  /*
   * Save meals after initial storage loading finishes.
   */
  useEffect(() => {
    if (!loaded) {
      return;
    }

    async function saveMeals() {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(meals)
        );
      } catch (error) {
        console.warn(
          "CollectionContext save error:",
          error
        );
      }
    }

    saveMeals();
  }, [meals, loaded]);

  /*
   * Add a new recipe.
   */
  const addMeal = useCallback((mealData = {}) => {
    const newMeal = {
      ...mealData,
      id: createMealId(),
      source: mealData.source || "mine",
      favourite: Boolean(mealData.favourite),
    };

    setMeals((currentMeals) => [
      newMeal,
      ...currentMeals,
    ]);

    return newMeal.id;
  }, []);

  /*
   * Update only the meal with the matching ID.
   *
   * Usage:
   * updateMeal(mealId, {
   *   title: "Updated title"
   * });
   */
  const updateMeal = useCallback(
    (id, updates = {}) => {
      if (id === undefined || id === null) {
        console.warn(
          "updateMeal requires a meal ID."
        );
        return;
      }

      if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates)
      ) {
        console.warn(
          "updateMeal requires an updates object."
        );
        return;
      }

      setMeals((currentMeals) =>
        currentMeals.map((meal) => {
          if (!idsMatch(meal.id, id)) {
            return meal;
          }

          return {
            ...meal,
            ...updates,

            // Prevent accidental ID changes.
            id: meal.id,
          };
        })
      );
    },
    []
  );

  /*
   * Delete only the meal with the matching ID.
   */
  const removeMeal = useCallback((id) => {
    if (id === undefined || id === null) {
      console.warn(
        "removeMeal requires a meal ID."
      );
      return;
    }

    setMeals((currentMeals) =>
      currentMeals.filter(
        (meal) => !idsMatch(meal.id, id)
      )
    );
  }, []);

  /*
   * Alternative name supported by other screens.
   */
  const deleteMeal = useCallback(
    (id) => {
      removeMeal(id);
    },
    [removeMeal]
  );

  /*
   * Toggle favourite for one meal.
   */
  const toggleFavourite = useCallback((id) => {
    setMeals((currentMeals) =>
      currentMeals.map((meal) =>
        idsMatch(meal.id, id)
          ? {
              ...meal,
              favourite: !Boolean(
                meal.favourite
              ),
            }
          : meal
      )
    );
  }, []);

  /*
   * Return one meal by ID.
   */
  const getMealById = useCallback(
    (id) =>
      meals.find((meal) =>
        idsMatch(meal.id, id)
      ) || null,
    [meals]
  );

  /*
   * Delete all recipes.
   */
  const clearMeals = useCallback(() => {
    setMeals([]);
  }, []);

  /*
   * Restore original seed recipes.
   */
  const resetMeals = useCallback(() => {
    setMeals(cloneSeedItems());
  }, []);

  const favourites = useMemo(
    () =>
      meals.filter(
        (meal) => meal.favourite === true
      ),
    [meals]
  );

  const myMeals = useMemo(
    () =>
      meals.filter(
        (meal) => meal.source === "mine"
      ),
    [meals]
  );

  const value = useMemo(
    () => ({
      meals,
      favourites,
      myMeals,
      loaded,

      addMeal,
      updateMeal,
      removeMeal,
      deleteMeal,
      toggleFavourite,
      getMealById,
      clearMeals,
      resetMeals,
    }),
    [
      meals,
      favourites,
      myMeals,
      loaded,
      addMeal,
      updateMeal,
      removeMeal,
      deleteMeal,
      toggleFavourite,
      getMealById,
      clearMeals,
      resetMeals,
    ]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error(
      "useCollection must be used inside CollectionProvider."
    );
  }

  return context;
}

function createMealId() {
  return `meal-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function idsMatch(firstId, secondId) {
  return String(firstId) === String(secondId);
}
// src/contexts/ProfileContext.js
//
// Manages the user profile (name, bio, avatar URL).
// Persisted to AsyncStorage.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@user_profile";

const DEFAULT_PROFILE = {
  name: "Food Lover",
  bio: "I collect recipes from around the world 🌍",
  avatar: "",
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch (e) {
        console.warn("ProfileContext: failed to load profile", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save on change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch((e) =>
      console.warn("ProfileContext: failed to save profile", e)
    );
  }, [profile, loaded]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

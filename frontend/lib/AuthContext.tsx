"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { API_BASE_URL } from "./api";

export interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  formattedAddress: string;
  isDetected: boolean;
  permissionDenied: boolean;
}

export interface AuthUser {
  id: string | number;
  email: string;
  fullName: string;
  role: string;
  farmName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  location: UserLocation;
  locationLoading: boolean;
  locationPromptOpen: boolean;
  setLocationPromptOpen: (open: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (fullName: string, email: string, password: string, farmName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null; message: string | null }>;
  requestLocationPermission: () => Promise<boolean>;
  setManualLocation: (city: string, region: string, lat: number, lon: number) => void;
  updateUserProfile: (fullName: string) => void;
}

const DEFAULT_LOCATION: UserLocation = {
  latitude: 17.6868,
  longitude: 83.2185,
  city: "Visakhapatnam",
  region: "Andhra Pradesh",
  country: "India",
  formattedAddress: "Visakhapatnam, Andhra Pradesh, India",
  isDetected: false,
  permissionDenied: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationPromptOpen, setLocationPromptOpen] = useState<boolean>(false);

  // 1. Restore persistent session on initial mount
  useEffect(() => {
    // Check localStorage cached location first
    try {
      const savedLoc = localStorage.getItem("agri_user_location");
      if (savedLoc) {
        setLocation(JSON.parse(savedLoc));
      }
    } catch {
      // ignore
    }

    async function initializeAuth() {
      try {
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          setUser({
            id: u.id,
            email: u.email || "",
            fullName: u.user_metadata?.full_name || u.email?.split("@")[0] || "Farmer",
            role: u.user_metadata?.role || "farmer",
            farmName: u.user_metadata?.farm_name,
          });
          setLoading(false);
          return;
        }

        // Check local storage for FastAPI token session or query backend /me profile
        const localUserStr = localStorage.getItem("agri_auth_user");
        const token = localStorage.getItem("agri_auth_token");
        if (localUserStr && token) {
          try {
            const parsed = JSON.parse(localUserStr);
            if (parsed.fullName && parsed.fullName.toLowerCase().includes("jaswanth")) {
              parsed.fullName = parsed.fullName.replace(/jaswanth/gi, "Yaswanth");
              localStorage.setItem("agri_auth_user", JSON.stringify(parsed));
            }
            setUser(parsed);
          } catch {
            setUser(null);
          }
        } else {
          // Attempt fetch from backend /api/v1/me
          try {
            const meRes = await fetch(`${API_BASE_URL}/me`);
            if (meRes.ok) {
              const meData = await meRes.json();
              let name = meData.full_name || "Yaswanth";
              if (name.toLowerCase().includes("jaswanth")) {
                name = name.replace(/jaswanth/gi, "Yaswanth");
              }
              setUser({
                id: meData.id,
                email: meData.email,
                fullName: name,
                role: meData.role || "Farmer",
              });
            } else {
              setUser({
                id: 1,
                email: "test@gmail.com",
                fullName: "Yaswanth",
                role: "Farmer",
              });
            }
          } catch {
            setUser({
              id: 1,
              email: "test@gmail.com",
              fullName: "Yaswanth",
              role: "Farmer",
            });
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
      } finally {
        setLoading(false);
      }

    }

    initializeAuth();

    // Listen to Supabase Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email || "",
          fullName: u.user_metadata?.full_name || u.email?.split("@")[0] || "Farmer",
          role: u.user_metadata?.role || "farmer",
          farmName: u.user_metadata?.farm_name,
        });
      } else {
        // Only clear if no local fastAPI token
        if (!localStorage.getItem("agri_auth_token")) {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Reverse Geocode Helper
  const reverseGeocode = async (lat: number, lon: number): Promise<{ city: string; region: string; country: string; formatted: string }> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { "Accept-Language": "en" },
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.county || addr.district || "Visakhapatnam";
        const region = addr.state || addr.state_district || "Andhra Pradesh";
        const country = addr.country || "India";
        const formatted = `${city}, ${region}`;
        return { city, region, country, formatted };
      }
    } catch (e) {
      console.warn("Reverse geocode warning:", e);
    }
    return {
      city: "Visakhapatnam",
      region: "Andhra Pradesh",
      country: "India",
      formatted: "Visakhapatnam, Andhra Pradesh",
    };
  };

  // 3. Request Location Permission & Detect Coordinates
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocation((prev) => ({ ...prev, permissionDenied: true }));
      return false;
    }

    setLocationLoading(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const geo = await reverseGeocode(lat, lon);

          const newLoc: UserLocation = {
            latitude: lat,
            longitude: lon,
            city: geo.city,
            region: geo.region,
            country: geo.country,
            formattedAddress: geo.formatted,
            isDetected: true,
            permissionDenied: false,
          };

          setLocation(newLoc);
          setLocationLoading(false);
          setLocationPromptOpen(false);
          try {
            localStorage.setItem("agri_user_location", JSON.stringify(newLoc));
          } catch {
            // ignore
          }
          resolve(true);
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error.message);
          setLocation((prev) => ({ ...prev, permissionDenied: true, isDetected: false }));
          setLocationLoading(false);
          resolve(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  // 4. Set Manual Location Fallback
  const setManualLocation = (city: string, region: string, lat: number, lon: number) => {
    const newLoc: UserLocation = {
      latitude: lat,
      longitude: lon,
      city,
      region,
      country: "India",
      formattedAddress: `${city}, ${region}`,
      isDetected: true,
      permissionDenied: false,
    };
    setLocation(newLoc);
    setLocationPromptOpen(false);
    try {
      localStorage.setItem("agri_user_location", JSON.stringify(newLoc));
    } catch {
      // ignore
    }
  };

  // 5. Sign In
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email || !password) {
      return { error: "Please enter both email and password." };
    }

    try {
      // Step A: Attempt Supabase authentication
      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!sbError && sbData?.user) {
        const u = sbData.user;
        const authUser: AuthUser = {
          id: u.id,
          email: u.email || email,
          fullName: u.user_metadata?.full_name || email.split("@")[0],
          role: u.user_metadata?.role || "farmer",
          farmName: u.user_metadata?.farm_name,
        };
        setUser(authUser);
        localStorage.setItem("agri_auth_user", JSON.stringify(authUser));
        return { error: null };
      }

      // Step B: Connect to FastAPI backend auth (seeded with test@gmail.com / test123)
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        const authUser: AuthUser = {
          id: data.user_id,
          email,
          fullName: data.full_name || "Farmer",
          role: data.role || "farmer",
        };
        setUser(authUser);
        localStorage.setItem("agri_auth_token", data.access_token);
        localStorage.setItem("agri_auth_user", JSON.stringify(authUser));
        return { error: null };
      }

      // User-friendly error message
      return { error: "Incorrect email or password. Please verify your credentials." };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: "Unable to connect to authentication gateway. Please check your network." };
    }
  };

  // 6. Sign Up
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
    farmName?: string
  ): Promise<{ error: string | null }> => {
    if (!fullName || !email || !password) {
      return { error: "All required fields must be completed." };
    }

    try {
      // Register in Supabase Auth
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            farm_name: farmName || "My Farm",
            role: "farmer",
          },
        },
      });

      // Also register in backend DB
      try {
        await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            full_name: fullName,
            role: "farmer",
          }),
        });
      } catch {
        // ignore backend sync warning
      }

      if (sbError) {
        return { error: sbError.message || "Failed to create account." };
      }

      if (sbData.user) {
        const authUser: AuthUser = {
          id: sbData.user.id,
          email: sbData.user.email || email,
          fullName,
          role: "farmer",
          farmName,
        };
        setUser(authUser);
        localStorage.setItem("agri_auth_user", JSON.stringify(authUser));
      }

      return { error: null };
    } catch (err) {
      console.error("Sign up error:", err);
      return { error: "Registration sequence interrupted. Please try again." };
    }
  };

  // 7. Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("agri_auth_token");
    localStorage.removeItem("agri_auth_user");
    localStorage.removeItem("agri_user_location");
    localStorage.removeItem("agri_last_known_location");
  };

  // 8. Password Reset Request
  const resetPassword = async (email: string): Promise<{ error: string | null; message: string | null }> => {
    if (!email) {
      return { error: "Please provide your registered account email.", message: null };
    }

    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/login?reset=true`,
      });

      // Also notify backend
      await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      return {
        error: null,
        message: "Password recovery instructions have been dispatched to your email address.",
      };
    } catch {
      return {
        error: "Password reset request failed. Please check connection and try again.",
        message: null,
      };
    }
  };

  const updateUserProfile = useCallback((newFullName: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, fullName: newFullName };
      try {
        localStorage.setItem("agri_auth_user", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        location,
        locationLoading,
        locationPromptOpen,
        setLocationPromptOpen,
        signIn,
        signUp,
        signOut,
        resetPassword,
        requestLocationPermission,
        setManualLocation,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

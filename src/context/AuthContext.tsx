import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/models";
import { isValidOtp, isValidPhoneNumber, normalizePhoneInput } from "../utils/validators";
import { authAPI } from "../services/api";

const STORAGE_KEY = "moofu_auth_v1";

type AuthContextValue = {
  loading: boolean;
  loggedIn: boolean;
  user: User | null;
  pendingPhone: string | null; // digits only
  loginWithPhone: (phoneDigits: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  setUserProfile: (patch: Partial<Omit<User, "id">>) => Promise<void>;
  logout: () => Promise<void>;
};

type StoredAuth = {
  loggedIn: boolean;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }
        const parsed = JSON.parse(raw) as StoredAuth;
        setLoggedIn(!!parsed.loggedIn && !!parsed.user);
        setUser(parsed.user);
      } catch {
        // If storage fails, keep user logged out.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: StoredAuth) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const loginWithPhone = useCallback(
    async (phoneDigits: string) => {
      const normalized = normalizePhoneInput(phoneDigits);
      if (!isValidPhoneNumber(normalized)) {
        throw new Error("Invalid phone number");
      }

      try {
        // Call backend API to request OTP
        await authAPI.requestOTP(normalized);
        setPendingPhone(normalized);
      } catch (error: any) {
        const message = error.message || "Failed to request OTP";
        console.error("[AuthContext] loginWithPhone error:", message);
        throw new Error(message);
      }
    },
    []
  );

  const verifyOtp = useCallback(async (otp: string) => {
    if (!pendingPhone) return false;
    const entered = otp.trim();
    if (!isValidOtp(entered)) return false;

    try {
      // Call backend API to verify OTP
      const result = await authAPI.verifyOTP(pendingPhone, entered);
      const newUser: User = {
        id: result.user.id,
        name: result.user.name || "MOOFU User",
        phone: result.user.phone,
        location: result.user.location || "",
        vehicleNumber: result.user.vehicleNumber || "",
      };

      setUser(newUser);
      setLoggedIn(true);
      setPendingPhone(null);
      await persist({ loggedIn: true, user: newUser });
      return true;
    } catch (error: any) {
      const message = error.message || "Failed to verify OTP";
      console.error("[AuthContext] verifyOtp error:", message);
      return false;
    }
  }, [pendingPhone, persist]);

  const setUserProfile = useCallback(
    async (patch: Partial<Omit<User, "id">>) => {
      if (!user) return;

      try {
        // Call backend API to update profile
        const updated = await authAPI.updateProfile({
          name: patch.name,
          location: patch.location,
          vehicleNumber: patch.vehicleNumber,
        });

        const newUser: User = {
          id: updated.id,
          name: updated.name,
          phone: updated.phone,
          location: updated.location || "",
          vehicleNumber: updated.vehicleNumber || "",
        };

        setUser(newUser);
        await persist({ loggedIn: true, user: newUser });
      } catch (error: any) {
        const message = error.message || "Failed to update profile";
        console.error("[AuthContext] setUserProfile error:", message);
        throw new Error(message);
      }
    },
    [persist, user]
  );

  const logout = useCallback(async () => {
    setLoggedIn(false);
    setUser(null);
    setPendingPhone(null);
    await authAPI.logout();
    await persist({ loggedIn: false, user: null });
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({ loading, loggedIn, user, pendingPhone, loginWithPhone, verifyOtp, setUserProfile, logout }),
    [loading, loggedIn, user, pendingPhone, loginWithPhone, verifyOtp, setUserProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


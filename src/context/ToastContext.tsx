import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "../theme/theme";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [visibleAnim] = useState(() => new Animated.Value(0));

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const next: Toast = { id, message, tone };
    setToasts((prev) => [next, ...prev].slice(0, 2));

    // Quick slide in; good enough for demo polish.
    visibleAnim.setValue(0);
    Animated.timing(visibleAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, [visibleAnim]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          {toasts.map((t) => (
            <Animated.View
              key={t.id}
              style={[
                styles.toast,
                { transform: [{ translateY: visibleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] },
              ]}
            >
              <Text
                style={[
                  styles.toastText,
                  t.tone === "success" ? { color: Colors.success } : null,
                  t.tone === "error" ? { color: Colors.danger } : null,
                ]}
              >
                {t.message}
              </Text>
            </Animated.View>
          ))}
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  toastWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  toast: {
    width: "100%",
    backgroundColor: "rgba(15,23,42,0.92)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: Colors.shadow,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});


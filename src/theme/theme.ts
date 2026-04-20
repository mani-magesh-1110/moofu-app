export const Colors = {
  /** Primary teal from Parking designs */
  brand: "#62DFC0",
  brandDark: "#27B07D",
  /** Active tab / soft highlights */
  brandTint: "rgba(98, 223, 192, 0.28)",
  text: "#000000",
  mutedText: "#686868",
  background: "#F9FBFB",
  surface: "#FFFFFF",
  /** Secondary service tiles (Car rent, Driver) */
  serviceMuted: "#B5B5B5",
  adBackground: "#F2F2F2",
  border: "#E6E6E6",
  shadow: "rgba(0,0,0,0.10)",
  danger: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

/**
 * Font Families - Using system fonts for web compatibility
 * Montserrat: Bold (700), ExtraBold (800)
 * Inter: Regular, Medium
 * Poppins: Medium (500)
 */
export const FontFamily = {
  montserratBold: { fontFamily: "Montserrat", fontWeight: "700" as const },
  montserratExtraBold: { fontFamily: "Montserrat", fontWeight: "800" as const },
  interMedium: { fontFamily: "Inter", fontWeight: "500" as const },
  interRegular: { fontFamily: "Inter", fontWeight: "400" as const },
  poppinsMedium: { fontFamily: "Poppins", fontWeight: "500" as const },
} as const;

export const Typography = {
  h1: { fontSize: 28, letterSpacing: -0.4, ...FontFamily.montserratExtraBold },
  h2: { fontSize: 20, letterSpacing: -0.2, ...FontFamily.montserratExtraBold },
  h3: { fontSize: 16, letterSpacing: -0.1, ...FontFamily.montserratBold },
  body: { fontSize: 14, color: Colors.text, ...FontFamily.montserratBold },
  bodyRegular: { fontSize: 14, color: Colors.text, ...FontFamily.interRegular },
  caption: { fontSize: 12, color: Colors.mutedText, ...FontFamily.montserratBold },
  bodyMedium: { fontSize: 14, color: Colors.text, ...FontFamily.poppinsMedium },
} as const;


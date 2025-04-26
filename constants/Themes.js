// Theme.js - Central theme configuration for the app

export const Colors = {
  // Primary palette
  PRIMARY: "#FF6B6B", // Coral red
  PRIMARY_DARK: "#E05252",
  PRIMARY_LIGHT: "#FF8A8A",

  // Secondary palette
  SECONDARY: "#4ECDC4", // Teal
  SECONDARY_DARK: "#3DAFA7",
  SECONDARY_LIGHT: "#6FDED6",

  // Neutrals
  BACKGROUND: "#F9F9F9",
  SURFACE: "#FFFFFF",
  TEXT_PRIMARY: "#333333",
  TEXT_SECONDARY: "#666666",
  TEXT_TERTIARY: "#999999",

  // Status colors
  SUCCESS: "#6BCB77",
  WARNING: "#FFD166",
  ERROR: "#EF476F",
  INFO: "#118AB2",

  // UI elements
  BORDER: "#EEEEEE",
  DIVIDER: "#E0E0E0",
  SHADOW: "rgba(0, 0, 0, 0.1)",
  OVERLAY: "rgba(0, 0, 0, 0.5)",
}

export const Typography = {
  // Font families
  HEADING_FONT: "Poppins_600SemiBold",
  TITLE_FONT: "Lobster_400Regular",
  BODY_FONT: "Roboto_400Regular",
  ACCENT_FONT: "Roboto_500Medium",

  // Font sizes
  FONT_SIZE_SMALL: 12,
  FONT_SIZE_MEDIUM: 14,
  FONT_SIZE_REGULAR: 16,
  FONT_SIZE_LARGE: 18,
  FONT_SIZE_XLARGE: 20,
  FONT_SIZE_XXLARGE: 24,
  FONT_SIZE_HUGE: 32,
}

export const Spacing = {
  SPACE_XS: 4,
  SPACE_SMALL: 8,
  SPACE_MEDIUM: 12,
  SPACE_REGULAR: 16,
  SPACE_LARGE: 20,
  SPACE_XLARGE: 24,
  SPACE_XXLARGE: 32,
}

export const BorderRadius = {
  RADIUS_SMALL: 4,
  RADIUS_MEDIUM: 8,
  RADIUS_LARGE: 12,
  RADIUS_XLARGE: 16,
  RADIUS_ROUND: 50,
}

export const Shadows = {
  SHADOW_SMALL: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  SHADOW_MEDIUM: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  SHADOW_LARGE: {
    shadowColor: Colors.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
}

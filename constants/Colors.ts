// constants/Colors.ts

/**
 * Material Design 3 color schemes for the app.
 * This theme, "Sunset Glow", features a warm and energetic palette with
 * Orange (primary), Red (secondary), and Yellow/Gold (tertiary) accents,
 * inspired by modern Material Design principles for a vibrant and engaging UI.
 */

const MD3LightTheme = {
  primary: "#F26A00", // Vibrant Orange (e.g., Orange50)
  onPrimary: "#FFFFFF",
  primaryContainer: "#FFDDB7", // Light Orange (Orange90)
  onPrimaryContainer: "#4E1E00", // Dark Orange (Orange10)
  secondary: "#C62828", // Fiery Red (e.g., Red50)
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFDAD6", // Light Red (Red90)
  onSecondaryContainer: "#410002", // Dark Red (Red10)
  tertiary: "#755B00", // Deep Gold/Yellow (e.g., Yellow40, for text contrast)
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFDF90", // Light Yellow (Yellow90)
  onTertiaryContainer: "#241A00", // Dark Yellow (Yellow10)

  error: "#B3261E", // Standard Error Red
  onError: "#FFFFFF",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",

  background: "#FFFBFA", // Warm Off-White (Neutral99)
  onBackground: "#1F1C1A", // Very Dark Warm Gray (Neutral10)
  surface: "#FFFBFA", // Warm Off-White
  onSurface: "#1F1C1A", // Very Dark Warm Gray
  surfaceVariant: "#F0E2D2", // Warm Light Gray (NeutralVariant90)
  onSurfaceVariant: "#4D4539", // Warm Dark Gray (NeutralVariant30)
  surfaceTint: "#F26A00", // Same as primary

  outline: "#817567", // Warm Medium Gray (NeutralVariant50)
  outlineVariant: "#D3C4B4", // Warm Light Gray (NeutralVariant80)

  shadow: "#000000",
  scrim: "#000000",

  inverseSurface: "#35302B", // Warm Dark Gray (Neutral20)
  inverseOnSurface: "#F9F0E9", // Warm Off-White (Neutral95)
  inversePrimary: "#FFB776", // Light Orange (Orange80 for use on dark inverse surface)

  primaryFixed: "#FFDDB7",
  onPrimaryFixed: "#4E1E00",
  primaryFixedDim: "#FFB776",
  onPrimaryFixedVariant: "#B34D00", // Darker Orange

  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#410002",
  secondaryFixedDim: "#FFB4A9",
  onSecondaryFixedVariant: "#A8000D", // Darker Red

  tertiaryFixed: "#FFDF90",
  onTertiaryFixed: "#241A00",
  tertiaryFixedDim: "#EAC248", // Gold
  onTertiaryFixedVariant: "#584400", // Darker Gold

  surfaceDim: "#E2D8CF", // Slightly darker warm neutral
  surfaceBright: "#FFFBFA", // Same as surface or slightly brighter
  surfaceContainerLowest: "#FFFFFF", // Pure White
  surfaceContainerLow: "#FBF2EB", // Warm Off-White +
  surfaceContainer: "#F5EDE4", // Warm Off-White ++
  surfaceContainerHigh: "#F0E7DD", // Warm Off-White +++
  surfaceContainerHighest: "#EAE1D7", // Warm Off-White ++++
};

const MD3DarkTheme = {
  primary: "#FFB776", // Light Orange (Orange80)
  onPrimary: "#652B00", // Dark Orange (Orange20)
  primaryContainer: "#B34D00", // Medium Dark Orange (Orange30)
  onPrimaryContainer: "#FFDDB7", // Light Orange (Orange90)
  secondary: "#FFB4A9", // Light Red (Red80)
  onSecondary: "#680003", // Dark Red (Red20)
  secondaryContainer: "#930006", // Medium Dark Red (Red30)
  onSecondaryContainer: "#FFDAD6", // Light Red (Red90)
  tertiary: "#EAC248", // Gold (Yellow80)
  onTertiary: "#3E2E00", // Dark Gold (Yellow20)
  tertiaryContainer: "#584400", // Medium Dark Gold (Yellow30)
  onTertiaryContainer: "#FFDF90", // Light Gold (Yellow90)

  error: "#F2B8B5",
  onError: "#601410",
  errorContainer: "#8C1D18",
  onErrorContainer: "#F9DEDC",

  background: "#1F1C1A", // Very Dark Warm Gray (Neutral10)
  onBackground: "#EAE1D7", // Light Warm Gray (Neutral90)
  surface: "#1F1C1A", // Very Dark Warm Gray
  onSurface: "#EAE1D7", // Light Warm Gray
  surfaceVariant: "#4D4539", // Warm Dark Gray (NeutralVariant30)
  onSurfaceVariant: "#D3C4B4", // Warm Light Gray (NeutralVariant80)
  surfaceTint: "#FFB776", // Same as primary

  outline: "#9C8E80", // Warm Medium Gray (NeutralVariant60)
  outlineVariant: "#4D4539", // Warm Dark Gray (NeutralVariant30)

  shadow: "#000000",
  scrim: "#000000",

  inverseSurface: "#EAE1D7", // Light Warm Gray (Neutral90)
  inverseOnSurface: "#35302B", // Warm Dark Gray (Neutral20)
  inversePrimary: "#F26A00", // Vibrant Orange (Orange40/50 for use on light inverse surface)

  primaryFixed: "#FFDDB7",
  onPrimaryFixed: "#4E1E00",
  primaryFixedDim: "#FFB776",
  onPrimaryFixedVariant: "#B34D00",

  secondaryFixed: "#FFDAD6",
  onSecondaryFixed: "#410002",
  secondaryFixedDim: "#FFB4A9",
  onSecondaryFixedVariant: "#930006",

  tertiaryFixed: "#FFDF90",
  onTertiaryFixed: "#241A00",
  tertiaryFixedDim: "#EAC248",
  onTertiaryFixedVariant: "#584400",

  surfaceDim: "#161310", // Darker warm neutral
  surfaceBright: "#3B3732", // Brighter dark warm neutral
  surfaceContainerLowest: "#13100E", // Darkest Warm Neutral
  surfaceContainerLow: "#1F1C1A", // Dark Warm Neutral + (Same as background)
  surfaceContainer: "#23201D", // Dark Warm Neutral ++
  surfaceContainerHigh: "#2D2A27", // Dark Warm Neutral +++
  surfaceContainerHighest: "#383531", // Dark Warm Neutral ++++
};

// These will be the direct replacements for your old Colors.light and Colors.dark
const MappedLightTheme = {
  ...MD3LightTheme,
  text: MD3LightTheme.onBackground,
  background: MD3LightTheme.background,
  tint: MD3LightTheme.primary,
  icon: MD3LightTheme.onSurfaceVariant,
  tabIconDefault: MD3LightTheme.onSurfaceVariant,
  tabIconSelected: MD3LightTheme.primary,
};

const MappedDarkTheme = {
  ...MD3DarkTheme,
  text: MD3DarkTheme.onBackground,
  background: MD3DarkTheme.background,
  tint: MD3DarkTheme.primary,
  icon: MD3DarkTheme.onSurfaceVariant,
  tabIconDefault: MD3DarkTheme.onSurfaceVariant,
  tabIconSelected: MD3DarkTheme.primary,
};

export const Colors = {
  light: MappedLightTheme,
  dark: MappedDarkTheme,
};

// You can also export the pure MD3 schemes if needed elsewhere:
export const PureMD3LightTheme = MD3LightTheme;
export const PureMD3DarkTheme = MD3DarkTheme;
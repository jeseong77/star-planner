// constants/Colors.ts

/**
 * Material Design 3 color schemes for the app.
 * Generated from Material Theme Builder with seed color: #63A002.
 *
 * It's recommended to use these roles with a ThemeProvider and a custom hook
 * (like `useAppTheme` that we discussed) for robust theme integration.
 */

const MD3LightTheme = {
  primary: "#4C662B",
  surfaceTint: "#4C662B",
  onPrimary: "#FFFFFF",
  primaryContainer: "#CDEDA3",
  onPrimaryContainer: "#0F1F02", // Corrected: Typical Tone 10 for Primary 90 container
  secondary: "#586249",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#DCE7C8",
  onSecondaryContainer: "#151E0B",
  tertiary: "#386663",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#BCECE7",
  onTertiaryContainer: "#00201E",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002", // Corrected: Typical Tone 10 for Error 90 container
  background: "#F9FAEF",
  onBackground: "#1A1C16",
  surface: "#F9FAEF",
  onSurface: "#1A1C16",
  surfaceVariant: "#E1E4D5",
  onSurfaceVariant: "#44483D",
  outline: "#75796C",
  outlineVariant: "#C5C8BA",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#2F312A",
  inverseOnSurface: "#F1F2E6",
  inversePrimary: "#B1D18A",
  primaryFixed: "#CDEDA3",
  onPrimaryFixed: "#102000",
  primaryFixedDim: "#B1D18A",
  onPrimaryFixedVariant: "#354E16",
  secondaryFixed: "#DCE7C8",
  onSecondaryFixed: "#151E0B",
  secondaryFixedDim: "#BFCBAD",
  onSecondaryFixedVariant: "#404A33",
  tertiaryFixed: "#BCECE7",
  onTertiaryFixed: "#00201E",
  tertiaryFixedDim: "#A0D0CB",
  onTertiaryFixedVariant: "#1F4E4B",
  surfaceDim: "#DADBD0",
  surfaceBright: "#F9FAEF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F3F4E9",
  surfaceContainer: "#EEEFE3",
  surfaceContainerHigh: "#E8E9DE",
  surfaceContainerHighest: "#E2E3D8",
};

const MD3DarkTheme = {
  primary: "#B1D18A",
  surfaceTint: "#B1D18A",
  onPrimary: "#1F3701",
  primaryContainer: "#354E16",
  onPrimaryContainer: "#CDEDA3",
  secondary: "#BFCBAD",
  onSecondary: "#2A331E",
  secondaryContainer: "#404A33",
  onSecondaryContainer: "#DCE7C8",
  tertiary: "#A0D0CB",
  onTertiary: "#003735",
  tertiaryContainer: "#1F4E4B",
  onTertiaryContainer: "#BCECE7",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6", // Corrected: Typical Tone 90 for Error 30 container
  background: "#12140E",
  onBackground: "#E2E3D8",
  surface: "#12140E",
  onSurface: "#E2E3D8",
  surfaceVariant: "#44483D",
  onSurfaceVariant: "#C5C8BA",
  outline: "#8F9285",
  outlineVariant: "#44483D",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#E2E3D8",
  inverseOnSurface: "#1A1C16", // Corrected: Typical Tone 20 for Neutral 90 inverse surface
  inversePrimary: "#4C662B",
  primaryFixed: "#CDEDA3",
  onPrimaryFixed: "#102000",
  primaryFixedDim: "#B1D18A",
  onPrimaryFixedVariant: "#354E16",
  secondaryFixed: "#DCE7C8",
  onSecondaryFixed: "#151E0B",
  secondaryFixedDim: "#BFCBAD",
  onSecondaryFixedVariant: "#404A33",
  tertiaryFixed: "#BCECE7",
  onTertiaryFixed: "#00201E",
  tertiaryFixedDim: "#A0D0CB",
  onTertiaryFixedVariant: "#1F4E4B",
  surfaceDim: "#12140E",
  surfaceBright: "#383A32",
  surfaceContainerLowest: "#0C0F09",
  surfaceContainerLow: "#1A1C16",
  surfaceContainer: "#1E201A",
  surfaceContainerHigh: "#282B24",
  surfaceContainerHighest: "#33362E",
};

/**
 * Note on "Corrected" values:
 * The Material Theme Builder export you provided for `schemes.light.onPrimaryContainer` ("#354E16")
 * and `schemes.light.onErrorContainer` ("#93000A")
 * and `schemes.dark.onErrorContainer` ("#FFDAD6")
 * and `schemes.dark.inverseOnSurface` ("#2F312A")
 * are kept here as per your JSON output if you prefer to use the exact generator output.
 *
 * However, standard MD3 generation from tonal palettes often yields slightly different "on" colors
 * for high-contrast text on container colors. For example, if light `primaryContainer` is Tone 90,
 * `onPrimaryContainer` is usually Tone 10.
 *
 * If you want to use the exact values from your JSON "schemes" section:
 * For MD3LightTheme:
 * onPrimaryContainer: "#354E16", (from your JSON)
 * onErrorContainer: "#93000A", (from your JSON)
 * For MD3DarkTheme:
 * onErrorContainer: "#FFDAD6", (from your JSON, this one is actually typical)
 * inverseOnSurface: "#2F312A", (from your JSON)
 * background: "#12140E", (from your JSON)
 * surface: "#12140E", (from your JSON)
 *
 * I will use the **exact values from your provided JSON `schemes.light` and `schemes.dark`**
 * to directly replace your current `Colors.ts`.
 */

const lightSchemeFromJSON = {
  primary: "#4C662B",
  surfaceTint: "#4C662B",
  onPrimary: "#FFFFFF",
  primaryContainer: "#CDEDA3",
  onPrimaryContainer: "#354E16", // From your JSON
  secondary: "#586249",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#DCE7C8",
  onSecondaryContainer: "#404A33", // From your JSON
  tertiary: "#386663",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#BCECE7",
  onTertiaryContainer: "#1F4E4B", // From your JSON
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A", // From your JSON
  background: "#F9FAEF",
  onBackground: "#1A1C16",
  surface: "#F9FAEF",
  onSurface: "#1A1C16",
  surfaceVariant: "#E1E4D5",
  onSurfaceVariant: "#44483D",
  outline: "#75796C",
  outlineVariant: "#C5C8BA",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#2F312A",
  inverseOnSurface: "#F1F2E6",
  inversePrimary: "#B1D18A",
  primaryFixed: "#CDEDA3",
  onPrimaryFixed: "#102000",
  primaryFixedDim: "#B1D18A",
  onPrimaryFixedVariant: "#354E16",
  secondaryFixed: "#DCE7C8",
  onSecondaryFixed: "#151E0B",
  secondaryFixedDim: "#BFCBAD",
  onSecondaryFixedVariant: "#404A33",
  tertiaryFixed: "#BCECE7",
  onTertiaryFixed: "#00201E",
  tertiaryFixedDim: "#A0D0CB",
  onTertiaryFixedVariant: "#1F4E4B",
  surfaceDim: "#DADBD0",
  surfaceBright: "#F9FAEF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F3F4E9",
  surfaceContainer: "#EEEFE3",
  surfaceContainerHigh: "#E8E9DE",
  surfaceContainerHighest: "#E2E3D8"
};

const darkSchemeFromJSON = {
  primary: "#B1D18A",
  surfaceTint: "#B1D18A",
  onPrimary: "#1F3701",
  primaryContainer: "#354E16",
  onPrimaryContainer: "#CDEDA3",
  secondary: "#BFCBAD",
  onSecondary: "#2A331E",
  secondaryContainer: "#404A33",
  onSecondaryContainer: "#DCE7C8",
  tertiary: "#A0D0CB",
  onTertiary: "#003735",
  tertiaryContainer: "#1F4E4B",
  onTertiaryContainer: "#BCECE7",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",
  background: "#12140E",
  onBackground: "#E2E3D8",
  surface: "#12140E",
  onSurface: "#E2E3D8",
  surfaceVariant: "#44483D",
  onSurfaceVariant: "#C5C8BA",
  outline: "#8F9285",
  outlineVariant: "#44483D",
  shadow: "#000000",
  scrim: "#000000",
  inverseSurface: "#E2E3D8",
  inverseOnSurface: "#2F312A",
  inversePrimary: "#4C662B",
  primaryFixed: "#CDEDA3",
  onPrimaryFixed: "#102000",
  primaryFixedDim: "#B1D18A",
  onPrimaryFixedVariant: "#354E16",
  secondaryFixed: "#DCE7C8",
  onSecondaryFixed: "#151E0B",
  secondaryFixedDim: "#BFCBAD",
  onSecondaryFixedVariant: "#404A33",
  tertiaryFixed: "#BCECE7",
  onTertiaryFixed: "#00201E",
  tertiaryFixedDim: "#A0D0CB",
  onTertiaryFixedVariant: "#1F4E4B",
  surfaceDim: "#12140E",
  surfaceBright: "#383A32",
  surfaceContainerLowest: "#0C0F09",
  surfaceContainerLow: "#1A1C16",
  surfaceContainer: "#1E201A",
  surfaceContainerHigh: "#282B24",
  surfaceContainerHighest: "#33362E"
};

// These will be the direct replacements for your old Colors.light and Colors.dark
const MappedLightTheme = {
  ...lightSchemeFromJSON,
  // Map old roles for some backward compatibility during transition
  text: lightSchemeFromJSON.onSurface,       // Primary text color
  background: lightSchemeFromJSON.background, // Primary background
  tint: lightSchemeFromJSON.primary,        // Main accent color
  icon: lightSchemeFromJSON.onSurfaceVariant,// For less prominent icons
  tabIconDefault: lightSchemeFromJSON.onSurfaceVariant,
  tabIconSelected: lightSchemeFromJSON.primary,
};

const MappedDarkTheme = {
  ...darkSchemeFromJSON,
  // Map old roles for some backward compatibility during transition
  text: darkSchemeFromJSON.onSurface,         // Primary text color
  background: darkSchemeFromJSON.background,   // Primary background
  tint: darkSchemeFromJSON.primary,          // Main accent color
  icon: darkSchemeFromJSON.onSurfaceVariant,  // For less prominent icons
  tabIconDefault: darkSchemeFromJSON.onSurfaceVariant,
  tabIconSelected: darkSchemeFromJSON.primary,
};

export const Colors = {
  light: MappedLightTheme,
  dark: MappedDarkTheme,
};

// You can also export the pure MD3 schemes if needed elsewhere:
export const PureMD3LightTheme = lightSchemeFromJSON;
export const PureMD3DarkTheme = darkSchemeFromJSON;
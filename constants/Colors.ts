/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const youtube = '#FF0000'; // Official YouTube Red
const spotify = '#1DB954'; // Official Spotify Green

export const Colors = {
  light: {
    text: '#1A1A1A',                // Very dark gray for high contrast
    textContrast: '#FFFFFF',         // White for contrast on dark backgrounds
    textMuted: '#6B7280',      // Muted gray
    textSubtle: '#9CA3AF',     // Subtle gray
    textDanger: '#EF4444',     // Red for errors
    textSuccess: '#22C55E',    // Green for success
    textWarning: '#F59E42',    // Orange for warnings
    textAccent: '#2563EB',     // Accent blue
    background: '#F7F8FA',           // Soft off-white background
    containerBackground: '#FFFFFF',  // White cards/containers
    containerBackgroundLight: '#F3F4F6', // Very light gray for subtle containers
    containerBackgroundDark: '#E5E7EB',  // Slightly darker than white
    containerBackgroundAccent: '#F0ABFC', // Light purple accent for special containers
    // Tints & Accents
    tint: '#2563EB',           // Primary blue
    tintLight: '#60A5FA',      // Lighter blue
    tintDark: '#1E40AF',       // Darker blue
    accent: '#A21CAF',         // Purple accent
    accentLight: '#F472B6',    // Pink accent
    accentDark: '#701A75',     // Dark purple
    // Status
    success: '#22C55E',        // Green
    warning: '#F59E42',        // Orange
    error: '#EF4444',          // Red
    // Buttons
    primaryButton: '#2563EB',
    secondaryButton: '#E5E7EB',
    // Brand
    youtube: youtube,
    spotify: spotify
  },
  dark: {
    text: '#F3F4F6',                 // Light gray for readability
    textContrast: '#18181B',         // Near-black for contrast on light backgrounds
    textMuted: '#9CA3AF',
    textSubtle: '#6B7280',
    textDanger: '#F87171',
    textSuccess: '#22D3EE',
    textWarning: '#FBBF24',
    textAccent: '#60A5FA',
    background: '#131417',                 // Even darker background
    containerBackground: '#20232A',        // Slightly lighter than background
    containerBackgroundLight: '#262A32',   // For subtle containers
    containerBackgroundDark: '#181A1F',    // For blending or deep containers
    containerBackgroundAccent: '#3B2E5A',  // Muted purple accent
    // Tints & Accents
    tint: '#60A5FA',           // Primary blue
    tintLight: '#93C5FD',      // Lighter blue
    tintDark: '#1E3A8A',       // Darker blue
    accent: '#C084FC',         // Purple accent
    accentLight: '#F472B6',    // Pink accent
    accentDark: '#7C3AED',     // Dark purple
    // Status
    success: '#22D3EE',        // Cyan-green
    warning: '#FBBF24',        // Orange
    error: '#F87171',          // Red
    // Buttons
    primaryButton: '#60A5FA',
    secondaryButton: '#A78BFA', // Vibrant lavender, matches accent but is lighter and visible
    // Brand
    youtube: youtube,
    spotify: spotify
  },
};

export const colors = {
  // Primary Colors
  background: {
    primary: '#121212',    // Jet Black
    secondary: '#1E1E1E',  // Charcoal Gray
  },
  
  // Accent Colors
  accent: {
    primary: '#00A8E8',    // Electric Blue
    secondary: '#4DFFDF',  // Cyan Blue
    error: '#FF4500',      // Sunset Orange
  },
  
  // Text Colors
  text: {
    primary: '#F5F5F5',    // White Smoke
    secondary: '#A3A3A3',  // Cool Gray
  },
  
  // Border/Divider Colors
  border: {
    primary: '#2C2C2C',    // Dark Gray
  },
  
  // Button Colors
  button: {
    primary: '#00A8E8',    // Electric Blue
    secondary: '#A3A3A3',  // Cool Gray
  },
  
  // State Colors
  state: {
    hover: '#4682B4',      // Steel Blue
    success: '#32CD32',    // Neon Green
  },
} as const;

// Type for the colors object
export type ColorPalette = typeof colors;

// Utility type to get nested color values
export type ColorValue = 
  | ColorPalette['background'][keyof ColorPalette['background']]
  | ColorPalette['accent'][keyof ColorPalette['accent']]
  | ColorPalette['text'][keyof ColorPalette['text']]
  | ColorPalette['border'][keyof ColorPalette['border']]
  | ColorPalette['button'][keyof ColorPalette['button']]
  | ColorPalette['state'][keyof ColorPalette['state']]; 
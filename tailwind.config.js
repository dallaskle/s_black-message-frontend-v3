/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#121212',
          secondary: '#1E1E1E',
        },
        accent: {
          primary: '#00A8E8',
          secondary: '#4DFFDF',
          error: '#FF4500',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A3A3A3',
        }
      }
    },
  },
  plugins: [],
} 
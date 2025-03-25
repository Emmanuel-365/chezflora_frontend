/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Mode clair
        lightBg: '#F9F5F0',        // Ancien: #FFFFFF
        lightText: '#5C4033',      // Ancien: #1F2937
        lightCard: '#FDF6E3',      // Ancien: #F3F4F6
        lightBorder: '#B0B8B8',    // Ancien: #D1D5DB
        // Mode sombre
        darkBg: '#2F2F2F',         // Ancien: #1F2937
        darkText: '#EDEDED',       // Ancien: #F9FAFB
        darkCard: '#424242',       // Ancien: #374151
        darkBorder: '#6B7280',     // Ancien: #4B5563
        // Couleurs personnalisées
        'soft-green': '#4A704A',   // Ancien: #A8D5BA
        'dark-soft-green': '#6BAF6B', // Nouveau pour mode sombre
        'powder-pink': '#E07B91',  // Ancien: #F8C1CC
        'dark-powder-pink': '#F4A1B3', // Nouveau pour mode sombre
        'off-white': '#F9F5F0',    // Ancien: #F5F5F5
        'light-beige': '#FDF6E3',  // Ancien: #F5E8C7
        'soft-brown': '#5C4033',   // Ancien: #D2B48C
        'pastel-green': '#A3C1A3', // Ancien: #B2F2BB
        'pastel-pink': '#F4B8C1',  // Ancien: #FFC9C9
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Roboto', 'sans-serif'],
      },
      padding: {
       'max-24': '6rem',
      },
    },
  },
  plugins: [],
};
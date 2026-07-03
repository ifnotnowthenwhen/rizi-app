/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        'warm-gray': '#E8E0D0',
        'light-brown': '#D4C5A9',
        sage: '#A8B5A2',
        'deep-brown': '#8B7E74',
        caramel: '#6B5B4F',
        'sage-light': '#E8F0E4',
        'sage-dark': '#6B7A60',
      },
    },
  },
  plugins: [],
}

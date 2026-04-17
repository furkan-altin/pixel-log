/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- BU SATIR MUTLAKA OLMALI
  theme: {
    extend: {
      colors: {
        // "yellow" sınıfını ele geçirip dinamik Cyber-Skin değişkenlerine bağlıyoruz!
        yellow: {
          400: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          500: 'rgb(var(--color-accent) / <alpha-value>)',
          600: 'rgb(var(--color-accent-dark) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
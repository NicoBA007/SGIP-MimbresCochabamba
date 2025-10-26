/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- 👇 AÑADIR/MODIFICAR ESTO 👇 ---
      colors: {
        'mimbres-primary': '#a4544c',   // Tu color primario (Terracota)
        'mimbres-secondary': '#644c44', // Tu color secundario (Marrón oscuro)
        'mimbres-tertiary': '#e3a45c',  // Tu color terciario (Naranja/Dorado)
        
        // Colores basados en el análisis de la imagen (ajusta los HEX si prefieres otros tonos)
        'mimbres-cream': '#fdfbf7',     // Fondo claro de la sidebar (Beige muy claro)
        'mimbres-peach': '#fdecdf',     // Fondo hover/activo de la sidebar (Durazno claro)
      }
      // --- 👆 AÑADIR/MODIFICAR ESTO 👆 ---
    },
  },
  plugins: [],
}
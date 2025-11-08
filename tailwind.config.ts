import type { Config } from "tailwindcss";

const config: Config = {
  // Baris ini sudah benar, untuk mengaktifkan dark mode berbasis class
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
        // DITAMBAHKAN: Definisikan animasi shake di sini
        keyframes: {
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
          }
        },
        animation: {
          shake: 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both',
        }
      },
    },
  plugins: [],
};
export default config;
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {

      colors: {
        "rnsit-blue": "#09015F",
        "rnsit-orange": "#FF6501",
      },

      backgroundColor: {
        "rnsit-blue": "#09015F",
        "rnsit-orange": "#FF6501",
      },

      animation: {
        floatSlow: "floatSlow 4s ease-in-out infinite",
      },

      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },

    },
  },

  plugins: [],
};
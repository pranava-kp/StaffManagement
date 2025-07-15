/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                "rnsit-blue": "#09015F",
                "rnsit-orange": "#FF6501",
            },
            backgroundColor:{
                "rnsit-blue": "#09015F",
                "rnsit-orange": "#FF6501",
            },
        },
    },
    plugins: [],
};

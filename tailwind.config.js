/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  safelist: [
    {
      pattern: /grid-cols-./,
    },
  ],
  theme: {
    extend: {
      backgroundImage: {
        "ducks-bg": "url('@/assets/images/ducks.png')",
        "ducks-bg-dark": "url('@/assets/images/ducks-black.png')",
        "app-driver-cover": "url('@/assets/images/app-driver-cover.png')",
      },
      boxShadow: {
        "app-driver": "0px 0px 6px 0px #A8B6D11F",
      },
    },
  },
  plugins: [],
};

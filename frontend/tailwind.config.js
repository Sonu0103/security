/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          green: "#28a745",
          blue: "#007bff",
        },
        accent: {
          yellow: "#ffc107",
          orange: "#fd7e14",
        },
        neutral: {
          white: "#ffffff",
          lightGray: "#f8f9fa",
          darkGray: "#343a40",
        },
        highlight: {
          red: "#dc3545",
          gold: "#ffbf00",
        },
        "primary-blue": "#2563eb",
      },
    },
  },
  plugins: [],
};

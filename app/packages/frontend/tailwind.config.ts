import type { Config } from "tailwindcss";

const tailwindConfig: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1DA1F2", // Example custom color
      },
      spacing: {
        128: "32rem", // Example custom spacing
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;

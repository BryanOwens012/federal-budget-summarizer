import type { Config } from "tailwindcss";

const tailwindConfig: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {},
  plugins: [],
};

export default tailwindConfig;

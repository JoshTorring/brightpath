import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { nhs: { blue: "#005EB8", ink: "#212B32", amber: "#FFBF47", mint:"#23BEB0", cream:"#FAFAF5" } },
      borderRadius: { '2xl':'1rem' }
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/layout/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
  ],
}

export default config

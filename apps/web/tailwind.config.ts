import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Correct paths for your 'apps/web' structure (NO 'src' folder)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Correct relative path to your shared 'packages/ui'
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can add custom theme settings later if needed
    },
  },
  plugins: [
    // Add Tailwind plugins here if needed (e.g., require('@tailwindcss/forms'))
  ],
};

export default config;
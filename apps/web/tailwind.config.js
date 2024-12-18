/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@pagen/config/tailwind.config")],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-contrast": "var(--primary-contrast)",
        secondary: "var(--secondary)",
        "secondary-contrast": "var(--secondary-contrast)",
        accent: "var(--accent)",
        background: "var(--bg)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        text: "var(--text)",
        "text-h": "var(--text-h)",
        border: "var(--border)",
      },
    },
  },
  plugins: [],
}
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "var(--primary)",
				"primary-contrast": "var(--primary-contrast)",
				secondary: "var(--secondary)",
				"secondary-contrast": "var(--secondary-contrast)",
				accent: "var(--accent)",
				"accent-orb": "rgba(217, 119, 6, 0.16)",
				"primary-orb": "rgba(211, 22, 53, 0.12)",
				bg: "var(--bg)",
				surface: "var(--surface)",
				muted: "var(--muted)",
				text: "var(--text)",
				"text-h": "var(--text-h)",
				border: "var(--border)",
			},
			fontFamily: {
				display: ["Playfair Display", "ui-serif", "Georgia", "serif"],
				body: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
				subtitle: ["Caveat", "Comic Sans MS", "cursive"],
				comfortaa: ["Playfair Display", "ui-serif", "Georgia", "serif"],
				poppins: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
			},
			backgroundImage: {
				"panel-gradient":
					"linear-gradient(140deg, rgba(38, 29, 27, 0.96), rgba(177, 17, 42, 0.18))",
				"home-banner":
					"linear-gradient(130deg, rgba(38, 29, 27, 0.98), rgba(177, 17, 42, 0.16))",
				"login-hero":
					"linear-gradient(160deg, rgba(211, 22, 53, 0.98), rgba(177, 17, 42, 0.96))",
			},
		},
	},
	plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			screens: {
				'ipad-pro': '1024px', // iPad Pro específico
				'desktop': '1280px', // Desktop real
			},
			fontFamily: {
				'sans': ['Byrd', 'Byrd Fallback', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
				'byrd': ['Byrd', 'Byrd Fallback', 'sans-serif'],
			},
		},
	},
	plugins: [],
}

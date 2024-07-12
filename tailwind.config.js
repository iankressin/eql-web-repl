/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				black: '#1e2326',
				'dim-0': '#232a2e',
				'dim-1': '#2d353b',
				white: '#fff8f0',
				orange: '#e69875',
				yellow: '#f0c674',
				red: '#e67e80',
				blue: '#7fbbb3',
				green: '#a7c080',
				pink: '#d699b6',
				olive: '#425047',
				gray: '#859289'
			}
		}
	},
	plugins: []
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: 'class',
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#2874f0',
                    dark: '#1c5dc9',
                    light: '#f0f5ff',
                },
            },
        },
    },
    plugins: [],
};

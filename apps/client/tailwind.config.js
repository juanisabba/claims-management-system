/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './app/**/*.{html,ts}',
    './features/**/*.{html,ts}',
    '../../libs/**/*.{html,ts}', // Si tienes librerías compartidas en el monorepo
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

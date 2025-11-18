/** @type {import('tailwindcss').Config} */
module.exports = {
    // ATENÇÃO LUUUD ---> Adicionar o caminho para todos os seus arquivos que usam classes NativeWind
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

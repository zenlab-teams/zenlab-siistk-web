/** @type {import('tailwindcss').Config} */
export default {
    content: ["./resources/js/**/*.{jsx,js,ts,tsx,html}"],
    theme: {
        extend: {
            fontFamily: {
                mondwest: ["Mondwest", "sans-serif"],
                hack: ["Hack", "sans-serif"],
            },
        },
    },
    darkMode: "selector",
    plugins: [],
};

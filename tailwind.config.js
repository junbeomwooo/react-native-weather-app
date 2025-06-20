/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to  include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", // app 폴더 전체 포함
    "./components/**/*.{js,jsx,ts,tsx}", // components 폴더 전체 포함
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};

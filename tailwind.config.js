const { colors } = require("./lib/constants");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Body: Now
        "now-regular": ["now-regular"],
        "now-medium": ["now-medium"],
        "now-bold": ["now-bold"],
        // Titles: Instrument Serif
        serif: ["instrument-serif"],
        "serif-italic": ["instrument-serif-italic"],
      },
    },
  },
  plugins: [],
};

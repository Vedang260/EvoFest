module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#FF6EC7", // Hot pink
          DEFAULT: "#FF2D95", // Stronger pink
          dark: "#D4006A", // Deep pink
        },
        secondary: {
          light: "#B388FF", // Light purple
          DEFAULT: "#7C4DFF", // Vibrant purple
          dark: "#4A00D1", // Deep purple
        },
        accent: {
          light: "#CCFF00", // Cyber lime
          DEFAULT: "#A2FF00", 
          dark: "#7ACC00",
        },
        neutral: {
          white: "#FFFFFF", // Ice white
          light: "#F5F5F5",
          DEFAULT: "#333333", // Charcoal
          dark: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
}
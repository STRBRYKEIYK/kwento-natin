/** Same family as the resume and voucher book: ink, warm-neutral paper, one red. */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121111",
        paper: "#f3f3f0",
        card: "#fdfdfb",
        mute: "#67635d",
        line: "#d6d3cb",
        red: { DEFAULT: "#c8102e", lt: "#ff4b63" }
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } }
      },
      animation: { marquee: "marquee 28s linear infinite" },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

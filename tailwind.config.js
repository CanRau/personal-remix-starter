const plugin = require("tailwindcss/plugin");

// done: find better name? allows to target all (list) elements except the first
// todo: Get tailwind.config.js [types](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/tailwindcss) working for plugins [tailwindlabs/tailwindcss#1077](https://github.com/tailwindlabs/tailwindcss/discussions/1077)
// note: mentioned in [tailwindlabs/tailwindcss/#2466](https://github.com/tailwindlabs/tailwindcss/discussions/2466#discussioncomment-1871027)
/** @type {import('tailwindcss/plugin')} */
const notFirst = plugin(({ addVariant, e }) => {
  addVariant("not-first", ({ modifySelectors, separator }) => {
    modifySelectors(({ className }) => {
      const element = e(`not-first${separator}${className}`);
      // return `.${element} > * + *`;
      return `.${element} > :not(:first-child)`;
    });
  });
});

/** @type {import('tailwindcss/plugin')} */
const externalLink = plugin(({ addComponents }) => {
  addComponents({
    ".with-icon-left > i": {
      marginLeft: "0.3rem",
      marginRight: "0.5rem",
    },
    ".with-icon-right > i": {
      marginLeft: "0.5rem",
      marginRight: "0.3rem",
    },
    // code by https://css.gg/external
    ".gg-external": {
      boxSizing: "border-box",
      position: "relative",
      display: "inline-block",
      transform: "scale(var(--ggs,1))",
      width: "12px",
      height: "12px",
      boxShadow: "-2px 2px 0 0,-4px -4px 0 -2px,4px 4px 0 -2px",
      marginLeft: "-2px",
      marginTop: "1px",
      "&:before,&:after": {
        content: `""`,
        display: "block",
        boxSizing: "border-box",
        position: "absolute",
        right: "-4px",
      },
      "&:before": {
        background: "currentColor",
        transform: "rotate(-45deg)",
        width: "12px",
        height: "2px",
        top: "1px",
      },
      "&:after": {
        width: "8px",
        height: "8px",
        borderRight: "2px solid",
        borderTop: "2px solid",
        top: "-4px",
      },
    },
  });
});

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  // note: disable JIT until [prettier-plugin-tailwind#29](https://github.com/Acidic9/prettier-plugin-tailwind/issues/29)
  mode: process.env.NODE_ENV ? "jit" : undefined,
  content: ["./{app,content}/**/*.{ts,tsx}"],
  plugins: [
    // done: TailwindCSS Typography plugins' styles, or remove it 🤨 Wait for [tailwindcss-typography#102](https://github.com/tailwindlabs/tailwindcss-typography/issues/102) and [tailwindlabs/tailwindcss/discussions/5711](https://github.com/tailwindlabs/tailwindcss/discussions/5711)
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    notFirst,
    externalLink,
  ],
  theme: {
    extend: {},
  },
};

function withOpacity(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

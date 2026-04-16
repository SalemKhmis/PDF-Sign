const sveltePreprocess = require('svelte-preprocess');

module.exports = {
  preprocess: sveltePreprocess({
    // Enable SCSS support
    scss: {
      includePaths: ['src'],
    },
  }),
};
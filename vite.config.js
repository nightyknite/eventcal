import vue from '@vitejs/plugin-vue'

module.exports = {
  root: './',
  base: './',
  build: {
    sourcemap: 'true'
  },
  plugins: [
    vue()
  ],
  css: {
    devSourcemap: true,
  },
}

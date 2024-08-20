const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://bb.vdev.tech',
        changeOrigin: true,  // Handles the origin of the host header to the target URL
        secure: false,       // If you're targeting an HTTPS server and need to accept self-signed certificates
        pathRewrite: { '^/api': '/api' },  // Strips the '/api' prefix when forwarding the request
      }
    }
  }
});

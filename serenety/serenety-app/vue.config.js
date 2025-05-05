// vue.config.js
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  // This line might have been there already:
  transpileDependencies: true,

  // === ADD THIS SECTION ===
  // This configures the development server to handle secure WebSockets (wss://)
  // correctly when your application is served over HTTPS (like in Codespaces).
  devServer: {
    client: {
      // Automatically determines the correct protocol (ws or wss), host, and port.
      webSocketURL: "auto://0.0.0.0:0/ws",
    },
    // Allows connections from any host, often needed for proxies.
    allowedHosts: "all",
  },
  // === END OF ADDED SECTION ===
});

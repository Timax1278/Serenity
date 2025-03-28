const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0",  // Ascolta su tutte le interfacce di rete
    port: 8080,        // Puoi usare una porta diversa se necessario
    allowedHosts: "all",  // Permette tutte le richieste da host esterni, inclusi quelli di ngrok
  },
});

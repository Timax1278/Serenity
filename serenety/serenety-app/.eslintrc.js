// .eslintrc.js

module.exports = {
  root: true,
  env: {
    node: true,
    // --- AGGIUNTA QUESTA RIGA ---
    "vue/setup-compiler-macros": true,
    // ---------------------------
  },
  extends: [
    "plugin:vue/vue3-essential", // Assicurati che sia la versione per Vue 3
    "eslint:recommended",
    "plugin:prettier/recommended", // Se usi Prettier, mantienilo
  ],
  parserOptions: {
    // Se usi solo JavaScript (no TypeScript) in <script setup>, @babel/eslint-parser va bene
    // Se hai problemi, potresti omettere questa riga e lasciare che vue-eslint-parser (attivato da plugin:vue) gestisca tutto.
    parser: "@babel/eslint-parser",
    ecmaVersion: "latest", // Aggiungere questo può aiutare
    sourceType: "module", // Aggiungere questo può aiutare
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    // Potresti voler temporaneamente disabilitare/abbassare no-unused-vars durante lo sviluppo
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};

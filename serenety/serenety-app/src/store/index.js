// src/store/index.js
import { createStore } from "vuex";

// --- IMPORTA TUTTI I TUOI MODULI ---
import auth from "./modules/auth"; // <--- IMPORTANTE: Assicurati che l'import sia corretto
import users from "./modules/users";
import groups from "./modules/groups"; // <--- IMPORTANTE: Assicurati che sia importato
import appointments from "./modules/appointments";
import meditation from "./modules/meditation";
import shop from "./modules/shop";
// Importa il modulo presence se usi Socket.IO con Vuex
// import presence from "./modules/presence";

// Crea lo store usando createStore
const store = createStore({
  modules: {
    // --- AGGIUNGI TUTTI I MODULI QUI ---
    auth, // <--- IMPORTANTE: Assicurati che 'auth' sia qui
    users,
    groups, // <--- IMPORTANTE: Assicurati che 'groups' sia qui
    appointments,
    meditation,
    shop,
    // presence,   // Aggiungi se usi Socket.IO con Vuex
  },
  // Puoi aggiungere qui state, mutations, actions, getters globali se necessario
  // state: {},
  // mutations: {},
  // actions: {},
  // getters: {},
});

export default store;

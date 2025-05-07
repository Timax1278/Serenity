// src/store/index.js
import { createStore } from "vuex";

// --- IMPORTA TUTTI I TUOI MODULI ---
import auth from "./modules/auth";
import users from "./modules/users";
import groups from "./modules/groups";
import appointments from "./modules/appointments"; // <-- Assicurati che questo file esista e sia importato
import meditation from "./modules/meditation";
import shop from "./modules/shop";
// import presence from "./modules/presence"; // Commentato se non lo usi

// Crea lo store usando createStore
const store = createStore({
  modules: {
    // --- AGGIUNGI TUTTI I MODULI QUI ---
    auth,
    users,
    groups,
    appointments, // <-- Assicurati che sia aggiunto qui all'oggetto modules
    meditation,
    shop,
    // presence,   // Commentato se non lo usi
  },
  // State, Mutations, Actions, Getters globali (generalmente non servono se usi moduli ben strutturati)
  // state: {},
  // mutations: {},
  // actions: {},
  // getters: {},
});

export default store;

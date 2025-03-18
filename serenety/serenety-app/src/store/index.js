import { createStore } from "vuex"; // Importing createStore from vuex for Vue 3
import users from "./modules/users";
import groups from "./modules/groups";
import appointments from "./modules/appointments";
import meditation from "./modules/meditation";
import shop from "./modules/shop";

// Create the store using createStore instead of Vuex.Store
const store = createStore({
  modules: {
    users,
    groups,
    appointments,
    meditation,
    shop,
  },
});

export default store;

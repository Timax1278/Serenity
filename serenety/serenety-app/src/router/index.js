import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "vuex"; // Importa useStore per verificare lo stato di autenticazione

// Importa le viste
import HomePage from "../views/HomePage.vue";
import DashboardPage from "../views/DashboardPage.vue";
import GroupsPage from "../views/GroupsPage.vue";
import MeditationLibrary from "../views/MeditationLibrary.vue";
import AppointmentsPage from "../views/AppointmentsPage.vue";
import UserProfile from "../views/UserProfile.vue";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
  {
    path: "/dashboard-page",
    name: "DashboardPage",
    component: DashboardPage,
    beforeEnter: (to, from, next) => {
      const store = useStore();
      if (!store.getters["auth/isAuthenticated"]) {
        next("/"); // Redirigi alla pagina principale se non autenticato
      } else {
        next(); // Altrimenti, consenti l'accesso
      }
    },
  },
  {
    path: "/groups-page",
    name: "GroupsPage",
    component: GroupsPage,
    beforeEnter: (to, from, next) => {
      const store = useStore();
      if (!store.getters["auth/isAuthenticated"]) {
        next("/"); // Redirigi se non autenticato
      } else {
        next();
      }
    },
  },
  {
    path: "/meditation-library",
    name: "MeditationLibrary",
    component: MeditationLibrary,
    beforeEnter: (to, from, next) => {
      const store = useStore();
      if (!store.getters["auth/isAuthenticated"]) {
        next("/"); // Redirigi se non autenticato
      } else {
        next();
      }
    },
  },
  {
    path: "/appointments-page",
    name: "AppointmentsPage",
    component: AppointmentsPage,
    beforeEnter: (to, from, next) => {
      const store = useStore();
      if (!store.getters["auth/isAuthenticated"]) {
        next("/"); // Redirigi se non autenticato
      } else {
        next();
      }
    },
  },
  {
    path: "/user-profile",
    name: "UserProfile",
    component: UserProfile,
    beforeEnter: (to, from, next) => {
      const store = useStore();
      if (!store.getters["auth/isAuthenticated"]) {
        next("/"); // Redirigi se non autenticato
      } else {
        next();
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Protezione globale per tutte le rotte
router.beforeEach((to, from, next) => {
  const store = useStore();
  if (to.name !== "HomePage" && !store.getters["auth/isAuthenticated"]) {
    next("/"); // Redirigi alla HomePage se non autenticato
  } else {
    next();
  }
});

export default router;

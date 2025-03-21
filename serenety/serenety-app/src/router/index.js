import { createRouter, createWebHistory } from "vue-router";

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
  },
  {
    path: "/groups-page",
    name: "GroupsPage",
    component: GroupsPage,
  },
  {
    path: "/meditation-library",
    name: "MeditationLibrary",
    component: MeditationLibrary,
  },
  {
    path: "/appointments-page",
    name: "AppointmentsPage",
    component: AppointmentsPage,
  },
  {
    path: "/user-profile",
    name: "UserProfile",
    component: UserProfile,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Rimuoviamo temporaneamente i guard di navigazione per debugging

export default router;

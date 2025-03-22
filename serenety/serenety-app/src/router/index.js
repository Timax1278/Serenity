import { createRouter, createWebHistory } from "vue-router";

// Importa le viste
import HomePage from "../views/HomePage.vue";
import DashboardPage from "../views/DashboardPage.vue";
import GroupsPage from "../views/GroupsPage.vue";
import MeditationLibrary from "../views/MeditationLibrary.vue";
import AppointmentsPage from "../views/AppointmentsPage.vue";
import UserProfile from "../views/UserProfile.vue";

// Importa le nuove viste
import AjaxDataPage from "../views/AjaxDataPage.vue";
import ThirdPartyApiPage from "../views/ThirdPartyApiPage.vue";
import SwaggerDocsPage from "../views/SwaggerDocsPage.vue";
import WebsocketCounterPage from "../views/WebsocketCounterPage.vue";

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
  // Nuove rotte aggiunte
  {
    path: "/ajax-data",
    name: "AjaxDataPage",
    component: AjaxDataPage,
  },
  {
    path: "/third-party-api",
    name: "ThirdPartyApiPage",
    component: ThirdPartyApiPage,
  },
  {
    path: "/swagger-docs",
    name: "SwaggerDocsPage",
    component: SwaggerDocsPage,
  },
  {
    path: "/websocket-counter",
    name: "WebsocketCounterPage",
    component: WebsocketCounterPage,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Rimuoviamo temporaneamente i guard di navigazione per debugging

export default router;

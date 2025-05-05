import { createRouter, createWebHistory } from "vue-router";

// Importa le viste esistenti
import HomePage from "../views/HomePage.vue";
import DashboardPage from "../views/DashboardPage.vue";
import GroupsPage from "../views/GroupsPage.vue"; // Questo componente mostrerà la lista dei gruppi
import MeditationLibrary from "../views/MeditationLibrary.vue";
import AppointmentsPage from "../views/AppointmentsPage.vue";
import UserProfile from "../views/UserProfile.vue";
import AjaxDataPage from "../views/AjaxDataPage.vue";
import ThirdPartyApiPage from "../views/ThirdPartyApiPage.vue";
import SwaggerDocsPage from "../views/SwaggerDocsPage.vue";
import WebsocketCounterPage from "../views/WebsocketCounterPage.vue";

// --- Importa la nuova vista per i dettagli del gruppo ---
// Assicurati che questo file esista in src/views/
import GroupDetailPage from "../views/GroupDetailPage.vue";

// Importa vista Admin opzionale (se la crei)
// import AdminGroupsPage from "../views/AdminGroupsPage.vue";

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
    // meta: { requiresAuth: true } // Aggiungere protezione se necessario
  },
  {
    path: "/groups-page", // Questa rotta ora serve per la LISTA dei gruppi
    name: "GroupsPage", // Potrebbe essere rinominato in GroupsListPage per chiarezza
    component: GroupsPage,
    // meta: { requiresAuth: true } // Aggiungere protezione
  },
  // --- NUOVA ROTTA PER IL DETTAGLIO DEL GRUPPO ---
  {
    path: "/groups/:groupId", // Rotta dinamica che accetta un ID di gruppo
    name: "GroupDetailPage",
    component: GroupDetailPage, // Componente che mostra dettagli e chat
    props: true, // Passa automaticamente i parametri della rotta (es. :groupId) come props al componente
    // meta: { requiresAuth: true } // Proteggi questa rotta, l'utente deve essere loggato
  },
  // --- FINE NUOVA ROTTA ---
  {
    path: "/meditation-library",
    name: "MeditationLibrary",
    component: MeditationLibrary,
    // meta: { requiresAuth: true }
  },
  {
    path: "/appointments-page",
    name: "AppointmentsPage",
    component: AppointmentsPage,
    // meta: { requiresAuth: true }
  },
  {
    path: "/user-profile",
    name: "UserProfile",
    component: UserProfile,
    // meta: { requiresAuth: true }
  },
  // Nuove rotte aggiunte (mantenute come da tuo file originale)
  {
    path: "/ajax-data",
    name: "AjaxDataPage",
    component: AjaxDataPage,
    // meta: { requiresAuth: true }
  },
  {
    path: "/third-party-api",
    name: "ThirdPartyApiPage",
    component: ThirdPartyApiPage,
    // meta: { requiresAuth: true }
  },
  {
    path: "/swagger-docs",
    name: "SwaggerDocsPage",
    component: SwaggerDocsPage,
    // meta: { requiresAuth: true }
  },
  {
    path: "/websocket-counter",
    name: "WebsocketCounterPage",
    component: WebsocketCounterPage,
    // meta: { requiresAuth: true }
  },
  // --- Esempio di Rotta Admin Opzionale ---
  // {
  //   path: '/admin/groups', // Se vuoi una pagina separata per la gestione admin dei gruppi
  //   name: 'AdminGroupsPage',
  //   component: AdminGroupsPage, // Devi creare questo componente
  //   meta: { requiresAuth: true, requiresAdmin: true } // Proteggi per admin
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// --- IMPORTANTE: Aggiungere Navigation Guards ---
// Qui è dove dovresti aggiungere la logica per proteggere le rotte.
// Questo codice va aggiunto DOPO la creazione del router e PRIMA dell'export.
/*
import store from './store'; // Importa lo store Vuex se non già fatto

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const isAuthenticated = store.getters['auth/isAuthenticated']; // Usa il tuo getter auth
  const isAdmin = store.getters['auth/isAdmin']; // Usa il tuo getter auth

  if (requiresAuth && !isAuthenticated) {
    // Se la rotta richiede login ma l'utente non è loggato,
    // reindirizza alla homepage o alla pagina di login.
    console.log('Navigation blocked: Authentication required, redirecting to Home.');
    next({ name: 'HomePage' });
  } else if (requiresAdmin && !isAdmin) {
    // Se la rotta richiede privilegi admin ma l'utente non è admin,
    // reindirizza al dashboard o a una pagina di accesso negato.
     console.log('Navigation blocked: Admin privileges required, redirecting to Dashboard.');
    next({ name: 'DashboardPage' }); // O una pagina 'AccessDenied'
  } else {
    // Altrimenti, permetti la navigazione.
    next();
  }
});
*/

export default router;

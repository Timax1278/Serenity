import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginForm from '../components/UserLogin.vue' // Importa il componente LoginForm

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // Lazy loading della pagina About
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: LoginForm // Aggiungi il percorso del LoginForm
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    // Lazy loading della dashboard (pagina protetta)
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Protezione delle route
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user') // Controlla se l'utente è autenticato

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router

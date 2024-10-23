import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue' // Importa la LandingPage
import LoginForm from '../components/UserLogin.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage // Imposta la LandingPage come pagina principale
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: LoginForm
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import(/* webpackChunkName: "register" */ '../components/UserRegister.vue') // Aggiungi il percorso per la registrazione
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Protezione delle route
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('user')

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router

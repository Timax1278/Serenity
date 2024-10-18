import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue' // Ensure you import Home if it exists.

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home // Use the imported Home component
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

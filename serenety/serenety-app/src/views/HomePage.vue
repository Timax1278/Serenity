<template>
  <div class="home">
    <h1>Welcome to Serenity</h1>
    <p>Your space for relaxation, meditation, and self-improvement.</p>

    <div v-if="!isAuthenticated">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="loginData.email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="loginData.password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      <h2>Register</h2>
      <form @submit.prevent="register">
        <div>
          <label for="new-email">Email:</label>
          <input
            type="email"
            id="new-email"
            v-model="registerData.email"
            required
          />
        </div>
        <div>
          <label for="new-password">Password:</label>
          <input
            type="password"
            id="new-password"
            v-model="registerData.password"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>

    <div v-else>
      <p>You are logged in!</p>
      <router-link to="/dashboard-page">Go to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex"; // Mantieni solo l'importazione di useStore

export default {
  name: "HomePage",
  data() {
    return {
      loginData: {
        email: "",
        password: "",
      },
      registerData: {
        email: "",
        password: "",
      },
    };
  },
  computed: {
    isAuthenticated() {
      const store = useStore();
      return store.getters["auth/isAuthenticated"];
    },
  },
  methods: {
    async login() {
      const store = useStore();
      try {
        await store.dispatch("auth/login", this.loginData);
        this.$router.push("/dashboard-page"); // Navigazione usando this.$router
      } catch (error) {
        console.error("Login failed", error);
      }
    },
    async register() {
      const store = useStore();
      try {
        await store.dispatch("auth/register", this.registerData);
        this.$router.push("/dashboard-page"); // Navigazione usando this.$router
      } catch (error) {
        console.error("Registration failed", error);
      }
    },
  },
};
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f4f7fc;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

form div {
  margin-bottom: 1rem;
}

form label {
  font-weight: bold;
}

form input {
  width: 100%;
  padding: 0.8rem;
  margin-top: 0.2rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

form button {
  padding: 0.8rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

form button:hover {
  background-color: #2980b9;
}
</style>

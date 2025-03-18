<template>
  <div class="login-container">
    <div class="login-form">
      <h1>Accedi</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="La tua email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="La tua password"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn primary" :disabled="loading">
            {{ loading ? "Caricamento..." : "Accedi" }}
          </button>
        </div>

        <div class="social-login">
          <button type="button" class="btn google" @click="loginWithGoogle">
            Accedi con Google
          </button>
        </div>

        <div class="login-footer">
          <p>
            Non hai un account?
            <router-link to="/register">Registrati</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "LoginView", // ✅ multi-word name
  setup() {
    const store = useStore();
    const router = useRouter();

    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const error = ref(null);

    const handleLogin = async () => {
      try {
        loading.value = true;
        await store.dispatch("auth/login", {
          email: email.value,
          password: password.value,
        });
        router.push("/dashboard");
      } catch (err) {
        error.value = err.response?.data?.message || "Errore di autenticazione";
      } finally {
        loading.value = false;
      }
    };

    const loginWithGoogle = () => {
      // Implementazione per Google OAuth
      console.log("Google login da implementare");
    };

    return {
      email,
      password,
      loading,
      error,
      handleLogin,
      loginWithGoogle,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333;
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #4caf50;
    }
  }
}

.form-actions {
  margin-bottom: 1.5rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;

  &.primary {
    background-color: #4caf50;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken(#4caf50, 10%);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.google {
    background-color: #4285f4;
    color: white;
    margin-top: 1rem;

    &:hover {
      background-color: darken(#4285f4, 10%);
    }
  }
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;

  a {
    color: #4caf50;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

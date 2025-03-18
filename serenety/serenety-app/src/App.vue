<template>
  <div id="app">
    <header v-if="isAuthenticated">
      <nav>
        <router-link to="/">Home Page</router-link> |
        <router-link to="/dashboard-page">Dashboard Page</router-link> |
        <router-link to="/groups-page">Groups Page</router-link> |
        <router-link to="/meditation-library">Meditation Library</router-link> |
        <router-link to="/appointments-page">Appointments Page</router-link> |
        <router-link to="/user-profile">User Profile</router-link> |
        <router-link to="/shop-page">Shop Page</router-link>
        <span v-if="isAdmin">
          | <router-link to="/admin-dashboard">Admin Dashboard</router-link>
        </span>
        <span class="online-counter">Online Users: {{ onlineUsers }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(
      () => store.getters["auth/isAuthenticated"]
    );
    const isAdmin = computed(() => store.getters["auth/isAdmin"]);
    const onlineUsers = computed(
      () => store.getters["presence/getOnlineUsers"]
    );

    onMounted(() => {
      if (isAuthenticated.value) {
        store.dispatch("presence/initSocketConnection");
      }
    });

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/login");
    };

    return {
      isAuthenticated,
      isAdmin,
      onlineUsers,
      logout,
    };
  },
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f7fc;
  color: #2c3e50;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #3498db;
  padding: 1rem;
  color: white;
}

nav {
  display: flex;
  align-items: center;

  a {
    color: white;
    text-decoration: none;
    padding: 0 1rem;

    &:hover {
      font-weight: bold;
    }
  }

  .online-counter {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 0.875rem;
  }

  .logout-btn {
    margin-left: 1rem;
    padding: 0.25rem 0.75rem;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

main {
  flex-grow: 1;
  padding: 2rem;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

h1 {
  color: #3498db;
  margin-bottom: 1.5rem;
}
</style>

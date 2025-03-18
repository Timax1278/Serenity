<template>
  <div class="dashboard">
    <h1>Welcome to the Dashboard</h1>
    <p>Select a feature below:</p>
    <div class="feature-buttons">
      <router-link to="/groups-page">
        <button class="btn">Go to Groups</button>
      </router-link>
      <router-link to="/meditation-library">
        <button class="btn">Meditation Library</button>
      </router-link>
      <router-link to="/appointments-page">
        <button class="btn">Appointments</button>
      </router-link>
      <router-link to="/user-profile">
        <button class="btn">Your Profile</button>
      </router-link>
    </div>

    <button class="btn-logout" @click="logout">Logout</button>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "DashboardPage",
  setup() {
    const store = useStore();
    const router = useRouter();

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/"); // Redirigi alla HomePage dopo il logout
    };

    return { logout };
  },
};
</script>

<style scoped>
.dashboard {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.feature-buttons {
  margin-top: 2rem;
}

.feature-buttons .btn {
  padding: 1rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  margin: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.feature-buttons .btn:hover {
  background-color: #2980b9;
}

.btn-logout {
  margin-top: 2rem;
  padding: 1rem 2rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #c0392b;
}
</style>

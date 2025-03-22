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

      <!-- Nuovi tasti aggiunti -->
      <router-link to="/ajax-data">
        <button class="btn">AJAX Data</button>
      </router-link>
      <router-link to="/third-party-api">
        <button class="btn">Third Party API</button>
      </router-link>
      <router-link to="/swagger-docs">
        <button class="btn">Swagger Docs</button>
      </router-link>
      <router-link to="/websocket-counter">
        <button class="btn">Real-time Visitors</button>
      </router-link>
    </div>

    <button class="btn-logout" @click="logout">Logout</button>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "DashboardPage",
  setup() {
    const store = useStore();
    const router = useRouter();
    const visitorCount = ref(0);
    let socket = null;

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/"); // Redirigi alla HomePage dopo il logout
    };

    onMounted(() => {
      // Inizializza WebSocket per il contatore visitatori
      initWebSocket();
    });

    onUnmounted(() => {
      // Chiudi WebSocket quando il componente viene smontato
      if (socket) {
        socket.close();
      }
    });

    const initWebSocket = () => {
      // Usa variabile d'ambiente per l'URL del WebSocket
      const wsUrl =
        process.env.VUE_APP_WEBSOCKET_URL || "ws://localhost:8080/visitors";
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        visitorCount.value = data.count;
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    return {
      logout,
      visitorCount,
    };
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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

.visitor-counter {
  margin-top: 1.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  display: inline-block;
}

.visitor-counter p {
  margin: 0;
  font-weight: bold;
  color: #2c3e50;
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

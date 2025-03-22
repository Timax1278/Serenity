<template>
  <div class="profile-page dashboard-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <!-- Brand logo -->
    <div class="brand">
      <div class="brand-icon"></div>
      <div class="brand-text">Serenity</div>
    </div>

    <h1 class="typewriter">Welcome to the Dashboard</h1>
    <p>Select a feature below to begin your wellness journey</p>

    <div class="glass dashboard-container">
      <div class="feature-grid">
        <router-link to="/groups-page" class="feature-card">
          <div class="feature-icon groups-icon"></div>
          <h3>Groups</h3>
          <p>Join meditation groups and connect with others</p>
        </router-link>

        <router-link to="/meditation-library" class="feature-card">
          <div class="feature-icon meditation-icon"></div>
          <h3>Meditation Library</h3>
          <p>Explore guided meditations and relaxation techniques</p>
        </router-link>

        <router-link to="/appointments-page" class="feature-card">
          <div class="feature-icon appointments-icon"></div>
          <h3>Appointments</h3>
          <p>Schedule sessions with wellness professionals</p>
        </router-link>

        <router-link to="/user-profile" class="feature-card">
          <div class="feature-icon profile-icon"></div>
          <h3>Your Profile</h3>
          <p>View and update your personal information</p>
        </router-link>

        <router-link to="/ajax-data" class="feature-card">
          <div class="feature-icon ajax-icon"></div>
          <h3>AJAX Data</h3>
          <p>View dynamic content loaded from the server</p>
        </router-link>

        <router-link to="/third-party-api" class="feature-card">
          <div class="feature-icon api-icon"></div>
          <h3>Third Party API</h3>
          <p>Explore integrations with external services</p>
        </router-link>

        <router-link to="/swagger-docs" class="feature-card">
          <div class="feature-icon docs-icon"></div>
          <h3>Swagger Docs</h3>
          <p>API documentation and testing tools</p>
        </router-link>

        <router-link to="/websocket-counter" class="feature-card">
          <div class="feature-icon realtime-icon"></div>
          <h3>Real-time Visitors</h3>
          <p>See who's online in the Serenity community</p>
        </router-link>
      </div>

      <button class="logout-button" @click="logout">Logout</button>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
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
      router.push("/"); // Redirect to HomePage after logout
    };

    onMounted(() => {
      // Initialize WebSocket for visitor counter
      initWebSocket();
    });

    onUnmounted(() => {
      // Close WebSocket when component is unmounted
      if (socket) {
        socket.close();
      }
    });

    const initWebSocket = () => {
      // Use environment variable for WebSocket URL
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
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Background animation */
.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  animation: animate 25s linear infinite;
  bottom: -150px;
  border-radius: 50%;
}

.circles li:nth-child(1) {
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}

.circles li:nth-child(2) {
  left: 10%;
  width: 20px;
  height: 20px;
  animation-delay: 2s;
  animation-duration: 12s;
}

.circles li:nth-child(3) {
  left: 70%;
  width: 20px;
  height: 20px;
  animation-delay: 4s;
}

.circles li:nth-child(4) {
  left: 40%;
  width: 60px;
  height: 60px;
  animation-delay: 0s;
  animation-duration: 18s;
}

.circles li:nth-child(5) {
  left: 65%;
  width: 20px;
  height: 20px;
  animation-delay: 0s;
}

.circles li:nth-child(6) {
  left: 75%;
  width: 110px;
  height: 110px;
  animation-delay: 3s;
}

.circles li:nth-child(7) {
  left: 35%;
  width: 150px;
  height: 150px;
  animation-delay: 7s;
}

.circles li:nth-child(8) {
  left: 50%;
  width: 25px;
  height: 25px;
  animation-delay: 15s;
  animation-duration: 45s;
}

.circles li:nth-child(9) {
  left: 20%;
  width: 15px;
  height: 15px;
  animation-delay: 2s;
  animation-duration: 35s;
}

.circles li:nth-child(10) {
  left: 85%;
  width: 150px;
  height: 150px;
  animation-delay: 0s;
  animation-duration: 11s;
}

@keyframes animate {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
    border-radius: 0;
  }

  100% {
    transform: translateY(-1000px) rotate(720deg);
    opacity: 0;
    border-radius: 50%;
  }
}

/* Brand styling */
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  margin-right: 10px;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid white;
  animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: white;
  }
}

p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.9;
}

/* Glass effect container */
.glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 1000px;
  margin-bottom: 2rem;
  position: relative;
}

/* Dashboard specific styles */
.dashboard-page .glass {
  padding: 2.5rem;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  position: relative;
}

.feature-icon::before {
  content: "";
  position: absolute;
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.9;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.feature-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0;
}

/* Feature icons */
.groups-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zm0-10C13.66 2.75 15 4.09 15 5.75S13.66 8.75 12 8.75 9 7.41 9 5.75 10.34 2.75 12 2.75zM6 9.5c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm-2 8.5h3v-1.62c0-.83-.36-1.59-.95-2.11-.72.16-1.39.38-2.05.62v3.11zm14-12.5c-1.11 0-2 .89-2 2s.89 2 2 2 2-.89 2-2-.89-2-2-2zm2 12.5v-3.11c-.66-.24-1.33-.46-2.05-.62-.59.52-.95 1.28-.95 2.11V18h3z'/%3E%3C/svg%3E");
}

.meditation-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z'/%3E%3C/svg%3E");
}

.appointments-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'/%3E%3C/svg%3E");
}

.profile-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.ajax-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z'/%3E%3C/svg%3E");
}

.api-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z'/%3E%3C/svg%3E");
}

.docs-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'/%3E%3C/svg%3E");
}

.realtime-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/%3E%3C/svg%3E");
}

/* Visitor counter */
.visitor-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  margin: 1rem 0 2rem;
  position: relative;
}

.visitor-counter p {
  margin: 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.pulse-animation {
  width: 12px;
  height: 12px;
  background-color: #4caf50;
  border-radius: 50%;
  margin-right: 15px;
  position: relative;
}

.pulse-animation::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #4caf50;
  animation: pulse 2s infinite;
  opacity: 0.7;
  left: 0;
  top: 0;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(2);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* Glow effect */
.glow {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* Logout button */
.logout-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  width: auto;
  margin-top: 1rem;
}

.logout-button:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.2);
}

/* Version badge */
.version-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .feature-card {
    padding: 1.2rem;
  }

  .feature-icon {
    width: 50px;
    height: 50px;
  }

  .feature-card h3 {
    font-size: 1rem;
  }

  .feature-card p {
    font-size: 0.8rem;
  }
}

@media (max-width: 600px) {
  .profile-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .glass {
    padding: 1.5rem;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-page .glass {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .visitor-counter {
    padding: 0.8rem 1.2rem;
  }
}
</style>

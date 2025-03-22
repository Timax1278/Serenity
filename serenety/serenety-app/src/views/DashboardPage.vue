<template>
  <div class="dashboard">
    <ul class="circles">
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>

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

    <div class="visitor-counter">
      <p>Current visitors: {{ visitorCount }}</p>
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1a237e, #4a148c);
  color: #fff;
  position: relative;
  overflow: hidden;
}

h1 {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: fadeIn 1.2s ease-out;
  text-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  animation: fadeIn 1.4s ease-out;
}

.feature-buttons {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  max-width: 800px;
  width: 90%;
  animation: fadeIn 1.6s ease-out;
}

.feature-buttons .btn {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.feature-buttons .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  color: #64ffda;
}

.feature-buttons .btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.feature-buttons .btn:hover::before {
  left: 100%;
}

.visitor-counter {
  margin-top: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  display: inline-block;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  from {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  to {
    box-shadow: 0 10px 30px rgba(100, 255, 218, 0.3);
  }
}

.visitor-counter p {
  margin: 0;
  font-weight: bold;
  color: #64ffda;
}

.btn-logout {
  margin-top: 3rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  position: relative;
  overflow: hidden;
  animation: fadeIn 1.8s ease-out;
}

.btn-logout:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(231, 76, 60, 0.3);
}

.btn-logout::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.btn-logout:hover::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* Background circles animation */
.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  z-index: -1;
}

.circles li {
  position: absolute;
  display: block;
  list-style: none;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  animation: animate 25s linear infinite;
  bottom: -150px;
  border-radius: 50%;
}

.circles li:nth-child(1) {
  left: 25%;
  width: 80px;
  height: 80px;
  animation-delay: 0s;
  animation-duration: 20s;
  background: rgba(100, 255, 218, 0.1);
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
  background: rgba(100, 255, 218, 0.1);
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
  background: rgba(100, 255, 218, 0.1);
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
  background: rgba(100, 255, 218, 0.1);
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
  background: rgba(100, 255, 218, 0.1);
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

/* Aggiungi effetto di comparsa graduale per i bottoni */
.feature-buttons .btn:nth-child(1) {
  animation: slideUp 0.4s ease-out 0.1s both;
}
.feature-buttons .btn:nth-child(2) {
  animation: slideUp 0.4s ease-out 0.2s both;
}
.feature-buttons .btn:nth-child(3) {
  animation: slideUp 0.4s ease-out 0.3s both;
}
.feature-buttons .btn:nth-child(4) {
  animation: slideUp 0.4s ease-out 0.4s both;
}
.feature-buttons .btn:nth-child(5) {
  animation: slideUp 0.4s ease-out 0.5s both;
}
.feature-buttons .btn:nth-child(6) {
  animation: slideUp 0.4s ease-out 0.6s both;
}
.feature-buttons .btn:nth-child(7) {
  animation: slideUp 0.4s ease-out 0.7s both;
}
.feature-buttons .btn:nth-child(8) {
  animation: slideUp 0.4s ease-out 0.8s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Aggiungi effetto hover 3D */
.feature-buttons .btn {
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.feature-buttons .btn:hover {
  transform: translateY(-5px) rotateX(5deg);
}

/* Aggiungi un sottile bordo brillante */
.dashboard::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    #64ffda,
    transparent,
    #64ffda,
    transparent
  );
  z-index: -1;
  background-size: 400%;
  animation: glowing 20s linear infinite;
  opacity: 0.3;
}

@keyframes glowing {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

/* Aggiungi effetto di evidenziazione al passaggio del mouse */
.feature-buttons .btn {
  position: relative;
}

.feature-buttons .btn::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  opacity: 0;
  transition: all 0.5s;
  box-shadow: 0 0 15px 3px rgba(100, 255, 218, 0.6);
}

.feature-buttons .btn:hover::after {
  opacity: 1;
}

/* Aggiungi animazione per il contatore visitatori */
@keyframes countUp {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.visitor-counter {
  animation: countUp 0.5s ease-out 2s both;
}

/* Responsive styles */
@media (max-width: 768px) {
  .feature-buttons {
    width: 95%;
  }

  .feature-buttons .btn {
    width: 100%;
    min-width: unset;
  }

  h1 {
    font-size: 2rem;
  }
}

/* Aggiungi effetto di luce per il logout */
.btn-logout {
  position: relative;
}

.btn-logout::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
  z-index: -1;
  border-radius: 35px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-logout:hover::before {
  opacity: 0.4;
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}
</style>

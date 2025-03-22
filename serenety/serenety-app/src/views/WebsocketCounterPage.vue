<template>
  <div class="websocket-page">
    <h1>Real-time Visitors Counter</h1>
    <p>This is a simple test page for WebSocket functionality.</p>

    <div class="counter-display">
      <h2>Current Visitors: {{ visitorCount }}</h2>
      <button @click="simulateConnection" class="connect-button">
        {{ isConnected ? "Disconnect" : "Connect" }}
      </button>
    </div>

    <p class="status">Status: {{ connectionStatus }}</p>

    <router-link to="/dashboard-page" class="back-link"
      >Back to Dashboard</router-link
    >
  </div>
</template>

<script>
export default {
  name: "WebsocketCounterPage",
  data() {
    return {
      visitorCount: 0,
      isConnected: false,
      connectionStatus: "Disconnected",
    };
  },
  methods: {
    simulateConnection() {
      if (this.isConnected) {
        // Simulate disconnection
        this.isConnected = false;
        this.connectionStatus = "Disconnected";
        clearInterval(this.interval);
      } else {
        // Simulate connection
        this.isConnected = true;
        this.connectionStatus = "Connected to WebSocket";
        this.visitorCount = Math.floor(Math.random() * 50) + 10;

        // Simulate real-time updates
        this.interval = setInterval(() => {
          // Random change in visitor count
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          this.visitorCount = Math.max(0, this.visitorCount + change);
        }, 2000);
      }
    },
  },
  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
};
</script>

<style scoped>
.websocket-page {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #3498db;
  margin-bottom: 1rem;
}

.counter-display {
  margin: 2rem auto;
  padding: 2rem;
  max-width: 400px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.connect-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.status {
  margin-top: 1rem;
  font-style: italic;
}

.back-link {
  display: block;
  margin-top: 2rem;
  color: #3498db;
  text-decoration: none;
}
</style>

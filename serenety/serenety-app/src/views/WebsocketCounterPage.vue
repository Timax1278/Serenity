<template>
  <div class="websocket-counter-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <!-- Main content -->
    <div class="counter-container glass">
      <h1>Live Visitor Count</h1>

      <div class="counter-display">
        <div class="counter-icon">
          <svg viewBox="0 0 24 24">
            <path
              d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"
            />
          </svg>
        </div>

        <div class="counter-value">
          <div class="counter-number">{{ visitorCount }}</div>
          <div class="counter-label">{{ visitorLabel }}</div>
        </div>
      </div>

      <div
        v-if="connectionStatus === 'connected'"
        class="connection-status connected"
      >
        <span class="status-indicator"></span>
        Connected to real-time server
      </div>

      <div
        v-else-if="connectionStatus === 'connecting'"
        class="connection-status connecting"
      >
        <span class="status-indicator"></span>
        Connecting to server...
      </div>

      <div v-else class="connection-status disconnected">
        <span class="status-indicator"></span>
        Disconnected
        <button @click="connectWebSocket" class="reconnect-button">
          Reconnect
        </button>
      </div>

      <div class="visitor-history">
        <h2>Visitor History</h2>
        <div class="chart-container">
          <div
            class="chart-bar"
            v-for="(count, index) in visitorHistory"
            :key="index"
            :style="{ height: `${(count / maxHistoryCount) * 100}%` }"
            :title="`${count} visitors`"
          ></div>
        </div>
        <div class="chart-labels">
          <span v-for="(time, index) in historyLabels" :key="index">{{
            time
          }}</span>
        </div>
      </div>

      <div class="last-update">Last updated: {{ lastUpdateTime }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WebsocketCounterPage",
  data() {
    return {
      visitorCount: 0,
      connectionStatus: "connecting",
      socket: null,
      lastUpdateTime: "Never",
      visitorHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      historyLabels: [],
      // Hardcoded backend URL - replace with your actual WebSocket URL
      websocketUrl:
        "wss://fuzzy-space-yodel-694rv596xpjrc4jr9-5000.app.github.dev/ws",
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      reconnectTimeout: null,
    };
  },
  computed: {
    visitorLabel() {
      return this.visitorCount === 1 ? "Visitor Online" : "Visitors Online";
    },
    maxHistoryCount() {
      return Math.max(...this.visitorHistory, 1);
    },
  },
  created() {
    // Initialize history labels with times (last 10 minutes)
    this.updateHistoryLabels();

    // Connect to WebSocket when component is created
    this.connectWebSocket();
  },
  beforeUnmount() {
    // Clean up WebSocket connection when component is destroyed
    this.disconnectWebSocket();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  },
  methods: {
    connectWebSocket() {
      this.connectionStatus = "connecting";

      try {
        // Close existing socket if it exists
        if (this.socket) {
          this.socket.close();
        }

        // Create new WebSocket connection
        this.socket = new WebSocket(this.websocketUrl);

        // Set up event handlers
        this.socket.onopen = this.handleSocketOpen;
        this.socket.onmessage = this.handleSocketMessage;
        this.socket.onclose = this.handleSocketClose;
        this.socket.onerror = this.handleSocketError;

        console.log("Attempting to connect to WebSocket:", this.websocketUrl);
      } catch (error) {
        console.error("WebSocket connection error:", error);
        this.connectionStatus = "disconnected";
      }
    },

    disconnectWebSocket() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    },

    handleSocketOpen() {
      console.log("WebSocket connection established");
      this.connectionStatus = "connected";
      this.reconnectAttempts = 0;

      // Send initial message to join visitor counter
      this.socket.send(JSON.stringify({ type: "join_visitor_counter" }));
    },

    handleSocketMessage(event) {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.type === "visitor_count") {
          this.visitorCount = data.count;
          this.lastUpdateTime = new Date().toLocaleTimeString();

          // Update visitor history
          this.visitorHistory.shift();
          this.visitorHistory.push(data.count);
          this.updateHistoryLabels();
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },

    handleSocketClose(event) {
      console.log("WebSocket connection closed:", event);
      this.connectionStatus = "disconnected";

      // Attempt to reconnect if not closed cleanly
      if (
        !event.wasClean &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          30000
        );

        console.log(
          `Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${
            this.reconnectAttempts
          }/${this.maxReconnectAttempts})`
        );

        this.reconnectTimeout = setTimeout(() => {
          this.connectWebSocket();
        }, delay);
      }
    },

    handleSocketError(error) {
      console.error("WebSocket error:", error);
      this.connectionStatus = "disconnected";
    },

    updateHistoryLabels() {
      const now = new Date();
      this.historyLabels = [];

      for (let i = 9; i >= 0; i--) {
        const time = new Date(now - i * 60000);
        this.historyLabels.push(
          time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
    },
  },
};
</script>
<style scoped>
.websocket-counter-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  color: white;
  font-family: "Arial", sans-serif;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

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

.counter-container {
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 600px;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

h1 {
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.counter-display {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  width: 100%;
}

.counter-icon {
  width: 60px;
  height: 60px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-icon svg {
  width: 100%;
  height: 100%;
  fill: white;
}

.counter-value {
  display: flex;
  flex-direction: column;
}

.counter-number {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.counter-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.connection-status {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  width: 100%;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.connected {
  background: rgba(39, 174, 96, 0.2);
}

.connected .status-indicator {
  background: #27ae60;
  box-shadow: 0 0 10px #27ae60;
}

.connecting {
  background: rgba(241, 196, 15, 0.2);
}

.connecting .status-indicator {
  background: #f1c40f;
  box-shadow: 0 0 10px #f1c40f;
  animation: blink 1s infinite;
}

.disconnected {
  background: rgba(231, 76, 60, 0.2);
}

.disconnected .status-indicator {
  background: #e74c3c;
  box-shadow: 0 0 10px #e74c3c;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.reconnect-button {
  background: rgba(231, 76, 60, 0.6);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.reconnect-button:hover {
  background: rgba(231, 76, 60, 0.8);
}

.visitor-history {
  width: 100%;
  margin-top: 20px;
}

.visitor-history h2 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-align: center;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 5px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #4b6cb7, #5e8afc);
  margin: 0 2px;
  border-radius: 3px 3px 0 0;
  min-height: 2px;
  transition: height 0.5s ease;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.chart-labels span {
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.7rem;
}

.last-update {
  margin-top: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

@media (max-width: 768px) {
  .counter-display {
    flex-direction: column;
    text-align: center;
  }

  .counter-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .chart-labels span {
    font-size: 0.6rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .counter-number {
    font-size: 2.5rem;
  }
}
</style>

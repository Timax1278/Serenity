<template>
  <div class="group-detail-page">
    <div v-if="isLoading">Loading group details...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="group" class="group-content">
      <header class="group-header">
        <h1>{{ group.name }}</h1>
        <p>{{ group.description }}</p>
        <div class="group-actions">
          <button
            v-if="!isMember"
            @click="joinGroupHandler"
            :disabled="isActionLoading"
          >
            Join Group
          </button>
          <button v-else @click="leaveGroupHandler" :disabled="isActionLoading">
            Leave Group
          </button>
        </div>
      </header>

      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesContainer">
          <div
            v-for="message in messages"
            :key="message._id"
            class="message"
            :class="{ 'my-message': message.userId === currentUserId }"
          >
            <span class="message-sender"
              >{{ message.userName || "Unknown User" }}:</span
            >
            <p class="message-text">{{ message.text }}</p>
            <span class="message-time">{{
              formatTimestamp(message.timestamp)
            }}</span>
          </div>
          <p v-if="messages.length === 0">No messages yet. Be the first!</p>
        </div>

        <form
          v-if="isMember"
          @submit.prevent="sendMessageHandler"
          class="chat-input-form"
        >
          <input
            type="text"
            v-model="newMessageText"
            placeholder="Type your message..."
            required
            :disabled="isActionLoading"
          />
          <button type="submit" :disabled="isActionLoading">Send</button>
        </form>
        <p v-else class="join-prompt">
          Join the group to participate in the chat.
        </p>
      </div>

      <aside class="members-list">
        <h3>Members ({{ members.length }})</h3>
        <ul>
          <!-- Mostra ID membri per ora. In futuro, recupera nomi utenti -->
          <li v-for="memberId in members" :key="memberId">
            {{
              memberId === currentUserId
                ? "You"
                : `User ${memberId.substring(0, 6)}...`
            }}
          </li>
        </ul>
      </aside>
    </div>
    <p v-else-if="!isLoading">Group not found.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useStore } from "vuex";
// import { useRoute } from 'vue-router'; // RIMOSSO - Non più necessario grazie a props: true

const props = defineProps({
  // Assicurati che questa riga sia presente e corretta
  groupId: {
    type: String,
    required: true,
  },
});

const store = useStore();
// const route = useRoute(); // RIMOSSO - Variabile non usata

const newMessageText = ref("");
const webSocket = ref(null);
const isActionLoading = ref(false);
const chatMessagesContainer = ref(null);

// Computed properties dallo store
const group = computed(() => store.getters["groups/getCurrentGroup"]);
const messages = computed(() => store.getters["groups/getGroupMessages"]);
const members = computed(() => store.getters["groups/getGroupMembers"]);
const isLoading = computed(() => store.getters["groups/isLoading"]);
const error = computed(() => store.getters["groups/getError"]);
const isMember = computed(() => store.getters["groups/isCurrentUserMember"]);
const currentUserId = computed(() => store.state.auth.user?._id);

// --- WebSocket Logic ---
const connectWebSocket = () => {
  const wsUrl = process.env.VUE_APP_WEBSOCKET_URL || "ws://localhost:5000";
  console.log(`Connecting WebSocket to ${wsUrl} for group ${props.groupId}`); // Usa props.groupId

  if (webSocket.value) {
    webSocket.value.close();
  }

  webSocket.value = new WebSocket(wsUrl);

  webSocket.value.onopen = () => {
    console.log("WebSocket connected");
    webSocket.value.send(
      JSON.stringify({
        type: "subscribe_group",
        groupId: props.groupId, // Usa props.groupId
      })
    );
  };

  webSocket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      if (data.groupId === props.groupId) {
        // Usa props.groupId
        store.dispatch("groups/handleIncomingMessage", data);
        scrollToBottom();
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  };

  webSocket.value.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  webSocket.value.onclose = (event) => {
    console.log("WebSocket closed:", event.reason);
    webSocket.value = null;
  };
};

const disconnectWebSocket = () => {
  if (webSocket.value) {
    webSocket.value.close();
    console.log("WebSocket disconnected");
  }
};

// --- Actions Handlers ---
const joinGroupHandler = async () => {
  isActionLoading.value = true;
  await store.dispatch("groups/joinGroup", props.groupId); // Usa props.groupId
  isActionLoading.value = false;
};

const leaveGroupHandler = async () => {
  if (confirm("Are you sure you want to leave this group?")) {
    isActionLoading.value = true;
    await store.dispatch("groups/leaveGroup", props.groupId); // Usa props.groupId
    isActionLoading.value = false;
  }
};

const sendMessageHandler = async () => {
  if (!newMessageText.value.trim()) return;
  isActionLoading.value = true;
  await store.dispatch("groups/sendMessage", {
    groupId: props.groupId, // Usa props.groupId
    text: newMessageText.value.trim(),
  });
  newMessageText.value = "";
  isActionLoading.value = false;
  scrollToBottom();
};

// --- Utility ---
const formatTimestamp = (isoString) => {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = chatMessagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

// --- Lifecycle Hooks ---
onMounted(() => {
  store
    .dispatch("groups/fetchGroupDetails", props.groupId) // Usa props.groupId
    .then(() => {
      connectWebSocket();
      scrollToBottom();
    });
});

onUnmounted(() => {
  disconnectWebSocket();
  store.commit("groups/CLEAR_CURRENT_GROUP");
});

// Scrolla in basso quando i messaggi cambiano
watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<style scoped>
.group-detail-page {
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
  z-index: -1;
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

.error-message {
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  width: 100%;
  max-width: 900px;
}

/* Group content */
.group-content {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header header"
    "chat members";
  gap: 1.5rem;
}

.group-header {
  grid-area: header;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
}

.group-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.group-header p {
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.group-actions {
  display: flex;
  gap: 1rem;
}

.group-actions button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.group-actions button:first-child {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.group-actions button:last-child {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.group-actions button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.group-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Chat container */
.chat-container {
  grid-area: chat;
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 70vh;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 10px;
  position: relative;
  max-width: 80%;
  align-self: flex-start;
  word-break: break-word;
}

.my-message {
  align-self: flex-end;
  background: rgba(67, 233, 123, 0.3);
}

.message-sender {
  font-weight: 600;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.3rem;
}

.message-text {
  margin: 0;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.8;
  position: absolute;
  bottom: 0.3rem;
  right: 0.5rem;
}

.chat-input-form {
  display: flex;
  gap: 0.5rem;
}

.chat-input-form input {
  flex-grow: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.chat-input-form input:focus {
  outline: none;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.chat-input-form button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.chat-input-form button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.chat-input-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.join-prompt {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-style: italic;
}

/* Members list */
.members-list {
  grid-area: members;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
}

.members-list h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
}

.members-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.members-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.members-list li:last-child {
  border-bottom: none;
}

/* Loading state */
[v-cloak] {
  display: none;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .group-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "chat"
      "members";
  }

  .chat-container {
    height: 400px;
  }

  .members-list {
    max-height: 300px;
  }
}

@media (max-width: 600px) {
  .group-detail-page {
    padding: 1rem;
  }

  .group-content {
    padding: 1.5rem;
  }

  .group-header h1 {
    font-size: 1.8rem;
  }

  .message {
    max-width: 95%;
  }
}
</style>

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
  height: calc(100vh - 100px); /* Adatta altezza */
}
.error-message {
  color: red;
  text-align: center;
  padding: 10px;
}
.group-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
} /* Flex per layout */

.group-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}
.group-header h1 {
  margin: 0 0 5px 0;
}
.group-header p {
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: #555;
}
.group-actions button {
  margin-right: 10px;
  padding: 8px 15px;
  cursor: pointer;
}
.group-actions button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.chat-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
  overflow: hidden;
}
.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #fff;
}
.message {
  margin-bottom: 15px;
  max-width: 70%;
}
.message .message-sender {
  font-weight: bold;
  font-size: 0.8em;
  color: #555;
  display: block;
  margin-bottom: 2px;
}
.message .message-text {
  background-color: #e0f7fa;
  padding: 8px 12px;
  border-radius: 15px 15px 15px 0;
  display: inline-block;
  word-wrap: break-word;
}
.message .message-time {
  font-size: 0.7em;
  color: #999;
  display: block;
  margin-top: 3px;
  text-align: right;
}

.message.my-message {
  margin-left: auto; /* Allinea a destra i propri messaggi */
  text-align: right;
}
.message.my-message .message-text {
  background-color: #dcf8c6;
  border-radius: 15px 15px 0 15px;
}
.message.my-message .message-sender {
  /* Nascondi mittente per i propri messaggi o scrivi "You" */
  display: none;
}

.chat-input-form {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background-color: #f8f8f8;
}
.chat-input-form input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
}
.chat-input-form button {
  padding: 10px 15px;
  border-radius: 20px;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
}
.chat-input-form button:disabled {
  background-color: #ccc;
}
.join-prompt {
  text-align: center;
  padding: 20px;
  color: #777;
}

.members-list {
  width: 200px; /* Larghezza fissa per la lista membri */
  flex-shrink: 0;
  border-left: 1px solid #eee;
  padding: 15px;
  overflow-y: auto;
  background-color: #f8f8f8;
}
.members-list h3 {
  margin: 0 0 10px 0;
  font-size: 1em;
}
.members-list ul {
  list-style: none;
  padding: 0;
}
.members-list li {
  padding: 5px 0;
  font-size: 0.9em;
  color: #333;
}
</style>

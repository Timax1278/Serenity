<template>
  <div class="groups-list-page">
    <h1>Available Groups</h1>
    <div v-if="isLoading">Loading groups...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Sezione Admin (Opzionale) -->
    <!-- DEBUG: Controlla il valore di isAdmin qui -->
    <div v-if="isAdmin" class="admin-section">
      <h2>Admin: Create Group</h2>
      <form @submit.prevent="handleCreateGroup">
        <input
          type="text"
          v-model="newGroupName"
          placeholder="Group Name"
          required
        />
        <textarea
          v-model="newGroupDesc"
          placeholder="Group Description"
        ></textarea>
        <input
          type="email"
          v-model="adminEmail"
          placeholder="Admin Email"
          required
        />
        <input
          type="password"
          v-model="adminPassword"
          placeholder="Admin Password"
          required
        />
        <button type="submit" :disabled="isLoading">Create Group</button>
      </form>
    </div>
    <div v-else></div>

    <ul v-if="groups.length > 0" class="groups-list">
      <li v-for="group in groups" :key="group._id" class="group-item">
        <router-link
          :to="{ name: 'GroupDetailPage', params: { groupId: group._id } }"
        >
          <h2>{{ group.name }}</h2>
          <p>{{ group.description }}</p>
          <span>Members: {{ group.memberCount }}</span>
        </router-link>
        <button
          v-if="isAdmin"
          @click="handleDeleteGroup(group._id)"
          :disabled="isLoading"
          class="delete-btn"
        >
          Delete
        </button>
      </li>
    </ul>
    <p v-else-if="!isLoading">No groups available yet.</p>
  </div>
</template>

<script setup>
// --- IMPORT NECESSARI ---
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

const store = useStore();

// --- STATE PER IL FORM ADMIN ---
const newGroupName = ref("");
const newGroupDesc = ref("");
const adminEmail = ref(""); // Necessario per requireAdmin attuale
const adminPassword = ref(""); // Necessario per requireAdmin attuale

// --- COMPUTED PROPERTIES NECESSARIE PER LA LISTA E ADMIN CHECK ---
const groups = computed(() => store.getters["groups/getGroupsList"]);
const isLoading = computed(() => store.getters["groups/isLoading"]);
const error = computed(() => store.getters["groups/getError"]);
const isAdmin = computed(() => store.getters["auth/isAdmin"]); // Per mostrare/nascondere sezione admin

// --- LOG DI DEBUG (Mantenuti per ora) ---
console.log("[DEBUG] GroupsPage: Checking admin status in setup...");
console.log("[DEBUG] GroupsPage: Value from isAdmin getter:", isAdmin.value);
console.log(
  "[DEBUG] GroupsPage: Current user object in store:",
  store.state.auth?.user
);
// ---------------------------

// --- AZIONI AL MOUNT ---
onMounted(() => {
  console.log("[DEBUG] GroupsPage: Component mounted. Fetching groups list.");
  console.log("[DEBUG] GroupsPage: Admin status in onMounted:", isAdmin.value);
  // Chiama l'azione per caricare la lista dei gruppi
  store.dispatch("groups/fetchGroupsList");
});

// --- HANDLER PER CREAZIONE GRUPPO (ADMIN) ---
const handleCreateGroup = () => {
  console.log("[DEBUG] GroupsPage: handleCreateGroup called.");
  if (!newGroupName.value) {
    alert("Group Name is required."); // Messaggio utente più chiaro
    return;
  }
  if (!adminEmail.value || !adminPassword.value) {
    alert("Admin Email and Password are required to create a group.");
    return;
  }
  const adminCredentials = {
    adminEmail: adminEmail.value,
    adminPassword: adminPassword.value,
  };
  console.log("[DEBUG] GroupsPage: Dispatching createGroup with:", {
    /* ... dati ... */
  });
  store
    .dispatch("groups/createGroup", {
      name: newGroupName.value,
      description: newGroupDesc.value,
      adminCredentials,
    })
    .then(() => {
      console.log(
        "[DEBUG] GroupsPage: createGroup dispatch finished successfully."
      );
      // Pulisci il form dopo successo
      newGroupName.value = "";
      newGroupDesc.value = "";
      adminEmail.value = "";
      adminPassword.value = "";
      // Opzionale: pulisci l'errore se presente
      store.dispatch("groups/clearGroupsError");
    })
    .catch((err) => {
      console.error("[ERROR] GroupsPage: createGroup dispatch failed:", err);
      // L'errore dovrebbe essere già nello store, ma puoi aggiungere feedback qui se vuoi
      // alert(`Failed to create group: ${store.getters['groups/getError'] || 'Unknown error'}`);
    });
};

// --- HANDLER PER ELIMINAZIONE GRUPPO (ADMIN) ---
const handleDeleteGroup = (groupId) => {
  console.log(
    `[DEBUG] GroupsPage: handleDeleteGroup called for groupId: ${groupId}`
  );
  if (!adminEmail.value || !adminPassword.value) {
    alert(
      "Admin Email and Password are required in the form to delete a group."
    );
    return;
  }
  if (
    confirm(
      "Are you sure you want to delete this group and all its messages? This cannot be undone."
    )
  ) {
    const adminCredentials = {
      adminEmail: adminEmail.value,
      adminPassword: adminPassword.value,
    };
    console.log("[DEBUG] GroupsPage: Dispatching deleteGroup with:", {
      /* ... dati ... */
    });
    store
      .dispatch("groups/deleteGroup", { groupId, adminCredentials })
      .catch((err) => {
        console.error("[ERROR] GroupsPage: deleteGroup dispatch failed:", err);
        // alert(`Failed to delete group: ${store.getters['groups/getError'] || 'Unknown error'}`);
      });
  }
};

// --- RIMOSSE TUTTE LE VARIABILI/FUNZIONI NON USATE ---
// const group = computed(...);
// const members = computed(...);
// const isMember = computed(...);
// const currentUserId = computed(...);
// const joinGroupHandler = async () => { ... };
// const leaveGroupHandler = async () => { ... };
// const sendMessageHandler = async () => { ... };
// const formatTimestamp = (isoString) => { ... };
// watch(messages, ...);
// ----------------------------------------------------
</script>

<style scoped>
.groups-list-page {
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
.groups-list-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
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

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.error-message {
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  width: 100%;
  max-width: 700px;
}

/* Admin section */
.admin-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 100%;
  max-width: 700px;
  margin-bottom: 2rem;
}

.admin-section h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.admin-section form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-section input,
.admin-section textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.admin-section textarea {
  min-height: 100px;
  resize: vertical;
}

.admin-section input:focus,
.admin-section textarea:focus {
  outline: none;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.admin-section button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.admin-section button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.admin-section button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Groups list */
.groups-list {
  width: 100%;
  max-width: 700px;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.group-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.3s ease;
  position: relative;
}

.group-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(31, 38, 135, 0.3);
}

.group-item a {
  color: white;
  text-decoration: none;
  display: block;
}

.group-item h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.group-item p {
  margin-bottom: 1rem;
  opacity: 0.9;
}

.group-item span {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.delete-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(244, 67, 54, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(244, 67, 54, 1);
  transform: scale(1.1);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading state */
[v-cloak] {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .groups-list-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .admin-section,
  .group-item {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .admin-section input,
  .admin-section textarea {
    padding: 0.8rem;
  }
}
</style>

<template>
  <div class="groups-list-page">
    <h1>Available Groups</h1>
    <div v-if="isLoading">Loading groups...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Sezione Admin (Opzionale) -->
    <!-- DEBUG: Controlla il valore di isAdmin qui -->
    <p style="background: lightyellow; padding: 5px">
      [DEBUG] isAdmin value in template: {{ isAdmin }}
    </p>
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
    <div v-else>
      <p style="background: lightcoral; color: white; padding: 5px">
        [DEBUG] Admin section is hidden because isAdmin is false.
      </p>
    </div>

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
/* ... (i tuoi stili) ... */
.error-message {
  color: red;
  margin-bottom: 15px;
}
.admin-section {
  background-color: #eee;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}
.admin-section form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.admin-section input,
.admin-section textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
.groups-list {
  list-style: none;
  padding: 0;
}
.group-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.group-item a {
  text-decoration: none;
  color: inherit;
  flex-grow: 1;
}
.delete-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 15px;
}
.delete-btn:disabled {
  background-color: #ccc;
}
</style>

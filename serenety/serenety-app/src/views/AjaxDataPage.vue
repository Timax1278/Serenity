<template>
  <div class="ajax-data">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <div class="glass main-container">
      <h1>Utenti Registrati</h1>

      <div class="back-link">
        <router-link to="/dashboard-page">← Torna alla Dashboard</router-link>
      </div>

      <div class="filters">
        <div class="float-label input-icon search">
          <input
            v-model="nameFilter"
            placeholder=" "
            @input="filterUsers"
            class="a11y-focus"
          />
          <label>Cerca per nome</label>
        </div>

        <button @click="resetFilter" class="btn-action">Reset</button>
        <button
          @click="fetchUsers"
          :class="{ loading: loading }"
          class="btn-action"
        >
          {{ loading ? "Caricamento..." : "Aggiorna" }}
        </button>
      </div>

      <div class="users-container">
        <div v-if="loading" class="loading-animation">
          <div class="spinner"></div>
          <p>Caricamento in corso...</p>
        </div>

        <div v-else-if="error" class="error shake">{{ error }}</div>

        <div v-else>
          <p class="result-count">
            Risultati trovati: {{ filteredUsers.length }}
          </p>

          <div class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="2" class="no-results">Nessun utente trovato</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  name: "AjaxDataPage",
  setup() {
    const users = ref([]);
    const filteredUsers = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const nameFilter = ref("");
    const backendUrl =
      "https://fuzzy-space-yodel-694rv596xpjrc4jr9-5000.app.github.dev";

    const fetchUsers = async () => {
      loading.value = true;
      error.value = null;

      try {
        // In produzione, usa il tuo endpoint API
        // Prova prima a usare il tuo backend
        let response;
        try {
          response = await axios.get(`${backendUrl}/api/users`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
        } catch (backendError) {
          console.log("Fallback to mock API:", backendError);
          // Fallback a JSONPlaceholder se il tuo backend non è disponibile
          response = await axios.get(
            "https://jsonplaceholder.typicode.com/users"
          );
        }

        users.value = response.data;
        filteredUsers.value = response.data;
      } catch (err) {
        error.value = `Errore durante il caricamento degli utenti: ${err.message}`;
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const filterUsers = () => {
      if (!nameFilter.value) {
        filteredUsers.value = users.value;
        return;
      }

      const filter = nameFilter.value.toLowerCase();
      filteredUsers.value = users.value.filter((user) =>
        user.name.toLowerCase().includes(filter)
      );
    };

    const resetFilter = () => {
      nameFilter.value = "";
      filteredUsers.value = users.value;
    };

    const getAuthToken = () => {
      const user = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
      );
      return user.token || "";
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      filteredUsers,
      loading,
      error,
      nameFilter,
      fetchUsers,
      filterUsers,
      resetFilter,
    };
  },
};
</script>

<style scoped>
.ajax-data {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background: linear-gradient(135deg, #1a237e, #4a148c);
  color: #fff;
}

.main-container {
  width: 90%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 15px;
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
}

.back-link {
  margin-bottom: 1.5rem;
  text-align: left;
}

.back-link a {
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
}

.back-link a:hover {
  color: #64ffda;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.float-label {
  position: relative;
  flex: 1;
}

.float-label input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
}

.float-label input:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.3);
}

.float-label input:focus + label,
.float-label input:not(:placeholder-shown) + label {
  transform: translateY(-130%) scale(0.8);
  color: #64ffda;
}

.float-label label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.7);
}

.btn-action {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-action.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(231, 76, 60, 0.2);
  color: #fff;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
}

.btn-delete:hover {
  background: rgba(231, 76, 60, 0.4);
}

.btn-delete.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.result-count {
  margin-bottom: 1rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th,
.users-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table th {
  background: rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: #64ffda;
}

.users-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #64ffda;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  padding: 1rem;
  background: rgba(231, 76, 60, 0.2);
  border-left: 4px solid #e74c3c;
  border-radius: 4px;
  margin: 1rem 0;
}

.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.version-badge {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.6);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #fff;
  font-size: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-danger {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(231, 76, 60, 0.7);
  color: white;
}

.btn-danger:hover {
  background: rgba(231, 76, 60, 1);
  transform: translateY(-2px);
}

.btn-cancel {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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

/* Responsive styles */
@media (max-width: 768px) {
  .main-container {
    width: 95%;
    padding: 1.5rem;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-action {
    width: 100%;
    margin-top: 0.5rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-danger,
  .btn-cancel {
    width: 100%;
  }
}

/* Accessibility focus styles */
.a11y-focus:focus {
  outline: 2px solid #64ffda;
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .ajax-data {
    background: linear-gradient(135deg, #0d1117, #161b22);
  }
}
</style>

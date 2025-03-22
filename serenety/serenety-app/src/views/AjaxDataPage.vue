<template>
  <div class="profile-page ajax-data-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <!-- Brand logo -->
    <div class="brand">
      <div class="brand-icon"></div>
      <div class="brand-text">Serenity</div>
    </div>

    <h1 class="typewriter">Registered Users</h1>
    <p>View and search all users in the Serenity community</p>

    <div class="glass main-container">
      <div class="back-link">
        <router-link to="/dashboard-page">
          <span class="back-arrow">←</span> Return to Dashboard
        </router-link>
      </div>

      <div class="filters">
        <div class="float-label input-icon search">
          <input
            v-model="nameFilter"
            placeholder=" "
            @input="filterUsers"
            class="a11y-focus"
          />
          <label>Search by name</label>
        </div>

        <div class="action-buttons">
          <button @click="resetFilter" class="btn-secondary">Reset</button>
          <button
            @click="fetchUsers"
            :class="{ loading: loading }"
            class="btn-primary"
          >
            {{ loading ? "Loading..." : "Refresh" }}
          </button>
        </div>
      </div>

      <div class="users-container">
        <div v-if="loading" class="loading-animation">
          <div class="spinner"></div>
          <p>Loading users...</p>
        </div>

        <div v-else-if="error" class="error shake">{{ error }}</div>

        <div v-else>
          <p class="result-count">
            Results found: <span class="glow">{{ filteredUsers.length }}</span>
          </p>

          <div class="table-container">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                </tr>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="2" class="no-results">No users found</td>
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
        // Try to use your backend first
        let response;
        try {
          response = await axios.get(`${backendUrl}/api/users`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
        } catch (backendError) {
          console.log("Fallback to mock API:", backendError);
          // Fallback to JSONPlaceholder if your backend is not available
          response = await axios.get(
            "https://jsonplaceholder.typicode.com/users"
          );
        }

        users.value = response.data;
        filteredUsers.value = response.data;
      } catch (err) {
        error.value = `Error loading users: ${err.message}`;
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
  max-width: 900px;
  margin-bottom: 2rem;
  position: relative;
}

/* AJAX Data specific styles */
.ajax-data-page .main-container {
  display: flex;
  flex-direction: column;
}

.back-link {
  margin-bottom: 1.5rem;
}

.back-link a {
  color: white;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  opacity: 0.8;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.back-link a:hover {
  opacity: 1;
  transform: translateX(-5px);
}

.back-arrow {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.float-label {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.float-label input {
  width: 100%;
  padding: 1rem 1rem 1rem 2.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.float-label input:focus {
  outline: none;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.float-label label {
  position: absolute;
  left: 2.5rem;
  top: 1rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
  pointer-events: none;
}

.float-label input:focus ~ label,
.float-label input:not(:placeholder-shown) ~ label {
  top: -0.5rem;
  left: 1rem;
  font-size: 0.8rem;
  background-color: rgba(118, 75, 162, 0.8);
  padding: 0 0.5rem;
  border-radius: 4px;
}

.input-icon::before {
  content: "";
  position: absolute;
  left: 1rem;
  top: 1rem;
  width: 1rem;
  height: 1rem;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.7;
}

.input-icon.search::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: calc(50% - 10px);
  right: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #fff;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.result-count {
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: left;
}

.table-container {
  overflow-x: auto;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  color: white;
}

.users-table thead {
  background: rgba(255, 255, 255, 0.1);
}

.users-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.users-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.users-table tbody tr:last-child td {
  border-bottom: none;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.error {
  padding: 1rem;
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
}

.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
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
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* Glow effect */
.glow {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  font-weight: 600;
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

/* A11y focus styles */
.a11y-focus:focus {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
  outline: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .glass {
    padding: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .float-label {
    width: 100%;
  }

  .action-buttons {
    display: flex;
    width: 100%;
  }

  .action-buttons button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.7rem;
  }
}
</style>

<template>
  <div class="profile-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <div class="brand">
      <div class="brand-icon"></div>
      <div class="brand-text">Serenity</div>
    </div>

    <h1 class="typewriter">Your Profile</h1>
    <p>Manage your personal information and account settings.</p>

    <div class="profile-container glass">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>

      <div v-if="!isEditing" class="profile-view">
        <div class="profile-header">
          <div class="profile-avatar">
            <img
              :src="
                user.picture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`
              "
              alt="Profile picture"
            />
          </div>
          <div class="profile-info">
            <h2>{{ user.name }}</h2>
            <p class="joined-date">
              Member since {{ formatDate(user.createdAt) }}
            </p>
          </div>
          <button @click="startEditing" class="edit-button">
            <span class="icon">✏️</span> Edit Profile
          </button>
        </div>

        <div class="profile-details">
          <div class="detail-item">
            <div class="detail-label">Email</div>
            <div class="detail-value">{{ user.email }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Authentication Method</div>
            <div class="detail-value">
              <span
                v-if="user.authProvider === 'google'"
                class="auth-badge google"
              >
                <svg viewBox="0 0 24 24" class="google-icon">
                  <path
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Google Account
              </span>
              <span v-else class="auth-badge local">
                <svg viewBox="0 0 24 24" class="local-icon">
                  <path
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                  />
                </svg>
                Email & Password
              </span>
            </div>
          </div>
          <div class="detail-item" v-if="user.isAdmin">
            <div class="detail-label">Account Type</div>
            <div class="detail-value">
              <span class="admin-badge">Administrator</span>
            </div>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="updateProfile" class="profile-edit-form">
        <h2>Edit Your Profile</h2>

        <div class="float-label input-icon name">
          <input
            type="text"
            v-model="editedUser.name"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Full Name</label>
        </div>

        <div
          class="float-label input-icon email"
          v-if="user.authProvider === 'local'"
        >
          <input
            type="email"
            v-model="editedUser.email"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Email Address</label>
          <p class="field-note">
            Changing your email will require you to login again.
          </p>
        </div>

        <div v-if="user.authProvider === 'local'">
          <div class="password-section">
            <h3>Change Password</h3>
            <p class="section-note">
              Leave blank if you don't want to change your password
            </p>
          </div>

          <div class="float-label input-icon password">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="editedUser.currentPassword"
              placeholder=" "
              class="a11y-focus"
            />
            <label>Current Password</label>
            <div class="password-toggle" @click="showPassword = !showPassword">
              👁️
            </div>
          </div>

          <div class="float-label input-icon password">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="editedUser.newPassword"
              placeholder=" "
              class="a11y-focus"
            />
            <label>New Password</label>
          </div>

          <div
            class="password-strength"
            :class="passwordStrengthClass"
            v-if="editedUser.newPassword"
          >
            <div class="password-strength-bar"></div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="cancelEditing" class="cancel-button">
            Cancel
          </button>
          <button type="submit" :class="{ loading: isSubmitting }">
            Save Changes
          </button>
        </div>

        <p v-if="updateError" class="error shake">{{ updateError }}</p>
        <p v-if="updateSuccess" class="success">{{ updateSuccess }}</p>
      </form>
    </div>

    <div class="actions-panel">
      <button @click="$router.push('/dashboard-page')" class="back-button">
        <span class="icon">←</span> Back to Dashboard
      </button>
      <button @click="logout" class="logout-button">Logout</button>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
  </div>
</template>

<script>
export default {
  name: "UserProfile",
  data() {
    return {
      user: {
        _id: "",
        name: "",
        email: "",
        authProvider: "local",
        createdAt: "",
        picture: "",
        isAdmin: false,
      },
      editedUser: {
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
      },
      isEditing: false,
      isLoading: true,
      isSubmitting: false,
      showPassword: false,
      updateError: "",
      updateSuccess: "",
      passwordStrengthClass: "",
      backendUrl:
        "https://fuzzy-space-yodel-694rv596xpjrc4jr9-5000.app.github.dev",
    };
  },
  created() {
    this.loadUserProfile();
  },
  watch: {
    "editedUser.newPassword": function (newVal) {
      // Simple password strength checker
      if (!newVal) {
        this.passwordStrengthClass = "";
      } else if (newVal.length < 6) {
        this.passwordStrengthClass = "strength-weak";
      } else if (
        newVal.length < 10 ||
        !/[A-Z]/.test(newVal) ||
        !/[0-9]/.test(newVal)
      ) {
        this.passwordStrengthClass = "strength-medium";
      } else {
        this.passwordStrengthClass = "strength-strong";
      }
    },
  },
  methods: {
    async loadUserProfile() {
      this.isLoading = true;
      try {
        // Retrieve user from local storage first
        const storedUser =
          localStorage.getItem("user") || sessionStorage.getItem("user");

        if (!storedUser) {
          // Redirect to login if no user is found
          this.$router.push("/");
          return;
        }

        const userData = JSON.parse(storedUser);

        // Fetch the latest user data from the server
        const response = await fetch(
          `${this.backendUrl}/api/users/${userData._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const freshUserData = await response.json();
        this.user = freshUserData;

        // Initialize edited user with current values
        this.resetEditForm();
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        this.isLoading = false;
      }
    },

    resetEditForm() {
      this.editedUser = {
        name: this.user.name,
        email: this.user.email,
        currentPassword: "",
        newPassword: "",
      };
    },

    startEditing() {
      this.isEditing = true;
      this.updateError = "";
      this.updateSuccess = "";
      this.resetEditForm();
    },

    cancelEditing() {
      this.isEditing = false;
      this.resetEditForm();
    },

    async updateProfile() {
      this.isSubmitting = true;
      this.updateError = "";
      this.updateSuccess = "";

      try {
        // Validate form
        if (!this.editedUser.name) {
          throw new Error("Name is required");
        }

        if (this.user.authProvider === "local") {
          if (!this.editedUser.email) {
            throw new Error("Email is required");
          }

          // If setting a new password, current password is required
          if (this.editedUser.newPassword && !this.editedUser.currentPassword) {
            throw new Error(
              "Current password is required to set a new password"
            );
          }
        }

        // SOLUZIONE TEMPORANEA: Aggiorna solo i dati locali
        console.log(
          "Backend update endpoint not available, updating locally only"
        );

        // Prepara i dati aggiornati
        const updatedUserData = {
          ...this.user,
          name: this.editedUser.name,
        };

        if (this.user.authProvider === "local") {
          updatedUserData.email = this.editedUser.email;
        }

        // Aggiorna lo storage locale
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Aggiorna i dati nel componente
        this.user = updatedUserData;
        this.updateSuccess =
          "Profile updated locally. Note: Server update not available.";

        // Esci dalla modalità di modifica dopo un breve ritardo
        setTimeout(() => {
          this.isEditing = false;
        }, 1500);
      } catch (error) {
        console.error("Error updating profile:", error);
        this.updateError =
          error.message || "Failed to update profile. Please try again.";
      } finally {
        this.isSubmitting = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "Unknown";

      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    },

    logout() {
      // Clear stored user data
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Redirect to login page
      this.$router.push("/");
    },
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
  max-width: 700px;
  margin-bottom: 2rem;
  position: relative;
}

.profile-container {
  display: flex;
  flex-direction: column;
}

/* Profile view styling */
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1.5rem;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.joined-date {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.edit-button {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.icon {
  margin-right: 0.5rem;
}

.profile-details {
  display: grid;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.3rem;
}

.detail-value {
  font-size: 1.1rem;
  font-weight: 500;
}

.auth-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.auth-badge svg {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  fill: currentColor;
}

.auth-badge.google {
  background-color: #4285f4;
  color: white;
}

.auth-badge.local {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.admin-badge {
  display: inline-block;
  background-color: #ff9800;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Form styling */
.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-edit-form h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
}

.float-label {
  position: relative;
  margin-bottom: 1rem;
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

.input-icon.name::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.input-icon.email::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.input-icon.password::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 1rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.password-toggle:hover {
  opacity: 1;
}

.field-note,
.section-note {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 0.3rem;
  margin-left: 0.5rem;
}

.password-section {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.password-section h3 {
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.password-strength {
  height: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  width: 0;
  transition: all 0.3s ease;
}

.strength-weak .password-strength-bar {
  width: 30%;
  background-color: #ff5252;
}

.strength-medium .password-strength-bar {
  width: 70%;
  background-color: #ffb74d;
}

.strength-strong .password-strength-bar {
  width: 100%;
  background-color: #66bb6a;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

button[type="submit"] {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  flex: 1;
}

button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.cancel-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
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

.error,
.success {
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.error {
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
}

.success {
  background-color: rgba(76, 175, 80, 0.2);
  color: #c8e6c9;
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  z-index: 10;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.actions-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button,
.logout-button {
  padding: 0.7rem 1.2rem;
  border-radius: 30px;
  font-size: 0.9rem;
}

.back-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.logout-button {
  background-color: rgba(244, 67, 54, 0.2);
  color: white;
}

.logout-button:hover {
  background-color: rgba(244, 67, 54, 0.3);
}

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

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .edit-button {
    position: relative;
    margin-top: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .actions-panel {
    flex-direction: column;
    width: 100%;
  }
}
</style>

<template>
  <div class="home">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <!-- Language selector -->
    <div class="language-selector">
      <select>
        <option value="en">English</option>
        <option value="it">Italiano</option>
        <option value="fr">Français</option>
      </select>
    </div>

    <!-- Brand logo -->
    <div class="brand">
      <div class="brand-icon"></div>
      <div class="brand-text">Serenity</div>
    </div>

    <h1 class="typewriter">Welcome to Serenity</h1>
    <p>Your space for relaxation, meditation, and self-improvement.</p>

    <div v-if="!isAuthenticated" class="auth-container">
      <!-- Form switch tabs -->
      <div class="form-switch">
        <button
          :class="{ active: activeForm === 'login' }"
          @click="activeForm = 'login'"
        >
          Login
        </button>
        <button
          :class="{ active: activeForm === 'register' }"
          @click="activeForm = 'register'"
        >
          Register
        </button>
      </div>

      <!-- Login form -->
      <form v-if="activeForm === 'login'" @submit.prevent="login" class="glass">
        <h2>Login to Your Account</h2>

        <div class="float-label input-icon email">
          <input
            type="email"
            v-model="loginData.email"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Email Address</label>
        </div>

        <div class="float-label input-icon password">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="loginData.password"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Password</label>
          <div class="password-toggle" @click="showPassword = !showPassword">
            👁️
          </div>
        </div>

        <div class="remember-toggle">
          <label class="toggle">
            <input type="checkbox" v-model="rememberMe" />
            <span class="toggle-slider"></span>
          </label>
          <span class="remember-text">Remember me</span>
        </div>

        <div class="forgot-password">
          <a href="#">Forgot password?</a>
        </div>

        <button type="submit" :class="{ loading: isLoading }">Login</button>

        <p v-if="loginError" class="error shake">{{ loginError }}</p>

        <div class="divider">OR</div>

        <div class="social-login">
          <div class="social-btn google-btn" @click="loginWithGoogle">
            <svg viewBox="0 0 24 24">
              <path
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            <span>Login with Google</span>
          </div>
          <div class="social-btn">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.6 18.57C21.17 16.76 22.04 14.47 22.04 12.06C22.04 6.53 17.54 2.04 12 2.04Z"
              />
            </svg>
          </div>
          <div class="social-btn">
            <svg viewBox="0 0 24 24">
              <path
                d="M19.05,8.362c0.062-0.062,0.125-0.125,0.187-0.187l1.937-2c0.125-0.125,0.063-0.313-0.125-0.313h-2.5c-0.062,0-0.125,0-0.187,0.062l-1.937,2.375h0.125L19.05,8.362z M16.05,8.737H8.112c-0.063,0-0.125,0.063-0.125,0.125v1.5c0,0.063,0.063,0.125,0.125,0.125h7.813c0.062,0,0.125-0.063,0.125-0.125v-1.5C16.175,8.8,16.113,8.737,16.05,8.737z M5.175,4.237c-1.375,0-2.5,1.125-2.5,2.5v10.25c0,1.375,1.125,2.5,2.5,2.5h13.5c1.375,0,2.5-1.125,2.5-2.5v-8.25c0-0.063-0.063-0.125-0.125-0.125h-0.812c-0.063,0-0.125,0.063-0.125,0.125v8.25c0,0.75-0.625,1.375-1.375,1.375h-13.5c-0.75,0-1.375-0.625-1.375-1.375v-10.25c0-0.75,0.625-1.375,1.375-1.375h10.25c0.063,0,0.125-0.063,0.125-0.125v-0.812c0-0.063-0.063-0.125-0.125-0.125H5.175z"
              />
            </svg>
          </div>
        </div>
      </form>

      <!-- Register form -->
      <form
        v-if="activeForm === 'register'"
        @submit.prevent="register"
        class="glass"
      >
        <h2>Create Your Account</h2>

        <div class="float-label input-icon name">
          <input
            type="text"
            v-model="registerData.name"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Full Name</label>
        </div>

        <div class="float-label input-icon email">
          <input
            type="email"
            v-model="registerData.email"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Email Address</label>
        </div>

        <div class="float-label input-icon password">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="registerData.password"
            placeholder=" "
            required
            class="a11y-focus"
          />
          <label>Password</label>
          <div class="password-toggle" @click="showPassword = !showPassword">
            👁️
          </div>
        </div>

        <div class="password-strength" :class="passwordStrengthClass">
          <div class="password-strength-bar"></div>
        </div>

        <label class="custom-checkbox terms-checkbox">
          <input type="checkbox" v-model="agreeToTerms" required />
          <span class="checkmark"></span>
          I agree to the <a href="#">Terms of Service</a> and
          <a href="#">Privacy Policy</a>
        </label>

        <button type="submit" :class="{ loading: isLoading }">
          Create Account
        </button>

        <p v-if="registerError" class="error shake">{{ registerError }}</p>

        <div class="divider">OR</div>

        <div class="social-login">
          <div class="social-btn google-btn" @click="registerWithGoogle">
            <svg viewBox="0 0 24 24">
              <path
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            <span>Sign up with Google</span>
          </div>
        </div>
      </form>
    </div>

    <!-- Logged in user view -->
    <div v-else class="glass">
      <div class="success-checkmark">
        <div class="check-icon">
          <span class="icon-line line-tip"></span>
          <span class="icon-line line-long"></span>
        </div>
      </div>

      <p>
        You are logged in as <span class="glow">{{ loggedInUser }}</span>
      </p>

      <router-link to="/dashboard-page" class="cta-button"
        >Go to Dashboard</router-link
      >

      <button @click="logout">Logout</button>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
  </div>
</template>

<script>
import { googleTokenLogin } from "vue3-google-login";
export default {
  name: "HomePage",
  data() {
    return {
      loginData: {
        email: "",
        password: "",
      },
      registerData: {
        name: "",
        email: "",
        password: "",
      },
      isAuthenticated: false,
      loggedInUser: null,
      loginError: "",
      registerError: "",
      // Hardcoded backend URL for GitHub Codespaces
      backendUrl:
        "https://fuzzy-space-yodel-694rv596xpjrc4jr9-5000.app.github.dev",
      // New properties for enhanced UI
      showPassword: false,
      isLoading: false,
      activeForm: "login",
      rememberMe: false,
      agreeToTerms: false,
      passwordStrengthClass: "",
    };
  },
  created() {
    // Check if user is already logged in
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.isAuthenticated = true;
      this.loggedInUser = user.email;
    }

    // Log the backend URL we're using
    console.log("Using backend URL:", this.backendUrl);
  },
  watch: {
    "registerData.password": function (newVal) {
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
    async register() {
      this.registerError = "";
      this.isLoading = true;

      try {
        // Log the data we're sending
        console.log("Registration attempt with:", {
          name: this.registerData.name,
          email: this.registerData.email,
          password: this.registerData.password ? "[PRESENT]" : "[MISSING]",
        });

        // Make sure all fields are present
        if (
          !this.registerData.name ||
          !this.registerData.email ||
          !this.registerData.password
        ) {
          throw new Error("All fields are required");
        }

        // Check terms agreement
        if (!this.agreeToTerms) {
          throw new Error(
            "You must agree to the Terms of Service and Privacy Policy"
          );
        }

        console.log("Using backend URL:", this.backendUrl);
        console.log(
          "Sending registration data:",
          JSON.stringify(this.registerData)
        );

        const res = await fetch(`${this.backendUrl}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.registerData),
        });

        console.log("Registration response status:", res.status);

        // Handle non-successful responses
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        }

        // Parse successful response
        const data = await res.json();
        console.log("Registration successful:", data);

        // Show success animation
        this.createConfetti();

        // Store user data and update UI
        localStorage.setItem("user", JSON.stringify(data));
        this.isAuthenticated = true;
        this.loggedInUser = data.email;
        this.$router.push("/dashboard-page");
      } catch (err) {
        console.error("Registration error:", err);
        this.registerError =
          err.message || "Registration failed. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    async login() {
      this.loginError = "";
      this.isLoading = true;

      try {
        console.log("Attempting login with:", {
          email: this.loginData.email,
          password: "[HIDDEN]",
        });

        // Use the login endpoint
        const res = await fetch(`${this.backendUrl}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.loginData.email,
            password: this.loginData.password,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        }

        const user = await res.json();
        console.log("Login successful for user:", user.email);

        // Store user data (conditionally if remember me is checked)
        if (this.rememberMe) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }

        this.isAuthenticated = true;
        this.loggedInUser = user.email;

        // Show success notification
        this.showNotification("Login successful!", "success");

        // Navigate to dashboard
        this.$router.push("/dashboard-page");
      } catch (err) {
        console.error("Login error:", err);
        this.loginError = err.message || "Login failed. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    loginWithGoogle() {
      googleTokenLogin({
        // Specify the correct redirect URI that matches your Google Cloud Console config
        ux_mode: "popup",
        context: "signin",
      })
        .then((response) => {
          // Process the response as before
          const token = response.credential;

          fetch(`${this.backendUrl}/api/auth/login-google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Login successful:", data);
              localStorage.setItem("user", JSON.stringify(data));
              this.isAuthenticated = true;
              this.loggedInUser = data.email;
              this.showNotification("Login successful!", "success");
              this.$router.push("/dashboard-page");
            })
            .catch((error) => {
              console.error("Error during login:", error);
              this.loginError = "Google login failed. Please try again.";
            });
        })
        .catch((error) => {
          console.error("Google login error:", error);
          this.loginError = "Google login failed. Please try again.";
        });
    },

    registerWithGoogle() {
      googleTokenLogin({
        // Same settings for registration
        ux_mode: "popup",
        context: "signup",
      })
        .then((response) => {
          // Process as before
          const token = response.credential;

          fetch(`${this.backendUrl}/api/auth/register-google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Registration successful:", data);
              localStorage.setItem("user", JSON.stringify(data));
              this.isAuthenticated = true;
              this.loggedInUser = data.email;
              this.createConfetti();
              this.$router.push("/dashboard-page");
            })
            .catch((error) => {
              console.error("Error during registration:", error);
              this.registerError =
                "Google registration failed. Please try again.";
            });
        })
        .catch((error) => {
          console.error("Google registration error:", error);
          this.registerError = "Google registration failed. Please try again.";
        });
    },

    logout() {
      this.isLoading = true;

      try {
        // Cancella i dati dell'utente
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");

        this.isAuthenticated = false;
        this.loggedInUser = null;

        // Redirect alla home page
        this.$router.push("/");

        this.showNotification("Logout successful", "info");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        this.isLoading = false;
      }
    },

    showNotification(message, type = "info") {
      // Implementazione semplice di notifiche
      console.log(`Notification (${type}): ${message}`);

      // Mostra un toast o un alert
      // Questa è una implementazione base, potresti voler usare una libreria come vue-toastification
      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      // Rimuovi il toast dopo 3 secondi
      setTimeout(() => {
        toast.classList.add("toast-hide");
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    },

    createConfetti() {
      // Implementazione semplice dell'animazione confetti
      console.log("Showing confetti animation!");

      // Qui potresti implementare un'animazione confetti
      // Ad esempio, usando una libreria come canvas-confetti

      // Per questa implementazione semplice, creiamo alcuni elementi DOM
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";
      container.style.zIndex = "9999";
      document.body.appendChild(container);

      // Crea 50 confetti colorati
      const colors = [
        "#f44336",
        "#e91e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4CAF50",
      ];

      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 10 + 5}px`;
        confetti.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = "-20px";
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

        container.appendChild(confetti);

        // Animazione di caduta
        const duration = Math.random() * 3 + 2;
        confetti.style.animation = `fall ${duration}s linear forwards`;
      }

      // Rimuovi il container dopo 5 secondi
      setTimeout(() => {
        document.body.removeChild(container);
      }, 5000);
    },
  },
};
</script>

<style scoped>
/* Aggiungi qui i tuoi stili CSS esistenti */

/* Stile per il pulsante Google */
.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #ffffff;
  color: #444;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 15px;
}

.google-btn:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.google-btn svg {
  width: 20px;
  height: 20px;
}

/* Stile per i toast di notifica */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  max-width: 300px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  z-index: 9999;
  animation: slideIn 0.3s ease forwards;
}

.toast-success {
  background-color: #4caf50;
}

.toast-info {
  background-color: #2196f3;
}

.toast-warning {
  background-color: #ff9800;
}

.toast-error {
  background-color: #f44336;
}

.toast-hide {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
<style scoped>
/* Paste the entire CSS here */
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
#app {
  min-height: 100vh;
  width: 100%;
}
.home {
  text-align: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  animation: gradientFlow 15s ease infinite;
  background-size: 400% 400%;
  padding: 3rem 1.5rem;
  position: relative;
  overflow-x: hidden;
  margin: 0;
  box-sizing: border-box;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 1s ease;
  font-weight: 800;
  letter-spacing: -1px;
}

h2 {
  font-size: 2rem;
  margin: 1.5rem 0;
  color: #ffffff;
  position: relative;
  display: inline-block;
}

h2:after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #ffe259;
  animation: expandWidth 0.8s ease forwards;
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 50px;
  }
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  animation: fadeIn 1s ease 0.3s both;
}

.error {
  color: #ff6b6b;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-weight: 500;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}

form {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 2rem;
  margin-bottom: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.8s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

form:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

form div {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

form input {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

form input:focus {
  outline: none;
  border-color: #ffe259;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 3px rgba(255, 226, 89, 0.3);
}

form input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

button {
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ffe259, #ffa751);
  color: #333;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 226, 89, 0.4);
  width: 100%;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(255, 226, 89, 0.5);
  color: #111;
}

button:before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ffa751, #ffe259);
  transition: left 0.5s ease;
  z-index: -1;
}

button:hover:before {
  left: 0;
}

a {
  color: #ffe259;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  margin: 1rem 0;
  padding: 0.5rem 1.5rem;
  border: 2px solid #ffe259;
  border-radius: 50px;
}

a:hover {
  background-color: #ffe259;
  color: #185a9d;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255, 226, 89, 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  form {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }

  form {
    padding: 1.2rem;
  }

  button {
    padding: 0.8rem 1.5rem;
  }
}

/* Additional animations for logged in state */
div[v-else] {
  animation: fadeIn 0.8s ease;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}

div[v-else] p {
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

div[v-else] button {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  margin-top: 1rem;
}

div[v-else] button:before {
  background: linear-gradient(45deg, #ff8e8e, #ff6b6b);
}

/* Additional styling for the entire app */
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Loading animation for form submissions */
button[type="submit"] {
  position: relative;
}

button[type="submit"].loading:after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: calc(50% - 10px);
  right: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
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

/* Form focus effects */
form div {
  position: relative;
}

form div:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(45deg, #ffe259, #ffa751);
  transition: width 0.3s ease;
}

form div:focus-within:after {
  width: 100%;
}

/* Logo placeholder */
.logo {
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* Welcome text animation */
.welcome-text {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3.5s steps(40, end);
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* Input field icons */
.input-icon {
  position: relative;
}

.input-icon input {
  padding-left: 40px;
}

.input-icon:before {
  content: "";
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  opacity: 0.7;
  z-index: 1;
}

.input-icon.email:before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E")
    no-repeat center center;
}

.input-icon.password:before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z'/%3E%3C/svg%3E")
    no-repeat center center;
}

.input-icon.name:before {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E")
    no-repeat center center;
}

/* Toggle password visibility */
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.password-toggle:hover {
  opacity: 1;
}

/* Success message animation */
.success-message {
  padding: 1rem;
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
  border-radius: 8px;
  margin-top: 1rem;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Form transition effects */
.form-enter-active,
.form-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.form-enter-from,
.form-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.circles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
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

/* Toggle switch for light/dark mode */
.toggle-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #ffe259;
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px #ffe259;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Brand logo animation */
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background: linear-gradient(45deg, #ffe259, #ffa751);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  animation: pulse-grow 2s infinite alternate;
}

@keyframes pulse-grow {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.brand-icon:before,
.brand-icon:after {
  content: "";
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
}

.brand-icon:before {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  top: 8px;
  left: 12px;
}

.brand-icon:after {
  width: 24px;
  height: 4px;
  border-radius: 2px;
  bottom: 10px;
  left: 8px;
}

.brand-text {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  letter-spacing: 1px;
}

.form-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 5px;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.form-switch button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-weight: 500;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  width: 50%;
}

.form-switch button.active {
  color: #333;
  background: linear-gradient(45deg, #ffe259, #ffa751);
  box-shadow: 0 4px 15px rgba(255, 226, 89, 0.4);
}

/* Floating labels */
.float-label {
  position: relative;
  margin-bottom: 20px;
}

.float-label input {
  width: 100%;
  padding: 18px 15px 10px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.float-label label {
  position: absolute;
  top: 15px;
  left: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
}

.float-label input:focus ~ label,
.float-label input:not(:placeholder-shown) ~ label {
  top: 5px;
  left: 15px;
  font-size: 0.75rem;
  color: #ffe259;
}

.float-label input:focus {
  border-color: #ffe259;
  box-shadow: 0 0 0 3px rgba(255, 226, 89, 0.3);
}

/* Password strength indicator */
.password-strength {
  height: 5px;
  border-radius: 3px;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  width: 0%;
  transition: all 0.3s ease;
}

.strength-weak .password-strength-bar {
  width: 33%;
  background-color: #ff6b6b;
}

.strength-medium .password-strength-bar {
  width: 66%;
  background-color: #feca57;
}

.strength-strong .password-strength-bar {
  width: 100%;
  background-color: #1dd1a1;
}

/* Social login buttons */
.social-login {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-btn:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.3);
}

.social-btn svg {
  width: 24px;
  height: 24px;
  fill: white;
}

/* Forgot password link */
.forgot-password {
  text-align: right;
  margin-top: -1rem;
  margin-bottom: 1rem;
}

.forgot-password a {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border: none;
  padding: 0;
  transition: all 0.3s ease;
}

.forgot-password a:hover {
  color: #ffe259;
  background: none;
  transform: none;
  box-shadow: none;
}

/* Custom checkbox styling */
.custom-checkbox {
  display: block;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  color: rgba(255, 255, 255, 0.8);
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.custom-checkbox:hover input ~ .checkmark {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #ffe259;
  border-color: #ffe259;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.custom-checkbox .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Terms checkbox */
.terms-checkbox {
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.terms-checkbox a {
  display: inline;
  margin: 0;
  padding: 0;
  border: none;
}

.terms-checkbox a:hover {
  background: none;
  transform: none;
  box-shadow: none;
  text-decoration: underline;
}

/* Success checkmark animation */
.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  position: relative;
  animation: scale 0.5s ease-in-out;
  margin-bottom: 1rem;
}

.success-checkmark .check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4caf50;
}

.success-checkmark .check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.success-checkmark .check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.success-checkmark .check-icon::before,
.success-checkmark .check-icon::after {
  content: "";
  height: 100px;
  position: absolute;
  background: transparent;
  transform: rotate(-45deg);
}

.success-checkmark .check-icon .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.success-checkmark .check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.success-checkmark .check-icon .icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 46px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

@keyframes scale {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* CTA button */
.cta-button {
  padding: 1.2rem 2.5rem;
  background: linear-gradient(45deg, #ffe259, #ffa751);
  color: #333;
  border: none;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(255, 226, 89, 0.4);
  margin: 2rem auto;
  display: block;
  text-align: center;
  max-width: 250px;
  text-decoration: none;
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 25px rgba(255, 226, 89, 0.5);
}

.cta-button:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  background-size: 250% 250%;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

/* Version badge */
.version-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

/* Confetti animation */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #ffe259;
  animation: confetti-fall 3s linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Language selector */
.language-selector {
  position: absolute;
  top: 20px;
  left: 20px;
}

.language-selector select {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  padding: 5px 25px 5px 10px;
  font-size: 0.8rem;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-selector select:hover {
  background: rgba(255, 255, 255, 0.3);
}

.language-selector:after {
  content: "▼";
  font-size: 0.7rem;
  color: white;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Notification */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 4.5s forwards;
  z-index: 1000;
}

.notification.success {
  background: linear-gradient(45deg, #2ecc71, #1abc9c);
}

.notification.error {
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.notification.info {
  background: linear-gradient(45deg, #3498db, #2980b9);
}

.notification:before {
  content: "";
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Auth container to hold login/register forms */
.auth-container {
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.8s ease;
}

/* Glow effect for important elements */
.glow {
  text-shadow: 0 0 10px rgba(255, 226, 89, 0.7);
}

/* Remember me toggle */
.remember-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  margin-right: 10px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #ffe259;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.remember-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Divider with text */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.divider:before,
.divider:after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.divider:before {
  margin-right: 10px;
}

.divider:after {
  margin-left: 10px;
}

/* Typewriter effect */
.typewriter {
  overflow: hidden;
  border-right: 0.15em solid #ffe259;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: 0.15em;
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
    border-color: #ffe259;
  }
}

/* Accessibility focus */
.a11y-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 226, 89, 0.6);
  border-radius: 4px;
}

/* Mobile optimizations */
@media (max-width: 320px) {
  h1 {
    font-size: 1.8rem;
  }

  form input {
    padding: 0.8rem;
  }

  .brand {
    margin-bottom: 1.5rem;
  }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  .home {
    padding: 4rem 2rem;
  }

  form {
    max-width: 500px;
  }
}

/* Responsive adjustments for ultra-wide screens */
@media (min-width: 1600px) {
  .home {
    padding: 5rem;
  }

  form {
    max-width: 550px;
  }

  h1 {
    font-size: 4rem;
  }
}
</style>

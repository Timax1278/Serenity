<template>
  <div class="profile-page">
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

      <button @click="navigateToDashboard" class="cta-button">
        Go to Dashboard
      </button>

      <button @click="logout">Logout</button>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
  </div>
</template>

<script>
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
      // Opzioni per il backend URL
      backendUrlOptions: {
        codespaces:
          "https://fuzzy-space-yodel-694rv596xpjrc4jr9-5000.app.github.dev",
        local: "http://localhost:5000",
      },
      backendUrl: "",
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
    // Determina l'URL del backend in base all'ambiente
    this.detectBackendUrl();

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
    // Metodo per rilevare l'URL del backend
    detectBackendUrl() {
      // Controlla prima se c'è un URL salvato nelle preferenze dell'utente
      const savedBackendUrl = localStorage.getItem("preferredBackendUrl");
      if (savedBackendUrl) {
        this.backendUrl = savedBackendUrl;
        return;
      }

      // Altrimenti, prova a determinare l'ambiente
      const hostname = window.location.hostname;

      // Se siamo su GitHub Codespaces
      if (
        hostname.includes("github.dev") ||
        hostname.includes("githubpreview.dev")
      ) {
        this.backendUrl = this.backendUrlOptions.codespaces;
      } else {
        // Altrimenti, prova la connessione locale
        this.testBackendConnection();
      }
    },

    // Prova a connettersi al backend locale, altrimenti usa Codespaces
    async testBackendConnection() {
      try {
        // Prova prima la connessione locale
        const response = await fetch(
          `${this.backendUrlOptions.local}/api/status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // Timeout breve per non bloccare l'interfaccia
            signal: AbortSignal.timeout(2000),
          }
        );

        if (response.ok) {
          console.log("Connessione locale riuscita");
          this.backendUrl = this.backendUrlOptions.local;
        } else {
          throw new Error("Connessione locale fallita");
        }
      } catch (error) {
        console.log("Fallback su URL Codespaces:", error);
        this.backendUrl = this.backendUrlOptions.codespaces;
      }

      // Salva la preferenza per future visite
      localStorage.setItem("preferredBackendUrl", this.backendUrl);
    },

    // Metodo per cambiare manualmente l'URL del backend
    switchBackendUrl(type) {
      this.backendUrl = this.backendUrlOptions[type];
      localStorage.setItem("preferredBackendUrl", this.backendUrl);
      console.log(`Backend URL cambiato a: ${this.backendUrl}`);
    },

    // Updated register method
    async register() {
      this.registerError = "";
      this.isLoading = true;

      try {
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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.registerData.email)) {
          throw new Error("Invalid email format");
        }

        // Check if email is already in use (in local storage)
        const usersJSON = localStorage.getItem("serenity_users") || "[]";
        let users = JSON.parse(usersJSON);

        const existingUser = users.find(
          (user) => user.email === this.registerData.email
        );
        if (existingUser) {
          throw new Error("Email already in use");
        }

        // Create new user object
        const newUser = {
          _id: Date.now().toString(),
          name: this.registerData.name,
          email: this.registerData.email,
          password: this.registerData.password,
          authProvider: "local",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        };

        // Add user to local storage database
        users.push(newUser);
        localStorage.setItem("serenity_users", JSON.stringify(users));

        console.log("User registered locally:", newUser);

        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;

        // Show success animation
        this.createConfetti();

        // Store user data
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));

        // Update UI
        this.isAuthenticated = true;
        this.loggedInUser = userWithoutPassword.email;

        // Navigate to dashboard
        this.$router.push("/dashboard-page");
      } catch (err) {
        console.error("Registration error:", err);
        this.registerError =
          err.message || "Registration failed. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    // Updated login method
    async login() {
      this.loginError = "";
      this.isLoading = true;

      try {
        console.log("Attempting login with:", {
          email: this.loginData.email,
          password: "[HIDDEN]",
        });

        // Validate required fields
        if (!this.loginData.email || !this.loginData.password) {
          throw new Error("Email and password are required");
        }

        // Get users from local storage
        const usersJSON = localStorage.getItem("serenity_users") || "[]";
        const users = JSON.parse(usersJSON);

        // Find user by email
        const user = users.find((user) => user.email === this.loginData.email);

        // Check if user exists
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check password
        if (user.password !== this.loginData.password) {
          throw new Error("Invalid email or password");
        }

        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;

        console.log("Login successful:", userWithoutPassword);

        // Store user data based on remember me preference
        if (this.rememberMe) {
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        } else {
          sessionStorage.setItem("user", JSON.stringify(userWithoutPassword));
        }

        // Update UI
        this.isAuthenticated = true;
        this.loggedInUser = userWithoutPassword.email;

        // Navigate to dashboard
        this.$router.push("/dashboard-page");
      } catch (err) {
        console.error("Login error:", err);
        this.loginError = err.message || "Login failed. Please try again.";
      } finally {
        this.isLoading = false;
      }
    },

    // Corrected loginWithGoogle method
    loginWithGoogle() {
      this.loginError = "";
      this.isLoading = true;

      // Create a Google OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const clientId =
        "918102923184-5tg9cgba9m9m64moj6njkodndu148iel.apps.googleusercontent.com"; // Your client ID

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: "http://localhost:5001",
        response_type: "token",
        scope: "email profile openid",
        prompt: "select_account",
      });

      const popup = window.open(
        `${googleAuthUrl}?${params.toString()}`,
        "Google Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll the popup to check when it's redirected
      const pollTimer = window.setInterval(() => {
        try {
          // Check if we can access the popup location
          if (popup.closed) {
            window.clearInterval(pollTimer);
            this.isLoading = false;
            return;
          }

          const url = popup.location.href;

          if (url.includes("access_token")) {
            window.clearInterval(pollTimer);
            popup.close();

            // Extract the access token
            const hashParams = new URLSearchParams(url.split("#")[1]);
            const accessToken = hashParams.get("access_token");

            // Get user info from Google API
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
              .then((res) => res.json())
              .then((googleUser) => {
                console.log("Google user info:", googleUser);

                // WORKAROUND: Skip backend call and use Google data directly
                const userData = {
                  _id: googleUser.sub, // Use Google's ID as our ID
                  email: googleUser.email,
                  name: googleUser.name,
                  googleId: googleUser.sub,
                  picture: googleUser.picture,
                  authProvider: "google",
                  isAdmin: false,
                };

                console.log("Using Google data directly due to CORS issues");

                // Store user data
                localStorage.setItem("user", JSON.stringify(userData));

                // Update state
                this.isAuthenticated = true;
                this.loggedInUser = userData.email;

                // Show success message
                this.createConfetti();

                // Navigate to dashboard
                this.$router.push("/dashboard-page");
              })
              .catch((error) => {
                console.error("Google login error:", error);
                this.loginError = "Failed to login with Google";
                this.isLoading = false;
              });
          }
        } catch (e) {
          // Likely a cross-origin error when trying to access popup.location
          // This is normal and we just continue polling
        }
      }, 500);
    },

    // Similarly update your registerWithGoogle method
    registerWithGoogle() {
      // Check terms agreement first
      if (!this.agreeToTerms) {
        this.registerError =
          "You must agree to the Terms of Service and Privacy Policy";
        return;
      }

      this.registerError = "";
      this.isLoading = true;

      // Create a Google OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const clientId =
        "918102923184-5tg9cgba9m9m64moj6njkodndu148iel.apps.googleusercontent.com"; // Your client ID

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: "http://localhost:5001",
        response_type: "token",
        scope: "email profile openid",
        prompt: "select_account",
      });

      const popup = window.open(
        `${googleAuthUrl}?${params.toString()}`,
        "Google Signup",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll the popup to check when it's redirected
      const pollTimer = window.setInterval(() => {
        try {
          // Check if we can access the popup location
          if (popup.closed) {
            window.clearInterval(pollTimer);
            this.isLoading = false;
            return;
          }

          const url = popup.location.href;

          if (url.includes("access_token")) {
            window.clearInterval(pollTimer);
            popup.close();

            // Extract the access token
            const hashParams = new URLSearchParams(url.split("#")[1]);
            const accessToken = hashParams.get("access_token");

            // Get user info from Google API
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
              .then((res) => res.json())
              .then((googleUser) => {
                console.log("Google user info:", googleUser);

                // WORKAROUND: Skip backend call and use Google data directly
                const userData = {
                  _id: googleUser.sub, // Use Google's ID as our ID
                  email: googleUser.email,
                  name: googleUser.name,
                  googleId: googleUser.sub,
                  picture: googleUser.picture,
                  authProvider: "google",
                  isAdmin: false,
                  createdAt: new Date().toISOString(),
                };

                console.log("Using Google data directly due to CORS issues");

                // Store user data
                localStorage.setItem("user", JSON.stringify(userData));

                // Update state
                this.isAuthenticated = true;
                this.loggedInUser = userData.email;

                // Show success message
                this.createConfetti();

                // Navigate to dashboard
                this.$router.push("/dashboard-page");
              })
              .catch((error) => {
                console.error("Google signup error:", error);
                this.registerError = "Failed to sign up with Google";
                this.isLoading = false;
              });
          }
        } catch (e) {
          // Likely a cross-origin error when trying to access popup.location
          // This is normal and we just continue polling
        }
      }, 500);
    },
    logout() {
      // Clear stored user data
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Update UI
      this.isAuthenticated = false;
      this.loggedInUser = null;

      // Redirect to home
      if (this.$route.path !== "/") {
        this.$router.push("/");
      }
    },

    navigateToDashboard() {
      this.$router.push("/dashboard-page");
    },

    createConfetti() {
      // Simple confetti effect - in a real app, you might use a library
      console.log("Success! 🎉");
    },

    // Metodo per gestire problemi di connessione al backend
    handleConnectionError() {
      // Mostra un messaggio all'utente
      this.loginError =
        "Problema di connessione al server. Prova a cambiare modalità di connessione.";

      // Offri la possibilità di cambiare URL del backend
      const currentType =
        this.backendUrl === this.backendUrlOptions.local
          ? "codespaces"
          : "local";
      const alternativeType =
        this.backendUrl === this.backendUrlOptions.local
          ? "codespaces"
          : "local";

      console.log(
        `Connessione a ${currentType} fallita. Prova a connetterti a ${alternativeType}`
      );

      // Opzionalmente, puoi implementare un popup o un pulsante per cambiare la connessione
    },
  },
  computed: {
    isBackendConnected() {
      return !!this.backendUrl;
    },
    connectionMode() {
      if (this.backendUrl === this.backendUrlOptions.local) {
        return "Connessione locale";
      } else if (this.backendUrl === this.backendUrlOptions.codespaces) {
        return "Connessione cloud (GitHub Codespaces)";
      } else {
        return "Non connesso";
      }
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

/* Auth container styling */
.auth-container {
  width: 100%;
  max-width: 450px;
}

.form-switch {
  display: flex;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 0.3rem;
}

.form-switch button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.8rem;
  color: white;
  font-size: 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-switch button.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.float-label {
  position: relative;
  margin-bottom: 1.5rem;
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

.remember-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
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
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #43e97b;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.remember-text {
  font-size: 0.9rem;
}

.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-password a {
  color: white;
  opacity: 0.8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.forgot-password a:hover {
  opacity: 1;
  text-decoration: underline;
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
  width: 100%;
}

button[type="submit"] {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
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

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.divider::before {
  margin-right: 0.5rem;
}

.divider::after {
  margin-left: 0.5rem;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.social-btn.google-btn {
  background-color: #fff;
  color: #1a1a1a;
  border-radius: 30px;
  width: auto;
  padding: 0.5rem 1.5rem;
  gap: 0.5rem;
}

.social-btn.google-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.social-btn svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.google-btn span {
  font-weight: 500;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 35px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
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
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.custom-checkbox:hover input ~ .checkmark {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-checkbox input:checked ~ .checkmark {
  background-color: #43e97b;
  border-color: #43e97b;
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
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox a {
  color: white;
  text-decoration: none;
}

.custom-checkbox a:hover {
  text-decoration: underline;
}

.password-strength {
  height: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: -1rem 0 1.5rem;
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

/* Success checkmark animation */
.success-checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
}

.check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4caf50;
}

.check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.check-icon::before,
.check-icon::after {
  content: "";
  height: 100px;
  position: absolute;
  background: transparent;
  transform: rotate(-45deg);
}

.check-icon .icon-line {
  height: 5px;
  background-color: #4caf50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.check-icon .icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.check-icon .icon-line.line-long {
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

/* Glow effect */
.glow {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* CTA button */
.cta-button {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

/* Language selector */
.language-selector {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;
}

.language-selector select {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  appearance: none;
  cursor: pointer;
  font-size: 0.9rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 30px;
}

.language-selector select:focus {
  outline: none;
  border-color: white;
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

  .social-login {
    flex-wrap: wrap;
  }

  .social-btn.google-btn {
    width: 100%;
    justify-content: center;
  }

  .language-selector {
    top: 0.5rem;
    right: 0.5rem;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .form-switch button {
    padding: 0.6rem;
  }
}
</style>

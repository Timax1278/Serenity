<template>
  <div class="login-container">
    <div class="login-box" v-if="!loading">
      <h1>Login</h1>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" :disabled="loading">Login</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>

    <!-- Indicatore di caricamento -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Logging in...</p>
    </div>

    <!-- Stelle generate casualmente -->
    <div class="stars-container" ref="starsContainer"></div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data () {
    return {
      email: '',
      password: '',
      errorMessage: '',
      loading: false
    }
  },
  mounted () {
    this.generateStars()
  },
  methods: {
    submitForm () {
      this.loading = true
      setTimeout(() => {
        if (this.email === 'test@example.com' && this.password === 'password') {
          alert('Login successful!')
          localStorage.setItem('user', JSON.stringify({ email: this.email }))
          this.$router.push('/dashboard')
        } else {
          this.errorMessage = 'Invalid email or password'
        }
        this.loading = false
      }, 2000)
    },
    generateStars () {
      const starContainer = this.$refs.starsContainer // Usare il ref per accedere al contenitore delle stelle
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        // Posizioni casuali
        star.style.top = `${Math.random() * 100}vh`
        star.style.left = `${Math.random() * 100}vw`
        // Dimensioni casuali
        star.style.width = `${Math.random() * 4 + 2}px`
        star.style.height = star.style.width // Mantiene la proporzione
        star.style.animationDelay = `${Math.random() * 2}s` // Ritardo casuale per l'animazione
        starContainer.appendChild(star)
      }
    }
  }
}
</script>

<style scoped>
/* Container principale con sfondo animato tipo galassia con stelle */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative; /* Posizione relativa per le stelle */
  overflow: hidden; /* Nasconde eventuali elementi che fuoriescono */
  background: radial-gradient(circle, rgba(144, 98, 210, 1) 0%, rgba(10, 10, 30, 1) 70%);
}

/* Stelle animate */
.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: twinkle 1.5s infinite alternate;
}

@keyframes twinkle {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Container delle stelle */
.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Non interferire con i click degli input */
}

/* Box login con animazione di apparizione */
.login-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: all 0.3s;
}

input:focus {
  border-color: #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.5);
  outline: none;
  transform: scale(1.02);
}

button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #35a773;
  transform: scale(1.05);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:disabled:hover {
  transform: none;
}

.error {
  color: red;
  margin-top: 10px;
}

/* Spinner di caricamento */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #42b983;
  border-radius: 50%;
  width: 60px;
  height: 60px;
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

.loading-spinner p {
  margin-top: 10px;
  font-size: 18px;
  color: white;
}

/* Responsive design per schermi più piccoli */
@media (max-width: 600px) {
  .login-box {
    padding: 20px;
  }

  button {
    font-size: 16px;
  }
}

@media (max-width: 400px) {
  h1 {
    font-size: 24px;
  }

  button {
    padding: 10px;
    font-size: 14px;
  }
}
</style>

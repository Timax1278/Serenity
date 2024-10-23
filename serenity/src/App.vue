<template>
  <div id="app">
    <nav>
      <div class="logo">Serenity App</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/login" class="nav-link">Login</router-link>
        <router-link to="/register" class="nav-link">Register</router-link>
      </div>
    </nav>
    <router-view /> <!-- Questo visualizza le pagine corrispondenti alle rotte -->
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #fff;
  background: linear-gradient(to right, #6a5acd, #7b68ee); /* Gradient background */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); /* Shadow effect */
  position: sticky; /* Keep nav at the top */
  top: 0;
  z-index: 1000; /* Ensure it stays above other content */
}

.logo {
  font-size: 1.5em;
  font-weight: bold;
  color: #42b983; /* Logo color */
}

.nav-links {
  display: flex;
  gap: 15px; /* Space between links */
}

.nav-link {
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  padding: 10px 15px; /* Padding around links */
  border-radius: 5px; /* Rounded corners */
  transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition */
}

.nav-link:hover {
  background-color: rgba(66, 185, 131, 0.7); /* Hover effect */
  transform: translateY(-2px); /* Slight lift effect on hover */
}

.nav-link.router-link-exact-active {
  background-color: rgba(66, 185, 131, 0.9); /* Active link style */
  color: white; /* Active link text color */
}
</style>

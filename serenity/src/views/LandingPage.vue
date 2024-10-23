<template>
    <div class="landing-page">
      <h1>Benvenuto nel nostro sito!</h1>
      <p>Seleziona un'opzione per continuare:</p>
      <div class="button-container">
        <router-link to="/login" class="button">Login</router-link>
        <router-link to="/register" class="button">Registrati</router-link>
      </div>
    </div>
  </template>

  <style scoped>
  .landing-page {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to bottom right, #7b68ee, #6a5acd); /* Gradient background */
    color: white;
    text-align: center;
  }

  .button-container {
    margin-top: 20px;
  }

  .button {
    background-color: #42b983;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    margin: 0 10px;
    transition: background-color 0.3s ease;
  }

  .button:hover {
    background-color: #367d61; /* Darker shade on hover */
  }
  </style>

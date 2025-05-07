<template>
  <div id="app">
    <!--
    <header v-if="isAuthenticated">  <-- Inizio blocco commentato
      <nav>
        <router-link to="/">Home Page</router-link> |
        <router-link to="/dashboard-page">Dashboard Page</router-link> |
        <router-link to="/groups-page">Groups Page</router-link> |
        <router-link to="/meditation-library">Meditation Library</router-link> |
        <router-link to="/appointments-page">Appointments Page</router-link> |
        <router-link to="/user-profile">User Profile</router-link> |
        <router-link to="/shop-page">Shop Page</router-link>
        <span v-if="isAdmin">
          | <router-link to="/admin-dashboard">Admin Dashboard</router-link>
        </span>
        <span class="online-counter">Online Users: {{ onlineUsers }}</span>
        <button @click="logout" class="logout-btn">Logout</button>
      </nav>
    </header>  <-- Fine blocco commentato
    -->

    <main>
      <router-view />
      <!-- Qui vengono caricate le tue pagine -->
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const store = useStore();
    const router = useRouter();

    // Queste computed properties sono ancora utili se le usi per altre logiche
    // o se in futuro aggiungerai una navigazione diversa
    const isAuthenticated = computed(
      () => store.getters["auth/isAuthenticated"]
    );
    // const isAdmin = computed(() => store.getters["auth/isAdmin"]); // Non più usato nel template
    // const onlineUsers = computed(
    //   () => store.getters["presence/getOnlineUsers"] // Non più usato nel template
    // );

    onMounted(() => {
      // La logica di presence potrebbe non essere più necessaria qui se non visualizzi gli utenti online
      if (isAuthenticated.value && store.hasModule("presence")) {
        // Controlla se il modulo esiste
        store.dispatch("presence/initSocketConnection").catch((err) => {
          console.warn(
            "Failed to init presence socket connection in App.vue:",
            err
          );
        });
      }
    });

    // Il metodo logout è ancora utile se hai un bottone di logout altrove
    // (es. nella pagina UserProfile)
    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/"); // O la tua pagina di login/home
    };

    return {
      // Non esponiamo più isAdmin e onlineUsers se non usati nel template
      isAuthenticated, // Potrebbe servire per altre logiche globali
      logout, // Utile se hai un bottone logout in un'altra parte dell'app
    };
  },
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  background-color: #f4f7fc; /* Puoi cambiare lo sfondo globale qui se vuoi */
  color: #2c3e50;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/*
// Stili per l'header commentati, puoi rimuoverli se non ti servono più
header {
  background-color: #3498db;
  padding: 1rem;
  color: white;
}

nav {
  display: flex;
  align-items: center;

  a {
    color: white;
    text-decoration: none;
    padding: 0 1rem;

    &:hover {
      font-weight: bold;
    }
  }

  .online-counter {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: white;
    font-size: 0.875rem;
  }

  .logout-btn {
    margin-left: 1rem;
    padding: 0.25rem 0.75rem;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}
*/

main {
  flex-grow: 1;
  /* Potresti voler rimuovere o modificare il padding se la barra non c'è più */
  /* Esempio: padding: 0; se vuoi che le pagine occupino tutto lo spazio */
  /* Oppure un padding diverso: padding: 1rem; */
  padding: 2rem; /* Mantenuto per ora */
  background-color: #fff; /* Questo potrebbe non essere più desiderato se hai sfondi per pagina */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Anche questo potrebbe non servire più */
  border-radius: 10px; /* E questo */
}

/*
// Stile globale per h1, puoi decidere se mantenerlo o spostarlo in stili più specifici
h1 {
  color: #3498db;
  margin-bottom: 1.5rem;
}
*/
</style>

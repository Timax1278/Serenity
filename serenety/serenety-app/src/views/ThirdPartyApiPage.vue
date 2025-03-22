<template>
  <div class="api-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <div class="glass main-container">
      <h1>Citazioni Inspirazionali</h1>

      <div class="back-link">
        <router-link to="/dashboard-page">← Torna alla Dashboard</router-link>
      </div>
      <!-- Selettore del tipo di citazione -->
      <div class="category-selector">
        <button
          @click="setQuoteType('any')"
          :class="{ active: quoteType === 'any' }"
          class="category-btn"
        >
          Tutte le citazioni
        </button>
        <button
          @click="setQuoteType('motivational')"
          :class="{ active: quoteType === 'motivational' }"
          class="category-btn"
        >
          Motivazionali
        </button>
        <button
          @click="setQuoteType('wisdom')"
          :class="{ active: quoteType === 'wisdom' }"
          class="category-btn"
        >
          Saggezza
        </button>
      </div>

      <!-- Contenitore della citazione -->
      <div
        class="quote-container"
        :class="{ 'fade-in': !loadingQuote && quote }"
      >
        <div v-if="loadingQuote" class="loading-animation">
          <div class="spinner"></div>
          <p>Ricerca della saggezza...</p>
        </div>

        <div v-else-if="quoteError" class="error shake">
          <p>{{ quoteError }}</p>
          <small>Verifica la tua connessione.</small>
        </div>

        <div
          v-else-if="quote"
          class="quote-card"
          :class="{ pulse: newQuoteLoaded }"
        >
          <div class="quote-header">
            <div class="quote-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
                  fill="rgba(100, 255, 218, 0.6)"
                />
              </svg>
            </div>
            <div class="quote-date">
              {{ getCurrentDate() }}
            </div>
          </div>

          <div class="quote-content">
            <p class="quote-text">{{ quote.content }}</p>
            <p class="quote-author">— {{ quote.author }}</p>
          </div>

          <div class="quote-tags">
            <span v-for="tag in quote.tags" :key="tag" class="quote-tag">
              #{{ tag }}
            </span>
          </div>
        </div>

        <div v-else class="empty-quote">
          <p>Premi il pulsante per generare una citazione</p>
        </div>
      </div>

      <!-- Pulsante per generare citazione -->
      <div class="quote-actions">
        <button
          @click="fetchQuote"
          class="generate-btn"
          :disabled="loadingQuote"
          :class="{ loading: loadingQuote }"
        >
          <span class="btn-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span class="btn-text">{{
            loadingQuote ? "Generazione..." : "Nuova Citazione"
          }}</span>
        </button>

        <button
          v-if="quote"
          @click="copyToClipboard"
          class="copy-btn"
          :class="{ copied: copied }"
        >
          <span class="btn-icon">
            <svg
              v-if="!copied"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"
                fill="currentColor"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span class="btn-text">{{ copied ? "Copiato!" : "Copia" }}</span>
        </button>
      </div>

      <!-- Storia delle citazioni -->
      <div v-if="quoteHistory.length > 0" class="quote-history">
        <h2>Citazioni Precedenti</h2>
        <div class="history-list">
          <div
            v-for="(historyQuote, index) in quoteHistory"
            :key="index"
            class="history-item"
            @click="restoreQuote(historyQuote)"
          >
            <p class="history-text">
              {{ historyQuote.content.substring(0, 70)
              }}{{ historyQuote.content.length > 70 ? "..." : "" }}
            </p>
            <p class="history-author">— {{ historyQuote.author }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Version badge -->
    <div class="version-badge">v1.0.0</div>
  </div>
</template>
<script>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

export default {
  name: "ThirdPartyApiPage",
  setup() {
    const quote = ref(null);
    const loadingQuote = ref(false);
    const quoteError = ref(null);
    const quoteHistory = ref([]);
    const newQuoteLoaded = ref(false);
    const copied = ref(false);
    const quoteType = ref("any"); // 'motivational', 'wisdom', 'any'

    // Chiave API fissa inserita direttamente nel codice
    const API_KEY = "eDqrIYkmabQwRHqBkTJiZA==ZkF1iiPTN3bl6XR6";

    // Parole chiave per categorizzare le citazioni
    const motivationalKeywords = [
      "success",
      "achieve",
      "dream",
      "goal",
      "inspire",
      "motivate",
      "courage",
      "hope",
      "believe",
      "future",
      "opportunity",
      "challenge",
      "overcome",
      "strength",
      "determination",
      "perseverance",
      "improve",
    ];

    const wisdomKeywords = [
      "wisdom",
      "knowledge",
      "learn",
      "understand",
      "truth",
      "insight",
      "experience",
      "mind",
      "thought",
      "philosophy",
      "soul",
      "reflection",
      "peace",
      "enlightenment",
      "awareness",
      "consciousness",
      "mindfulness",
    ];

    // Funzione per determinare il tipo di citazione in base al contenuto
    const categorizeQuote = (text) => {
      text = text.toLowerCase();

      // Controlla parole chiave motivazionali
      for (const keyword of motivationalKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return "motivational";
        }
      }

      // Controlla parole chiave di saggezza
      for (const keyword of wisdomKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return "wisdom";
        }
      }

      return "other";
    };

    // Funzione per impostare il tipo di citazione desiderato
    const setQuoteType = (type) => {
      quoteType.value = type;
      fetchQuote();
    };

    const fetchQuote = async () => {
      loadingQuote.value = true;
      quoteError.value = null;

      // Massimo numero di tentativi per trovare una citazione del tipo desiderato
      const maxAttempts = 5;
      let attempts = 0;
      let foundMatchingQuote = false;

      while (!foundMatchingQuote && attempts < maxAttempts) {
        attempts++;

        try {
          // Utilizziamo API Ninjas senza il parametro category (che è solo per premium)
          const response = await axios.get(
            "https://api.api-ninjas.com/v1/quotes",
            {
              headers: {
                "X-Api-Key": API_KEY,
              },
            }
          );

          console.log("Risposta API:", response.data);

          // API Ninjas restituisce un array, prendiamo il primo elemento
          const quoteData = response.data[0];

          // Categorizza la citazione in base al contenuto
          const category = categorizeQuote(quoteData.quote);

          // Se l'utente ha richiesto un tipo specifico di citazione,
          // verifica se corrisponde
          if (
            quoteType.value === "any" ||
            (quoteType.value === "motivational" &&
              category === "motivational") ||
            (quoteType.value === "wisdom" && category === "wisdom")
          ) {
            // Salva la citazione corrente nella cronologia se esiste
            if (quote.value) {
              quoteHistory.value.unshift(quote.value);
              // Mantieni solo le ultime 5 citazioni
              if (quoteHistory.value.length > 5) {
                quoteHistory.value.pop();
              }
            }

            // Adatta il formato per corrispondere alla struttura che usiamo
            quote.value = {
              content: quoteData.quote,
              author: quoteData.author,
              tags: [category],
            };

            foundMatchingQuote = true;

            // Attiva l'animazione di pulse
            newQuoteLoaded.value = true;
            setTimeout(() => {
              newQuoteLoaded.value = false;
            }, 1000);

            console.log("Citazione ricevuta:", quote.value);
          } else {
            console.log(
              `Citazione non corrisponde al tipo richiesto (${quoteType.value}), riprovo...`
            );
            // Continuiamo il ciclo per trovare una citazione del tipo desiderato
          }
        } catch (err) {
          console.error("Errore durante il caricamento della citazione:", err);

          // Messaggio di errore più specifico
          if (err.response) {
            quoteError.value = `Errore API (${err.response.status}): ${
              err.response.data?.message || "Errore nella richiesta"
            }`;
            console.log("Dettagli errore:", err.response.data);
          } else if (err.request) {
            quoteError.value =
              "Nessuna risposta dal server. Verifica la tua connessione internet.";
          } else {
            quoteError.value = `Errore: ${err.message}`;
          }

          // Interrompiamo il ciclo in caso di errore
          break;
        }
      }

      // Se non abbiamo trovato una citazione del tipo desiderato dopo vari tentativi
      if (!foundMatchingQuote && !quoteError.value) {
        quoteError.value = `Non è stato possibile trovare una citazione "${quoteType.value}" dopo ${maxAttempts} tentativi. Riprova.`;
      }

      loadingQuote.value = false;
    };

    const restoreQuote = (historyQuote) => {
      // Rimuovi dalla storia
      quoteHistory.value = quoteHistory.value.filter((q) => q !== historyQuote);

      // Salva la citazione corrente nella cronologia
      if (quote.value) {
        quoteHistory.value.unshift(quote.value);
        // Mantieni solo le ultime 5 citazioni
        if (quoteHistory.value.length > 5) {
          quoteHistory.value.pop();
        }
      }

      // Imposta la citazione selezionata come corrente
      quote.value = historyQuote;

      // Attiva l'animazione di pulse
      newQuoteLoaded.value = true;
      setTimeout(() => {
        newQuoteLoaded.value = false;
      }, 1000);
    };

    const copyToClipboard = () => {
      if (!quote.value) return;

      const textToCopy = `"${quote.value.content}" — ${quote.value.author}`;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          copied.value = true;
          setTimeout(() => {
            copied.value = false;
          }, 2000);
        })
        .catch((err) => {
          console.error("Errore nella copia: ", err);
        });
    };

    const getCurrentDate = () => {
      return new Date().toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Carica una citazione all'avvio
    onMounted(() => {
      // Non carichiamo automaticamente la prima citazione
      // L'utente dovrà cliccare il pulsante
    });

    // Resetta lo stato di copia quando cambia la citazione
    watch(quote, () => {
      copied.value = false;
    });

    return {
      quote,
      loadingQuote,
      quoteError,
      quoteHistory,
      newQuoteLoaded,
      copied,
      quoteType,
      fetchQuote,
      setQuoteType,
      restoreQuote,
      copyToClipboard,
      getCurrentDate,
    };
  },
};
</script>
<style scoped>
.api-page {
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
  max-width: 800px;
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

h2 {
  color: #64ffda;
  margin: 2rem 0 1rem;
  text-align: center;
  font-size: 1.5rem;
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

/* Contenitore della citazione */
.quote-container {
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  transition: opacity 0.5s;
}

.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.quote-card {
  width: 100%;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.category-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.5rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.category-btn.active {
  background: rgba(100, 255, 218, 0.2);
  border-color: rgba(100, 255, 218, 0.5);
  color: #64ffda;
}

.quote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.03);
  }
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.quote-icon svg {
  width: 32px;
  height: 32px;
}

.quote-date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.quote-content {
  margin-bottom: 1.5rem;
}

.quote-text {
  font-size: 1.5rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-style: italic;
  position: relative;
}

.quote-author {
  font-size: 1.1rem;
  text-align: right;
  color: #64ffda;
}

.quote-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quote-tag {
  background: rgba(100, 255, 218, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s;
}

.quote-tag:hover {
  background: rgba(100, 255, 218, 0.2);
  transform: translateY(-2px);
}

.empty-quote {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Pulsanti */
.quote-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.generate-btn,
.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.generate-btn {
  background: linear-gradient(135deg, #64ffda, #1de9b6);
  color: #1a237e;
  min-width: 180px;
}

.generate-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(100, 255, 218, 0.3);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.generate-btn.loading {
  position: relative;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.copy-btn.copied {
  background: rgba(46, 204, 113, 0.3);
  border-color: rgba(46, 204, 113, 0.5);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Storia delle citazioni */
.quote-history {
  margin-top: 3rem;
}

.history-list {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.history-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.history-text {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
}

.history-author {
  font-size: 0.8rem;
  text-align: right;
  color: #64ffda;
}

/* Loading animation */
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

  .quote-text {
    font-size: 1.2rem;
  }

  .quote-actions {
    flex-direction: column;
  }

  .generate-btn,
  .copy-btn {
    width: 100%;
  }

  .history-list {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.8rem;
  }
}

/* Accessibility focus styles */
.a11y-focus:focus {
  outline: 2px solid #64ffda;
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .api-page {
    background: linear-gradient(135deg, #0d1117, #161b22);
  }
}
</style>

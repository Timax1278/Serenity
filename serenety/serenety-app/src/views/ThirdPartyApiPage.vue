<template>
  <div class="profile-page quote-page">
    <!-- Background elements -->
    <ul class="circles">
      <li v-for="n in 10" :key="n"></li>
    </ul>

    <!-- Brand logo -->
    <div class="brand">
      <div class="brand-icon"></div>
      <div class="brand-text">Serenity</div>
    </div>

    <h1 class="typewriter">Inspirational Quotes</h1>
    <p>Discover wisdom and motivation for your mindfulness journey</p>

    <div class="glass main-container">
      <div class="back-link">
        <router-link to="/dashboard-page">
          <span class="back-arrow">←</span> Return to Dashboard
        </router-link>
      </div>

      <!-- Category selector -->
      <div class="category-selector">
        <button
          @click="setQuoteType('any')"
          :class="{ active: quoteType === 'any' }"
          class="category-btn"
        >
          All Quotes
        </button>
        <button
          @click="setQuoteType('motivational')"
          :class="{ active: quoteType === 'motivational' }"
          class="category-btn"
        >
          Motivational
        </button>
        <button
          @click="setQuoteType('wisdom')"
          :class="{ active: quoteType === 'wisdom' }"
          class="category-btn"
        >
          Wisdom
        </button>
      </div>

      <!-- Quote container -->
      <div
        class="quote-container"
        :class="{ 'fade-in': !loadingQuote && quote }"
      >
        <div v-if="loadingQuote" class="loading-animation">
          <div class="spinner"></div>
          <p>Searching for wisdom...</p>
        </div>

        <div v-else-if="quoteError" class="error shake">
          <p>{{ quoteError }}</p>
          <small>Please check your connection.</small>
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
          <p>Press the button to generate a quote</p>
        </div>
      </div>

      <!-- Quote actions -->
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
            loadingQuote ? "Generating..." : "New Quote"
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
          <span class="btn-text">{{ copied ? "Copied!" : "Copy" }}</span>
        </button>
      </div>

      <!-- Quote history -->
      <div v-if="quoteHistory.length > 0" class="quote-history">
        <h2>Previous Quotes</h2>
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
import { ref, onMounted } from "vue";
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

    // Fixed API key
    const API_KEY = "eDqrIYkmabQwRHqBkTJiZA==ZkF1iiPTN3bl6XR6";

    // Keywords to categorize quotes
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

    // Function to determine quote type based on content
    const categorizeQuote = (text) => {
      text = text.toLowerCase();

      // Check motivational keywords
      for (const keyword of motivationalKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return "motivational";
        }
      }

      // Check wisdom keywords
      for (const keyword of wisdomKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return "wisdom";
        }
      }

      return "other";
    };

    // Function to set the desired quote type
    const setQuoteType = (type) => {
      quoteType.value = type;
      fetchQuote();
    };

    const fetchQuote = async () => {
      loadingQuote.value = true;
      quoteError.value = null;

      // Maximum number of attempts to find a quote of the desired type
      const maxAttempts = 5;
      let attempts = 0;
      let foundMatchingQuote = false;

      while (!foundMatchingQuote && attempts < maxAttempts) {
        attempts++;

        try {
          // Use API Ninjas without category parameter (premium only)
          const response = await axios.get(
            "https://api.api-ninjas.com/v1/quotes",
            {
              headers: {
                "X-Api-Key": API_KEY,
              },
            }
          );

          console.log("API Response:", response.data);

          // API Ninjas returns an array, take the first element
          const quoteData = response.data[0];

          // Categorize the quote based on content
          const category = categorizeQuote(quoteData.quote);

          // If the user requested a specific type of quote,
          // check if it matches
          if (
            quoteType.value === "any" ||
            (quoteType.value === "motivational" &&
              category === "motivational") ||
            (quoteType.value === "wisdom" && category === "wisdom")
          ) {
            // Save current quote to history if it exists
            if (quote.value) {
              quoteHistory.value.unshift(quote.value);
              // Keep only the last 5 quotes
              if (quoteHistory.value.length > 5) {
                quoteHistory.value.pop();
              }
            }

            // Adapt format to match our structure
            quote.value = {
              content: quoteData.quote,
              author: quoteData.author,
              tags: [category],
            };

            foundMatchingQuote = true;

            // Activate pulse animation
            newQuoteLoaded.value = true;
            setTimeout(() => {
              newQuoteLoaded.value = false;
            }, 1000);

            console.log("Quote received:", quote.value);
          } else {
            console.log(
              `Quote doesn't match requested type (${quoteType.value}), retrying...`
            );
            // Continue the loop to find a quote of the desired type
          }
        } catch (err) {
          console.error("Error loading quote:", err);

          // More specific error message
          if (err.response) {
            quoteError.value = `API Error (${err.response.status}): ${
              err.response.data?.message || "Request error"
            }`;
            console.log("Error details:", err.response.data);
          } else if (err.request) {
            quoteError.value =
              "No response from server. Check your internet connection.";
          } else {
            quoteError.value = `Error: ${err.message}`;
          }

          // Break the loop in case of error
          break;
        }
      }

      // If we didn't find a quote of the desired type after several attempts
      if (!foundMatchingQuote && !quoteError.value) {
        quoteError.value = `Unable to find a "${quoteType.value}" quote after ${maxAttempts} attempts. Please try again.`;
      }

      loadingQuote.value = false;
    };

    const restoreQuote = (historyQuote) => {
      // Remove from history
      quoteHistory.value = quoteHistory.value.filter((q) => q !== historyQuote);

      // Save current quote to history
      if (quote.value) {
        quoteHistory.value.unshift(quote.value);
        // Keep only the last 5 quotes
        if (quoteHistory.value.length > 5) {
          quoteHistory.value.pop();
        }
      }

      // Set the selected history quote as current
      quote.value = historyQuote;
    };

    const copyToClipboard = () => {
      if (!quote.value) return;

      const textToCopy = `"${quote.value.content}" — ${quote.value.author}`;

      navigator.clipboard.writeText(textToCopy).then(
        () => {
          copied.value = true;
          setTimeout(() => {
            copied.value = false;
          }, 2000);
        },
        (err) => {
          console.error("Could not copy text: ", err);
        }
      );
    };

    const getCurrentDate = () => {
      const now = new Date();
      return now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Fetch a quote on component mount
    onMounted(() => {
      fetchQuote();
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
  max-width: 800px;
  margin-bottom: 2rem;
  position: relative;
}

/* Quote page specific styles */
.quote-page .main-container {
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

/* Category selector */
.category-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.category-btn.active {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

/* Quote container */
.quote-container {
  margin-bottom: 2rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  padding: 1rem;
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
}

.error small {
  display: block;
  margin-top: 0.5rem;
  opacity: 0.8;
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

.empty-quote {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

/* Quote card */
.quote-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pulse {
  animation: pulse 1s;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.quote-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.5);
  opacity: 0.8;
}

.quote-date {
  font-size: 0.9rem;
  opacity: 0.7;
}

.quote-content {
  margin-bottom: 1.5rem;
}

.quote-text {
  font-size: 1.3rem;
  line-height: 1.6;
  font-style: italic;
  margin-bottom: 1rem;
}

.quote-author {
  text-align: right;
  font-size: 1.1rem;
  opacity: 0.8;
}

.quote-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quote-tag {
  background: rgba(100, 255, 218, 0.2);
  color: rgba(100, 255, 218, 0.9);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* Quote actions */
.quote-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
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
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.generate-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.copy-btn.copied {
  background: rgba(100, 255, 218, 0.3);
  color: rgba(100, 255, 218, 1);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Quote history */
.quote-history {
  margin-top: 1rem;
}

.quote-history h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.history-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.history-text {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.history-author {
  text-align: right;
  font-size: 0.8rem;
  opacity: 0.7;
  margin: 0;
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

  .category-selector {
    flex-direction: column;
  }

  .category-btn {
    width: 100%;
  }

  .quote-text {
    font-size: 1.1rem;
  }

  .quote-actions {
    flex-direction: column;
  }

  .generate-btn,
  .copy-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .quote-card {
    padding: 1.5rem;
  }

  .quote-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .quote-date {
    align-self: flex-end;
  }
}
</style>

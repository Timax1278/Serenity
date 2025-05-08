<template>
  <div class="meditation-library">
    <h1>Meditation Library</h1>

    <!-- Filtri per Tag -->
    <div class="filters" v-if="genres && genres.length > 0 && !isLoading">
      <span>Filter by Tag:</span>
      <button @click="filterByTag(null)" :class="{ active: !selectedTag }">
        All
      </button>
      <button
        v-for="tag in genres"
        :key="tag"
        @click="filterByTag(tag)"
        :class="{ active: selectedTag === tag }"
      >
        {{ tag }}
      </button>
    </div>
    <!-- ... placeholder ... -->

    <!-- Stato di Caricamento ed Errori -->
    <div v-if="isLoading" class="loading-indicator">Loading tracks...</div>
    <div v-if="error" class="error-message">
      Error loading tracks: {{ error }}. Please try again later.
      <button @click="retryFetch">Retry</button>
    </div>

    <!-- Lista delle Tracce -->
    <!-- Log della condizione v-if -->
    <!-- <p style="background: lightcyan; padding: 5px;">[DEBUG TEMPLATE] isLoading: {{isLoading}}, tracks.length: {{tracks?.length}}, error: {{error}}</p> -->
    <div class="track-list" v-if="!isLoading && tracks && tracks.length > 0">
      <!-- Log interno al v-if -->
      <!-- <p style="background: lightgreen; padding: 5px;">[DEBUG TEMPLATE] Rendering track list...</p> -->
      <div
        v-for="track in tracks"
        :key="track._id"
        class="track-item"
        @click="selectTrack(track)"
      >
        <img
          :src="track.coverArtUrl || '/images/covers/default.png'"
          alt="Waveform or Cover"
          class="cover-art"
        />
        <div class="track-info">
          <h2>{{ track.title }}</h2>
          <p>by {{ track.artist }}</p>
          <span
            >{{ formatDuration(track.duration) }} |
            {{ track.genre || "N/A" }}</span
          >
          <p class="license-info" v-if="track.license">
            License:
            <a
              :href="track.license"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >{{ getLicenseName(track.license) }}</a
            >
          </p>
        </div>
        <span
          v-if="currentTrack?._id === track._id && isPlaying"
          class="playing-indicator"
          >▶️ Playing</span
        >
        <span
          v-else-if="currentTrack?._id === track._id"
          class="playing-indicator"
          >⏹️ Selected</span
        >
      </div>
    </div>
    <!-- Modificato v-else-if per mostrare anche se tracks è vuoto dopo il caricamento senza errori -->
    <p v-else-if="!isLoading && !error && tracks && tracks.length === 0">
      No tracks found matching your criteria.
    </p>
    <p v-else-if="!isLoading && !error && !tracks">
      [DEBUG TEMPLATE] Tracks array is unexpectedly null or undefined after
      loading.
    </p>

    <!-- Componente Player Audio -->
    <AudioPlayer />
  </div>
</template>

<script setup>
// --- AGGIUNTO watchEffect ---
import { ref, computed, onMounted, watchEffect } from "vue";
// ---------------------------
import { useStore } from "vuex";
import AudioPlayer from "@/components/AudioPlayer.vue";

const store = useStore();
const selectedTag = ref(null);

// Computed properties
const tracks = computed(() => store.getters["meditation/getAllTracks"]);
const genres = computed(() => store.getters["meditation/getGenres"]);
const currentTrack = computed(
  () => store.getters["meditation/getCurrentTrack"]
);
const isPlaying = computed(() => store.getters["meditation/isPlaying"]);
const isLoading = computed(() => store.getters["meditation/isLoading"]);
const error = computed(() => store.getters["meditation/getError"]);

// --- AGGIUNTO WATCHEFFECT PER LOGGING ---
watchEffect(() => {
  // Questo si attiverà ogni volta che una delle dipendenze (tracks, isLoading, error) cambia
  const trackCount = Array.isArray(tracks.value)
    ? tracks.value.length
    : "not an array";
  console.log(
    `[DEBUG MeditationLibrary WatchEffect] isLoading: ${isLoading.value}, error: ${error.value}, tracks count: ${trackCount}`
  );
  if (Array.isArray(tracks.value) && tracks.value.length > 0) {
    console.log(
      "[DEBUG MeditationLibrary WatchEffect] First track sample:",
      JSON.parse(JSON.stringify(tracks.value[0]))
    );
  }
  // Calcola la condizione del v-if principale
  const shouldShowList =
    !isLoading.value && tracks.value && tracks.value.length > 0;
  console.log(
    "[DEBUG MeditationLibrary WatchEffect] Calculated shouldShowList:",
    shouldShowList
  );
});
// --------------------------------------

// Azioni al montaggio
onMounted(() => {
  console.log("[MeditationLibrary Mounted] Fetching initial tracks...");
  store.dispatch("meditation/fetchMeditations");
});

// Funzioni
const selectTrack = (track) => {
  console.log("[MeditationLibrary] Track selected:", track.title);
  store.dispatch("meditation/selectTrack", track);
};

const filterByTag = (tag) => {
  console.log("[MeditationLibrary] Filtering by tag:", tag);
  selectedTag.value = tag;
  store.dispatch("meditation/fetchMeditations", tag ? { genre: tag } : {});
};

const retryFetch = () => {
  console.log("[MeditationLibrary] Retrying fetch meditations...");
  filterByTag(selectedTag.value);
};

const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0)
    return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const getLicenseName = (licenseUrl) => {
  if (!licenseUrl || typeof licenseUrl !== "string") return "Unknown License";
  if (licenseUrl.includes("/publicdomain/zero/")) return "CC0";
  if (licenseUrl.includes("/by/4.0/")) return "CC BY 4.0";
  if (licenseUrl.includes("/by/3.0/")) return "CC BY 3.0";
  if (licenseUrl.includes("/by-nc/")) return "CC BY-NC";
  if (licenseUrl.includes("creativecommons.org")) return "Creative Commons";
  return "Custom/Unknown";
};
</script>

<style scoped>
.meditation-library {
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

/* Background animation - reusing from main styles */
.meditation-library::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 10%,
    transparent 70%
  );
  z-index: 0;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Filters styling */
.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 900px;
  position: relative;
  z-index: 1;
}

.filters span {
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
  font-weight: 500;
}

.filters button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filters button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.filters button.active {
  background: rgba(67, 233, 123, 0.3);
  border-color: #43e97b;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3);
}

/* Loading and error states */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
}

.loading-indicator::after {
  content: "";
  width: 20px;
  height: 20px;
  margin-left: 10px;
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

.error-message {
  background: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  max-width: 600px;
  margin: 1rem auto;
  position: relative;
  z-index: 1;
}

.error-message button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-message button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Track list styling */
.track-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  position: relative;
  z-index: 1;
}

.track-item {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
}

.track-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(31, 38, 135, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.cover-art {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.track-info {
  padding: 1.2rem;
}

.track-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: white;
}

.track-info p {
  margin: 0.3rem 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.track-info span {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
}

.license-info {
  font-size: 0.8rem !important;
  margin-top: 0.8rem !important;
  color: rgba(255, 255, 255, 0.6) !important;
}

.license-info a {
  color: rgba(67, 233, 123, 0.9);
  text-decoration: none;
  transition: all 0.2s ease;
}

.license-info a:hover {
  color: rgba(67, 233, 123, 1);
  text-decoration: underline;
}

.playing-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(67, 233, 123, 0.8);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a1a1a;
}

/* Audio Player Component (basic styles assuming it has its own styling) */
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(26, 32, 58, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
  z-index: 100;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .meditation-library {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .track-list {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: center;
  }

  .filters span {
    margin-bottom: 0.5rem;
  }
}

/* Empty states */
.meditation-library p {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 2rem 0;
  max-width: 600px;
  position: relative;
  z-index: 1;
}
</style>

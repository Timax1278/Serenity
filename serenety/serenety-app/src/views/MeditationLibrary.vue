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
/* Stili (invariati, ma assicurati che siano presenti) */
.meditation-library {
  padding: 20px;
  padding-bottom: 90px;
  box-sizing: border-box;
}
.filters {
  margin-bottom: 20px;
  flex-wrap: wrap;
  display: flex;
  gap: 8px;
  align-items: center;
}
.filters span {
  margin-right: 10px;
  font-weight: 500;
}
.filters button {
  padding: 6px 12px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 15px;
  transition: all 0.2s ease-in-out;
  font-size: 0.9em;
}
.filters button:hover {
  background-color: #eee;
}
.filters button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}
.loading-indicator {
  text-align: center;
  padding: 30px;
  color: #555;
  font-style: italic;
}
.error-message {
  color: #e74c3c;
  background-color: #fdd;
  border: 1px solid #e74c3c;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 4px;
}
.error-message button {
  margin-left: 15px;
  padding: 3px 8px;
  font-size: 0.85em;
}
.track-list {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.track-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}
.track-item:hover {
  background-color: #f7f7f7;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.cover-art {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
  background-color: #eee;
  flex-shrink: 0;
}
.track-info {
  flex-grow: 1;
  overflow: hidden;
  min-width: 0;
}
.track-info h2 {
  font-size: 1.05em;
  margin: 0 0 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}
.track-info p {
  font-size: 0.9em;
  color: #666;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.track-info span {
  font-size: 0.8em;
  color: #777;
  display: block;
}
.license-info {
  font-size: 0.75em;
  color: #888;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.license-info a {
  color: #555;
  text-decoration: none;
}
.license-info a:hover {
  text-decoration: underline;
}
.playing-indicator {
  margin-left: 10px;
  font-size: 0.8em;
  color: #27ae60;
  flex-shrink: 0;
  background-color: rgba(230, 255, 230, 0.8);
  padding: 2px 5px;
  border-radius: 3px;
  white-space: nowrap;
}
</style>

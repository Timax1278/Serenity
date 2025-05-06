<template>
  <!-- Barra del player visibile solo se c'è una traccia corrente -->
  <div class="audio-player-bar" v-if="currentTrack">
    <!-- Dettagli Traccia (Sinistra) -->
    <div class="track-details">
      <img
        :src="currentTrack.coverArtUrl || '/images/covers/default.png'"
        alt="Cover"
        class="player-cover-art"
      />
      <div>
        <div class="player-title">{{ currentTrack.title }}</div>
        <div class="player-artist">{{ currentTrack.artist }}</div>
      </div>
    </div>

    <!-- Controlli Centrali (Play/Pause, Barra Progresso) -->
    <div class="player-controls">
      <button @click="togglePlayPause" class="control-button">
        <span v-if="isPlaying">❚❚</span>
        <!-- Icona Pausa -->
        <span v-else>▶</span>
        <!-- Icona Play -->
      </button>
      <div class="time-controls">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="progress-bar"
          :value="currentTime"
          :max="duration || 0"
          @input="seekTime"
          step="1"
          :title="`${formatTime(currentTime)} / ${formatTime(duration)}`"
        />
        <!-- Rimosso testo 'Tooltip utile --' e '/>' extra da qui -->
        <span class="duration-time">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Controlli Volume (Destra) -->
    <div class="volume-controls">
      <span>🔊</span>
      <!-- Icona Volume -->
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="1"
        step="0.05"
        :value="volume"
        @input="setVolume"
        title="Volume"
      />
    </div>

    <!-- Elemento Audio Nascosto (Controllato da JS) -->
    <audio
      ref="audioElement"
      :src="currentTrack.filePath"
      @loadedmetadata="updateDuration"
      @timeupdate="updateTime"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @volumechange="updateVolumeState"
      preload="metadata"
    ></audio>
    <!-- Rimosso testo 'Carica solo metadati allinizio --' e '>' extra da qui -->
  </div>

  <!-- Placeholder se nessuna traccia è selezionata -->
  <div v-else class="audio-player-placeholder">
    Select a track to play from the library
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue"; // Aggiunto nextTick
import { useStore } from "vuex";

const store = useStore();
const audioElement = ref(null); // Riferimento all'elemento <audio>

// Stato locale del player (sincronizzato con l'elemento audio)
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1); // Volume iniziale (da 0 a 1)

// Dati dallo store Vuex
const currentTrack = computed(
  () => store.getters["meditation/getCurrentTrack"]
);
const isPlaying = computed(() => store.getters["meditation/isPlaying"]);

// --- Funzioni di Controllo Player (Interazione Utente -> Store) ---
const togglePlayPause = () => {
  if (!currentTrack.value) return; // Non fare nulla se non c'è traccia
  if (isPlaying.value) {
    console.log("[AudioPlayer UI] User clicked Pause -> Dispatching pause");
    store.dispatch("meditation/pause");
  } else {
    console.log("[AudioPlayer UI] User clicked Play -> Dispatching play");
    store.dispatch("meditation/play");
  }
};

const seekTime = (event) => {
  if (audioElement.value && currentTrack.value) {
    // Controlla anche se c'è una traccia
    const newTime = parseFloat(event.target.value);
    console.log(`[AudioPlayer UI] User seeked to time: ${newTime}`);
    audioElement.value.currentTime = newTime;
    currentTime.value = newTime; // Aggiorna subito UI locale per reattività
  }
};

const setVolume = (event) => {
  if (audioElement.value) {
    const newVolume = parseFloat(event.target.value);
    console.log(`[AudioPlayer UI] User set volume to: ${newVolume}`);
    audioElement.value.volume = newVolume;
    // Non serve aggiornare volume.value qui perché @volumechange lo farà
  }
};

// --- Gestori Eventi Elemento Audio (Elemento Audio -> Store / Stato Locale) ---
const updateDuration = () => {
  if (audioElement.value) {
    const newDuration = audioElement.value.duration;
    // Controlla se è un numero valido (evita NaN o Infinity)
    if (isFinite(newDuration)) {
      console.log(
        `[AudioPlayer Event] loadedmetadata - Duration: ${newDuration}`
      );
      duration.value = newDuration;
    } else {
      console.warn(
        `[AudioPlayer Event] loadedmetadata - Invalid duration received: ${newDuration}`
      );
      duration.value = 0; // Resetta a 0 se invalido
    }
  }
};

const updateTime = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
    // Non loggare questo evento, è troppo frequente
  }
};

const handlePlay = () => {
  console.log("[AudioPlayer Event] play event fired by audio element.");
  // Se l'evento play viene dall'elemento audio, assicurati che lo store sia sincronizzato
  // Questo previene discrepanze se il play viene avviato esternamente (es. da dev tools)
  if (!isPlaying.value) {
    console.log(
      "[AudioPlayer Event] Store was paused, dispatching play to sync."
    );
    store.dispatch("meditation/play");
  }
};

const handlePause = () => {
  console.log("[AudioPlayer Event] pause event fired by audio element.");
  // Se l'evento pause viene dall'elemento audio, assicurati che lo store sia sincronizzato
  if (isPlaying.value) {
    console.log(
      "[AudioPlayer Event] Store was playing, dispatching pause to sync."
    );
    store.dispatch("meditation/pause");
  }
};

const handleEnded = () => {
  console.log("[AudioPlayer Event] ended event fired by audio element.");
  const track = currentTrack.value; // Prendi la traccia che è appena finita
  // 1. Aggiorna lo stato Vuex per indicare che non sta più suonando
  store.dispatch("meditation/pause");
  // 2. Resetta il tempo corrente nella UI
  currentTime.value = 0;

  // --- 3. REGISTRA ASCOLTO COMPLETATO ---
  if (track) {
    console.log(
      `[AudioPlayer Event] Dispatching recordListenHistory for ended track: ${track.title}`
    );
    store.dispatch("meditation/recordListenHistory", {
      trackId: track._id,
      genre: track.genre, // Assicurati che l'oggetto track abbia il genere
      completed: true, // Indica che è stato completato
    });
  } else {
    console.warn(
      "[AudioPlayer Event] Track ended, but currentTrack in store was null. Cannot record history."
    );
  }
  // ---------------------------------

  // 4. Qui potresti implementare logica per la traccia successiva
  // Esempio: store.dispatch('meditation/playNextTrack');
};

const updateVolumeState = () => {
  // Aggiorna lo stato locale 'volume' quando il volume dell'elemento audio cambia
  // (es. se viene cambiato da controlli hardware o altri script)
  if (audioElement.value) {
    // console.log(`[AudioPlayer Event] volumechange - New volume: ${audioElement.value.volume}`);
    volume.value = audioElement.value.volume;
  }
};

// --- Watchers per Sincronizzazione (Store -> Elemento Audio) ---

// Watcher: Quando la traccia nello store cambia -> aggiorna <audio> src
watch(currentTrack, (newTrack) => {
  console.log(
    `[AudioPlayer Watch currentTrack] Store track changed to: ${
      newTrack?.title || "null"
    }`
  );
  // Resetta stato player UI quando la traccia cambia o diventa null
  currentTime.value = 0;
  duration.value = 0;
  if (audioElement.value) {
    // Importante mettere in pausa e resettare la source prima di caricare la nuova
    audioElement.value.pause();
    audioElement.value.removeAttribute("src"); // Rimuovi src per forzare ricaricamento
    audioElement.value.load(); // Chiamata importante dopo aver rimosso src
    console.log(
      `[AudioPlayer Watch currentTrack] Paused and reset src for audio element.`
    );

    // Aspetta che il DOM si aggiorni con il nuovo :src bind prima di caricare
    nextTick(() => {
      if (newTrack && audioElement.value) {
        console.log(
          `[AudioPlayer Watch currentTrack] Loading new track source: ${newTrack.filePath}`
        );
        // Non serve impostare src qui perché il binding :src lo fa,
        // ma chiamare load() è spesso necessario per i metadati.
        audioElement.value.load();
      } else {
        console.log(
          `[AudioPlayer Watch currentTrack] No new track, audio element remains empty.`
        );
      }
    });
  } else {
    console.warn("[AudioPlayer Watch currentTrack] audioElement ref is null.");
  }
  // Decidi se vuoi l'autoplay qui. Se sì, dovresti chiamare play DOPO che
  // l'evento 'loadedmetadata' o 'canplay' è scattato per la nuova traccia.
  // Esempio semplice (potrebbe non essere affidabile al 100% per autoplay):
  // if (newTrack) { store.dispatch('meditation/play'); }
});

// Watcher: Quando lo stato isPlaying nello store cambia -> controlla l'elemento <audio>
watch(isPlaying, (newIsPlaying) => {
  console.log(
    `[AudioPlayer Watch isPlaying] Store state changed to: ${newIsPlaying}`
  );
  if (!audioElement.value) {
    console.warn("[AudioPlayer Watch isPlaying] audioElement ref is null.");
    return;
  }
  // Sincronizza lo stato dell'elemento audio con lo store
  try {
    if (newIsPlaying) {
      // Se lo store dice PLAY e l'audio è in pausa (o non è partito)
      if (audioElement.value.paused) {
        console.log(
          "[AudioPlayer Watch isPlaying] Store wants play, attempting audio.play()"
        );
        // play() restituisce una Promise che può essere rifiutata
        audioElement.value.play().catch((error) => {
          console.error(
            "[AudioPlayer] Error attempting to play audio from watcher:",
            error
          );
          // Se il play automatico fallisce (comune nei browser),
          // rimetti lo stato Vuex in pausa per coerenza.
          store.dispatch("meditation/pause");
        });
      } else {
        console.log(
          "[AudioPlayer Watch isPlaying] Store wants play, but audio element is already playing."
        );
      }
    } else {
      // Se lo store dice PAUSE e l'audio NON è in pausa
      if (!audioElement.value.paused) {
        console.log(
          "[AudioPlayer Watch isPlaying] Store wants pause, attempting audio.pause()"
        );
        audioElement.value.pause();
      } else {
        console.log(
          "[AudioPlayer Watch isPlaying] Store wants pause, but audio element is already paused."
        );
      }
    }
  } catch (error) {
    console.error(
      "[AudioPlayer Watch isPlaying] Error syncing play/pause state:",
      error
    );
  }
});

// --- Utility Formattazione Tempo ---
const formatTime = (seconds) => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0)
    return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// --- Lifecycle ---
onMounted(() => {
  console.log("[AudioPlayer Component Mounted]");
  if (audioElement.value) {
    // Leggi il volume iniziale dall'elemento audio (potrebbe essere diverso da 1)
    volume.value = audioElement.value.volume;
    console.log(
      `[AudioPlayer Mounted] Initial audio element volume: ${volume.value}`
    );
  } else {
    console.warn(
      "[AudioPlayer Mounted] audioElement ref not available on mount."
    );
  }
});

onUnmounted(() => {
  console.log("[AudioPlayer Component Unmounted]");
  // Non è strettamente necessario mettere in pausa qui se la traccia viene
  // resettata quando si esce dalla vista parent, ma per sicurezza:
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value.removeAttribute("src"); // Rimuovi sorgente
    audioElement.value.load(); // Resetta
  }
  // Potrebbe essere utile resettare lo stato nello store se l'utente
  // lascia completamente la sezione musica
  // store.commit('meditation/SET_CURRENT_TRACK', null);
  // store.commit('meditation/SET_IS_PLAYING', false);
});
</script>

<style scoped>
/* Stili CSS per il player (come forniti in precedenza) */
.audio-player-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f0f2f5;
  padding: 10px 20px;
  border-top: 1px solid #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  box-sizing: border-box;
}
.audio-player-placeholder {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  text-align: center;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
  box-sizing: border-box;
}
.track-details {
  display: flex;
  align-items: center;
  flex-shrink: 1;
  min-width: 150px;
  margin-right: 20px;
  overflow: hidden; /* Aggiunto per contenere testo lungo */
}
.player-cover-art {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
  flex-shrink: 0; /* Evita che l'immagine si restringa */
}
.track-details > div {
  /* Contenitore per titolo/artista */
  overflow: hidden; /* Nasconde overflow testo */
}
.player-title {
  font-weight: bold;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 200px; */ /* Rimuovi max-width, lascia che flex gestisca */
}
.player-artist {
  font-size: 0.8em;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 200px; */ /* Rimuovi max-width */
}
.player-controls {
  display: flex;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  min-width: 250px; /* Ridotto leggermente */
}
.control-button {
  background: none;
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  margin: 0 15px;
  color: #333;
  padding: 0;
  line-height: 1;
}
.control-button:hover {
  color: #007bff;
}
.time-controls {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 10px;
}
.current-time,
.duration-time {
  font-size: 0.8em;
  color: #555;
  min-width: 35px;
  text-align: center;
  user-select: none; /* Evita selezione testo tempo */
}
.progress-bar {
  flex-grow: 1;
  height: 5px;
  cursor: pointer;
  margin: 0 10px;
  -webkit-appearance: none;
  appearance: none;
  background: #ddd;
  border-radius: 5px;
  outline: none;
}
.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
}
.progress-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
.volume-controls {
  display: flex;
  align-items: center;
  min-width: 120px;
}
.volume-controls span {
  margin-right: 5px;
  user-select: none;
}
.volume-slider {
  width: 80px;
  height: 4px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background: #ccc;
  border-radius: 3px;
  outline: none;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  background: #555;
  border-radius: 50%;
  cursor: pointer;
}
.volume-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  background: #555;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
audio {
  display: none;
}
</style>

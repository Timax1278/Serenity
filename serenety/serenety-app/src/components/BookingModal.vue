<template>
  <!-- Overlay per scurire lo sfondo -->
  <div class="modal-overlay" @click.self="closeModal">
    <!-- Chiude se clicchi fuori -->
    <!-- Contenitore Modale -->
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      <h2>Book Appointment for: {{ service?.name }}</h2>

      <div v-if="service">
        <!-- Step 1: Seleziona Professionista (se ce n'è più di uno) -->
        <div
          class="step"
          v-if="service.professionals && service.professionals.length > 1"
        >
          <h3>Step 1: Select a Professional</h3>
          <select
            v-model="selectedProfessionalId"
            @change="handleProfessionalSelection"
            required
          >
            <!-- Aggiunto required -->
            <option disabled value="">Please select one</option>
            <option
              v-for="prof in service.professionals"
              :key="prof._id"
              :value="prof._id"
            >
              {{ prof.name }} ({{ prof.specialization }})
            </option>
          </select>
        </div>
        <!-- Mostra nome se c'è solo un professionista -->
        <div
          class="step"
          v-else-if="
            service.professionals && service.professionals.length === 1
          "
        >
          <h3>Professional</h3>
          <p>
            {{ service.professionals[0].name }} ({{
              service.professionals[0].specialization
            }})
          </p>
          <!-- L'ID viene impostato automaticamente in onMounted -->
        </div>
        <!-- Messaggio se nessun professionista è associato -->
        <p v-else class="error-message">
          No professionals available for this service.
        </p>

        <!-- Step 2: Seleziona Data (appare DOPO aver scelto il professionista) -->
        <div class="step" v-if="selectedProfessionalId">
          <h3>Step 2: Select a Date</h3>
          <input
            type="date"
            v-model="selectedDate"
            :min="todayDate"
            @change="handleDateSelection"
            required
          />
          <!-- Aggiunto required -->
          <!-- Mostra errore specifico se la data non è valida (anche se l'input type=date aiuta) -->
          <!-- <p v-if="!isDateValid && selectedDate" class="error-message small">Please select a valid date.</p> -->
        </div>

        <!-- Step 3: Seleziona Orario (appare DOPO aver scelto una data valida) -->
        <div class="step" v-if="selectedDate && selectedProfessionalId">
          <h3>Step 3: Select an Available Time Slot</h3>
          <!-- Indicatore di caricamento per gli slot -->
          <div v-if="isAvailabilityLoading" class="loading-indicator small">
            Loading available slots...
          </div>
          <!-- Errore nel caricamento degli slot -->
          <div
            v-if="availabilityError && !isAvailabilityLoading"
            class="error-message small"
          >
            Failed to load slots: {{ availabilityError }}. Please try another
            date or contact support.
          </div>

          <!-- Lista degli slot disponibili -->
          <div
            class="slot-list"
            v-if="!isAvailabilityLoading && availableSlots.length > 0"
          >
            <button
              v-for="slot in availableSlots"
              :key="slot"
              class="slot-button"
              :class="{ selected: selectedSlot === slot }"
              @click="selectSlot(slot)"
            >
              {{ formatSlotTime(slot) }}
            </button>
          </div>
          <!-- Messaggio se non ci sono slot disponibili -->
          <p v-else-if="!isAvailabilityLoading && !availabilityError">
            No available time slots found for the selected date. Please choose
            another date.
          </p>
        </div>

        <!-- Step 4: Conferma (appare DOPO aver scelto lo slot) -->
        <div
          class="step confirmation"
          v-if="selectedSlot && selectedDate && selectedProfessionalId"
        >
          <h3>Step 4: Confirm Booking</h3>
          <p>
            You are about to book <strong>{{ service.name }}</strong> with
            <strong>{{ selectedProfessionalName }}</strong> on
            <strong>{{ formatDateForDisplay(selectedDate) }}</strong> at
            <strong>{{ formatSlotTime(selectedSlot) }}</strong
            >.
          </p>
          <!-- Bottone di conferma con stato di caricamento -->
          <button
            @click="confirmBooking"
            class="confirm-button"
            :disabled="isBookingLoading"
          >
            {{
              isBookingLoading
                ? "Booking in progress..."
                : "Confirm Appointment"
            }}
          </button>
          <!-- Mostra errore specifico della prenotazione -->
          <p v-if="bookingError" class="error-message small">
            {{ bookingError }}
          </p>
        </div>
      </div>
      <!-- Fallback se l'oggetto service non è ancora pronto -->
      <div v-else>
        <p class="loading-indicator">Loading service details...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue"; // nextTick importato
import { useStore } from "vuex";

// Props ricevute dal componente padre (AppointmentsPage)
const props = defineProps({
  service: {
    type: Object, // Aspetta un oggetto servizio
    required: true, // È obbligatorio
  },
});

// Eventi che questo componente può emettere verso il padre
const emit = defineEmits(["close", "booking-confirmed"]);

const store = useStore(); // Hook per accedere allo store Vuex

// --- Stato Locale della Modale ---
const selectedProfessionalId = ref(""); // ID del professionista scelto
const selectedDate = ref(""); // Data scelta (stringa YYYY-MM-DD)
const selectedSlot = ref(""); // Orario scelto (stringa HH:MM)

// Data odierna per l'attributo 'min' dell'input date
const todayDate = new Date().toISOString().split("T")[0];

// --- Computed Properties (leggono dati dallo Store) ---
const availableSlots = computed(
  () => store.getters["appointments/getAvailabilitySlots"]
);
const isAvailabilityLoading = computed(
  () => store.getters["appointments/isAvailabilityLoading"]
);
const availabilityError = computed(
  () => store.getters["appointments/getAvailabilityError"]
);
const isBookingLoading = computed(
  () => store.getters["appointments/isBookingLoading"]
);
const bookingError = computed(
  () => store.getters["appointments/getBookingError"]
);

// Trova il nome del professionista selezionato dall'array passato nelle props
const selectedProfessionalName = computed(() => {
  if (!selectedProfessionalId.value || !props.service?.professionals)
    return "N/A";
  const prof = props.service.professionals.find(
    (p) => p._id === selectedProfessionalId.value
  );
  return prof ? prof.name : "Unknown Professional";
});

// --- Watchers e Lifecycle Hooks ---

// Hook chiamato quando il componente viene montato
onMounted(() => {
  console.log("[BookingModal Mounted] Service prop:", props.service);
  // Se c'è un solo professionista disponibile per questo servizio, preselezionalo
  if (props.service?.professionals?.length === 1) {
    selectedProfessionalId.value = props.service.professionals[0]._id;
    console.log(
      "[BookingModal Mounted] Auto-selected professional:",
      selectedProfessionalId.value
    );
  }
  // Pulisci eventuali errori precedenti all'apertura
  store.dispatch("appointments/clearAppointmentErrors");
});

// Watcher: Reagisce quando cambia il professionista selezionato
watch(selectedProfessionalId, (newProfId, oldProfId) => {
  // Evita reset inutile se l'ID non è realmente cambiato (es. al mount)
  if (newProfId !== oldProfId) {
    console.log(
      "[BookingModal Watch] Professional selection changed to:",
      newProfId
    );
    // Resetta la data e lo slot selezionati
    selectedDate.value = "";
    selectedSlot.value = "";
    // Pulisci gli slot disponibili e gli errori nello store
    store.commit("appointments/SET_AVAILABILITY_SLOTS", []);
    store.commit("appointments/CLEAR_ERROR"); // Usa la mutation che pulisce tutto
  }
});

// Watcher: Reagisce quando cambia la data selezionata
watch(selectedDate, (newDate, oldDate) => {
  // Evita reset inutile se la data non è cambiata
  if (newDate !== oldDate) {
    console.log(`[BookingModal Watch] Date selection changed to: ${newDate}`);
    // Resetta lo slot selezionato
    selectedSlot.value = "";
    // Pulisci eventuali errori precedenti e la lista slot
    store.commit("appointments/SET_AVAILABILITY_SLOTS", []);
    store.commit("appointments/CLEAR_ERROR");
    // Se sono selezionati sia una data valida che un professionista, carica la disponibilità
    if (newDate && selectedProfessionalId.value) {
      console.log(
        `[BookingModal Watch] Fetching availability for ${selectedProfessionalId.value} on ${newDate}`
      );
      store.dispatch("appointments/fetchAvailability", {
        professionalId: selectedProfessionalId.value,
        date: newDate,
      });
    } else if (!newDate) {
      console.log(`[BookingModal Watch] Date cleared, clearing slots.`);
      // Se la data viene cancellata, pulisci gli slot
      store.commit("appointments/SET_AVAILABILITY_SLOTS", []);
    }
  }
});

// --- Funzioni Handler (chiamate da eventi nel template) ---

const handleProfessionalSelection = () => {
  // Logica eseguita quando l'utente cambia selezione nel dropdown
  // Il watcher su selectedProfessionalId farà già il reset necessario
  console.log(
    "[BookingModal Handler] Professional selected via dropdown:",
    selectedProfessionalId.value
  );
};

const handleDateSelection = () => {
  // Logica eseguita quando l'utente seleziona una data dall'input
  // Il watcher su selectedDate farà già il fetch della disponibilità
  console.log(
    "[BookingModal Handler] Date selected via input:",
    selectedDate.value
  );
};

const selectSlot = (slot) => {
  // Logica eseguita quando l'utente clicca su un bottone slot
  console.log("[BookingModal Handler] Slot selected:", slot);
  selectedSlot.value = slot;
  // Pulisci eventuali errori specifici di prenotazione quando si seleziona un nuovo slot
  store.commit("appointments/CLEAR_ERROR"); // Usa la mutation che pulisce tutto
};

// Funzione per chiudere la modale (chiamata dal bottone X o click overlay)
const closeModal = () => {
  console.log("[BookingModal Handler] Close modal requested.");
  emit("close"); // Emette l'evento al componente padre
};

// Funzione chiamata quando si clicca "Confirm Appointment"
const confirmBooking = async () => {
  // Validazione: Assicurati che tutti i dati necessari siano selezionati
  if (
    !props.service?._id ||
    !selectedProfessionalId.value ||
    !selectedDate.value ||
    !selectedSlot.value
  ) {
    console.error("[BookingModal Confirm] Missing required data for booking.");
    alert(
      "Please ensure you have selected a professional, date, and time slot."
    );
    return; // Interrompe l'esecuzione
  }

  // Prepara i dati da inviare all'azione Vuex
  const bookingData = {
    serviceId: props.service._id,
    professionalId: selectedProfessionalId.value,
    date: selectedDate.value,
    time: selectedSlot.value,
  };

  console.log(
    "[BookingModal Handler] Confirming booking with data for action:",
    bookingData
  );

  try {
    // Chiama l'azione Vuex per prenotare
    const newAppointment = await store.dispatch(
      "appointments/bookAppointment",
      bookingData
    );

    console.log(
      "[BookingModal Handler] Booking action successful! API response:",
      newAppointment
    );

    // Prepara dettagli per il messaggio di successo/evento
    const confirmationDetails = {
      ...(newAppointment || {}), // Include i dati restituiti dall'API (es. _id)
      professionalName: selectedProfessionalName.value,
      serviceName: props.service.name,
      date: selectedDate.value, // Assicurati che data e ora siano inclusi
      time: selectedSlot.value,
    };

    // Mostra conferma all'utente
    alert(
      `Appointment confirmed successfully with ${
        confirmationDetails.professionalName
      } on ${formatDateForDisplay(
        confirmationDetails.date
      )} at ${formatSlotTime(confirmationDetails.time)}!`
    );

    // Emetti evento al padre con i dettagli della conferma
    emit("booking-confirmed", confirmationDetails);

    // Chiudi la modale automaticamente dopo successo
    closeModal();
  } catch (error) {
    // L'errore è già stato loggato dall'azione Vuex e salvato nello stato 'bookingError'
    console.error("[BookingModal Handler] Booking failed:", error);
    // L'errore viene mostrato nel template tramite la computed property 'bookingError'
    // alert(`Booking failed: ${bookingError.value || 'Please try again.'}`); // Evita alert doppio
  }
  // Lo stato isLoading viene gestito dall'azione Vuex
};

// --- Utility di Formattazione ---
const formatSlotTime = (timeString) => {
  if (
    !timeString ||
    typeof timeString !== "string" ||
    !timeString.includes(":")
  )
    return timeString;
  // Esempio formattazione AM/PM (richiede più logica)
  // const [hour, minute] = timeString.split(':');
  // const hourNum = parseInt(hour, 10);
  // const ampm = hourNum >= 12 ? 'PM' : 'AM';
  // const hour12 = hourNum % 12 || 12; // Converte 0 in 12 per le 12 AM
  // return `${hour12}:${minute} ${ampm}`;
  return timeString; // Mantiene HH:MM per ora
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return "";
  try {
    // Aggiunge l'ora per evitare problemi di timezone nell'interpretazione della data
    const date = new Date(dateString + "T12:00:00"); // Usa mezzogiorno per sicurezza
    // Usa le opzioni locali del browser per un formato leggibile
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      // timeZone: 'UTC' // Rimuovi UTC per usare il fuso orario locale del browser
    });
  } catch {
    return dateString; // Fallback se la data non è valida
  }
};
</script>

<style scoped>
/* Stili CSS (come forniti in precedenza) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: #fff;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 85vh; /* Aumentata leggermente altezza max */
  overflow-y: auto;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8em;
  cursor: pointer;
  color: #888;
  line-height: 1;
}
.close-button:hover {
  color: #333;
}
h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}
h3 {
  margin-top: 25px;
  margin-bottom: 10px;
  color: #555;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  font-size: 1.1em;
}
.step {
  margin-bottom: 20px;
}
select,
input[type="date"] {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
}
.loading-indicator.small {
  font-style: italic;
  color: #666;
  font-size: 0.9em;
  padding: 10px 0;
}
.error-message {
  /* Stile errore generico */
  color: #e74c3c;
  background-color: #fdd;
  border: 1px solid #e74c3c;
  padding: 10px 15px;
  margin-top: 10px;
  border-radius: 4px;
  font-size: 0.9em;
}
.error-message.small {
  padding: 8px;
  font-size: 0.85em;
} /* Stile errore più piccolo */
.slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.slot-button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.slot-button:hover {
  background-color: #eee;
}
.slot-button.selected {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
  font-weight: bold;
}
.confirmation p {
  background-color: #e8f4f8;
  border-left: 4px solid #3498db;
  padding: 15px;
  margin-bottom: 15px;
  font-size: 0.95em;
  line-height: 1.5;
}
.confirmation strong {
  color: #2980b9;
}
.confirm-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}
.confirm-button:hover:not(:disabled) {
  background-color: #27ae60;
}
.confirm-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>

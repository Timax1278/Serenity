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
/* Modal Appointment Booking CSS */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  width: 90%;
  max-width: 500px;
  position: relative;
  color: white;
  max-height: 90vh;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  height: 30px;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

h2 {
  margin-top: 0;
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.step {
  margin-bottom: 2rem;
}

h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

select,
input[type="date"] {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
  margin-bottom: 1rem;
  -webkit-appearance: none;
  appearance: none;
}

/* Custom arrow for selects */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 30px;
}

select:focus,
input[type="date"]:focus {
  outline: none;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

/* Calendar icon color fix for date inputs */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.7;
}

.slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1rem;
}

.slot-button {
  padding: 0.6rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slot-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.slot-button.selected {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  border: none;
  font-weight: 500;
}

.confirmation {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.confirm-button {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 100%;
  margin-top: 1rem;
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #a8a8a8 0%, #d3d3d3 100%);
  transform: none;
  box-shadow: none;
}

.loading-indicator {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-indicator.small {
  padding: 0.5rem;
  font-size: 0.9rem;
}

.error-message {
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}

.error-message.small {
  padding: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Animation for modal appearance */
.modal-overlay {
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  animation: scaleIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .slot-list {
    gap: 8px;
  }

  .slot-button {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1rem;
  }
}
</style>

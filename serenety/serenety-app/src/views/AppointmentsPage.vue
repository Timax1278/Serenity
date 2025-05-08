<template>
  <div class="appointments-page">
    <h1>Therapy Services</h1>
    <p>Find the support that's right for you.</p>

    <!-- SEZIONE ADMIN TEMPORANEA PER TEST -->
    <div v-if="isAdmin" class="admin-section">
      <h2>Admin: Create New Service</h2>
      <form @submit.prevent="handleCreateService" class="admin-form">
        <input
          type="text"
          v-model="newServiceName"
          placeholder="Service Name"
          required
        />
        <textarea
          v-model="newServiceDesc"
          placeholder="Description"
          required
        ></textarea>
        <input
          type="text"
          v-model="newServiceTags"
          placeholder="Tags (comma-separated)"
        />
        <input
          type="text"
          v-model="newServiceAudience"
          placeholder="Target Audience (e.g., Adolescenti)"
        />
        <input
          type="number"
          v-model.number="newServiceDuration"
          placeholder="Default Duration (mins)"
        />
        <input
          type="text"
          v-model="newServiceProfIds"
          placeholder="Associated Professional IDs (comma-separated, e.g., prof_rossi,prof_bianchi)"
        />
        <input
          type="email"
          v-model="adminCreds.email"
          placeholder="Admin Email"
          required
        />
        <input
          type="password"
          v-model="adminCreds.password"
          placeholder="Admin Password"
          required
        />
        <button type="submit" :disabled="isSubmittingAdmin">
          {{ isSubmittingAdmin ? "Creating..." : "Create Service" }}
        </button>
        <p v-if="adminError" class="error-message admin-error">
          {{ adminError }}
        </p>
      </form>
    </div>
    <p v-else style="color: gray; font-style: italic">
      (Admin controls hidden)
    </p>
    <!-- FINE SEZIONE ADMIN -->

    <hr style="margin: 20px 0" />

    <!-- Sezione visualizzazione servizi -->
    <div v-if="isLoading" class="loading-indicator">Loading services...</div>
    <div v-if="error && !isLoading" class="error-message">
      Failed to load services: {{ error }}
      <button @click="retryFetchServices" style="margin-left: 10px">
        Retry
      </button>
    </div>

    <div class="service-list" v-if="!isLoading && services.length > 0">
      <div v-for="service in services" :key="service._id" class="service-card">
        <h2>{{ service.name }}</h2>
        <p class="service-desc">{{ service.description }}</p>
        <div
          class="service-tags"
          v-if="service.tags && service.tags.length > 0"
        >
          <span v-for="tag in service.tags" :key="tag" class="tag">{{
            tag
          }}</span>
        </div>
        <div
          class="service-professionals"
          v-if="service.professionals && service.professionals.length > 0"
        >
          <strong>Available Professionals:</strong>
          <ul>
            <li v-for="prof in service.professionals" :key="prof._id">
              {{ prof.name }} ({{ prof.specialization }})
            </li>
          </ul>
        </div>
        <p v-else class="service-professionals">
          <em>No specific professionals listed for this service currently.</em>
        </p>
        <button
          @click="showBookingModal(service)"
          class="book-button"
          :disabled="
            !service.professionals || service.professionals.length === 0
          "
          title="Book an appointment"
        >
          Book Appointment
        </button>
      </div>
    </div>
    <p v-else-if="!isLoading && !error">No services currently available.</p>

    <!-- Modale di Prenotazione -->
    <BookingModal
      v-if="selectedServiceForBooking"
      :service="selectedServiceForBooking"
      @close="closeBookingModal"
      @booking-confirmed="handleBookingConfirmation"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import BookingModal from "@/components/BookingModal.vue"; // Importa la modale

const store = useStore();
const selectedServiceForBooking = ref(null);

// State per il Form Admin
const newServiceName = ref("");
const newServiceDesc = ref("");
const newServiceTags = ref("");
const newServiceAudience = ref("");
const newServiceDuration = ref(null);
const newServiceProfIds = ref("");
const adminCreds = ref({ email: "", password: "" });
const isSubmittingAdmin = ref(false);
const adminError = ref(null);

// Computed Properties dallo Store
const services = computed(
  () => store.getters["appointments/getAvailableServices"]
);
const isLoading = computed(() => store.getters["appointments/isLoading"]);
const error = computed(() => store.getters["appointments/getError"]);
const isAdmin = computed(() => store.getters["auth/isAdmin"]);

// Azioni al Montaggio
onMounted(() => {
  fetchServicesData();
});

// Funzioni Metodo
const fetchServicesData = () => {
  console.log("[AppointmentsPage] Fetching services...");
  store.dispatch("appointments/fetchServices");
};

const retryFetchServices = () => {
  fetchServicesData();
};

// Funzione chiamata dal form admin per creare un servizio
const handleCreateService = async () => {
  if (!isAdmin.value) {
    adminError.value = "Unauthorized action.";
    return;
  }
  isSubmittingAdmin.value = true;
  adminError.value = null;

  try {
    const serviceData = {
      name: newServiceName.value,
      description: newServiceDesc.value,
      tags: newServiceTags.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      targetAudience: newServiceAudience.value || undefined,
      defaultDuration:
        newServiceDuration.value > 0 ? newServiceDuration.value : undefined,
      associatedProfessionalIds: newServiceProfIds.value
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id),
    };
    const credentials = {
      adminEmail: adminCreds.value.email,
      adminPassword: adminCreds.value.password,
    };

    console.log(
      "[Admin Create Service] Dispatching with data:",
      serviceData,
      "and creds (pwd hidden)"
    );

    await store.dispatch("appointments/adminCreateService", {
      serviceData,
      adminCredentials: credentials,
    });

    console.log("[Admin Create Service] Service created successfully.");
    newServiceName.value = "";
    newServiceDesc.value = "";
    newServiceTags.value = "";
    newServiceAudience.value = "";
    newServiceDuration.value = null;
    newServiceProfIds.value = "";

    alert(
      "Service created successfully! The list should refresh automatically."
    );
  } catch (err) {
    console.error("[ERROR Admin Create Service]:", err);
    adminError.value =
      err?.response?.data?.message ||
      err.message ||
      "Failed to create service.";
  } finally {
    isSubmittingAdmin.value = false;
  }
};

// Funzione per mostrare la modale di prenotazione
const showBookingModal = (service) => {
  console.log(
    "[AppointmentsPage] Opening booking modal for service:",
    service.name
  );
  store.dispatch("appointments/clearAppointmentErrors"); // Pulisci errori precedenti della modale
  selectedServiceForBooking.value = service; // Mostra la modale impostando il servizio
};

// Funzione per chiudere la modale (chiamata dall'evento @close della modale)
const closeBookingModal = () => {
  console.log("[AppointmentsPage] Closing booking modal.");
  selectedServiceForBooking.value = null; // Nasconde la modale
};

// Funzione chiamata quando la prenotazione è confermata (emessa dalla modale)
const handleBookingConfirmation = (appointmentDetails) => {
  console.log(
    "[AppointmentsPage] Booking confirmed event received:",
    appointmentDetails
  );
  // Qui potresti mostrare un messaggio di successo all'utente sulla pagina principale
  alert(
    `Appointment booked successfully with ${appointmentDetails.professionalName} on ${appointmentDetails.date} at ${appointmentDetails.time}!`
  );
  // La modale si chiude da sola dopo la conferma (se implementato correttamente lì)
};
</script>

<style scoped>
/* Stile principale pagina appuntamenti */
.appointments-page {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Stile titoli e sottotitoli */
.appointments-page h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: white;
}

.appointments-page p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.9;
}

/* Lista dei servizi */
.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

/* Card dei servizi con effetto glass */
.service-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.3);
}

.service-card h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.service-desc {
  margin-bottom: 1.5rem;
  flex-grow: 1;
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.9;
  text-align: left;
}

/* Tag dei servizi */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  transition: background 0.3s ease;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Sezione professionisti */
.service-professionals {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: left;
}

.service-professionals strong {
  display: block;
  margin-bottom: 0.5rem;
}

.service-professionals ul {
  list-style: none;
  padding-left: 0.5rem;
}

.service-professionals li {
  margin-bottom: 0.3rem;
  position: relative;
  padding-left: 1rem;
}

.service-professionals li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: rgba(255, 255, 255, 0.8);
}

/* Pulsante prenota */
.book-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  margin-top: auto;
  align-self: center;
}

.book-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.book-button:disabled {
  background: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading e errori */
.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.error-message {
  background-color: rgba(244, 67, 54, 0.2);
  color: #ffcdd2;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1rem;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.error-message button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Sezione Admin */
.admin-section {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-section h2 {
  margin-bottom: 1rem;
  color: white; /* Cambiato da rgba(255, 255, 255, 0.9) a white */
  font-size: 1.3rem;
}

.admin-form {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.admin-form input,
.admin-form textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white; /* Colore del testo digitato */
  font-size: 1rem;
  transition: all 0.3s;
}

/* Per il booking form, se necessario */
.booking-form input::placeholder,
.booking-form select::placeholder, /* Anche se select non ha un placeholder standard, per coerenza */
.booking-form textarea::placeholder {
  color: white;
  opacity: 1;
}
.admin-form textarea {
  min-height: 100px;
  resize: vertical;
  grid-column: 1 / -1;
}

.admin-form input::placeholder,
.admin-form textarea::placeholder {
  color: white !important; /* Forza il colore bianco */
  opacity: 1 !important; /* Forza l'opacità piena (nessuna trasparenza) */
}

.admin-form button {
  grid-column: 1 / -1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  font-weight: 500;
}

.admin-form button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.admin-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.admin-error {
  grid-column: 1 / -1;
}

/* Stile Modal prenotazione */
.booking-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.booking-modal {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.18);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.booking-modal h2 {
  margin-bottom: 1.5rem;
  color: white;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.modal-close:hover {
  opacity: 1;
}

/* Input form nella modale */
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.booking-form input,
.booking-form select,
.booking-form textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.booking-form input:focus,
.booking-form select:focus,
.booking-form textarea:focus {
  outline: none;
  border-color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.booking-submit {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #1a1a1a;
  font-weight: 500;
  margin-top: 1rem;
}

.booking-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(67, 233, 123, 0.4);
}

.booking-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .appointments-page {
    padding: 1.5rem;
  }

  .service-list {
    grid-template-columns: 1fr;
  }

  .admin-form {
    grid-template-columns: 1fr;
  }

  .booking-modal {
    width: 95%;
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .appointments-page h1 {
    font-size: 2rem;
  }

  .service-card {
    padding: 1.2rem;
  }
}
</style>

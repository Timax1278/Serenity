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
/* Stili (invariati ma assicurati siano presenti) */
.appointments-page {
  padding: 20px;
}
.admin-section {
  background-color: #e8f4f8;
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #bde0fe;
  border-radius: 5px;
}
.admin-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.admin-form input,
.admin-form textarea,
.admin-form button {
  padding: 8px;
  margin-bottom: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
}
.admin-form textarea {
  min-height: 60px;
}
.admin-form button {
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
.admin-form button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.admin-error {
  margin-top: 10px;
  color: red;
  font-size: 0.9em;
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
  padding: 3px 8px;
  font-size: 0.85em;
  cursor: pointer;
}
.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #555;
}
.service-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.service-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.service-card h2 {
  margin: 0 0 10px 0;
  color: #3498db;
  font-size: 1.3em;
}
.service-desc {
  font-size: 0.95em;
  color: #555;
  flex-grow: 1;
  margin-bottom: 15px;
}
.service-tags {
  margin-bottom: 10px;
}
.tag {
  display: inline-block;
  background-color: #eee;
  color: #555;
  padding: 3px 8px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 12px;
  font-size: 0.8em;
}
.service-professionals {
  font-size: 0.9em;
  margin-bottom: 15px;
}
.service-professionals strong {
  display: block;
  margin-bottom: 5px;
}
.service-professionals ul {
  list-style: disc;
  margin-left: 20px;
  padding: 0;
}
.service-professionals li {
  margin-bottom: 3px;
}
.book-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.2s;
  margin-top: auto;
}
.book-button:hover:not(:disabled) {
  background-color: #27ae60;
}
.book-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>

const state = {
  appointments: [],
};

const mutations = {
  SET_APPOINTMENTS(state, appointments) {
    state.appointments = appointments;
  },
};

const actions = {
  // Empty action for now, commit is not needed yet
  fetchAppointments() {
    // Example API call can go here later
  },
};

const getters = {
  getAppointments: (state) => state.appointments,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

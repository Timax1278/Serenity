const state = {
  meditations: [],
};

const mutations = {
  SET_MEDITATIONS(state, meditations) {
    state.meditations = meditations;
  },
};

const actions = {
  // Placeholder action for fetching meditations (to be implemented later)
  fetchMeditations() {
    // Add your API logic here later
    // Example:
    // api.getMeditations().then(response => {
    //   commit('SET_MEDITATIONS', response.data);
    // });
  },
};

const getters = {
  getMeditations: (state) => state.meditations,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

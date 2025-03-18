const state = {
  groups: [],
};

const mutations = {
  SET_GROUPS(state, groups) {
    state.groups = groups;
  },
};

const actions = {
  // Placeholder action for fetching groups (to be implemented later)
  fetchGroups() {
    // Placeholder for future API call logic
    // Example: api.getGroups().then(response => {
    //   commit('SET_GROUPS', response.data);
    // });
  },
};

const getters = {
  getGroups: (state) => state.groups,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

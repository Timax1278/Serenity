const state = {
  users: [],
};

const mutations = {
  SET_USERS(state, users) {
    state.users = users;
  },
};

const actions = {
  // Placeholder action for fetching users (to be implemented later)
  fetchUsers() {
    // Add your API logic here later
    // Example:
    // api.getUsers().then(response => {
    //   commit('SET_USERS', response.data);
    // });
  },
};

const getters = {
  getUsers: (state) => state.users,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

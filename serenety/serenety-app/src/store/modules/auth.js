import authService from "@/services/authService";

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    SET_USER(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    LOGOUT(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await authService.login(credentials);
      commit("SET_TOKEN", response.token);
      commit("SET_USER", response.user);
      return response;
    },
    async register({ commit }, userData) {
      const response = await authService.register(userData);
      commit("SET_TOKEN", response.token);
      commit("SET_USER", response.user);
      return response;
    },
    logout({ commit }) {
      commit("LOGOUT");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user && state.user.roles.includes("admin"),
    currentUser: (state) => state.user,
  },
};

import { io } from "socket.io-client";

const socket = io(process.env.VUE_APP_WS_URL);

export default {
  namespaced: true,
  state: {
    onlineUsers: 0,
    socket: socket,
  },
  mutations: {
    SET_ONLINE_USERS(state, count) {
      state.onlineUsers = count;
    },
  },
  actions: {
    initSocketConnection({ commit }) {
      socket.on("userCountUpdate", (data) => {
        commit("SET_ONLINE_USERS", data.count);
      });
    },
  },
  getters: {
    getOnlineUsers: (state) => state.onlineUsers,
  },
};

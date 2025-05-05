// src/store/modules/groups.js
import groupService from "@/services/groupService"; // Assicurati che il percorso sia corretto

export default {
  namespaced: true, // Importante!
  state: {
    groupsList: [], // Lista dei gruppi disponibili
    currentGroup: null, // Dettagli del gruppo attualmente visualizzato (incl. membri, messaggi)
    isLoading: false,
    error: null,
  },
  mutations: {
    SET_GROUPS_LIST(state, groups) {
      state.groupsList = groups;
    },
    SET_CURRENT_GROUP(state, group) {
      state.currentGroup = group;
    },
    // --- MUTATION ADD_MESSAGE AGGIORNATA CON LOG ---
    ADD_MESSAGE_TO_CURRENT_GROUP(state, message) {
      // Logga lo stato PRIMA della modifica (usando JSON per evitare problemi con i Proxy di Vue)
      // console.log('[VUEX MUTATION ADD_MESSAGE] State before:', JSON.parse(JSON.stringify(state.currentGroup?.messages || [])));
      console.log("[VUEX MUTATION ADD_MESSAGE] Message to add:", message);

      if (state.currentGroup) {
        // Assicurati che currentGroup non sia null
        // Assicurati che l'array messages esista e sia un array
        if (
          !state.currentGroup.messages ||
          !Array.isArray(state.currentGroup.messages)
        ) {
          console.warn(
            "[VUEX MUTATION ADD_MESSAGE] state.currentGroup.messages was not an array or undefined. Initializing."
          );
          // Crea l'array se non esiste o non è un array
          state.currentGroup.messages = [];
        }
        // Aggiungi il nuovo messaggio
        state.currentGroup.messages.push(message);
        // Logga lo stato DOPO la modifica
        // console.log('[VUEX MUTATION ADD_MESSAGE] State after:', JSON.parse(JSON.stringify(state.currentGroup.messages)));
        console.log(
          `[VUEX MUTATION ADD_MESSAGE] Message added. Total messages now: ${state.currentGroup.messages.length}`
        );
      } else {
        console.warn(
          "[VUEX MUTATION ADD_MESSAGE] Cannot add message, currentGroup is null."
        );
      }
    },
    // ----------------------------------------------
    // Potresti aggiungere mutazioni per ADD/REMOVE MEMBER se vuoi aggiornamenti real-time anche per quello
    // Esempio:
    // ADD_MEMBER_TO_CURRENT_GROUP(state, userId) {
    //   if (state.currentGroup && Array.isArray(state.currentGroup.members) && !state.currentGroup.members.includes(userId)) {
    //     state.currentGroup.members.push(userId);
    //   }
    // },
    // REMOVE_MEMBER_FROM_CURRENT_GROUP(state, userId) {
    //    if (state.currentGroup && Array.isArray(state.currentGroup.members)) {
    //      state.currentGroup.members = state.currentGroup.members.filter(id => id !== userId);
    //    }
    // },
    SET_LOADING(state, loading) {
      state.isLoading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_CURRENT_GROUP(state) {
      console.log(
        "[VUEX MUTATION CLEAR_CURRENT_GROUP] Clearing current group data."
      ); // Log
      state.currentGroup = null;
      state.error = null;
    },
    CLEAR_GROUPS_ERROR(state) {
      // Mutation aggiuntiva per pulire solo errore
      state.error = null;
    },
  },
  actions: {
    // Azione per pulire l'errore specifico dei gruppi
    clearGroupsError({ commit }) {
      commit("CLEAR_GROUPS_ERROR");
    },

    async fetchGroupsList({ commit }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        console.log("[VUEX ACTION fetchGroupsList] Fetching groups list...");
        const groups = await groupService.getGroups();
        console.log("[VUEX ACTION fetchGroupsList] Groups received:", groups);
        commit("SET_GROUPS_LIST", groups);
      } catch (error) {
        console.error("[ERROR] Error fetching groups list:", error);
        commit("SET_ERROR", error.message || "Failed to fetch groups list");
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async fetchGroupDetails({ commit }, groupId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      commit("CLEAR_CURRENT_GROUP"); // Pulisci prima di caricare
      try {
        console.log(
          `[VUEX ACTION fetchGroupDetails] Fetching details for group ID: ${groupId}`
        );
        const group = await groupService.getGroupDetails(groupId);
        console.log(
          "[VUEX ACTION fetchGroupDetails] Group details received:",
          group
        );
        commit("SET_CURRENT_GROUP", group);
      } catch (error) {
        console.error(
          `[ERROR] Error fetching group details for ${groupId}:`,
          error
        );
        commit("SET_ERROR", error.message || "Failed to fetch group details");
        // Non rilanciare l'errore qui, lo stato error lo segnala
      } finally {
        commit("SET_LOADING", false);
      }
    },
    // --- Azioni Utente ---
    async joinGroup({ commit, dispatch, rootState }, groupId) {
      commit("SET_LOADING", true); // Potresti voler un loading specifico per l'azione
      commit("SET_ERROR", null);
      const userId = rootState.auth.user?._id;
      if (!userId) {
        console.error("[ERROR joinGroup] User not authenticated");
        commit("SET_ERROR", "User not authenticated to join group");
        commit("SET_LOADING", false);
        // Non rilanciare, l'errore è nello stato
        return; // Esce dall'azione
      }
      try {
        console.log(
          `[VUEX ACTION joinGroup] User ${userId} attempting to join group ${groupId}`
        );
        await groupService.joinGroup(groupId, userId);
        console.log(
          `[VUEX ACTION joinGroup] Join successful for user ${userId} in group ${groupId}. Refreshing details.`
        );
        // Ricarica i dettagli del gruppo per vedere il nuovo membro e altri dati aggiornati
        await dispatch("fetchGroupDetails", groupId);
      } catch (error) {
        console.error(`[ERROR] Error joining group ${groupId}:`, error);
        commit("SET_ERROR", error.message || "Failed to join group");
        // Non rilanciare
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async leaveGroup({ commit, dispatch, rootState }, groupId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      const userId = rootState.auth.user?._id;
      if (!userId) {
        console.error("[ERROR leaveGroup] User not authenticated");
        commit("SET_ERROR", "User not authenticated to leave group");
        commit("SET_LOADING", false);
        return;
      }
      try {
        console.log(
          `[VUEX ACTION leaveGroup] User ${userId} attempting to leave group ${groupId}`
        );
        await groupService.leaveGroup(groupId, userId);
        console.log(
          `[VUEX ACTION leaveGroup] Leave successful for user ${userId} from group ${groupId}. Refreshing details.`
        );
        // Ricarica i dettagli del gruppo
        await dispatch("fetchGroupDetails", groupId);
      } catch (error) {
        console.error(`[ERROR] Error leaving group ${groupId}:`, error);
        commit("SET_ERROR", error.message || "Failed to leave group");
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async sendMessage({ commit, rootState }, { groupId, text }) {
      commit("SET_ERROR", null); // Pulisce errori precedenti prima di inviare
      const userId = rootState.auth.user?._id;
      const userName = rootState.auth.user?.name;
      if (!userId || !userName) {
        console.error(
          "[ERROR sendMessage] Cannot send message: User not authenticated or name missing in state."
        );
        commit(
          "SET_ERROR",
          "Cannot send message: Authentication details missing."
        );
        return; // Esce dall'azione
      }
      try {
        console.log(
          `[VUEX ACTION sendMessage] User ${userName} (${userId}) sending message to group ${groupId}: "${text}"`
        );
        // L'API salva e il backend invia via WebSocket. NON aggiorniamo lo stato qui.
        await groupService.sendMessage(groupId, text, userId, userName);
        console.log(
          `[VUEX ACTION sendMessage] Message sent to API successfully for group ${groupId}. Waiting for WebSocket echo.`
        );
      } catch (error) {
        console.error(
          `[ERROR] Error sending message API call for group ${groupId}:`,
          error
        );
        commit("SET_ERROR", error.message || "Failed to send message");
        // Non rilanciare, l'errore è nello stato
      }
    },
    // --- Azioni Admin ---
    async createGroup(
      { commit, dispatch },
      { name, description, adminCredentials }
    ) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        console.log(
          `[VUEX ACTION createGroup] Attempting to create group "${name}"`
        );
        await groupService.createGroup(name, description, adminCredentials);
        console.log(
          `[VUEX ACTION createGroup] Group "${name}" created successfully. Refreshing list.`
        );
        // Ricarica la lista gruppi dopo la creazione
        await dispatch("fetchGroupsList");
      } catch (error) {
        console.error("[ERROR] Error creating group:", error);
        commit("SET_ERROR", error.message || "Failed to create group");
        // Rilancia l'errore se vuoi gestirlo specificamente nel componente
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },
    async deleteGroup(
      { commit, dispatch, state },
      { groupId, adminCredentials }
    ) {
      // Aggiunto 'state' per controllare currentGroup
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);
      try {
        console.log(
          `[VUEX ACTION deleteGroup] Attempting to delete group ID: ${groupId}`
        );
        await groupService.deleteGroup(groupId, adminCredentials);
        console.log(
          `[VUEX ACTION deleteGroup] Group ${groupId} deleted successfully. Refreshing list.`
        );
        // Ricarica la lista gruppi dopo l'eliminazione
        await dispatch("fetchGroupsList");
        // Se l'utente era nella pagina del gruppo eliminato, pulisci lo stato
        if (state.currentGroup && state.currentGroup._id === groupId) {
          console.log(
            `[VUEX ACTION deleteGroup] Clearing current group state as it was deleted.`
          );
          commit("CLEAR_CURRENT_GROUP");
        }
      } catch (error) {
        console.error(`[ERROR] Error deleting group ${groupId}:`, error);
        commit("SET_ERROR", error.message || "Failed to delete group");
        throw error; // Rilancia per gestione nel componente
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // --- AZIONE PER GESTIRE MESSAGGI WEBSOCKET AGGIORNATA CON LOG ---
    handleIncomingMessage({ commit, state }, data) {
      // Riceve l'oggetto 'data' dal dispatch
      console.log(
        "[VUEX ACTION handleIncomingMessage] Received data from WebSocket handler:",
        data
      );
      // Assicurati che il tipo sia corretto e che il messaggio esista
      if (data.type === "new_message" && data.message && data.message.groupId) {
        // Verifica se il messaggio è per il gruppo attualmente caricato
        if (
          state.currentGroup &&
          state.currentGroup._id === data.message.groupId
        ) {
          console.log(
            "[VUEX ACTION handleIncomingMessage] Message is for the currently viewed group. Committing ADD_MESSAGE_TO_CURRENT_GROUP:",
            data.message
          );
          commit("ADD_MESSAGE_TO_CURRENT_GROUP", data.message);
        } else {
          const targetGroupId = data.message.groupId;
          const currentGroupId = state.currentGroup?._id;
          console.log(
            `[VUEX ACTION handleIncomingMessage] Message received for group ${targetGroupId} but current group is ${currentGroupId}. Ignoring UI update for now.`
          );
          // Potresti implementare notifiche o aggiornare la lista gruppi qui in futuro
        }
      } else if (data.type === "user_joined" && data.userId && data.groupId) {
        console.log(
          `[VUEX ACTION handleIncomingMessage] User ${data.userId} joined group ${data.groupId}.`
        );
        // Se l'utente sta guardando questo gruppo, potremmo aggiornare i membri
        // if (state.currentGroup && state.currentGroup._id === data.groupId) {
        //    commit('ADD_MEMBER_TO_CURRENT_GROUP', data.userId);
        // }
      } else if (data.type === "user_left" && data.userId && data.groupId) {
        console.log(
          `[VUEX ACTION handleIncomingMessage] User ${data.userId} left group ${data.groupId}.`
        );
        // Se l'utente sta guardando questo gruppo, potremmo aggiornare i membri
        // if (state.currentGroup && state.currentGroup._id === data.groupId) {
        //    commit('REMOVE_MEMBER_FROM_CURRENT_GROUP', data.userId);
        // }
      } else {
        console.log(
          "[VUEX ACTION handleIncomingMessage] Received data is not a recognized message type or lacks needed info:",
          data
        );
      }
    },
    // ---------------------------------------------------------
  },
  getters: {
    getGroupsList: (state) => state.groupsList,
    getCurrentGroup: (state) => state.currentGroup,
    // Assicurati che restituisca sempre un array
    getGroupMessages: (state) =>
      state.currentGroup?.messages && Array.isArray(state.currentGroup.messages)
        ? state.currentGroup.messages
        : [],
    getGroupMembers: (state) =>
      state.currentGroup?.members && Array.isArray(state.currentGroup.members)
        ? state.currentGroup.members
        : [],
    isLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    isCurrentUserMember: (state, getters, rootState) => {
      const userId = rootState.auth.user?._id;
      // Usa il getter aggiornato per sicurezza
      const members = getters.getGroupMembers;
      return !!userId && members.includes(userId);
    },
  },
};

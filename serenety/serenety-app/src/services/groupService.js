// src/services/groupService.js
import api from "./api"; // La tua istanza axios configurata

export default {
  // --- Chiamate Utente ---
  async getGroups() {
    const response = await api.get("/api/groups");
    return response.data;
  },

  async getGroupDetails(groupId) {
    const response = await api.get(`/api/groups/${groupId}`);
    return response.data;
  },

  async joinGroup(groupId, userId) {
    // Passa userId nel body (richiesto dal backend placeholder)
    // Con JWT, il backend prenderebbe userId dal token e il body sarebbe vuoto
    const response = await api.post(`/api/groups/${groupId}/join`, { userId });
    return response.data;
  },

  async leaveGroup(groupId, userId) {
    // Passa userId nel body (richiesto dal backend placeholder)
    const response = await api.post(`/api/groups/${groupId}/leave`, { userId });
    return response.data;
  },

  async sendMessage(groupId, text, userId, userName) {
    // Passa i dati necessari (richiesto dal backend placeholder)
    const response = await api.post(`/api/groups/${groupId}/messages`, {
      text,
      userId,
      userName,
    });
    return response.data;
  },

  // --- Chiamate Admin ---
  async createGroup(name, description, adminCredentials) {
    // Includi le credenziali admin come richiesto da requireAdmin
    const payload = { name, description, ...adminCredentials };
    const response = await api.post("/api/admin/groups", payload);
    return response.data;
  },

  async deleteGroup(groupId, adminCredentials) {
    // DELETE non ha body standard, metti credenziali nei dati della richiesta config
    const response = await api.delete(`/api/admin/groups/${groupId}`, {
      data: adminCredentials,
    });
    return response.data;
  },
};

const state = {
  shopItems: [],
};

const mutations = {
  SET_SHOP_ITEMS(state, items) {
    state.shopItems = items;
  },
};

const actions = {
  // Placeholder action for fetching shop items (to be implemented later)
  fetchShopItems() {
    // Add your API logic here later
    // Example:
    // api.getShopItems().then(response => {
    //   commit('SET_SHOP_ITEMS', response.data);
    // });
  },
};

const getters = {
  getShopItems: (state) => state.shopItems,
};

export default {
  state,
  mutations,
  actions,
  getters,
};

import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      tasks: [],
      buyers: [],
    };
  },
  mutations: {
    setBuyers(state, buyers) {
      state.buyers = buyers;
    },
    addBuyer(state, buyer) {
      state.buyers.push(buyer);
    },
    updateBuyerInStore(state, updatedBuyer) {
      const index = state.buyers.findIndex(buyer => buyer.id === updatedBuyer.id);
      if (index !== -1) {
        state.buyers.splice(index, 1, updatedBuyer);
      }
    },
  },
  actions: {

    async fetchBuyers({ commit }) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/buyers', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${token}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          commit('setBuyers', result.data);
        } else {
          console.error('Error fetching buyers:', result.message);
        }
      } catch (error) {
        console.error('Failed to fetch buyers:', error);
      }
    },

    async createBuyer({ commit }, buyerData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/buyer', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyerData),
        });
        const result = await response.json();
        if (response.ok) {
          commit('addBuyer', result.data);
        } else {
          console.error('Error creating buyer:', result.message);
        }
      } catch (error) {
        console.error('Failed to create buyer:', error);
      }
    },

    async updateBuyer({ commit }, buyerData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/buyer/${buyerData.id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyerData),
        });
        const result = await response.json();
        if (response.ok) {
          commit('updateBuyerInStore', result.data);
        } else {
          console.error('Error updating buyer:', result.message);
        }
      } catch (error) {
        console.error('Failed to update buyer:', error);
      }
    },

    async searchBuyersByZipCode({ commit }, zipCode) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/search_buyers/${zipCode}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        if (response.ok) {
          commit('setBuyers', result.data);
        } else {
          console.error('Error searching buyers:', result.message);
        }
      } catch (error) {
        console.error('Failed to search buyers:', error);
      }
    },

    async searchBuyersWithFilters({ commit }, filters) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/filtered_buyers', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filters: {
              financial_status: filters.financial_status,
              min_area: filters.min_area,
              search_zip_code: filters.zip_code,
              // Add other filters as needed
            },
            sort_options: {
              inserted_at: 'desc',
            },
          }),
        });

        const result = await response.json();
        if (response.ok) {
          commit('setBuyers', result.data);
        } else {
          console.error('Error searching buyers:', result.message);
        }
      } catch (error) {
        console.error('Failed to search buyers with filters:', error);
      }
    },
    
  },
  getters: {
    buyers(state) {
      return state.buyers;
    },
  },
});

export default store;

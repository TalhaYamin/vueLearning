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
      const index = state.buyers.findIndex(buyer => buyer._id === updatedBuyer._id); // Use _id instead of id
      if (index !== -1) {
        state.buyers.splice(index, 1, updatedBuyer);
      }
    },
    deleteBuyerFromStore(state, buyerId) {
      state.buyers = state.buyers.filter(buyer => buyer._id !== buyerId);
    },
  },
  actions: {

    // Fetch all buyers
    async fetchBuyers({ commit }) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/buyers', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`, // Use Bearer for token authentication
          },
        });

        const buyers = await response.json();

        if (response.ok) {
          commit('setBuyers', buyers); // Assuming the response is an array of buyers
        } else {
          console.error('Error fetching buyers:', buyers.error);
        }
      } catch (error) {
        console.error('Failed to fetch buyers:', error);
      }
    },

    // Create a new buyer
    async createBuyer({ commit }, buyerData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/buyers', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyerData),
        });
        const newBuyer = await response.json();
        if (response.ok) {
          commit('addBuyer', newBuyer); // Assuming the response contains the created buyer
        } else {
          console.error('Error creating buyer:', newBuyer.error);
        }
      } catch (error) {
        console.error('Failed to create buyer:', error);
      }
    },

    // Update an existing buyer
    async updateBuyer({ commit }, buyerData) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/buyers/${buyerData._id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buyerData),
        });
        const updatedBuyer = await response.json();
        if (response.ok) {
          commit('updateBuyerInStore', updatedBuyer); // Assuming the response contains the updated buyer
        } else {
          console.error('Error updating buyer:', updatedBuyer.error);
        }
      } catch (error) {
        console.error('Failed to update buyer:', error);
      }
    },

    // Delete a buyer
    async deleteBuyer({ commit }, buyerId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/buyers/${buyerId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (response.ok) {
          commit('deleteBuyerFromStore', buyerId);
        } else {
          console.error('Error deleting buyer:', result.error);
        }
      } catch (error) {
        console.error('Failed to delete buyer:', error);
      }
    },

    // Search buyers with filters (example using name and company filters)
    async searchBuyersWithFilters({ commit }, filters) {
      try {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams(filters).toString(); // Convert filters object to query string
        const response = await fetch(`http://localhost:3000/api/buyers?${queryParams}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const buyers = await response.json();
        if (response.ok) {
          commit('setBuyers', buyers); // Assuming the response is an array of filtered buyers
        } else {
          console.error('Error searching buyers:', buyers.error);
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

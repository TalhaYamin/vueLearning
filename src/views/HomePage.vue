<template>
  <div>
    <h1>Buyers List</h1>

    <a-button type="primary" @click="showModal">+ Add Buyer</a-button>


    <!-- Search by Zip Code -->
    <div class="search-container">
      <form @submit.prevent="handleSearch">
        <input
          v-model="searchZipCode"
          type="text"
          placeholder="Enter Zip Code"
          class="search-input"
        />
        <a-button v-if="searchZipCode" type="default" @click="clearSearch" class="clear-button">×</a-button>
        <a-button type="primary" htmlType="submit">Search</a-button>
      </form>
    </div>

    <!-- Buyers Table -->
    <a-table
      :columns="columns"
      :data-source="paginatedData"
      row-key="id"
      :pagination="paginationConfig"
      @change="handleTableChange"
    >
      <!-- Custom template for action buttons -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleEdit(record)">Edit</a-button>
        </template>
      </template>
    </a-table>


    <!-- Buyer Modal -->
    <BuyerModal
      :visible="isModalVisible"
      :isEditMode="isEditMode"
      :buyerData="formData"
      @submit="handleModalSubmit"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'; 
import { useStore } from 'vuex';
import BuyerModal from '../components/BuyerModal.vue';

export default {
  components: {
    BuyerModal,
  },
  setup() {
    const store = useStore();
    const isModalVisible = ref(false);
    const isEditMode = ref(false);
    const formData = reactive({});
    const searchZipCode = ref(''); // New zip code search input

    // Fetch buyers data from Vuex store when component is mounted
    onMounted(() => {
      store.dispatch('fetchBuyers');
    });

    const buyers = computed(() => store.getters.buyers);

    const paginationConfig = reactive({
      current: 1,
      pageSize: 10,
      total: 0
    });

    watch(buyers, (newBuyers) => {
      paginationConfig.total = newBuyers.length;
    });

    const paginatedData = computed(() => {
      const start = (paginationConfig.current - 1) * paginationConfig.pageSize;
      const end = start + paginationConfig.pageSize;
      return buyers.value.slice(start, end);
    });

    const handleTableChange = (pagination) => {
      paginationConfig.current = pagination.current;
    };

    const showModal = () => {
      formData.first_name = '';
      formData.last_name = '';
      formData.email = '';
      isEditMode.value = false;
      isModalVisible.value = true;
    };

    const handleEdit = (record) => {
      Object.assign(formData, record);
      isEditMode.value = true;
      isModalVisible.value = true;
    };

    const handleModalSubmit = (buyerData) => {
      if (isEditMode.value) {
        store.dispatch('updateBuyer', buyerData);
      } else {
        store.dispatch('createBuyer', buyerData);
      }
      isModalVisible.value = false;
    };

    const handleModalCancel = () => {
      isModalVisible.value = false;
    };

    // Handle Zip Code Search
    const handleSearch = () => {
      store.dispatch('searchBuyersByZipCode', searchZipCode.value);
    };

    const clearSearch = () => {
      searchZipCode.value = '';
      store.dispatch('fetchBuyers'); // Re-fetch all buyers when search is cleared
    };

    return {
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'First Name', dataIndex: 'first_name', key: 'first_name' },
        { title: 'Last Name', dataIndex: 'last_name', key: 'last_name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'primary_phone_number', key: 'primary_phone_number' },
        { title: 'Action', key: 'action' },
      ],
      searchZipCode,
      paginatedData,
      paginationConfig,
      isModalVisible,
      isEditMode,
      formData,
      showModal,
      handleEdit,
      handleModalSubmit,
      handleModalCancel,
      handleTableChange,
      handleSearch,
      clearSearch
    };
  }
};
</script>

<style scoped>
.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.search-input {
  margin-right: 10px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
  margin-top: 10px;
}

.clear-button {
  margin-right: 10px;
  background-color: #f5f5f5;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
</style>

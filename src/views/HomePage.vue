<template>
  <div>
    <h1>Buyers List</h1>

    <a-button type="primary" @click="showModal">+ Add Buyer</a-button>

    <!-- Search with Multiple Filters -->
    <div class="search-container">
      <form @submit.prevent="handleSearch">
        <input
          v-model="filters.name"
          type="text"
          placeholder="Search by Name"
          class="search-input"
        />
        <input
          v-model="filters.company"
          type="text"
          placeholder="Search by Company"
          class="search-input"
        />
        <!-- Add more filter inputs as needed -->
        <a-button v-if="isAnyFilterActive" type="default" @click="clearSearch" class="clear-button">×</a-button>
        <a-button type="primary" htmlType="submit">Search</a-button>
      </form>
    </div>

    <!-- Buyers Table -->
    <a-table
      :columns="columns"
      :data-source="paginatedData"
      row-key="_id"
      :pagination="paginationConfig"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="handleEdit(record)">Edit</a-button>
          <a-button type="link" danger @click="handleDelete(record._id)">Delete</a-button>
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
    const filters = reactive({ name: '', company: '' }); // Define your filters here

    onMounted(() => {
      store.dispatch('fetchBuyers');
    });

    const buyers = computed(() => store.getters.buyers);

    const paginationConfig = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
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

    const handleDelete = (buyerId) => {
      store.dispatch('deleteBuyer', buyerId);
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

    // Check if any filter is active
    const isAnyFilterActive = computed(() => {
      return Object.values(filters).some((value) => value.trim() !== '');
    });

    // Handle Search with Filters
    const handleSearch = () => {
      store.dispatch('searchBuyersWithFilters', filters);
    };

    const clearSearch = () => {
      filters.name = '';
      filters.company = '';
      store.dispatch('fetchBuyers'); // Re-fetch all buyers when search is cleared
    };

    return {
      columns: [
        { title: 'ID', dataIndex: '_id', key: '_id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        { title: 'Action', key: 'action' },
      ],
      filters,
      paginatedData,
      paginationConfig,
      isModalVisible,
      isEditMode,
      formData,
      showModal,
      handleEdit,
      handleDelete,
      handleModalSubmit,
      handleModalCancel,
      handleTableChange,
      handleSearch,
      clearSearch,
      isAnyFilterActive,
    };
  },
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

<template>
  <a-modal
    :title="isEditMode ? 'Edit Buyer' : 'Create Buyer'"
    v-model:visible="isModalVisible"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleOk" class="buyer-form">
      <div class="form-item">
        <label for="first_name">First Name</label>
        <input v-model="formData.first_name" type="text" id="first_name" placeholder="Enter First Name" />
      </div>
      <div class="form-item">
        <label for="last_name">Last Name</label>
        <input v-model="formData.last_name" type="text" id="last_name" placeholder="Enter Last Name" />
      </div>
      <div class="form-item">
        <label for="email">Email</label>
        <input v-model="formData.email" type="email" id="email" placeholder="Enter Email" />
      </div>
      <div class="form-item">
        <label for="primary_phone_number">Primary Phone</label>
        <input v-model="formData.primary_phone_number" type="text" id="primary_phone_number" placeholder="Enter Phone Number" />
      </div>
      <div class="form-item">
        <label for="additional_desires">Additional Desires</label>
        <input v-model="formData.additional_desires" type="text" id="additional_desires" placeholder="Enter Additional Desires" />
      </div>
      <div class="form-item">
        <label for="agreement_expiry_date">Agreement Expiry Date</label>
        <input
          v-model="formData.agreement_expiry_date"
          type="date"
          id="agreement_expiry_date"
          placeholder="Select Expiry Date"
          style="width: 100%"
        />
      </div>
    </form>
  </a-modal>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { Modal } from 'ant-design-vue';
import { useStore } from 'vuex';

export default {
  components: {
    'a-modal': Modal,
  },
  props: {
    isEditMode: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    buyerData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const isModalVisible = ref(props.visible);
    const formData = reactive({ ...props.buyerData });

    // Convert ISO date to YYYY-MM-DD format for date input on edit
    watch(() => props.buyerData.agreement_expiry_date, (newDate) => {
      if (newDate) {
        formData.agreement_expiry_date = newDate.split('T')[0]; // Extract the date part (YYYY-MM-DD)
      }
    }, { immediate: true });

    watch(() => props.visible, (newVal) => {
      isModalVisible.value = newVal;
      Object.assign(formData, props.buyerData); // Reset the form data when the modal is opened
    });

    const handleOk = () => {
      // Ensure the date is converted back to ISO before sending
      if (formData.agreement_expiry_date && !formData.agreement_expiry_date.includes('T')) {
        formData.agreement_expiry_date = new Date(formData.agreement_expiry_date).toISOString();
      }

      if (props.isEditMode) {
        store.dispatch('updateBuyer', formData);
      } else {
        store.dispatch('createBuyer', formData);
      }

      emit('submit', formData);
      isModalVisible.value = false;
    };

    const handleCancel = () => {
      emit('cancel');
      isModalVisible.value = false;
    };

    return {
      formData,
      isModalVisible,
      handleOk,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.buyer-form {
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.buyer-form input:focus {
  border-color: #409eff;
}
</style>

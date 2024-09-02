<template>
  <a-modal
    :title="isEditMode ? 'Edit Buyer' : 'Create Buyer'"
    v-model:visible="isModalVisible"
    @cancel="handleCancel"
  >
    <form @submit.prevent="handleOk" class="buyer-form">
      <div class="form-item">
        <label for="name">Name</label>
        <input v-model="formData.name" type="text" id="name" placeholder="Enter Name" />
      </div>
      <div class="form-item">
        <label for="email">Email</label>
        <input v-model="formData.email" type="email" id="email" placeholder="Enter Email" />
      </div>
      <div class="form-item">
        <label for="phone">Primary Phone</label>
        <input v-model="formData.phone" type="text" id="phone" placeholder="Enter Phone Number" />
      </div>
      <div class="form-item">
        <label for="company">Company</label>
        <input v-model="formData.company" type="text" id="company" placeholder="Enter Company" />
      </div>
      <!-- Submit button inside the form to trigger handleOk only once -->
      <a-button type="primary" htmlType="submit">
        {{ isEditMode ? 'Update' : 'Create' }} Buyer
      </a-button>
    </form>
  </a-modal>
</template>

<script>
import { ref, reactive, watch } from 'vue';

export default {
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
    const isModalVisible = ref(props.visible);
    const formData = reactive({ ...props.buyerData });

    watch(
      () => props.visible,
      (newVal) => {
        isModalVisible.value = newVal;
        if (props.isEditMode && newVal) {
          Object.assign(formData, props.buyerData);
        }
      }
    );

    const handleOk = () => {
      // Prevent multiple API calls by ensuring handleOk is triggered only by form submission
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

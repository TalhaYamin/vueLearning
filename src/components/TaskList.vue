<template>
  <ul>
    <TaskItem
      v-for="(task, index) in tasks"
      :key="index"
      :task="task"
      @completeTask="completeTask(index)"
      @deleteTask="deleteTask(index)"
    />
  </ul>
</template>

<script>
import TaskItem from './TaskItem.vue';

export default {
  props: ['tasks'],
  components: {
    TaskItem
  },
  methods: {
    completeTask(index) {
      this.$emit('completeTask', index);
    },
    deleteTask(index) {
      this.$emit('deleteTask', index);
    }
  }
};
</script>

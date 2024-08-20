<template>
  <li>
    <span :style="{ textDecoration: task.completed ? 'line-through' : 'none' }">
      {{ task.text }}
    </span>
    <button @click="$emit('completeTask')">{{ task.completed ? 'Undo' : 'Complete' }}</button>
    <button @click="$emit('deleteTask')">Delete</button>
  </li>
</template>

<script>
export default {
  props: ['task']
};
</script>

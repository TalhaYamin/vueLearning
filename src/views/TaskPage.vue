<template>
  <div>
    <h1>Your Tasks</h1>
    <input v-model="newTask" placeholder="Add a new task" />
    <button @click="addTask">Add Task</button>

    <TaskList :tasks="tasks" @completeTask="completeTask" @deleteTask="deleteTask" />
  </div>
</template>

<script>
import TaskList from '../components/TaskList.vue';

export default {
  components: {
    TaskList
  },
  data() {
    return {
      newTask: '',
      // tasks: []
    };
  },
  // methods: {
  //   addTask() {
  //     if (this.newTask.trim()) {
  //       this.tasks.push({ text: this.newTask, completed: false });
  //       this.newTask = '';
  //     }
  //   },
  //   completeTask(index) {
  //     this.tasks[index].completed = !this.tasks[index].completed;
  //   },
  //   deleteTask(index) {
  //     this.tasks.splice(index, 1);
  //   }
  // }

  computed: {
  tasks() {
    return this.$store.state.tasks;
  }
},
methods: {
  addTask() {
    if (this.newTask.trim()) {
      this.$store.dispatch('addTask', { text: this.newTask, completed: false });
      this.newTask = '';
    }
  },
  deleteTask(index) {
    this.$store.dispatch('deleteTask', index);
  },
  completeTask(index) {
    this.$store.dispatch('toggleTask', index);
  }
}

};
</script>

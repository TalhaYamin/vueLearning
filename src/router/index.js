import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AboutPage from '../views/AboutPage.vue';
import TaskPage from '../views/TaskPage.vue'
import LoginPage from '../views/LoginPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/about', name: 'About', component: AboutPage },
  { path: '/task', name: 'Task', component: TaskPage },
  { path: '/login', name: 'Login', component: LoginPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the token is stored
  if (to.name !== 'Login' && !isAuthenticated) next({ name: 'Login' });
  else next();
});


export default router;

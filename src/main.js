import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Antd from 'ant-design-vue'; 
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css'; // Import the CSS for Vue Toastification

// Create the app and configure plugins
const app = createApp(App);

app.use(router);
app.use(store);
app.use(Antd);
app.use(Toast, {
  // Optional configuration for Toastification
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: false,
});

app.mount('#app');


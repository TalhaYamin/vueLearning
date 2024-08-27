<template>
  <div class="login-container">
    <h1 class="login-title">Login</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" placeholder="Enter your email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" placeholder="Enter your password" />
      </div>
      <button type="submit" class="login-button">Login</button>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref(null);
    const router = useRouter();

    const handleLogin = async () => {
      if (!email.value || !password.value) {
        error.value = 'Please fill in all fields.';
        return;
      }

      try {
        const response = await fetch('/api/users/log_in', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.value, password: password.value })
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify({ email: email.value, id: data.data.id }));
          router.push('/');
        } else {
          error.value = data.message || 'Invalid email or password.';
        }
      } catch (err) {
        error.value = 'An error occurred during login.';
        console.error(err);
      }
    };

    return {
      email,
      password,
      handleLogin,
      error
    };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-title {
  font-size: 2rem;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.login-button {
  padding: 12px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.login-button:hover {
  background-color: #36a369;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>

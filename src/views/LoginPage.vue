<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" placeholder="Enter your email" />
      </div>
      <div>
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" placeholder="Enter your password" />
      </div>
      <button type="submit">Login</button>
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
      console.log("Email: ", email.value);
      console.log("Password: ", password.value);

      // Validate that both fields are filled
      if (!email.value || !password.value) {
        error.value = 'Please fill in all fields.';
        return;
      }

      try {
        error.value = null;

        // Correct login request
        const response = await fetch('/api/users/log_in', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',  // Set Accept header
            'Content-Type': 'application/json'  // Set Content-Type header
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Handle successful login
          localStorage.setItem('token', data.data.token);  // Assuming the token is returned in the response
          router.push('/');  // Redirect to home page
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
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>

<template>
    <div id="app">
        <div>
            <nav class="navbar">
                <router-link to="/" class="nav-link">Home</router-link>
                <router-link to="/about" class="nav-link">About</router-link>
                <router-link to="/task" class="nav-link">Task</router-link>
                <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
                <a class="nav-link" v-if="isAuthenticated" @click="logout">Logout</a>
            </nav>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        isAuthenticated() {
            return !!localStorage.getItem('token');
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
nav {
    margin-bottom: 20px;
}

.navbar {
    display: flex;
    justify-content: center;
    background-color: #333;
    padding: 10px;
    border-radius: 8px;
}

.nav-link {
    color: #fff;
    text-decoration: none;
    font-size: 18px;
    padding: 10px 20px;
    border-radius: 4px;
    transition: background-color 0.3s, color 0.3s;
}

.nav-link:hover {
    background-color: #575757;
    color: #fff;
}

.nav-link:not(:last-child) {
    margin-right: 15px;
}

/* Fix router-link styling */
a.router-link-active {
    color: #42b983;
}
</style>

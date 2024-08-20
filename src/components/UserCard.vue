<template>
    <div>
        <h1>{{name}}</h1>
        <h1>{{age}}</h1>
    </div>
</template>

<script>
export default {
    props: ['name', 'age']
}
</script>

<style scoped>
h1 {
    color: #42b983;
}
</style>

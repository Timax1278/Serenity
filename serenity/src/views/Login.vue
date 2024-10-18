<template>
    <v-container>
        <v-form ref="form" v-model="valid">
            <v-text-field v-model="email" label="Email" type="email" :rules="[v => !!v || 'Email is required']"
                required />
            <v-text-field v-model="password" label="Password" type="password"
                :rules="[v => !!v || 'Password is required']" required />
            <v-btn @click="submit">Login</v-btn>
        </v-form>
    </v-container>
</template>
<script>
export default {
    name: 'LoginView',
    data() {
        return {
            valid: false,
            email: '',
            password: ''
        }
    },
    methods: {
        submit() {
            if (this.$refs.form.validate()) {
                // Handle login logic
                console.log('Logging in with', this.email)
            }
        }
    }
}
</script>
<style scoped>
/* Add your styles here */
</style>

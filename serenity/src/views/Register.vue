<template>
    <v-container>
        <v-form ref="form" v-model="valid">
            <v-text-field v-model="email" label="Email" type="email" :rules="[v => !!v || 'Email is required']"
                required />
            <v-text-field v-model="password" label="Password" type="password"
                :rules="[v => !!v || 'Password is required']" required />
            <v-text-field v-model="confirmPassword" label="Confirm Password" type="password"
                :rules="[v => v === password || 'Passwords do not match']" required />
            <v-btn @click="submit">Register</v-btn>
        </v-form>
    </v-container>
</template>
<script>
export default {
    name: 'RegisterView',
    data() {
        return {
            valid: false,
            email: '',
            password: '',
            confirmPassword: ''
        }
  },
  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        console.log('Registering with', this.email)
      }
    }
  }
}
</script>
<style scoped>
/* Add your styles here */
</style>

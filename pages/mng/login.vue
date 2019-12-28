<template>
  <div class="container">
    <div class="links">
      <h1 class="title">Tech Blog Login Page</h1>
      <b-button @click="handleGoogleLogin" variant="primary" size="lg">Google Login</b-button>
      <div v-if="loggedIn">Are you loggedIn? :{{ loggedIn }}</div>
      <div v-if="loggedIn">Welcome {{ user }} !!</div>
      <div v-if="loggedIn">Email {{ email }} !!</div>
    </div>
  </div>
</template>

<script>
import Logo from "~/components/Logo.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    Logo
  },
  computed: {
    ...mapGetters("authentication", ["user", "loggedIn"])
  },
  async fetch({ store, app, redirect }) {
    const { loggedIn, user, email } = await app.$axios.$get("/auth-check");
    store.commit("authentication/setIsLoggedIn", loggedIn);
    store.commit("authentication/setUser", user);
    store.commit("authentication/setEmail", email);
    if(loggedIn) {
      console.log("push するデー")
      redirect('/mng');
    }
  },
  methods: {
    checkLoggedIn() {
      if (this.loggedIn) {
        this.$router.push("/mng");
      }
    },
    async handleGoogleLogin() {
      await this.googleLogin();
      await this.checkLoggedIn();
    },
    ...mapActions("authentication", ["googleLogin"])
  }
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
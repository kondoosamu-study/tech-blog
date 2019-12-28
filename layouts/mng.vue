<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="/">m_blog</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item href="/">Blog Top</b-nav-item>
          <b-nav-item href="/mng">Articles</b-nav-item>
          <b-nav-item href="/mng/create">Create Article</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item right>
            <b-nav-item href="#">Sign Out</b-nav-item>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <nuxt />
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$auth();
      this.$cookies.remove("token");
      this.$store.commit("auth/setLoggedIn", false);
      this.$router.push("/admin/login");
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
  color: white;
}
</style>
<script>
import axios from "axios";
const urlCallbackBE =
  process.env.VUE_APP_END_POINT_API + "auth/facebook/callbackBE";
export default {
  async created() {
    const queryParam = this.$route.query;
    await axios
      .get(urlCallbackBE, { params: queryParam })
      .then((response) => {
        localStorage.setItem("access_token", response.data.access_token);
        const expires_in = Date.now() + response.data.expires_in;
        localStorage.setItem("expires_in", expires_in);
         localStorage.setItem("userId", response.data.userId);
        this.$router.push({ name: "home" });
      })
      .catch(() => {
        this.$router.push({name:"login"});
      });
  },
};
</script>
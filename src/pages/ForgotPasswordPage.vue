<template>
  <div class="container">
    <form class="form-forgotPassword" @submit.prevent="submit">
      <div class="forgot-title">ResetPassword</div>
      <div class="forgot-box">
        <input
          v-model="email"
          type="email"
          class="forgot-input"
          placeholder="Email address"
        />
        <span v-if="errorEmail" class="error">{{ errorEmail }}</span>
        <input
          class="forgot-input button"
          type="submit"
          value="Submit"
        />
      </div>
      <a :href="urlLogin"> LOGIN? </a>
    </form>
  </div>
</template>

<script>
import axios from "axios";
const urlLogin = process.env.VUE_APP_URL + "login";
const urlSendEmail = process.env.VUE_APP_END_POINT_API + "forgot-password";
export default {
  data() {
    return {
      urlLogin: urlLogin,
      email: "",
      errorEmail: "",
      emailRegex: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
    };
  },
  methods: {
    async submit() {
      if (this.validateForm()) {
        await axios
          .post(urlSendEmail, { email: this.email })
          .then(() => {
            this.$router.push("/login");
          })
          .catch((error) => {
            console.log(error);
            if (error.response.data.message == "email is not found"){
              this.errorEmail = "";
              this.errorEmail = "Email is not found";
            }
          });
      }
    },
    validateForm() {
      this.errorEmail = "";
      if (!this.email || !this.emailRegex.test(this.email)) {
        this.errorEmail = "Please enter a valid email address.";
      }
      return !this.errorEmail;
    },
  },
};
</script>

<style lang="css">
body {
  padding: 0px;
  margin: 0px;
  font-family: sans-serif, helvetica;
  box-sizing: border-box;
  background-color: #243b55;
}
.container {
  max-width: 450px;
  margin-top: 200px;
  margin-left: 35%;
  text-align: center;
}
.container * {
  box-sizing: border-box;
  border-radius: 3px;
}
.form-forgotPassword {
  margin-top: 20px;
  background-color: #ffffff;
  color: #565656;
  padding: 40px;
  position: relative;
}
.forgot-title {
  font-size: 30px;
  font-weight: 300;
  margin: 0px 0px 35px 0px;
}
.form-forgotPassword .forgot-input {
  display: block;
  margin: 20px auto;
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  border: solid #e7e7e7 1px;
  background-color: #fcfcfc;
}
.form-forgotPassword .forgot-input.button {
  border: none;
  color: white;
  background: #00796b;
  cursor: pointer;
  margin-top: 40px;
}
.form-forgotPassword .forgot-input.button:hover {
  transition: 100ms;
  background-color: #2e435b;
}
.form-forgotPassword a {
  font-size: 0.9em;
  text-decoration: underline;
  text-decoration: none;
}
.form-forgotPassword span {
  position: absolute;
  color: red;
  top:170px;
  left: 43px;
}
</style>
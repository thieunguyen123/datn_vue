<template>
  <div class="body">
    <div class="container">
      <form class="form-forgot">
        <div class="forgot-title">ResetPassword</div>
        <div class="forgot-box">
          <div class="input">
            <label>New Password</label>
            <input v-model="password" type="password" class="login-input" />
            <span v-if="errors.password" class="error">{{
              errors.password
            }}</span>
          </div>

          <div class="input">
            <label>Password Confirm</label>
            <input
              v-model="password_confirmation"
              type="password"
              class="login-input"
            />
            <span v-if="errors.password_confirmed" class="error">{{
              errors.password_confirmed
            }}</span>
          </div>

          <div class="input">
            <label>Token</label>
            <input v-model="token" type="text" class="login-input" />
            <span v-if="errors.token" class="error">{{ errors.token }}</span>
          </div>

          <input
            @click="submit"
            class="login-input button"
            type="button"
            value="Submit"
          />
        </div>
        <a class="url-login" :href="urlLogin"> LOGIN? </a>
        <span class="resend-token" @click="resendToken">Resend the token</span>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const urlLogin = process.env.VUE_APP_URL + "login";
const urlResetPassword = process.env.VUE_APP_END_POINT_API + "reset-password";
const urlSendEmail = process.env.VUE_APP_END_POINT_API + "forgot-password";
export default {
  data() {
    return {
      email: this.$route.query.email,
      urlLogin: urlLogin,
      password: "",
      password_confirmation: "",
      token: "",
      errors: {
        password: "",
        password_confirmed: "",
        token: "",
      },
      passwordRegex: /.{6,}/,
      tokenRegex: /^[a-zA-Z0-9]{20}$/,
    };
  },
  methods: {
    async resendToken() {
      await axios
        .post(urlSendEmail, { email: this.email })
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    },

    async submit() {
      if (this.validateForm()) {
        await axios
          .post(urlResetPassword, {
            email: this.email,
            password: this.password,
            password_confirmation: this.password_confirmation,
            token: this.token,
          })
          .then(() => {
            this.$router.push({ name: "login" });
          })
          .catch((error) => {
            console.log(error);
            if (
              error.response.data.message ===
                "Token is expired, please resend token." ||
              error.response.data.message === "Token is invalid."
            ) {
              this.errors.token = error.response.data.message;
            }
          });
      }
    },
    validateForm() {
      this.errors = {};

      if (!this.password || !this.passwordRegex.test(this.password)) {
        this.errors.password =
          "Please enter a valid password (at least 6 characters).";
      }

      if (
        !this.password_confirmation ||
        this.password_confirmation !== this.password
      ) {
        this.errors.password_confirmed =
          "Password confirmation does not match the password.";
      }

      if (!this.token || !this.tokenRegex.test(this.token)) {
        this.errors.token = "Please enter a valid token";
      }
      return Object.keys(this.errors).every((key) => !this.errors[key]);
    },
  },
};
</script>

<style lang="css" scoped>

.body {
  padding: 0px;
  margin: 0px;
  height: 100vh;
  font-family: sans-serif, helvetica;
  box-sizing: border-box;
  background-color: #243b55;
  position: relative;
}

.container {
  margin-left: 35%;
  text-align: center;
}

.container * {
  box-sizing: border-box;
  border-radius: 3px;
}

.form-forgot {
  position: absolute;
  top: 100px;
  width: 450px;
  background-color: #ffffff;
  color: #565656;
  padding: 40px;
}

.forgot-title {
  font-size: 30px;
  font-weight: 300;
  margin: 0px 0px 35px 0px;
}

form .login-input {
  display: block;
  margin: 10px auto;
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  border: solid #e7e7e7 1px;
  background-color: #fcfcfc;
}

form .login-input.button {
  border: none;
  color: white;
  background: #00796b;
  cursor: pointer;
}

form .login-input.button:hover {
  transition: 100ms;
  background-color: #2e435b;
}

.url-login {
  font-size: 0.9em;
  text-decoration: none;
}

.resend-token {
  margin-left: 80px;
  text-decoration: none;
  cursor: pointer;
  color: rgb(76, 76, 238);
}

.input {
  margin-bottom: 5px;
}

.input span {
  color: red;
  font-size: 0.8em;
}
</style>
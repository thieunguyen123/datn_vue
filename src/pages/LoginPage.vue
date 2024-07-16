  <template>
  <div class="body">
    <div class="login-box">
      <h2>Login</h2>
      <form>
        <div class="user-box">
          <input type="text" v-model="fields.email" name="" required="" />
          <label>Email</label>
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="user-box">
          <input
            type="password"
            v-model="fields.password"
            name=""
            required=""
          />
          <span v-if="errors.password" class="error">{{
            errors.password
          }}</span>
          <label>Password</label>
        </div>
        <div class="social-login">
          <a :href="urlLoginFacebook">
            Login with facebook
            <div class="icon">
              <font-awesome-icon icon="fa-brands fa-facebook" />
            </div>
          </a>
          <a :href="urlLoginGoogle">
            login with Google
            <div class="icon">
              <font-awesome-icon icon="fa-brands fa-google" />
            </div>
          </a>
        </div>
        <div style="position: relative" class="form-submit">
          <a
            style="position: absolute; top: 65px; left: -17px; font-size: 10px"
            :href="urlForgotPassword"
            >forgot password?</a
          >
          <a href="#" plain @click="submit">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Submit
          </a>
          <a class="url-register" :href="urlRegister">register</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ElNotification } from "element-plus";
const urlBE = process.env.VUE_APP_END_POINT_API;
const urlFE = process.env.VUE_APP_URL;
const urlForgotPassword = urlFE + "forgot-password";
const urlLogin = urlBE + "login";
const urlLoginGoogle = urlBE + "auth/google";
const urlLoginFacebook = urlBE + "auth/facebook";
const urlRegister = process.env.VUE_APP_URL + "register";
export default {
  data() {
    return {
      urlForgotPassword: urlForgotPassword,
      urlLoginGoogle: urlLoginGoogle,
      urlLoginFacebook: urlLoginFacebook,
      fields: {},
      errors: {},
      emailRegex: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      passwordRegex: /.{6,}/,
      urlRegister: urlRegister,
      valueRoleAdmin: "R1",
      valueRoleOwner: "R2",
      query: null,
    };
  },

  // created() {
  //   this.query = this.$route.query;
  //   if (this.query.badmintonCourt) {
  //     this.query.path =
  //       this.query.path + `?badmintonCourt=${this.query.badmintonCourt}`;
  //   }
  // },

  methods: {
    async submit() {
      if (this.validateForm()) {
        await axios
          .post(urlLogin, this.fields)
          .then((response) => {
            ElNotification({
              title: "Successfully Notification",
              message: "Login is successfully",
              position: "bottom-right",
              type: "success",
              duration: "3000",
            });
            localStorage.setItem("access_token", response.data.access_token);
            const expires_in = Date.now() + response.data.expires_in;
            localStorage.setItem("expires_in", expires_in);
            localStorage.setItem("role_id", response.data.role_id);
            localStorage.setItem("userId", response.data.userId);
            if (response.data.role_id === this.valueRoleAdmin) {
              this.$router.push({ name: "admin" });
            } else if (response.data.role_id === this.valueRoleOwner) {
              this.$router.push({ name: "owner" });
            } else {
              this.$router.push("/");
            }
          })
          .catch(() => {
            ElNotification({
              title: "Error Notification",
              message: "Login is failed",
              position: "bottom-right",
              type: "error",
              duration: "3000",
            });
            this.errors.password = "";
            this.errors.password =
              "You entered the wrong username or password, please re-enter";
          });
      }
    },

    validateForm() {
      this.errors = {};
      if (!this.fields.email || !this.emailRegex.test(this.fields.email)) {
        this.errors.email = "Please enter a valid email address.";
      }
      if (
        !this.fields.password ||
        !this.passwordRegex.test(this.fields.password)
      ) {
        this.errors.password =
          "Please enter a valid password (at least 6 characters).";
      }
      return Object.keys(this.errors).every((key) => !this.errors[key]);
    },
  },
};
</script>

<style scoped>
.body {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background: linear-gradient(#141e30, #243b55);
}

.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  padding: 40px;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.6);
  border-radius: 10px;
}

.login-box h2 {
  margin: 0 0 30px;
  padding: 0;
  color: #fff;
  text-align: center;
}

.social-login {
  position: relative;
  float: left;
  width: 100%;
  height: auto;
  padding: 10px 0 15px 0;
  border-bottom: 1px solid #eee;
  display: flex;
}

.login-box form .social-login a {
  width: calc(60% - 8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  margin: 0 3%;
  text-align: center;
  font-size: 10px;
  border-radius: 10px;
  height: 35px;
}

.social-login a:first-child {
  background-color: #49639f;
}

.social-login a:last-child {
  background-color: #df4a32;
}

.login-box .user-box {
  position: relative;
}

.login-box .user-box input {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  color: #fff;
  margin-bottom: 50px;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  background: transparent;
}
.login-box .user-box label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  font-size: 16px;
  color: #fff;
  pointer-events: none;
  transition: 0.5s;
}

.login-box .user-box input:focus ~ label,
.login-box .user-box input:valid ~ label {
  top: -20px;
  left: 0;
  color: #03e9f4;
  font-size: 12px;
}

.login-box form a {
  position: relative;
  display: inline-block;
  padding: 10px 20px;
  color: #03e9f4;
  text-decoration: none;
  text-transform: uppercase;
  overflow: hidden;
  transition: 0.5s;
  margin-top: 30px;
  letter-spacing: 4px;
  float: right;
}

.login-box a:hover {
  background: #03e9f4;
  color: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #03e9f4, 0 0 25px #03e9f4, 0 0 50px #03e9f4,
    0 0 100px #03e9f4;
}

.login-box a span {
  position: absolute;
  display: block;
}

.login-box a span:nth-child(1) {
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #03e9f4);
  animation: btn-anim1 1s linear infinite;
}

.login-box form .social-login a .icon {
  position: absolute;
  top: 33px;
  right: 10px;
}

.url-register {
  position: absolute;
  top: 10px;
  left: -90px;
  font-size: 10px;
}

@keyframes btn-anim1 {
  0% {
    left: -100%;
  }
  50%,
  100% {
    left: 100%;
  }
}

.login-box a span:nth-child(2) {
  top: -100%;
  right: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #03e9f4);
  animation: btn-anim2 1s linear infinite;
  animation-delay: 0.25s;
}

@keyframes btn-anim2 {
  0% {
    top: -100%;
  }
  50%,
  100% {
    top: 100%;
  }
}

.login-box a span:nth-child(3) {
  bottom: 0;
  right: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(270deg, transparent, #03e9f4);
  animation: btn-anim3 1s linear infinite;
  animation-delay: 0.5s;
}

@keyframes btn-anim3 {
  0% {
    right: -100%;
  }
  50%,
  100% {
    right: 100%;
  }
}

.login-box a span:nth-child(4) {
  bottom: -100%;
  left: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(360deg, transparent, #03e9f4);
  animation: btn-anim4 1s linear infinite;
  animation-delay: 0.75s;
}

@keyframes btn-anim4 {
  0% {
    bottom: -100%;
  }
  50%,
  100% {
    bottom: 100%;
  }
}

.login-box .user-box .error {
  position: absolute;
  color: red;
  top: 50px;
  left: 0px;
  font-size: 13px;
}
</style>

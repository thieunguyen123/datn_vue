<template>
  <div class="body">
    <div class="login-box">
      <div class="lb-header">
        <a href="#" id="signupBoxLOgin">Sign Up</a>
      </div>
      <div class="social-login">
        <a :href="urlLoginFacebook">
          <i class="fa fa-facebook fa-lg"></i>
          Login in with facebook
        </a>
        <a :href="urlLoginGoogle">
          <i class="fa fa-google-plus fa-lg"></i>
          log in with Google
        </a>
      </div>
      <form class="email-signup" @submit.prevent="submit">
        <div class="u-form-group">
          <label for="">First Name</label>
          <input
            type="text"
            v-model="fields.first_name"
            id="firstName"
            placeholder="First Name"
          />
          <span v-if="errors.firstName" class="error">{{
            errors.firstName
          }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Last Name</label>
          <input
            type="text"
            v-model="fields.last_name"
            id="lastName"
            placeholder="Last Name"
          />
          <span v-if="errors.lastName" class="error">{{
            errors.lastName
          }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Phone Number</label>
          <input
            type="text"
            v-model="fields.phone_number"
            id="phoneNumber"
            placeholder="Phone Number"
          />
          <span v-if="errors.phoneNumber" class="error">{{
            errors.phoneNumber
          }}</span>
        </div>
        <div class="u-form-group">
          <label>Gender</label>
          <div class="gender" v-for="(gen, index) in gender" :key="index">
            <input type="radio" :value="gen" v-model="fields.gender" />
            <span>{{ getDisplayedGenderValue(gen) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label class="role" for="role">Role</label>
          <div class="gender" v-for="(role, index) in role" :key="index">
            <input type="radio" :value="role" v-model="fields.role_id" />
            <span>{{ getDisplayedRoleValue(role) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label for="">Email</label>
          <input
            id="email"
            type="email"
            v-model="fields.email"
            placeholder="Email"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Password</label>
          <input
            id="password"
            type="password"
            v-model="fields.password"
            placeholder="Password"
          />
          <span v-if="errors.password" class="error">{{
            errors.password
          }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Password Confirm</label>
          <input
            id="passwordConfirmation"
            type="password"
            v-model="fields.password_confirmation"
            placeholder="Confirm Password"
          />
          <span v-if="errors.passwordConfirmation" class="error">{{
            errors.passwordConfirmation
          }}</span>
        </div>
        <RecaptchaV2
          style="margin-left: 120px"
          @expired-callback="handleExpiredCallback"
          @load-callback="handleLoadCallback"
        />
        <span v-if="errors.captcha && !fields.captcha" class="errorCaptcha">{{
          errors.captcha
        }}</span>
        <div class="u-form-group">
          <button type="submit">Sign Up</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { RecaptchaV2, useRecaptcha } from "vue3-recaptcha-v2";
import axios from "axios";
import useInfoAccountStore from "../stores/Account.js";
const { handleReset } = useRecaptcha();
const urlRegister = process.env.VUE_APP_END_POINT_API + "register";
import { ElNotification } from "element-plus";
const urlLoginGoogle = process.env.VUE_APP_END_POINT_API + "auth/google";
const urlLoginFacebook = process.env.VUE_APP_END_POINT_API + "auth/facebook";
export default {
  components: {
    RecaptchaV2: RecaptchaV2,
  },

  setup() {
    const infoAccount = useInfoAccountStore();
    return { infoAccount };
  },

  data() {
    return {
      fields: {
        first_name: "",
        last_name: "",
        phone_number: "",
        gender: "M",
        role_id: "R3",
        email: "",
        password: "",
        password_confirmation: "",
        captcha: "",
      },
      urlLoginFacebook: urlLoginFacebook,
      urlLoginGoogle: urlLoginGoogle,
      gender: ["M", "F", "O"],
      role: ["R2", "R3"],
      errors: {},
      emailRegex: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      firstNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      lastNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      phoneNumberRegex:
        /^((\+84)|(0))(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      passwordRegex: /.{6,}/,
    };
  },
  methods: {
    handleExpiredCallback() {
      this.fields.captcha = "";
    },
    handleLoadCallback(response) {
      this.fields.captcha = response;
    },
    getDisplayedGenderValue(value) {
      return this.infoAccount.genderOptions[value];
    },

    getDisplayedRoleValue(value) {
      return this.infoAccount.roleOptions[value];
    },

    submit() {
      if (this.validateForm()) {
        axios
          .post(urlRegister, this.fields)
          .then(() => {
            ElNotification({
              title: "Successfully Notification",
              message: "Register is successfully",
              position: "bottom-right",
              type: "success",
              duration: "3000",
            });
            this.$router.push({ name: "login" });
          })
          .catch((error) => {
            ElNotification({
              title: "Error Notification",
              message: "Register is failed",
              position: "bottom-right",
              type: "error",
              duration: "3000",
            });
            this.errors.email = error.response.data.errors.email[0];
            this.fields.captcha = "";
            handleReset();
          });
      }
    },

    validateForm() {
      this.errors = {};
      if (
        !this.fields.first_name ||
        !this.firstNameRegex.test(this.fields.first_name)
      ) {
        this.errors.firstName =
          "Please enter a valid first name (3-20 characters, alphanumeric).";
      }

      if (
        !this.fields.last_name ||
        !this.lastNameRegex.test(this.fields.last_name)
      ) {
        this.errors.lastName =
          "Please enter a valid last name (3-20 characters, alphanumeric).";
      }

      if (
        !this.fields.phone_number ||
        !this.phoneNumberRegex.test(this.fields.phone_number)
      ) {
        this.errors.phoneNumber = "Please enter a valid phone number.";
      }

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

      if (
        !this.fields.password_confirmation ||
        this.fields.password_confirmation !== this.fields.password
      ) {
        this.errors.passwordConfirmation =
          "Password confirmation does not match the password.";
      }

      if (!this.fields.captcha) {
        this.errors.captcha = "Please checked captcha";
      }
      return Object.keys(this.errors).every((key) => !this.errors[key]);
    },
  },
};
</script>

<style scoped>
.body {
  height: 120vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background: linear-gradient(to bottom right, #00ffa9, #0d4dff);
  position: relative;
}

.login-box {
  position: absolute;
  top: 13%;
  left: 35%;
  width: 500px;
  height: 700px;
  background-color: #fff;
  padding: 20px;
  border-radius: 3px;
  -webkit-box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.33);
  -moz-box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.33);
  box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.33);
  border-radius: 10px;
}

.lb-header {
  position: relative;
  color: #00415d;
  margin: 5px 5px 10px 5px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  text-align: center;
  height: 28px;
}

.lb-header a {
  margin: 0 25px;
  padding: 0 20px;
  text-decoration: none;
  color: #666;
  font-weight: bold;
  font-size: 25px;
  -webkit-transition: all 0.1s linear;
  -moz-transition: all 0.1s linear;
  transition: all 0.1s linear;
}

.lb-header .active {
  color: #029f5b;
  font-size: 18px;
}

.social-login {
  position: relative;
  float: left;
  width: 100%;
  height: auto;
  padding: 10px 0 15px 0;
  border-bottom: 1px solid #eee;
}

.social-login a {
  position: relative;
  float: left;
  width: calc(40% - 8px);
  text-decoration: none;
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 2px;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0 3%;
  text-align: center;
}

.social-login a i {
  position: relative;
  float: left;
  width: 20px;
  top: 2px;
}

.social-login a:first-child {
  background-color: #49639f;
}

.social-login a:last-child {
  background-color: #df4a32;
}

.email-login,
.email-signup {
  position: relative;
  float: left;
  width: 100%;
  height: auto;
  margin-top: 20px;
  text-align: center;
}

.u-form-group {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  position: relative;
}

.u-form-group label {
  flex: 0 0 100px;
  margin-right: 20px;
  text-align: right;
}

.u-form-group input[type="email"],
.u-form-group input[type="password"],
.u-form-group input[type="text"] {
  width: 100%;
  height: 35px;
  outline: none;
  border: 1px solid #ddd;
  padding: 0 10px;
  border-radius: 5px;
  box-sizing: border-box;
  color: #333;
  font-size: 0.8rem;
  -webkit-transition: all 0.1s linear;
  -moz-transition: all 0.1s linear;
  transition: all 0.1s linear;
}

.u-form-group input:focus {
  border-color: #358efb;
}

.u-form-group .error {
  color: red;
  font-size: 0.7rem;
  margin-top: 3px;
  text-align: left;
  position: absolute;
  bottom: -15px;
  left: 120px;
}

.u-form-group button {
  width: 50%;
  background-color: #1cb94e;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  font-weight: normal;
  padding: 14px 0;
  border-radius: 7px;
  text-transform: uppercase;
  margin-left: 25%;
}

.u-form-group .gender {
  display: flex;
  align-items: center;
  margin-left: 20px;
}
.u-form-group .gender input[type="radio"] {
  margin-right: 10px;
}

.u-form-group .gender span {
  margin-right: 15px;
}

button {
  margin-top: 15px;
  cursor: pointer;
}

.error-captcha {
  color: red;
  font-size: 0.7rem;
  margin-left: -120px;
}
</style>

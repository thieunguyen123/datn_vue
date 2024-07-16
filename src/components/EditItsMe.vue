<template>
  <el-dialog
    style="background: linear-gradient(to bottom right, #aa, #ffffff)"
    v-model="centerDialogVisible"
    :title="infoModal.showPassword ? 'Create User' : 'Edit User'"
    width="35%"
    center
    top="10vh"
  >
    <div class="login-box">
      <form class="email-signup" @submit.prevent="submit">
        <div class="u-form-group">
          <label class="" for="">FirstName</label>
          <input
            v-model="user.first_name"
            type="text"
            id="firstName"
            placeholder="FirstName"
          />
          <span v-if="errors.first_name" class="error">{{
            errors.first_name
          }}</span>
        </div>
        <div class="u-form-group">
          <label for="">LastName</label>
          <input
            type="text"
            v-model="user.last_name"
            id="lastName"
            placeholder="LastName"
          />
          <span v-if="errors.last_name" class="error">{{
            errors.last_name
          }}</span>
        </div>
        <div class="u-form-group">
          <label for="">PhoneNumber</label>
          <input
            v-model="user.phone_number"
            type="text"
            id="phoneNumber"
            placeholder="PhoneNumber"
          />
          <span v-if="errors.phone_number" class="error">{{
            errors.phone_number
          }}</span>
        </div>
        <div class="u-form-group">
          <label> Gender </label>
          <div class="gender" v-for="(gen, index) in gender" :key="index">
            <input type="radio" :value="gen" v-model="user.gender" />
            <span>{{ getDisplayedGenderValue(gen) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label class="role" for="role">Role</label>
          <div class="gender" v-for="(role, index) in role" :key="index">
            <input type="radio" :value="role" v-model="user.role_id" />
            <span>{{ getDisplayedRoleValue(role) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label for="">Email</label>
          <input
            id="email"
            type="email"
            v-model="user.email"
            placeholder="Email"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div v-if="infoModal.showPassword" class="u-form-group">
          <label for="">Password</label>
          <input
            id="password"
            type="password"
            v-model="user.password"
            placeholder="Password"
          />
          <span v-if="errors.password" class="error">{{
            errors.password
          }}</span>
        </div>
        <div v-if="infoModal.showPassword" class="u-form-group">
          <label for="">Password confirm</label>
          <input
            id="password_confirmation"
            type="password"
            v-model="user.password_confirmation"
            placeholder="Confirm Password"
          />
          <span v-if="errors.password_confirmation" class="error">{{
            errors.password_confirmation
          }}</span>
        </div>
        <el-form-item class="upload-image" label="Avatar">
          <el-upload class="upload-demo" :before-upload="beforeUpload">
            <el-button type="primary">Click to upload</el-button>
          </el-upload>
        </el-form-item>
      </form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeModal()">Cancel</el-button>
        <el-button @click="updateAccount()" type="success"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import useInfoModal from "../stores/ModalEditAccount";
import axios from "axios";
const valueGender = ["Male", "Female", "Other", "M", "F", "O"];
const valueRole = ["Admin", "Owner Court", "User", "R1", "R2", "R3"];
import { ElNotification } from "element-plus";
export default {
  setup() {
    const infoModal = useInfoModal();
    return { infoModal };
  },

  props: ["infoUser"],

  created() {
    this.user = this.infoUser;
    if (this.user.gender === valueGender[0]) {
      this.user.gender = valueGender[3];
    }
    if (this.user.gender === valueGender[1]) {
      this.user.gender = valueGender[4];
    }
    if (this.user.gender === valueGender[2] || !this.user.gender) {
      this.user.gender = valueGender[5];
    }
    if (this.user.role_id === valueRole[1]) {
      this.user.role_id = valueRole[4];
    }
    if (this.user.role_id === valueRole[2] || !this.user.role_id) {
      this.user.role_id = valueRole[5];
    }
  },

  data() {
    return {
      centerDialogVisible: true,
      gender: ["M", "F", "O"],
      role: ["R2", "R3"],
      errors: {},
      emailRegex: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      firstNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      lastNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      phoneNumberRegex:
        /^((\+84)|(0))(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      passwordRegex: /.{6,}/,
      token: localStorage.getItem("access_token"),
      user: {},
      binaryRegex: /^[01]+$/,
    };
  },
  computed: {},
  watch: {
    centerDialogVisible() {
      if (this.infoModal.showPassword === true) {
        this.infoModal.showPassword = false;
      }
      this.infoModal.showModalItsMe = !this.infoModal.showModalItsMe;
    },
  },

  methods: {
    getDisplayedGenderValue(value) {
      const displayedGenderMap = {
        M: valueGender[0],
        F: valueGender[1],
        O: valueGender[2],
      };
      return displayedGenderMap[value];
    },

    getDisplayedRoleValue(value) {
      const displayedRoleMap = {
        R2: valueRole[1],
        R3: valueRole[2],
      };
      return displayedRoleMap[value];
    },

    closeModal() {
      if (this.infoModal.showPassword === true) {
        this.infoModal.showPassword = false;
      }
      this.infoModal.showModalItsMe = !this.infoModal.showModalItsMe;
    },

    beforeUpload(file) {
      this.infoAccount.image = file;
      return true;
    },

    async updateAccount() {
      if (this.validateForm()) {
        const urlUpdateAccount =
          process.env.VUE_APP_END_POINT_API +
          `account/${this.user.id}?_method=PATCH`;
        let formDataUpdate = new FormData();
        formDataUpdate.append("first_name", this.user.first_name);
        formDataUpdate.append("last_name", this.user.last_name);
        formDataUpdate.append("email", this.user.email);
        formDataUpdate.append("phone_number", this.user.phone_number);
        formDataUpdate.append("gender", this.user.gender);
        formDataUpdate.append("role_id", this.user.role_id);
        if (this.binaryRegex.test(this.user.image)) {
          formDataUpdate.append("image", this.user.image);
        }
        await axios
          .post(urlUpdateAccount, formDataUpdate, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then(() => {
            ElNotification({
              title: "Successfully Notification",
              message: "Edit user is successfully",
              position: "bottom-right",
              type: "success",
              duration: "3000",
            });
            // window.location.reload();
          })
          .catch((error) => {
            ElNotification({
              title: "Error Notification",
              message: "Edit user is failed",
              position: "bottom-right",
              type: "error",
              duration: "3000",
            });
            this.errors.email = error.response.data.errors.email[0];
            console.log(error);
          });
      }
    },

    validateForm() {
      this.errors = {};
      if (
        !this.user.first_name ||
        !this.firstNameRegex.test(this.user.first_name)
      ) {
        this.errors.first_name =
          "Please enter a valid first name (3-20 characters, alphanumeric).";
      }

      if (
        !this.user.last_name ||
        !this.lastNameRegex.test(this.user.last_name)
      ) {
        this.errors.last_name =
          "Please enter a valid last name (3-20 characters, alphanumeric).";
      }

      if (
        !this.user.phone_number ||
        !this.phoneNumberRegex.test(this.user.phone_number)
      ) {
        this.errors.phone_number = "Please enter a valid phone number.";
      }

      if (!this.user.email || !this.emailRegex.test(this.user.email)) {
        this.errors.email = "Please enter a valid email address.";
      }
      if (
        this.infoModal.showPassword === true &&
        (!this.user.password || !this.passwordRegex.test(this.user.password))
      ) {
        this.errors.password =
          "Please enter a valid password (at least 6 characters).";
      }
      if (
        this.infoModal.showPassword === true &&
        (!this.user.password_confirmation ||
          this.user.password_confirmation !== this.user.password)
      ) {
        this.errors.password_confirmation =
          "Password confirmation does not match the password.";
      }
      return Object.keys(this.errors).every((key) => !this.errors[key]);
    },
  },
};
</script>

<style lang="css" scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}

.login-box {
  position: relative;
  margin: 20px auto;
  width: 400px;
  height: 520px;
  padding: 20px;
}

.u-form-group {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  position: relative;
}

.u-form-group label {
  margin-top: -15px;
  flex: 0 0 100px;
  margin-right: 20px;
  text-align: right;
}

.u-form-group input[type="email"],
.u-form-group input[type="password"],
.u-form-group input[type="text"] {
  width: 100%; /* Độ rộng đầy đủ cho input */
  height: 35px;
  outline: none;
  border: 1px solid #ddd;
  margin-bottom: 20px;
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
  font-size: 0.8rem;
  text-align: left;
  position: absolute;
  top: 39px;
  left: 125px;
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
  display: flex; /* Add this property to make the radio buttons appear in a row */
  align-items: center; /* Align items in the center vertically */
  margin-left: 20px; /* Optional: Adjust the margin for spacing */
}
.u-form-group .gender input[type="radio"] {
  margin-right: 10px; /* Optional: Adjust the margin for spacing between radio buttons */
}

.u-form-group .gender span {
  margin-right: 15px; /* Optional: Adjust the margin for spacing between radio buttons and text */
}

.upload-image {
  margin-left: 70px;
}
</style>

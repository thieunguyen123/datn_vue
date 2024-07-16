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
            v-model="account.first_name"
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
            v-model="account.last_name"
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
            v-model="account.phone_number"
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
            <input type="radio" :value="gen" v-model="account.gender" />
            <span>{{ getDisplayedGenderValue(gen) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label class="role" for="role">Role</label>
          <div class="gender" v-for="(role, index) in role" :key="index">
            <input type="radio" :value="role" v-model="account.role_id" />
            <span>{{ getDisplayedRoleValue(role) }}</span>
          </div>
        </div>
        <div class="u-form-group">
          <label for="">Email</label>
          <input
            id="email"
            type="email"
            v-model="account.email"
            placeholder="Email"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div v-if="infoModal.showPassword" class="u-form-group">
          <label for="">Password</label>
          <input
            id="password"
            type="password"
            v-model="account.password"
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
            v-model="account.password_confirmation"
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
const urlCreateAccount = process.env.VUE_APP_END_POINT_API + "create-account";
const valueGender = ["Male", "Female", "Other", "M", "F", "O"];
const valueRole = ["Admin", "Owner Court", "User", "R1", "R2", "R3"];
export default {
  setup() {
    const infoModal = useInfoModal();
    const infoAccount = infoModal.account;

    if (infoAccount.gender === valueGender[0]) {
      infoAccount.gender = valueGender[3];
    }
    if (infoAccount.gender === valueGender[1]) {
      infoAccount.gender = valueGender[4];
    }
    if (infoAccount.gender === valueGender[2] || !infoAccount.gender) {
      infoAccount.gender = valueGender[5];
    }
    if (infoAccount.role_id === valueRole[0]) {
      infoAccount.role_id = valueRole[3];
    }
    if (infoAccount.role_id === valueRole[1]) {
      infoAccount.role_id = valueRole[4];
    }
    if (infoAccount.role_id === valueRole[2] || !infoAccount.role_id) {
      infoAccount.role_id = valueRole[5];
    }

    infoAccount.image = "";
    return { infoModal, infoAccount };
  },
  data() {
    return {
      centerDialogVisible: true,
      account: this.infoAccount,
      gender: ["M", "F", "O"],
      role: ["R1", "R2", "R3"],
      errors: {},
      emailRegex: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      firstNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      lastNameRegex: /^[0-9a-zA-Z]{3,20}$/,
      phoneNumberRegex:
        /^((\+84)|(0))(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      passwordRegex: /.{6,}/,
      token: localStorage.getItem("access_token"),
      urlUpdateAccount:
        process.env.VUE_APP_END_POINT_API +
        `account/${this.infoAccount.id}?_method=PATCH`,
    };
  },
  computed: {},
  watch: {
    centerDialogVisible() {
      if (this.infoModal.showPassword === true) {
        this.infoModal.showPassword = false;
      }
      this.infoModal.showModal = !this.infoModal.showModal;
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
        R1: valueRole[0],
        R2: valueRole[1],
        R3: valueRole[2],
      };
      return displayedRoleMap[value];
    },

    closeModal() {
      if (this.infoModal.showPassword === true) {
        this.infoModal.showPassword = false;
      }
      this.infoModal.showModal = !this.infoModal.showModal;
    },

    beforeUpload(file) {
      this.infoAccount.image = file;
      return true;
    },

    async updateAccount() {
      if (this.validateForm()) {
        if (this.infoModal.showPassword === true) {
          let formDataCreate = new FormData();
          formDataCreate.append("first_name", this.account.first_name);
          formDataCreate.append("last_name", this.account.last_name);
          formDataCreate.append("email", this.account.email);
          formDataCreate.append("phone_number", this.account.phone_number);
          formDataCreate.append("gender", this.account.gender);
          formDataCreate.append("role_id", this.account.role_id);
          formDataCreate.append("password", this.account.password);
          formDataCreate.append(
            "password_confirmation",
            this.account.password_confirmation
          );
          if (this.account.image) {
            formDataCreate.append("image", this.account.image);
          }
          await axios
            .post(urlCreateAccount, formDataCreate, {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            })
            .then(() => {
              // window.location.reload();
            })
            .catch((error) => {
              this.errors.email = error.response.data.errors.email[0];
              console.log(error);
            });
        } else {
          let formDataUpdate = new FormData();
          formDataUpdate.append("first_name", this.account.first_name);
          formDataUpdate.append("last_name", this.account.last_name);
          formDataUpdate.append("email", this.account.email);
          formDataUpdate.append("phone_number", this.account.phone_number);
          formDataUpdate.append("gender", this.account.gender);
          formDataUpdate.append("role_id", this.account.role_id);
          if (this.account.image) {
            formDataUpdate.append("image", this.account.image);
          }
          await axios
            .post(this.urlUpdateAccount, formDataUpdate, {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            })
            .then(() => {
              // window.location.reload();
            })
            .catch((error) => {
              this.errors.email = error.response.data.errors.email[0];
              console.log(error);
            });
        }
      }
    },

    validateForm() {
      this.errors = {};
      if (
        !this.account.first_name ||
        !this.firstNameRegex.test(this.account.first_name)
      ) {
        this.errors.first_name =
          "Please enter a valid first name (3-20 characters, alphanumeric).";
      }

      if (
        !this.account.last_name ||
        !this.lastNameRegex.test(this.account.last_name)
      ) {
        this.errors.last_name =
          "Please enter a valid last name (3-20 characters, alphanumeric).";
      }

      if (
        !this.account.phone_number ||
        !this.phoneNumberRegex.test(this.account.phone_number)
      ) {
        this.errors.phone_number = "Please enter a valid phone number.";
      }

      if (!this.account.email || !this.emailRegex.test(this.account.email)) {
        this.errors.email = "Please enter a valid email address.";
      }
      if (
        this.infoModal.showPassword === true &&
        (!this.account.password ||
          !this.passwordRegex.test(this.account.password))
      ) {
        this.errors.password =
          "Please enter a valid password (at least 6 characters).";
      }
      if (
        this.infoModal.showPassword === true &&
        (!this.account.password_confirmation ||
          this.account.password_confirmation !== this.account.password)
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

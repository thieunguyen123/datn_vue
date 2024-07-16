<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <img
          class="logo"
          @click="refresh()"
          src="../assets/logo-kiai.png"
          alt=""
        />
<!--        <h1 class="title-header">KiaiSoft</h1>-->
        <el-dropdown>
          <img class="avatar" :src="infoUser?.image" alt="" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="toggleEditProfile()"
                >Edit Profile</el-dropdown-item
              >
              <el-dropdown-item @click="logOut">Log Out</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-container class="container">
        <el-aside class="aside">
          <el-row class="tac">
            <el-col :span="12">
              <el-menu
                active-text-color="#ffd04b"
                background-color="#545c64"
                class="el-menu-vertical-demo"
                default-active="1-1"
                text-color="#fff"
                @open="handleOpen"
                @close="handleClose"
              >
                <el-sub-menu index="1">
                  <template #title>
                    <el-icon><location /></el-icon>
                    <span class="title-menu">List Menu</span>
                  </template>
                  <el-menu-item
                    style="height: 50px"
                    class="sub-menu"
                    index="1-1"
                    @click="openListUsers"
                    >List Users</el-menu-item
                  >
                  <el-menu-item
                    style="height: 50px"
                    class="sub-menu"
                    index="1-2"
                    @click="openListCourtNeedApprove"
                    >Awaiting Pitch Approval</el-menu-item
                  >
                  <el-menu-item
                    style="height: 50px"
                    class="sub-menu"
                    index="1-3"
                    @click="openListBadmintonCourts"
                    >List All Pitches</el-menu-item
                  >
                </el-sub-menu>
              </el-menu>
            </el-col>
          </el-row>
        </el-aside>
        <el-main class="main">
          <el-button
            @click="showModalCreate()"
            v-if="toggleListUsers"
            type="success"
            >Create</el-button
          >
          <edit-account-vue v-if="infoModal.showModal" />
          <edit-its-me v-if="infoModal.showModalItsMe" :infoUser="infoUser" />
          <list-account v-if="toggleListUsers" />
          <list-register-courts-vue v-if="toggleListCourtNeedApprove" />
          <all-badminton-courts-vue v-if="toggleAllCourts" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import useInfoModal from "../stores/ModalEditAccount";
import {
  Message,
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from "@element-plus/icons-vue";
import ListAccount from "@/components/ListAccount.vue";
import EditAccountVue from "@/components/EditAccount.vue";
import ListRegisterCourtsVue from "./ListRegisterCourts.vue";
import { ElNotification } from "element-plus";
import axios from "axios";
import AllBadmintonCourtsVue from "@/components/AllBadmintonCourts.vue";
import EditItsMe from "@/components/EditItsMe.vue";
const urlLogout = process.env.VUE_APP_END_POINT_API + "logout";
const urlEdit = process.env.VUE_APP_END_POINT_API + "account/edit";
export default {
  setup() {
    const infoModal = useInfoModal();
    return { infoModal };
  },

  async created() {
    await this.editProfile();
    window.addEventListener("storage", (event) => {
      if (event.key === this.accessToken) {
        if (!localStorage.getItem(this.accessToken)) {
          this.$router.push("/login");
        } else {
          this.token = localStorage.getItem(this.accessToken);
          this.editProfile();
        }
      }
    });
  },

  components: {
    ListAccount,
    EditAccountVue,
    ListRegisterCourtsVue,
    AllBadmintonCourtsVue,
    EditItsMe,
  },
  data() {
    return {
      document: Document,
      location: Location,
      message: Message,
      setting: Setting,
      iconMenu: IconMenu,
      token: localStorage.getItem("access_token"),
      toggleListCourtNeedApprove: false,
      toggleListUsers: true,
      toggleAllCourts: false,
      infoUser: null,
      accessToken: "access_token",
    };
  },
  methods: {
    refresh() {
      window.location.reload();
    },

    showModalCreate() {
      this.infoModal.account = {};
      this.infoModal.showModal = !this.infoModal.showModal;
      this.infoModal.showPassword = !this.infoModal.showPassword;
    },

    toggleEditProfile() {
      this.infoModal.showModalItsMe = !this.infoModal.showModalItsMe;
    },

    async editProfile() {
      try {
        const response = await axios.get(urlEdit, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.infoUser = response.data.user;
      } catch (error) {
        console.log(error);
      }
    },

    openListCourtNeedApprove() {
      this.toggleListCourtNeedApprove = true;
      this.toggleAllCourts = false;
      this.toggleListUsers = false;
    },

    openListBadmintonCourts() {
      this.toggleAllCourts = true;
      this.toggleListUsers = false;
      this.toggleListCourtNeedApprove = false;
    },

    openListUsers() {
      this.toggleListCourtNeedApprove = false;
      this.toggleAllCourts = false;
      this.toggleListUsers = true;
    },

    async logOut() {
      await axios
        .post(
          urlLogout,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        )
        .then(() => {
          ElNotification({
              title: "Successfully Notification",
              message: "Logout is successfully",
              position: "bottom-right",
              type: "success",
              duration: "3000",
            });
          localStorage.removeItem("access_token");
          localStorage.removeItem("expires_in");
          localStorage.removeItem("role_id");
          this.$router.push({ name: "login" });
        })
        .catch((error) => {
          ElNotification({
              title: "Successfully Notification",
              message: "Logout is failed",
              position: "bottom-right",
              type: "error",
              duration: "3000",
            });
          console.log(error);
        });
    },
  },
};
</script>
<style lang="css" scoped>
.comon-layout {
  height: 100%;
}

.header {
  display: flex;
  height: 120px;
  background: #f0ebeba6;
  position: relative;
}

.header .logo {
  width: 10%;
  margin-left: -20px;
  cursor: pointer;
}

.header .title-header {
  margin-left: 25px;
  position: absolute;
  left: 140px;
  top: 18%;
  color: rgb(235, 67, 67);
  font-size: 30px;
}

.header .avatar {
  position: absolute;
  left: 85vw;
  height: 50px;
  width: 50px;
  top: 25%;
  cursor: pointer;
  border-radius: 30%;
}

.header .notification {
  background: #ccc;
  position: absolute;
  left: 81vw;
  top: 25%;
  height: 50px;
  width: 50px;
}

.container {
  height: 800px;
}

.aside {
  background: #f0ebeba6;
}

.aside .el-menu-vertical-demo {
  margin-top: 50px;
  width: 270px;
  height: 700px;
}

.title-menu {
  font-size: 25px;
}

.sub-menu {
  font-size: 20px;
  height: 300px;
}

.main {
  background: #ffffff;
  position: relative;
}
</style>

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
        <div class="demo-datetime-picker" v-if="toggleTableBooking">
          <div class="block">
            <span class="demonstration" style="margin-right: 10px"
              >Select Day</span
            >
            <el-date-picker
              v-model="timeDate"
              type="date"
              placeholder="Pick a day"
              :size="size"
              :default-value="defaultValue"
              :handleClose="handleClose"
              :clearable="false"
            />
          </div>
        </div>

        <el-select
          v-if="toggleTableBooking"
          v-model="timeType"
          class="m-2 selected-time-type"
          placeholder="Select"
          style="width: 240px"
        >
          <el-option
            v-for="item in options1"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-select
          v-if="toggleTableBooking"
          v-model="status"
          class="m-2 selected-status"
          placeholder="Select"
          style="width: 240px"
        >
          <el-option
            v-for="item in options2"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-button
          v-if="toggleTableBooking"
          @click="search()"
          class="multipleSearch"
          type="danger"
          round
          >Tìm Kiếm</el-button
        >

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
                    @click="openListBookings"
                    style="height: 50px"
                    class="sub-menu"
                    index="1-1"
                    >Reservation Request</el-menu-item
                  >
                  <el-menu-item
                    @click="openListBadmintonCourt"
                    style="height: 50px"
                    class="sub-menu"
                    index="1-2"
                    >Football Pitches</el-menu-item
                  >
                  <el-menu-item
                    @click="openSchedule"
                    style="height: 50px"
                    class="sub-menu"
                    index="1-3"
                    >Pitch Schedule</el-menu-item
                  >
                </el-sub-menu>
              </el-menu>
            </el-col>
          </el-row>
        </el-aside>
        <el-main class="main">
          <list-booking-of-owner
            v-if="toggleTableBooking"
            :status="status"
            :timeDate="timeDate"
            :timeType="timeType"
            :enableSearch="enableSearch"
          />
          <edit-its-me v-if="infoModal.showModalItsMe" :infoUser="infoUser" />
          <list-badminton-vue v-if="toggleTableBadminTonCourt" />
          <court-scheduler v-if="toggleSchedule" />
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
  ArrowDown,
} from "@element-plus/icons-vue";
import ListBookingOfOwner from "@/components/ListBookingOfOwner.vue";
import ListBadmintonVue from "@/components/ListBadmintonCourt.vue";
import CourtScheduler from "@/components/CourtScheduler.vue";
import EditItsMe from "@/components/EditItsMe.vue";
import { ElNotification } from "element-plus";
import axios from "axios";
const urlLogout = process.env.VUE_APP_END_POINT_API + "logout";
const urlEdit = process.env.VUE_APP_END_POINT_API + "account/edit";
export default {
  setup() {
    const infoModal = useInfoModal();
    return { infoModal };
  },

  components: {
    ListBookingOfOwner,
    ListBadmintonVue,
    CourtScheduler,
    EditItsMe,
  },

  created() {
    this.editProfile();

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

  data() {
    return {
      arrowDown: ArrowDown,
      document: Document,
      location: Location,
      message: Message,
      setting: Setting,
      iconMenu: IconMenu,
      timeDate: null,
      status: "Select Status",
      timeType: "Select Time",
      enableSearch: false,
      defaultValue: "",
      toggleTableBooking: true,
      toggleTableBadminTonCourt: false,
      toggleSchedule: false,
      token: localStorage.getItem("access_token"),
      accessToken: "access_token",
      infoUser: null,
      options1: [
        {
          value: null,
          label: "",
        },
        {
          value: "T1",
          label: "5:00AM-6:00AM",
        },
        {
          value: "T2",
          label: "6:00AM-7:00AM",
        },
        {
          value: "T3",
          label: "7:00AM-8:00AM",
        },
        {
          value: "T4",
          label: "8:00AM-9:00AM",
        },
        {
          value: "T5",
          label: "4:00PM-5:00PM",
        },
        {
          value: "T6",
          label: "5:00PM-6:00PM",
        },
        {
          value: "T7",
          label: "6:00PM-7:00PM",
        },
        {
          value: "T8",
          label: "7:00PM-8:00PM",
        },
      ],
      options2: [
        {
          value: null,
          label: "",
        },
        {
          value: "S1",
          label: "New",
        },
        {
          value: "S2",
          label: "Confirmed",
        },
        {
          value: "S3",
          label: "Done",
        },
        {
          value: "S4",
          label: "Cancel",
        },
      ],
    };
  },

  watch: {},

  methods: {
    refresh() {
      window.location.reload();
    },

    search() {
      this.enableSearch = !this.enableSearch;
    },

    openListBookings() {
      this.toggleTableBooking = true;
      this.toggleTableBadminTonCourt = false;
      this.toggleSchedule = false;
      this.timeDate = null;
      this.timeType = null;
      this.status = null;
    },

    toggleEditProfile() {
      this.infoModal.showModalItsMe = !this.infoModal.showModalItsMe;
    },

    openListBadmintonCourt() {
      this.toggleTableBooking = false;
      this.toggleTableBadminTonCourt = true;
      this.toggleSchedule = false;
    },

    openSchedule() {
      this.toggleTableBooking = false;
      this.toggleTableBadminTonCourt = false;
      this.toggleSchedule = true;
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

<style scoped>
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

.demo-datetime-picker .block {
  position: absolute;
  left: 25vw;
  top: 35%;
}

.header .selected-time-type {
  position: absolute;
  top: 35%;
  left: 45vw;
}

.header .selected-status {
  position: absolute;
  top: 35%;
  left: 62vw;
}

.header .multipleSearch {
  position: absolute;
  top: 35%;
  left: 79vw;
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

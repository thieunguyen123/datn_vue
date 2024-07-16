<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <img
          class="logo"
          @click="refresh()"
          src="../assets/logo-kiai.png"
          alt=""
        />
        <input
          class="search-name"
          type="text"
          v-model="searchName"
          placeholder="Search for football pitch name ..."
        />
        <div class="column"></div>
        <font-awesome-icon
          class="icon-search"
          icon="fa-solid fa-magnifying-glass"
        />
        <div v-if="!token" class="zone-login" @click="login">
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
          <span>Login</span>
        </div>
        <el-dropdown class="zone-login" v-if="token">
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
        <div class="zone-register" @click="register">
          <font-awesome-icon icon="fa-solid fa-file-pen" />
          <span>register</span>
        </div>
      </el-header>
      <el-main>
        <div class="search-address">
          <el-select
            v-model="provinceSelect"
            class="m-2 selected-status"
            placeholder="Select Province"
            style="margin-left: 30px"
          >
            <el-option
              v-for="item in provinces"
              :key="item.province_id"
              :label="item.province_name"
              :value="item.province_id"
            />
          </el-select>

          <el-select
            v-model="districtSelect"
            class="m-2 selected-status"
            placeholder="Select District"
            style="margin-left: 30px"
          >
            <el-option
              v-for="item in districts"
              :key="item.district_id"
              :label="item.district_name"
              :value="item.district_id"
            />
          </el-select>

          <el-select
            v-model="wardSelect"
            class="m-2 selected-status"
            placeholder="Select Ward"
            style="margin-left: 30px"
          >
            <el-option
              v-for="item in wards"
              :key="item.ward_id"
              :label="item.ward_name"
              :value="item.ward_id"
            />
          </el-select>
          <button @click="searchByAddress" class="button-search">
            Search
          </button>
          <button @click="clearSearch" class="button-clear">
            Clear All
          </button>
        </div>
        <div class="main">
          <edit-its-me v-if="infoModal.showModalItsMe" :infoUser="infoUser" />
          <div class="title-main">FootBall Pitches</div>
          <el-row class="row">
            <el-col :span="5" v-for="court in badmintonCourts" :key="court.id">
              <el-card
                shadow="always"
                class="card"
                :body-style="{ padding: '0px' }"
              >
                <el-image
                  class="image"
                  :src="court.image[0]"
                  :zoom-rate="1.2"
                  :preview-src-list="court.image"
                  :initial-index="4"
                  fit="cover"
                />
                <div style="padding: 14px">
                  <span class="name-court">{{ court.name }}</span>
                  <br />
                  <span class="description-court">
                    {{ court.description }}
                  </span>
                  <br />
                  <span class="price-court"
                    >Price: {{ court.price }} vnđ/h</span
                  >
                  <div class="bottom clearfix">
                    <el-button
                      @click="booking(court)"
                      type="text"
                      class="button"
                      >Book Pitch</el-button
                    >
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <img @click="openChatbot" class="custom-image" src="../assets/—Pngtree—messenger logo icon_3571405.png">
        <chat-bot v-show="toggleChatbot" class="custom-chatbot"/>
        <div v-if="totalBadmintonCourts > 0" class="demo-pagination-block">
          <el-pagination
            v-model="currentPage"
            :page-size="pageSize"
            :small="small"
            :disabled="disabled"
            :background="background"
            layout="prev, pager, next"
            :total="totalBadmintonCourts"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-main>
      <el-footer>
        <img class="image-footer" src="../assets/ảnh-footer.png" alt="" />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";
import useInfoModal from "../stores/ModalEditAccount";
const urlProvince = "https://vapi.vnappmob.com/api/province";
const urlGetAllBadmintonCourts =
  process.env.VUE_APP_END_POINT_API + "badminton-court";
import { ElNotification } from "element-plus";
import EditItsMe from "@/components/EditItsMe.vue";
import ChatBot from "../components/ChatBot.vue";
const urlLogin = "/login";
const urlRegister = "/register";
const urlLogout = process.env.VUE_APP_END_POINT_API + "logout";
const urlEdit = process.env.VUE_APP_END_POINT_API + "account/edit";
export default {
  components: { EditItsMe, ChatBot},

  setup() {
    const infoModal = useInfoModal();
    return { infoModal };
  },

  data() {
    return {
      provinces: {},
      provinceSelect: null,
      districts: {},
      districtSelect: null,
      wards: {},
      wardSelect: null,
      badmintonCourts: [],
      currentPage: 1,
      pageSize: 20,
      small: false,
      disable: false,
      background: true,
      totalBadmintonCourts: null,
      searchName: "",
      searchOptions: {
        province: null,
        district: null,
        ward: null,
      },
      debounceSearch: null,
      provinceName: null,
      districtName: null,
      wardName: null,
      address: "",
      token: localStorage.getItem("access_token"),
      accessToken: "access_token",
      infoUser: null,
      isClear: true,
      toggleChatbot: false
    };
  },

  async created() {
    this.loadProvince();
    this.getAllBadmintonCourts();
    if (this.token) {
      await this.editProfile();
    }

    window.addEventListener("storage", (event) => {
      if (event.key === this.accessToken) {
        if (!localStorage.getItem(this.accessToken)) {
          this.token = null;
        } else {
          this.token = localStorage.getItem(this.accessToken);
          this.editProfile();
        }
      }
    });
  },

  watch: {
    provinceSelect: function () {
      if (this.isClear) {
        console.log(this.isClear)
        this.districtSelect = null;
        this.loadDistrict();
        this.provinceName = this.provinces.find(
            (p) => p.province_id === this.provinceSelect
        ).province_name;
      }
    },

    districtSelect: function () {
      if (this.isClear) {
        this.wardSelect = null;
        this.loadWard();
        this.districtName = null;
        if (this.districtSelect) {
          this.districtName = this.districts.find(
              (d) => d.district_id === this.districtSelect
          ).district_name;
        }
      }
    },

    wardSelect: function () {
      if (this.isClear) {
        this.wardName = null;
        if (this.wardSelect) {
          this.wardName = this.wards.find(
              (w) => w.ward_id === this.wardSelect
          ).ward_name;
        }
      }
    },

    searchName: function () {
      this.currentPage = 1;
      if (this.debounceSearch) {
        clearTimeout(this.debounceSearch);
      }
      this.debounceSearch = setTimeout(() => {
        this.getAllBadmintonCourts();
      }, 700);
    },
  },

  methods: {
    openChatbot () {
      this.toggleChatbot = !this.toggleChatbot
    },
    clearSearch () {
      this.isClear = false
      this.provinceSelect = null
      this.provinceName = null
      this.wardSelect = null
      this.wardName = null
      this.districtSelect = null
      this.districtName = null
      this.searchName = ""
      this.getAllBadmintonCourts()
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

    refresh() {
      window.location.reload();
    },

    login() {
      this.$router.push(urlLogin);
    },

    register() {
      this.$router.push(urlRegister);
    },

    favourite() {
      this.$router.push("/favourite");
    },

    booking(court) {
      this.$router.push({
        name: "booking",
        query: { idBadmintonCourt: court.id },
      });
    },

    toggleEditProfile() {
      this.infoModal.showModalItsMe = !this.infoModal.showModalItsMe;
    },

    logOut() {
      axios
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
          localStorage.removeItem("access_token");
          localStorage.removeItem("expires_in");
          localStorage.removeItem("role_id");
          this.$router.push({ name: "login" });
          ElNotification({
            title: "Successfully Notification",
            message: "Logout is successfully",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
        })
        .catch(() => {
          ElNotification({
            title: "Error Notification",
            message: "Logout is failed",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
        });
    },

    async loadProvince() {
      await axios
        .get(urlProvince)
        .then((response) => {
          this.provinces = response.data.results;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async loadDistrict() {
      const urlDistrict = `https://vapi.vnappmob.com/api/province/district/${this.provinceSelect}`;
      await axios
        .get(urlDistrict)
        .then((response) => {
          this.districts = response.data.results;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async loadWard() {
      const urlWard = `https://vapi.vnappmob.com/api/province/ward/${this.districtSelect}`;
      await axios
        .get(urlWard)
        .then((response) => {
          this.wards = response.data.results;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async getAllBadmintonCourts() {
      const formData = new FormData();
      formData.append("page", this.currentPage);
      formData.append("name", this.searchName);
      if (this.provinceName && this.districtName && this.wardName) {
        this.address =
          this.wardName + ", " + this.districtName + ", " + this.provinceName;
      } else if (this.provinceName && this.districtName) {
        this.address = this.districtName + ", " + this.provinceName;
      } else if (this.provinceName) {
        this.address = this.provinceName;
      } else {
        this.address = "";
      }
      formData.append("address", this.address);
      await axios
        .post(urlGetAllBadmintonCourts, formData)
        .then((response) => {
          this.badmintonCourts = response.data.data;
          this.totalBadmintonCourts = response.data.total;
          this.isClear = true
        })
        .catch((error) => {
          console.log(error);
        });
    },

    handleCurrentChange() {
      this.getAllBadmintonCourts();
    },

    searchByAddress() {
      this.getAllBadmintonCourts();
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
}

.common-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

el-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

header {
  flex: 0 0 auto;
  background-color: #ffffff;
  padding: 10px;
  display: flex;
  flex-direction: row;
  height: 15vh;
  position: relative;
}

header .column {
  background: rgb(181, 227, 232);
  height: 35px;
  width: 2px;
  position: absolute;
  top: 35%;
  left: 59.7%;
  border-radius: 5px;
}

header .logo {
  margin-left: 100px;
}

header .icon-search {
  position: absolute;
  top: 41%;
  left: 60.5%;
  cursor: pointer;
  font-size: 23px;
  color: #515050;
}

header .icon-search:hover {
  color: rgb(121, 209, 209);
}

header .search-name {
  border: solid 2px rgb(181, 227, 232);
  border-radius: 7px;
  height: 35px;
  width: 35%;
  position: absolute;
  top: 34%;
  left: 28%;
  text-indent: 15px;
}

header .zone-login {
  width: 3vw;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 33%;
  right: 8%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

header .zone-favorite {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 12%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

header .zone-register {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 3%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

main {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  position: relative;
}

main .title-main {
  margin-top: 50px;
  margin-left: 200px;
  font-size: 30px;
  font-weight: bold;
}

main .row {
  display: flex;
  justify-content: left;
  flex-wrap: wrap;
  left: 11%;
}

main .image {
  width: 100%;
  height: 200px;
  display: block;
}

main .card {
  flex: 1;
  max-width: calc(100%);
  margin: 15px 20px 30px;
}

main .search-address {
  position: absolute;
  left: 20%;
  display: flex;
  width: 60%;
}

.row .name-court {
  font-size: 20px;
  font-weight: 600;
}

.row .price-court {
  font-weight: 600;
  color: tomato;
}

.row .description-court {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  min-height: 40px;
}

.search-address .button-search {
  cursor: pointer;
  color: #fff;
  margin-left: 6%;
  height: 30px;
  width: 20%;
  border-radius: 8px;
  background: rgb(25, 154, 168);
}

.search-address .button-search:hover {
  background: rgb(5, 213, 236);
}

.search-address .button-clear {
  cursor: pointer;
  color: #fff;
  margin-left: 2%;
  height: 30px;
  width: 20%;
  border-radius: 8px;
  background: #e65f5f;
}

.search-address .button-clear:hover {
  background: rgb(246, 6, 33);
}

.demo-pagination-block {
  margin: 100px 0px 0px 47vw;
}

footer {
}

footer .image-footer {
  width: 95vw;
  height: 30vh;
  margin-left: 40px;
}

.custom-image {
  max-width: 5%;
  position: fixed;
  right: 1%;
  bottom: 5%;
  z-index: 1200;
  cursor: pointer;
}

.custom-chatbot{
  z-index: 999;
  position: fixed;
  right: 2%;
  bottom: 15%;

}
</style>



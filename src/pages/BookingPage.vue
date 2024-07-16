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
        <div v-if="!token" class="zone-login" @click="login">
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
          <span>Login</span>
        </div>
        <div v-if="token" class="zone-login" @click="logOut">
          <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
          <span>Logout</span>
        </div>

        <el-popover
          style="height: 40vh"
          placement="left"
          width="50vw"
          hight
          trigger="click"
        >
          <el-table :data="listBooking">
            <el-table-column
              width="300"
              property="day_booking"
              label="date"
            ></el-table-column>
            <el-table-column
              width="300"
              property="time_booking_start"
              label="time"
            ></el-table-column>
            <el-table-column
              width="100"
              property="status_id"
              label="status"
            ></el-table-column>
          </el-table>
          <template #reference>
            <div v-if="token" class="zone-list-booking">
              <font-awesome-icon icon="fa-solid fa-list" />
              <span>List Booking</span>
            </div>
          </template>
        </el-popover>
      </el-header>
      <el-main :style="{ height: toggleBooking ? '120vh' : '190vh' }">
        <div class="header-main" @click="backHomePage">
          Home Page
          <font-awesome-icon
            style="margin-left: 10px"
            icon="fa-solid fa-arrow-left-long"
          />
        </div>

        <div class="name-badmintonCourt">
          {{ badmintonCourt.name }}
        </div>
        <el-image
          class="image-preview"
          :src="badmintonCourt.image ? badmintonCourt.image[0] : null"
          :zoom-rate="1.2"
          :preview-src-list="badmintonCourt.image"
          :initial-index="4"
          fit="cover"
        />
        <font-awesome-icon
          class="icon-location"
          icon="fa-solid fa-location-dot"
        />
        <span class="address-string">{{ badmintonCourt.address }}</span>
        <div>
          <div ref="map" id="map"></div>
        </div>
        <div
          :class="[toggleComment ? 'tabs-header1' : 'tabs-header']"
          id="tabs-header"
        >
          <ul>
            <li data="1" class="" @click="openBooking">BOOK PITCH</li>
            <li data="2" class="tabs-header-4 active" @click="openComment">
              COMMENT
            </li>
          </ul>
        </div>
        <book-court
          v-if="toggleBooking"
          class="book-court"
          :id="badmintonCourt.id"
          :courtOwnerId="badmintonCourt.court_owner_id"
        />
        <comment-court
          :idBadmintonCourt="badmintonCourt.id"
          v-if="toggleComment"
          class="comment-court"
        />
      </el-main>
      <el-footer>
        <img class="image-footer" src="../assets/ảnh-footer.png" alt="" />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import "../../public/css/goong-js.css";
import goongjs from "../../public/js/goong-js";
import polyline from "../../public/js/polyline";
import goongSdk from "../../public/js/goong-sdk.min";
import axios from "axios";
import BookCourt from "@/components/BookCourt.vue";
import CommentCourt from "@/components/CommentCourt.vue";
const apiKey = process.env.VUE_APP_GOONG_KEY;
const maptipleKey = process.env.VUE_APP_GOONG_MAP_KEY;
const urlLogout = process.env.VUE_APP_END_POINT_API + "logout";
const urlRegister = "/register";
import { ElNotification } from "element-plus";
import { ElMessage } from "element-plus";
export default {
  components: { BookCourt, CommentCourt },
  data() {
    return {
      badmintonCourt: {},
      map: null,
      latitudeIndex: null,
      longitudeIndex: null,
      latitudeAddress: null,
      longitudeAddress: null,
      latitudeFinal: null,
      longitudeFinal: null,
      toggleBooking: true,
      toggleComment: false,
      idBadminton: this.$route.query.idBadmintonCourt,
      token: localStorage.getItem("access_token"),
      forwardGeocodingURL: null,
      firstSymbolId: null,
      accessToken: "access_token",
      listBooking: [],
    };
  },

  async created() {
    await this.getInfoCourt();
    const address = this.badmintonCourt.address;
    this.forwardGeocodingURL = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
      address
    )}&api_key=${apiKey}`;
    await Promise.all([
      new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.getPosition(position);
            resolve();
          });
        } else {
          console.error("Geolocation is not supported by this browser.");
          reject();
        }
      }),
      this.getLocationAddress(this.forwardGeocodingURL),
    ]);

    this.showBookingOfUser();

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        this.token = localStorage.getItem("access_token");
      }
    });
  },

  methods: {
    getInfoCourt() {
      return new Promise((resolve) => {
        const urlGetDetailCourt =
          process.env.VUE_APP_END_POINT_API +
          `court-detail/${this.idBadminton}`;

        axios
          .get(urlGetDetailCourt, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then((response) => {
            this.badmintonCourt = response.data.badmintonCourt;
            resolve();
          })
          .catch(() => {
            this.$router.push('/404');
          });
      });
    },

    backHomePage() {
      this.$router.push("/");
    },

    refresh() {
      window.location.reload();
    },

    login() {
      this.$router.push("/login");
    },

    openComment() {
      this.toggleBooking = false;
      this.toggleComment = true;
    },

    openBooking() {
      this.toggleComment = false;
      this.toggleBooking = true;
    },

    getPosition(position) {
      this.latitudeIndex = position.coords.latitude;
      this.longitudeIndex = position.coords.longitude;
    },

    showBookingOfUser() {
      const urlShowBookingUser =
        process.env.VUE_APP_END_POINT_API +
        `list/booking/${this.badmintonCourt.court_owner_id}/${this.badmintonCourt.id}`;
      axios
        .get(urlShowBookingUser, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.listBooking = response.data.listBookings;
        })
        .catch((error) => {
          console.log(error);
        });
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
            title: "Error Notification",
            message: "Logout is failed",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
          console.log(error);
        });
    },

    addFavourite(id) {
      const urlAddFavouriteCourt =
        process.env.VUE_APP_END_POINT_API + `/favourite/${id}`;
      axios
        .post(
          urlAddFavouriteCourt,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        )
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    },

    async getLocationAddress(url) {
      try {
        const response = await axios.get(url);
        this.latitudeAddress = response.data.results[0].geometry.location.lat;
        this.longitudeAddress = response.data.results[0].geometry.location.lng;

        this.map.setCenter([this.longitudeAddress, this.latitudeAddress]);
        const goongClient = goongSdk({
          accessToken: apiKey,
        });

        const directionResponse = await goongClient.directions
          .getDirections({
            origin: `${this.latitudeIndex},${this.longitudeIndex}`,
            destination: `${this.latitudeAddress},${this.longitudeAddress}`,
            vehicle: "bike",
          })
          .send();

        const directions = directionResponse.body;
        const route = directions.routes[0];

        const geometryString = route.overview_polyline.points;
        const geoJSON = polyline.toGeoJSON(geometryString);
        this.map.addSource("route", {
          type: "geojson",
          data: geoJSON,
        });

        this.map.addLayer(
          {
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1e88e5",
              "line-width": 8,
            },
          },
          this.firstSymbolId
        );
      } catch (error) {
        // Xử lý lỗi ở đây
        console.error("Error in getLocationAddress:", error);
        // Hiển thị thông báo lỗi cho người dùng nếu cần thiết
        ElMessage({
          message:
            "Please enable browser location services and refresh the page to load the map!",
          type: "error",
          duration: 5000,
          width: "40vw",
        });
      }
    },

    register() {
      this.$router.push(urlRegister);
    },
  },

  mounted() {
    goongjs.accessToken = maptipleKey
    this.map = new goongjs.Map({
      container: this.$refs.map,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      zoom: 12,
    });

    this.map.on("load", () => {
      this.map.addControl(
        new goongjs.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      );

      const layers = this.map.getStyle().layers;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") {
          this.firstSymbolId = layers[i].id;
          break;
        }
      }
    });
  },
};
</script>

<style scoped>
.common-layout {
  width: 100vw;
  height: 100vh;
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

header .logo {
  position: absolute;
  top: 20px;
  left: 15vw;
  width: 200px;
}

header .zone-login {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 10%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

header .zone-list-booking {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 15%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

header .zone-favorite {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 20%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

header .zone-register {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 35%;
  right: 9%;
  color: rgb(25, 154, 168);
  cursor: pointer;
}

main {
  padding: 10px;
  overflow: hidden;
  position: relative;
}

main .header-main {
  font-size: 20px;
  position: absolute;
  left: 15vw;
  cursor: pointer;
  width: 77vw;
  background: #f4ebeb;
  height: 4vh;
  padding-top: 15px;
  text-indent: 20px;
}

main .header-main:hover {
  color: rgb(25, 154, 168);
}

main .name-badmintonCourt {
  position: absolute;
  top: 8vh;
  left: 16vw;
  font-size: 30px;
  font-weight: bolder;
}

main .image-preview {
  position: absolute;
  left: 18vw;
  top: 17vh;
  width: 30vw;
}

#map {
  position: absolute;
  top: 17vh;
  left: 50vw;
  width: 40vw;
  height: 50vh;
}

.address-string {
  position: absolute;
  left: 52vw;
  top: 100px;
}

.icon-location {
  position: absolute;
  left: 50vw;
  top: 100px;
}

.tabs-header {
  position: absolute;
  background: #eee;
  padding: 10px 0px;
  transition: 0.2s ease;
  border-radius: 4px;
  margin-top: 30px;
  top: 60%;
  width: 76vw;
  left: 240px;
}

.tabs-header1 {
  position: absolute;
  background: #eee;
  padding: 10px 0px;
  transition: 0.2s ease;
  border-radius: 4px;
  margin-top: 30px;
  top: 40%;
  width: 76vw;
  left: 240px;
}

.tabs-header ul {
  margin: 0;
  padding: 0;
  display: flex;
  list-style: none;
  font-weight: 600;
  align-items: center;
  justify-content: space-around;
  height: 30px;
}

.tabs-header1 ul {
  margin: 0;
  padding: 0;
  display: flex;
  list-style: none;
  font-weight: 600;
  align-items: center;
  justify-content: space-around;
  height: 30px;
}

.tabs-header ul li:hover {
  color: red;
  cursor: pointer;
}

.tabs-header1 ul li:hover {
  color: red;
  cursor: pointer;
}

.tabs-header ul .active:before {
  content: "";
  position: absolute;
  height: 3px;
  background: red;
  bottom: -10px;
  left: 0px;
  width: 100%;
}

.tabs-header1 ul .active:before {
  content: "";
  position: absolute;
  height: 3px;
  background: red;
  bottom: -10px;
  left: 0px;
  width: 100%;
}

.tabs-header ul .active:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -20px;
  width: 0px;
  margin: auto;
  border-top: 10px solid red;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

.tabs-header1 ul .active:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -20px;
  width: 0px;
  margin: auto;
  border-top: 10px solid red;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}

main .book-court {
  position: absolute;
  top: 95vh;
  left: 5vw;
}

main .comment-court {
  position: absolute;
  top: 90vh;
  left: 18vw;
}

footer {
}

footer .image-footer {
  width: 95vw;
  height: 30vh;
  margin-left: 40px;
}
</style>

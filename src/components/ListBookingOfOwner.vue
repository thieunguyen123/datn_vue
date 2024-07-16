<template>
  <el-table :data="filterTableData" style="width: 100%; margin-top: 10px">
    <el-table-column label="User Name" prop="user_id" />
    <el-table-column label="Time Booking" prop="time_booking_start" />
    <el-table-column label="Day Booking" prop="day_booking" />
    <el-table-column label="Owner Pitch" prop="name_court_owner" />
    <el-table-column label="Status" prop="status_id" />
    <el-table-column label="Pitch Name" prop="badminton_court" />
    <el-table-column align="right">
      <template #default="scope">
        <el-dropdown
          style="margin-right: 20px"
          v-if="scope.row.status_id !== 'Cancel'"
        >
          <el-button type="primary" :icon="edit" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="acceptBooking(scope.row)"
                >Confirm</el-dropdown-item
              >
              <el-dropdown-item @click="cancelBooking(scope.row)"
                >Cancel</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button
          @click="deleteBooking(scope.row.id, scope.row.court_owner_id)"
          type="danger"
          :icon="deleteIcon"
          circle
        />
      </template>
    </el-table-column>
  </el-table>
  <div class="demo-pagination-block">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :small="small"
      :disabled="disabled"
      :background="background"
      layout="prev, pager, next"
      :total="totalBookings"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import axios from "axios";
const urlGetAllBookingsOfOwner =
  process.env.VUE_APP_END_POINT_API + "owner/booking";
import { Edit, Delete, Search } from "@element-plus/icons-vue";
import { getDatabase, onValue, ref } from "firebase/database";
export default {
  created() {
    this.getAllBookingsOfOwner(urlGetAllBookingsOfOwner);
    const database = getDatabase();
    const bookingsRef = ref(database, "bookings");
    onValue(bookingsRef, (snapshot) => {
      this.checkChangeValue = snapshot.val();
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        this.token = localStorage.getItem("access_token");
      }
    });
  },

  props: ["status", "timeDate", "timeType", "enableSearch"],

  data() {
    return {
      deleteIcon: Delete,
      edit: Edit,
      search: Search,
      bookings: [],
      small: false,
      background: true,
      disabled: false,
      token: localStorage.getItem("access_token"),
      currentPage: 1,
      totalBookings: 0,
      pageSize: 10,
      searchOptions: {
        dateFilter: null,
        timeFilter: [],
        statusFilter: null,
      },
      statusConfirm: "Confirmed",
      checkChangeValue: null,
    };
  },

  mounted() {
    window.addEventListener("error", (e) => {
      if (
        e.message ===
        "ResizeObserver loop completed with undelivered notifications."
      ) {
        const resizeObserverErrDiv = document.getElementById(
          "webpack-dev-server-client-overlay-div"
        );
        const resizeObserverErr = document.getElementById(
          "webpack-dev-server-client-overlay"
        );
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute("style", "display: none");
        }
      }
    });
  },

  watch: {
    status: function () {
      this.searchOptions.statusFilter = this.status;
    },

    timeDate: function () {
      let time = new Date(this.timeDate);
      let day = time.getDate();
      let month = time.getMonth() + 1;
      let year = time.getFullYear();
      let formattedDate = `${month < 10 ? "0" : ""}${month}-${
        day < 10 ? "0" : ""
      }${day}-${year}`; // add số 0 vào nếu ngày , tháng < 10
      //để có định dạng : mm-dd-yy
      this.searchOptions.dateFilter = formattedDate;
    },

    timeType: function () {
      this.searchOptions.timeFilter = [];
      this.searchOptions.timeFilter.push(this.timeType);
    },

    enableSearch: function () {
      this.getAllBookingsOfOwner(urlGetAllBookingsOfOwner, this.searchOptions);
    },

    checkChangeValue: function () {
      this.getAllBookingsOfOwner(urlGetAllBookingsOfOwner, this.searchOptions);
    },
  },

  computed: {
    filterTableData: function () {
      return this.bookings;
    },
  },

  methods: {
    handleCurrentChange() {
      this.getAllBookingsOfOwner(urlGetAllBookingsOfOwner);
    },

    async acceptBooking(booking) {
      if (booking.status_id !== this.statusConfirm) {
        const urlAcceptBooking =
          process.env.VUE_APP_END_POINT_API +
          `booking/${booking.id}/accept?_method=PATCH&idOwner=${booking.court_owner_id}`;
        const formData = new FormData();
        formData.append("userId", booking.id_user);
        formData.append("date", booking.day_booking);
        formData.append("time", booking.time_booking_start);
        formData.append("badminton_court_id", booking.badminton_court_id);
        await axios
          .post(urlAcceptBooking, formData, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then(() => {})
          .catch((error) => {
            console.log(error);
          });
      }
    },

    async cancelBooking(booking) {
      console.log(booking);
      const urlCancelBooking =
        process.env.VUE_APP_END_POINT_API +
        `booking/${booking.id}/cancel?_method=PATCH&idOwner=${booking.court_owner_id}`;
      const formData = new FormData();
      formData.append("userId", booking.id_user);
      formData.append("date", booking.day_booking);
      formData.append("time", booking.time_booking_start);
      formData.append("badminton_court_id", booking.badminton_court_id);
      await axios
        .post(urlCancelBooking, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    },

    async deleteBooking(id, idOwner) {
      const urlDeleteBooking =
        process.env.VUE_APP_END_POINT_API + `booking/${id}?idOwner=${idOwner}`;
      axios
        .delete(urlDeleteBooking, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(error);
        });
    },

    async getAllBookingsOfOwner(urlGetAllBookingsOfOwner, searchOptions) {
      await axios
        .get(urlGetAllBookingsOfOwner, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            page: this.currentPage,
            ...searchOptions,
          },
        })
        .then((response) => {
          this.bookings = Object.values(response.data.listBookingOfOwner);
          console.log(this.bookings);
          this.totalBookings = response.data.totalBookings;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style scoped>
.demo-pagination-block {
  position: absolute;
  left: 40%;
  bottom: 1%;
}
</style>

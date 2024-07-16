<template>
  <div class="form">
    <div class="select-court">
      <div class="span"><b>Select Football Pitch</b></div>
      <el-select
        v-model="name"
        class="m-2"
        placeholder="Select"
        size="large"
        style="width: 240px"
      >
        <el-option
          v-for="item in courts"
          :key="item.index"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <div class="address"><b>Address</b></div>
      <el-input
        class="address-input"
        readonly
        v-model="address"
        placeholder="Address"
      />
    </div>

    <div class="day">
      <div class="select-day"><b>Select Day</b></div>
      <el-date-picker
        class="date-picker"
        v-model="day"
        type="date"
        placeholder="Pick a date"
        :default-value="dayDefault"
      />
      <div class="select-time">
        <b>Select Time</b>
      </div>
      <div class="multiple-button">
        <el-button
          v-for="button in buttons"
          :key="button.id"
          :class="{ active: button.active }"
          :disabled="button.status"
          @click="toggleButton(button)"
        >
          {{ button.label }}
        </el-button>
      </div>
      <el-button @click="makeSchedule" class="submit">
        <b>Submit</b>
      </el-button>
    </div>
    <div class="note">
      <div class="booked-color"></div>
      <span class="booked-text">Available</span>
      <div class="open-color"></div>
      <span class="open-text">Booked/Closed</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const urlMakeSchedule =
  process.env.VUE_APP_END_POINT_API + "badminton-court/schedule";
const urlGetAllBadmintonCourtsOfOwner =
  process.env.VUE_APP_END_POINT_API + "owner/list-badminton-courts";
const urlGetEmptyTime =
  process.env.VUE_APP_END_POINT_API + "badminton-court/empty";
import { getDatabase, onValue, ref } from "firebase/database";
import { ElNotification } from "element-plus";
export default {
  data() {
    return {
      courts: null,
      name: "Select Football Pitch",
      address: null,
      day: "Select Day",
      dayDefault: null,
      buttons: [
        {
          id: 1,
          label: "5:00AM-6:00AM",
          active: false,
          value: "T1",
          status: "false",
        },
        {
          id: 2,
          label: "6:00AM-7:00AM",
          active: false,
          value: "T2",
          status: "false",
        },
        {
          id: 3,
          label: "7:00AM-8:00AM",
          active: false,
          value: "T3",
          status: "false",
        },
        {
          id: 4,
          label: "8:00AM-9:00AM",
          active: false,
          value: "T4",
          status: "false",
        },
        {
          id: 5,
          label: "4:00PM-5:00PM",
          active: false,
          value: "T5",
          status: "false",
        },
        {
          id: 6,
          label: "5:00PM-6:00PM",
          active: false,
          value: "T6",
          status: "false",
        },
        {
          id: 7,
          label: "6:00PM-7:00PM",
          active: false,
          value: "T7",
          status: "false",
        },
        {
          id: 8,
          label: "7:00PM-8:00PM",
          active: false,
          value: "T8",
          status: "false",
        },
      ],
      timeOpen: [],
      token: localStorage.getItem("access_token"),
      checkRequest: true,
      checkChangeValue: null,
    };
  },

  watch: {
    name() {
      const timestamp = Date.now();
      this.dayDefault = timestamp;
      let currentDate = new Date(timestamp);
      let day = currentDate.getDate();
      let month = currentDate.getMonth() + 1;
      let year = currentDate.getFullYear();
      this.day = `${year}-${month < 10 ? "0" : ""}${month}-${
        day < 10 ? "0" : ""
      }${day}`; // add số 0 vào nếu ngày , tháng < 10 để có định dạng : yy-mm-dd

      const selectedCourt = this.courts.find((court) => court.id === this.name);
      if (selectedCourt) {
        this.address = selectedCourt.address;
      } else {
        this.address = null;
      }
    },
    day() {
      this.getEmptyTime();
      if (this.checkRequest === false) {
        this.buttons.forEach((item) => {
          item.active = false;
        });
      }
      const currentDate = new Date();
      console.log(currentDate);
      let time = new Date(this.day);
      console.log(time);
      if (time < currentDate - 1) {
        this.buttons.forEach((item) => {
          item.status = true;
        });
      }
      this.dayDefault = time;
      let day = time.getDate();
      let month = time.getMonth() + 1;
      let year = time.getFullYear();
      let formattedDate = `${month < 10 ? "0" : ""}${month}-${
        day < 10 ? "0" : ""
      }${day}-${year}`; // add số 0 vào nếu ngày , tháng < 10
      //để có định dạng : mm-dd-yy
      this.day = formattedDate;
    },
    checkChangeValue: function () {
      this.getEmptyTime();
    },
  },

  created() {
    this.openSchedule();
    const database = getDatabase();
    const schedules = ref(database, "badminton_court_schedules");
    onValue(schedules, (snapshot) => {
      this.checkChangeValue = snapshot.val();
    });

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        this.token = localStorage.getItem("access_token");
      }
    });
  },

  methods: {
    toggleButton(button) {
      button.active = !button.active;
    },

    async makeSchedule() {
      let formData = new FormData();
      formData.append("badminton_court_id", this.name);
      formData.append("date", this.day);
      this.buttons.forEach((button) => {
        if (button.active) {
          formData.append("empty_times[]", button.value);
        }
      });
      await axios
        .post(urlMakeSchedule, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Make Schedule is successfully!",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.getEmptyTime();
        })
        .catch((error) => {
          ElNotification({
            title: "Successfully Notification",
            message: "Make Schedule is failed!",
            position: "bottom-right",
            type: "error",
            duration: "3000",
          });
          console.log(error);
        });
    },

    openSchedule() {
      axios
        .get(urlGetAllBadmintonCourtsOfOwner, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.courts = response.data.allBadmintonCourtsOfOwner;
          console.log(this.courts);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async getEmptyTime() {
      this.buttons.forEach((button) => {
        button.status = false;
        if (!this.timeOpen.includes(button.value)) {
          button.active = false;
        }
      });
      const formData = new FormData();
      formData.append("badminton_court_id", this.name);
      formData.append("date", this.day);
      await axios
        .post(urlGetEmptyTime, formData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          const emptyTime = Object.values(response.data.emptyTime.empty_time);
          if (emptyTime) {
            this.buttons.forEach((button) => {
              if (!emptyTime.includes(button.value)) {
                button.active = false;
                button.status = true;
              } else {
                button.active = true;
                button.status = false;
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
          this.checkRequest = false;
        });
    },
  },
};
</script>

<style scoped>
.form {
  background: #e1f0bf;
  height: 290px;
  width: 120%;
}

.select-court {
  width: 60vw;
  padding: 30px 10%;
  display: flex;
}

.select-court .span {
  padding: 0 10px;
  margin: 10px 10px;
  color: rgba(7, 7, 126, 0.767);
}

.select-court .address {
  margin: 10px 0px 0px 40px;
  color: rgba(7, 7, 126, 0.767);
}

.select-court .address-input {
  height: 4vh;
  width: 30vw;
  margin-left: 17px;
}

.day {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  width: 50vw;
}

.day .select-day {
  margin: 7px 105px 0px 55%;
  color: rgba(7, 7, 126, 0.767);
  width: 4vw;
}

.day .date-picker {
  margin: 40px 10%;
}

.day .select-time {
  margin: 7px 0px 0px 40px;
  color: rgba(7, 7, 126, 0.767);
  width: 5vw;
}

.day .multiple-button {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  margin-left: -10px;
}

.day .multiple-button .el-button {
  background-color: #ccc;
  color: #000;
  border: none;
  cursor: pointer;
}

.day .multiple-button .el-button:first-child {
  margin-left: 12px;
}

.day .multiple-button .el-button.active {
  background-color: #2fc0ecec;
  color: #fff;
}

.submit {
  margin-left: 180px;
  margin-top: 30px;
  width: 120px;
  background: #ccc;
  font-size: 16px;
}

.submit:hover {
  background: #b3e0eeec;
}

.note {
  margin-top: -40px;
  margin-left: 600px;
  position: relative;
}

.note .booked-color {
  background: #2fc0ecec;
  width: 25px;
  height: 25px;
  position: absolute;
  left: 300px;
  top: 10px;
}

.note .booked-text {
  margin-top: -20px;
  position: absolute;
  left: 335px;
  top: 33px;
}

.note .open-color {
  position: absolute;
  background: #ccc;
  width: 25px;
  height: 25px;
  left: 500px;
  top: 10px;
}

.note .open-text {
  position: absolute;
  left: 535px;
  top: 14px;
}
</style>

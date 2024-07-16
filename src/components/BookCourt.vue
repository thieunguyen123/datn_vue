<template>
  <div class="book-court">
    <div class="day" @mouseenter="remindBooking">
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
          :class="bindingClassButton(button)"
          :disabled="button.status"
          @click="toggleButton(button)"
        >
          {{ button.label }}
        </el-button>
      </div>
      <el-button v-if="token" @click="booking" class="submit">
        <b>Submit</b>
      </el-button>
    </div>
    <div class="note">
      <div :class="[token ? 'available-color' : 'available-color1']"></div>
      <span :class="[token ? 'available-text' : 'available-text1']"
        >Available</span
      >
      <div v-if="token" class="booked-color1"></div>
      <span v-if="token" class="booked-text1">Selected</span>
      <div :class="[token ? 'open-color' : 'open-color1']"></div>
      <span :class="[token ? 'open-text' : 'open-text1']">Booked/Closed</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const urlGetEmptyTime =
  process.env.VUE_APP_END_POINT_API + "badminton-court/empty";
const urlBooking = process.env.VUE_APP_END_POINT_API + "booking";
import { getDatabase, onValue, ref } from "firebase/database";
import { ElMessage } from "element-plus";
export default {
  props: ["id", "courtOwnerId"],

  data() {
    return {
      day: "Select Day",
      buttons: [
        {
          id: 1,
          label: "5:00AM-6:00AM",
          active: false,
          value: "T1",
          status: "false",
          click: 0,
        },
        {
          id: 2,
          label: "6:00AM-7:00AM",
          active: false,
          value: "T2",
          status: "false",
          click: 0,
        },
        {
          id: 3,
          label: "7:00AM-8:00AM",
          active: false,
          value: "T3",
          status: "false",
          click: 0,
        },
        {
          id: 4,
          label: "8:00AM-9:00AM",
          active: false,
          value: "T4",
          status: "false",
          click: 0,
        },
        {
          id: 5,
          label: "4:00PM-5:00PM",
          active: false,
          value: "T5",
          status: "false",
          click: 0,
        },
        {
          id: 6,
          label: "5:00PM-6:00PM",
          active: false,
          value: "T6",
          status: "false",
          click: 0,
        },
        {
          id: 7,
          label: "6:00PM-7:00PM",
          active: false,
          value: "T7",
          status: "false",
          click: 0,
        },
        {
          id: 8,
          label: "7:00PM-8:00PM",
          active: false,
          value: "T8",
          status: "false",
          click: 0,
        },
      ],
      token: localStorage.getItem("access_token"),
      timeOpen: [],
      dayDefault: null,
      dayFormatted: null,
      checkChangeValue: null,
      hoverCount: 0,
    };
  },

  created() {
    const database = getDatabase();
    const schedulesRef = ref(database, "badminton_court_schedules");
    onValue(schedulesRef, (snapshot) => {
      this.checkChangeValue = snapshot.val();
    });
    const timestamp = Date.now();
    this.dayDefault = timestamp;
    this.day = this.dayDefault;
  },

  watch: {
    day: function () {
      let time = new Date(this.day);
      let day = time.getDate();
      let month = time.getMonth() + 1;
      let year = time.getFullYear();
      let formattedDate = `${month < 10 ? "0" : ""}${month}-${
        day < 10 ? "0" : ""
      }${day}-${year}`; // add số 0 vào nếu ngày , tháng < 10
      //để có định dạng : mm-dd-yy
      this.getEmptyTime(formattedDate);
      this.dayFormatted = formattedDate;
    },

    checkChangeValue: function () {
      this.getEmptyTime(this.dayFormatted);
    },
  },

  methods: {
    toggleButton(button) {
      button.click += 1;
    },

    bindingClassButton(button) {
      if (button.active == true) {
        if (button.click % 2 === 0) {
          return "unselected";
        } else {
          return "selected";
        }
      } else {
        return;
      }
    },

    remindBooking() {
      if (this.hoverCount === 0 && !this.token) {
        ElMessage({
          message: "Please log in to make a court reservation and comment!",
          type: "success",
          duration: "3000",
          width: "5vw",
        });
        this.hoverCount += 1;
      }
    },

    async getEmptyTime(formattedDate) {
      const formData = new FormData();
      formData.append("badminton_court_id", this.id);
      formData.append("date", formattedDate);
      await axios
        .post(urlGetEmptyTime, formData)
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
        .catch(() => {
          this.buttons.forEach((button) => {
            button.active = false;
            button.status = true;
          });
        });
    },

    booking() {
      this.buttons.forEach((button) => {
        if (button.active === true && button.click % 2 !== 0) {
          let formData = new FormData();
          formData.append("badminton_court_id", this.id);
          formData.append("day_booking", this.dayFormatted);
          formData.append("time_booking[]", button.value);
          formData.append("court_owner_id", this.courtOwnerId);
          axios
            .post(urlBooking, formData, {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            })
            .then(() => {
              ElMessage({
                message:
                  "Congratulations on successfully booking your appointment! Please check your email for the registration confirmation.",
                type: "success",
                duration: "5000",
                width: "30vw",
              });
            })
            .catch((error) => {
              ElMessage({
                message:
                  "Booking unsuccessful, please check your network connection and try again.",
                type: "error",
                duration: "5000",
                width: "30vw",
              });
              console.log(error);
            });
        }
      });
    },
  },
};
</script>

<style scoped>
.day {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  width: 50vw;
}

.day .select-day {
  margin: 7px 105px 0px 180px;
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

.day .multiple-button .el-button.selected {
  background-color: #e2b664ec;
  color: #fff;
}

.day .multiple-button .el-button.unselected {
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

.note .available-color {
  background: #2fc0ecec;
  width: 25px;
  height: 25px;
  position: absolute;
  left: 19.5vw;
  top: 10px;
}

.note .available-color1 {
  background: #2fc0ecec;
  width: 25px;
  height: 25px;
  position: absolute;
  left: 19.5vw;
  top: 60px;
}

.note .available-text {
  margin-top: -20px;
  position: absolute;
  left: 22vw;
  top: 33px;
}

.note .available-text1 {
  margin-top: -20px;
  position: absolute;
  left: 22vw;
  top: 83px;
}

.note .booked-color1 {
  background: #e2b664ec;
  width: 25px;
  height: 25px;
  position: absolute;
  left: 7.5vw;
  top: 10px;
}

.note .booked-text1 {
  margin-top: -20px;
  position: absolute;
  left: 10vw;
  top: 33px;
}

.note .open-color {
  position: absolute;
  background: #ccc;
  width: 25px;
  height: 25px;
  left: 32vw;
  top: 10px;
}

.note .open-color1 {
  position: absolute;
  background: #ccc;
  width: 25px;
  height: 25px;
  left: 32vw;
  top: 60px;
}

.note .open-text {
  position: absolute;
  left: 34.5vw;
  top: 14px;
}

.note .open-text1 {
  position: absolute;
  left: 34.5vw;
  top: 62px;
}
</style>

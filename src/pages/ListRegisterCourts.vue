<template>
  <el-table :data="filterTableData" style="width: 100%; margin-top: 10px">
    <el-table-column label="Name" prop="name" />
    <el-table-column label="Description" prop="description" />
    <el-table-column label="Address" prop="address" />
    <el-table-column label="Price" prop="price" />
    <el-table-column label="Image">
      <template #default="scope">
        <el-image
          style="width: 100px; height: 100px"
          :src="scope.row.image[0]"
          :zoom-rate="1.2"
          :max-scale="7"
          :min-scale="0.2"
          :preview-src-list="scope.row.image"
          :initial-index="4"
          :preview-teleported="true"
          fit="cover"
        />
      </template>
    </el-table-column>
    <el-table-column label="Status" prop="status_id" />
    <el-table-column align="right">
      <template #default="scope">
        <el-button
          type="success"
          :icon="checkIcon"
          circle
          @click="acceptBadmintonCourts(scope.row.id)"
        />
        <el-button
          @click="deleteBadmintonCourt(scope.row)"
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
      :total="totalBadmintonCourts"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { Check, Delete } from "@element-plus/icons-vue";
import axios from "axios";
import useInfoModalBadmintonCourt from "../stores/InfoModalBadmintonCourt.js";
import { ElNotification } from "element-plus";
const urlDeleteBadmintonCourt = "owner/badminton-court/";
const urlGetListNeedAccept =
  process.env.VUE_APP_END_POINT_API + "lists-accept/badmintonCourts";
export default {
  setup() {
    const infoModalBadmintonCourt = useInfoModalBadmintonCourt();
    return { infoModalBadmintonCourt };
  },

  created() {
    this.getListNeedAccept(urlGetListNeedAccept);

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        this.token = localStorage.getItem("access_token");
      }
    });
  },

  data() {
    return {
      deleteIcon: Delete,
      checkIcon: Check,
      token: localStorage.getItem("access_token"),
      currentPage: 1,
      small: false,
      badmintonCourts: [],
      disabled: false,
      background: true,
      pageSize: 5,
      totalBadmintonCourts: 0,
      toggleModalCreate: false,
      url: null,
      srcList: [],
      idUpdate: null,
    };
  },

  computed: {
    filterTableData: function () {
      return this.badmintonCourts;
    },
  },

  methods: {
    handleCurrentChange() {
      this.getListNeedAccept();
    },

    reloadListBadmintonCourts() {
      this.getListNeedAccept();
    },

    acceptBadmintonCourts(id) {
      const urlAcceptBadmintonCourts =
        process.env.VUE_APP_END_POINT_API + `accept-badminton-courts/${id}`;
      axios
        .get(urlAcceptBadmintonCourts, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Successfully",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.getListNeedAccept();
        })
        .catch(() => {
          ElNotification({
            title: "Error Notification",
            message: "Failed.",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
        });
    },

    async getListNeedAccept() {
      await axios
        .get(urlGetListNeedAccept, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            currentPage: this.currentPage,
          },
        })
        .then((response) => {
          this.badmintonCourts = response.data.badmintonCourts;
          this.totalBadmintonCourts = response.data.total;
        })
        .catch(() => {});
    },

    async deleteBadmintonCourt(court) {
      let url =
        process.env.VUE_APP_END_POINT_API + urlDeleteBadmintonCourt + court.id;
      await axios
        .delete(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            idOwner: court.court_owner_id,
          },
        })
        .then(() => {
          ElNotification({
            title: "Successfully Notification",
            message: "Delete Badminton Court is Successfully.",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
          this.getListNeedAccept();
        })
        .catch(() => {
          ElNotification({
            title: "Error Notification",
            message: "Delete Badminton Court is Failed.",
            position: "bottom-right",
            type: "success",
            duration: "3000",
          });
        });
    },
  },
};
</script>

<style scoped>
.image-slot {
  font-size: 30px;
}
.image-slot .el-icon {
  font-size: 30px;
}
.el-image {
  width: 100%;
  height: 200px;
}
.demo-pagination-block {
  position: absolute;
  left: 40%;
  bottom: 1%;
}
</style>
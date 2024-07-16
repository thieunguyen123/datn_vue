<template>
  <el-button @click="handleCreateBadmintonCourt" type="success"
    >Create</el-button
  >
  <create-badminton-court-vue
    v-if="infoModalBadmintonCourt.showModalCreate"
    @reload-list-badminton-courts="reloadListBadmintonCourts"
  />
  <edit-badminton-court-vue
    v-if="infoModalBadmintonCourt.showModalEdit"
    :id="idUpdate"
    @reload-list-badminton-courts="reloadListBadmintonCourts"
  />
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
          @click="editBadmintonCourt(scope.row.id)"
          type="primary"
          :icon="edit"
          circle
        />
        <el-button
          @click="deleteBadmintonCourt(scope.row.court_owner_id, scope.row.id)"
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
import { Edit, Delete } from "@element-plus/icons-vue";
import axios from "axios";
import CreateBadmintonCourtVue from "./CreateBadmintonCourt.vue";
import EditBadmintonCourtVue from "./EditBadmintonCourt.vue";
import useInfoModalBadmintonCourt from "../stores/InfoModalBadmintonCourt.js";
const urlDeleteBadmintonCourt = "owner/badminton-court/";
const urlgetAllBadmintonCourts =
  process.env.VUE_APP_END_POINT_API + "admin/all-courts";
export default {
  setup() {
    const infoModalBadmintonCourt = useInfoModalBadmintonCourt();
    return { infoModalBadmintonCourt };
  },
  components: {
    CreateBadmintonCourtVue,
    EditBadmintonCourtVue,
  },
  created() {
    this.getAllBadmintonCourts();

    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        this.token = localStorage.getItem("access_token");
      }
    });
  },
  data() {
    return {
      deleteIcon: Delete,
      edit: Edit,
      token: localStorage.getItem("access_token"),
      currentPage: 1,
      small: false,
      badmintonCourts: [],
      disabled: false,
      background: true,
      pageSize: 5,
      totalBookings: 0,
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
      this.getAllBadmintonCourts();
    },

    reloadListBadmintonCourts() {
      this.getAllBadmintonCourts();
    },

    async getAllBadmintonCourts() {
      await axios
        .get(urlgetAllBadmintonCourts, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            currentPage: this.currentPage,
          },
        })
        .then((response) => {
          this.badmintonCourts = response.data.badmintonCourts;
          this.totalBookings = response.data.total;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    handleCreateBadmintonCourt() {
      this.infoModalBadmintonCourt.showModalCreate =
        !this.infoModalBadmintonCourt.showModalCreate;
    },

    async deleteBadmintonCourt(idOwner, id) {
      let url =
        process.env.VUE_APP_END_POINT_API + urlDeleteBadmintonCourt + id;
      await axios
        .delete(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            idOwner: idOwner,
          },
        })
        .then(() => {
          this.getAllBadmintonCourts();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    editBadmintonCourt(id) {
      this.idUpdate = id;
      this.infoModalBadmintonCourt.showModalEdit =
        !this.infoModalBadmintonCourt.showModalEdit;
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
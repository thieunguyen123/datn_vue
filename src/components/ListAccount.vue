<template>
  <el-table :data="filterTableData" style="width: 100%; margin-top: 10px">
    <el-table-column label="First Name" prop="first_name" />
    <el-table-column label="Last Name" prop="last_name" />
    <el-table-column label="Email" prop="email" />
    <el-table-column label="Gender" prop="gender" />
    <el-table-column label="Phone Number" prop="phone_number" />
    <el-table-column label="Role" prop="role_id" />
    <el-table-column label="Date" prop="updated_at" />
    <el-table-column align="right">
      <template #header>
        <el-input v-model="search" size="small" placeholder="Type to search" />
      </template>
      <template #default="scope">
        <el-button size="small" @click="handleEdit(scope)">Edit</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope)"
          >Delete</el-button
        >
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
      :total="totalUsers"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import useInfoModal from "../stores/ModalEditAccount";
import axios from "axios";
const urlGetAllUsers = process.env.VUE_APP_END_POINT_API + "list-users";
export default {
  setup() {
    const infoModal = useInfoModal();
    return { infoModal };
  },
  created() {
    this.getAllUsers(this.token);
  },
  data() {
    return {
      users: [],
      search: "",
      small: false,
      background: true,
      disabled: false,
      pageSize: 10,
      totalUsers: 0,
      currentPage: 1,
      token: localStorage.getItem("access_token"),
      debounceSearch: null,
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

  computed: {
    filterTableData: function () {
      return this.users;
    },
  },

  watch: {
    search: function () {
      if (this.debounceSearch) {
        clearTimeout(this.debounceSearch);
      }
      this.debounceSearch = setTimeout(() => {
        this.currentPage = 1;
        this.getAllUsers(this.token);
      }, 700);
    },
  },

  methods: {
    async handleEdit(scope) {
      let userId = scope.row.id;
      await axios
        .get(process.env.VUE_APP_END_POINT_API + `account/${userId}/edit`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.infoModal.account = response.data.account;
        })
        .catch((error) => {
          console.log(error);
        });
      this.infoModal.showModal = !this.infoModal.showModal;
    },
    async handleDelete(scope) {
      let userId = scope.row.id;
      await axios
        .delete(process.env.VUE_APP_END_POINT_API + `account/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(() => {
          this.getAllUsers(this.token);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    handleCurrentChange() {
      this.getAllUsers(this.token);
    },
    async getAllUsers(token) {
      await axios
        .get(urlGetAllUsers, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: this.currentPage,
            search: this.search,
          },
        })
        .then((response) => {
          this.users = response.data.allUsers;
          this.totalUsers = response.data.totalUsers;
          console.log(this.users);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style lang="css">
.demo-pagination-block {
  position: absolute;
  left: 40%;
  bottom: 1%;
}
</style>
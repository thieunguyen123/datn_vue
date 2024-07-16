<template>
  <el-dialog
    style="background: linear-gradient(to bottom right, #aa, #ffffff)"
    v-model="centerDialogVisible"
    :title="thieu"
    width="40%"
    center
    top="10vh"
  >
    <div class="login-box">
      <form class="create-badmintonCourt" @submit.prevent="submit">
        <div class="u-form-group">
          <label class="" for="">Name</label>
          <input
            v-model="badmintonCourt.name"
            type="text"
            id="name"
            placeholder="Name"
          />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Description</label>
          <input
            type="text"
            v-model="badmintonCourt.description"
            id="description"
            placeholder="Description"
          />
          <span v-if="errors.description" class="error">{{
            errors.description
          }}</span>
        </div>
        <div class="u-form-group-address">
          <label for="">Address</label>
          <div class="select-address">
            <el-select
              v-model="provinceSelect"
              class="selected-status"
              :placeholder="provincePlaceHolder"
              style="margin: 10px 0px 0px 10px; width: 180px"
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
              class="selected-status"
              :placeholder="districtPlaceHolder"
              style="margin: 10px 0px 0px 10px; width: 180px"
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
              class="selected-status"
              :placeholder="wardPlaceHolder"
              style="margin: 10px 0px 0px 10px; width: 180px"
            >
              <el-option
                v-for="item in wards"
                :key="item.ward_id"
                :label="item.ward_name"
                :value="item.ward_id"
              />
            </el-select>
          </div>
          <input
            v-model="badmintonCourt.address"
            type="text"
            id="address"
            placeholder="Enter the badminton court address"
          />
          <span v-if="errors.address" class="error">{{ errors.address }}</span>
        </div>
        <div class="u-form-group">
          <label for="">Price</label>
          <input
            v-model="badmintonCourt.price"
            type="number"
            id="price"
            placeholder="Price"
          />
          <span v-if="errors.price" class="error">{{ errors.price }}</span>
        </div>
        <div class="u-form-group">
          <label style="margin-top: 7px" for="">Upload</label>
          <input
            type="file"
            @change="uploadImage"
            name="Image"
            id="upload"
            :disabled="disabled"
          />
          <div class="multiple-images">
            <div
              v-for="(url, index) in urls"
              :key="index"
              class="image-container"
            >
              <img
                class="images-click"
                :src="url"
                alt="Uploaded Image"
                @click="focusImg(index)"
              />
              <span
                v-if="showRemoveIcon(index)"
                class="remove-icon"
                @click="removeImage(index)"
              >
                &#10006;
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeModal()">Cancel</el-button>
        <el-button @click="updateBadmintonCourt()" type="success">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script>
import axios from "axios";
import { ElNotification } from "element-plus";
import useInfoModalBadmintonCourt from "../stores/InfoModalBadmintonCourt.js";
const urlProvince = "https://vapi.vnappmob.com/api/province";
export default {
  setup() {
    const infoModalBadmintonCourt = useInfoModalBadmintonCourt();
    return { infoModalBadmintonCourt };
  },

  props: ["id"],

  data() {
    return {
      centerDialogVisible: true,
      badmintonCourt: {},
      errors: {},
      urls: [],
      images: [],
      token: localStorage.getItem("access_token"),
      count: null,
      disabled: false,
      provinces: {},
      provinceSelect: null,
      districts: {},
      districtSelect: null,
      wards: {},
      wardSelect: null,
      provinceName: null,
      districtName: null,
      wardName: null,
      provincePlaceHolder: null,
      districtPlaceHolder: null,
      wardPlaceHolder: null,
      addressPlaceHolder: null,
      address: null,
    };
  },

  created() {
    this.getInfoToEdit(this.id);
    this.loadProvince();
  },

  watch: {
    centerDialogVisible() {
      this.infoModalBadmintonCourt.showModalEdit =
        !this.infoModalBadmintonCourt.showModalEdit;
    },

    count() {
      if (this.count > 4) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    },

    provinceSelect: function () {
      this.districtSelect = null;
      this.loadDistrict();
      this.districtPlaceHolder = "Select District";
      this.districtPlaceHolder = "Select District";
      this.wardPlaceHolder = "Select Ward";
      this.badmintonCourt.address = "";
      this.provinceName = this.provinces.find(
        (p) => p.province_id === this.provinceSelect
      ).province_name;
    },

    districtSelect: function () {
      this.wardSelect = null;
      this.loadWard();
      this.districtName = null;
      if (this.districtSelect) {
        this.districtName = this.districts.find(
          (d) => d.district_id === this.districtSelect
        ).district_name;
      }
    },

    wardSelect: function () {
      this.wardName = null;
      if (this.wardSelect) {
        this.wardName = this.wards.find(
          (w) => w.ward_id === this.wardSelect
        ).ward_name;
      }
    },
  },

  methods: {
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

    closeModal() {
      this.infoModalBadmintonCourt.showModalEdit =
        !this.infoModalBadmintonCourt.showModalEdit;
    },

    uploadImage(event) {
      const file = event.target.files[0];
      if (file && !this.checkDuplicatedImg(file)) {
        this.count++;
        const url = URL.createObjectURL(file);
        this.urls.push(url);
        this.images.push(file);
      }
    },

    checkDuplicatedImg(file) {
      return this.images.some((uploadedFile) => {
        return (
          uploadedFile.name === file.name && uploadedFile.size === file.size
        );
      });
    },

    focusImg(i) {
      const image = document.getElementsByClassName("images-click");
      Object.values(image).forEach((value) => {
        value.style.border = "none";
      });
      image[i].style.border = "solid 3px #00FFFF";
    },

    isImageFocused(index) {
      return index === this.focusedImageIndex;
    },

    showRemoveIcon(index) {
      return this.isImageFocused(index) || this.urls.length > 0;
    },

    removeImage(index) {
      this.images.splice(index, 1);
      this.urls.splice(index, 1);
      this.count--;
    },

    async getInfoToEdit(id) {
      const urlGetInfoBadmintonCourt =
        process.env.VUE_APP_END_POINT_API + `owner/badminton-court/${id}/edit`;
      await axios
        .get(urlGetInfoBadmintonCourt, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.badmintonCourt = response.data.badmintonCourt;
          this.urls = this.badmintonCourt.image;
          this.count = this.urls.length;
          let arrayParts = this.badmintonCourt.address.split(", ");
          let lengthArray = arrayParts.length;
          this.provincePlaceHolder = arrayParts[lengthArray - 1];
          this.districtPlaceHolder = arrayParts[lengthArray - 2];
          this.wardPlaceHolder = arrayParts[lengthArray - 3];
          this.badmintonCourt.address = arrayParts.slice(0, lengthArray - 3);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async updateBadmintonCourt() {
      if (this.checkValidate()) {
        const oldNameImg = this.urls
          .filter((url) => url.includes("storage"))
          .map((url) => url.split("storage/")[1]);
        const id = this.id;
        const urlUpdateBadmintonCourt =
          process.env.VUE_APP_END_POINT_API +
          `owner/badminton-court/${id}?_method=PATCH`;
        const formData = new FormData();
        formData.append("name", this.badmintonCourt.name);
        formData.append("description", this.badmintonCourt.description);
        formData.append("price", this.badmintonCourt.price);
        for (let i = 0; i < this.images.length; i++) {
          formData.append("images[]", this.images[i]);
        }
        oldNameImg.forEach((imageName) => {
          formData.append("oldNameImg[]", imageName);
        });
        if (!this.provinceSelect) {
          this.address =
            this.badmintonCourt.address +
            ", " +
            this.wardPlaceHolder +
            ", " +
            this.districtPlaceHolder +
            ", " +
            this.provincePlaceHolder;
        } else {
          this.address =
            this.badmintonCourt.address +
            ", " +
            this.wardName +
            ", " +
            this.districtName +
            ", " +
            this.provinceName;
        }
        formData.append("address", this.address);
        await axios
          .post(urlUpdateBadmintonCourt, formData, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then(() => {
            ElNotification({
              title: "Successfully Notification",
              message: "Edit Court is successfully",
              position: "bottom-right",
              type: "success",
              duration: "3000",
            });
            this.$emit("reloadListBadmintonCourts");
            this.infoModalBadmintonCourt.showModalEdit =
              !this.infoModalBadmintonCourt.showModalEdit;
          })
          .catch((error) => {
            ElNotification({
              title: "Error Notification",
              message: "Edit Court is failed",
              position: "bottom-right",
              type: "error",
              duration: "3000",
            });
            console.log(error);
          });
      }
    },

    checkValidate() {
      this.errors = {};
      if (
        (this.provinceSelect && (!this.districtSelect || !this.wardSelect)) ||
        !this.badmintonCourt.address
      ) {
        this.errors.address = "Please fill in the full address.";
      }
      return Object.keys(this.errors).every((key) => !this.errors[key]);
    },
  },
};
</script>

<style scoped>
.login-box {
  position: relative;
  margin: 20px auto;
  width: 500px;
  height: 600px;
  padding: 20px;
}

.u-form-group {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  position: relative;
}

.u-form-group label {
  margin-top: -15px;
  flex: 0 0 100px;
  margin-right: 20px;
  text-align: right;
}

.u-form-group input[type="text"],
input[type="number"] {
  width: 100%; /* Độ rộng đầy đủ cho input */
  height: 35px;
  outline: none;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding: 0 10px;
  border-radius: 5px;
  box-sizing: border-box;
  color: #333;
  font-size: 0.8rem;
  -webkit-transition: all 0.1s linear;
  -moz-transition: all 0.1s linear;
  transition: all 0.1s linear;
}

.u-form-group-address {
  margin-top: -10px;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.u-form-group-address label {
  position: absolute;
  left: 14%;
  top: 35%;
}

.u-form-group-address input {
  width: 370px;
  height: 35px;
  margin-left: 120px;
  margin-bottom: 20px;
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  text-indent: 10px;
}

.u-form-group input:focus {
  border-color: #358efb;
}

.u-form-group-address input:focus-visible {
  border-color: #358efb !important;
}

.u-form-group-address .error {
  color: red;
  margin-left: 125px;
  margin-top: -15px;
  font-size: 0.8rem;
}

.u-form-group-address .select-address {
  margin-left: 110px;
}

.u-form-group .error {
  color: red;
  font-size: 0.8rem;
  text-align: left;
  position: absolute;
  top: 39px;
  left: 125px;
}

.u-form-group .multiple-images {
  position: absolute;
  width: 400px;
  height: 200px;
  top: 45px;
  left: 20%;
}

.u-form-group .multiple-images img {
  margin: 10px 7px 10px 7px;
  width: 90px;
  height: 85px;
  cursor: pointer;
}

.image-container {
  position: relative;
  display: inline-block;
}

.remove-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 18px;
  color: red;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  padding: 5px;
  display: none;
}

.image-container:hover .remove-icon {
  display: block;
}
</style>
<template>
  <div>hi</div>
</template>

<script>
import axios from "axios";
const urlGetFavouritesCourt = process.env.VUE_APP_END_POINT_API + "favourite";
export default {
  created() {
    this.getFavouriteCourts();
  },

  data() {
    return {
      token: localStorage.getItem("access_token"),
      listFavouriteCourts: null,
    };
  },

  methods: {
    getFavouriteCourts() {
      axios
        .get(urlGetFavouritesCourt, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
            this.listFavouriteCourts = response.data.favourite_court;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    deleteFavouriteCourts() {
        axios.delete()
        .then(()=>{

        })
        .catch((error)=>{
            console.log(error);
        })
    }
  },
};
</script>

<style scoped>
</style>
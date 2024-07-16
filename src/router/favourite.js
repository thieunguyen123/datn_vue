const token = localStorage.getItem('access_token');

const favouriteCourt = [
    {
        path: "/favourite",
        name: "favouriteCourt",
        component: () => import("../pages/FavouriteCourtPage.vue"),
        beforeEnter: (to, from, next) => {
            if (!token) {
                next({ name: 'login', query: { redirect: to.fullPath } });
            } else {
                next();
            }
        }
    },
]

export default favouriteCourt;
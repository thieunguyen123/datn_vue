const user = [
    {
        path: "/booking",
        name: "booking",
        component: () => import("../pages/BookingPage.vue"),
        // beforeEnter: (to, from, next) => {
        //     const token = localStorage.getItem('access_token');
        //     if (!token) {
        //         const path = to.path;
        //         const badmintonCourt = to.query.badmintonCourt;
        //         next({ name: 'login', query: { path, badmintonCourt } });
        //     } else {
        //         next();
        //     }
        // }
    },
]

export default user;
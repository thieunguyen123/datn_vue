const checkToken = () => {
    const token = localStorage.getItem('access_token');
    return token;
}

const checkRole = () => {
    const roleId = localStorage.getItem("role_id");
    return roleId;
}

import useInfoAccountStore from '../stores/Account.js';

const setupStore = () => {
    return useInfoAccountStore();
}

const admin = [
    {
        path: "/admin",
        name: "admin",
        component: () => import("../pages/AdminPage.vue"),
        beforeEnter: (to, from, next) => {
            if (checkToken()) {
                if (checkRole() === setupStore().valueRoleAdmin) {
                    next();
                } else if (checkRole() === setupStore().valueRoleOwner) {
                    next('/owner');
                } else {
                    next('/');
                }
            } else {
                next('/login');
            }
        }
    },

    {
        path: "/list/badminton-court-accept",
        name: "listAcceptCourts",
        component: () => import("../pages/ListRegisterCourts.vue"),
    }
]

export default admin;
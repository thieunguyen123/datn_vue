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

const owner = [
    {
        path: "/owner",
        name: "owner",
        component: () => import("../pages/OwnerCourtPage.vue"),
        beforeEnter: (to, from, next) => {
            if (checkToken()) {
                if (checkRole() === setupStore().valueRoleOwner) {
                    next();
                } else if (checkRole() === setupStore().valueRoleAdmin) {
                    next('/admin');
                } else {
                    next('/');
                }
            } else {
                next('/login');
            }
        }
    },
]

export default owner;
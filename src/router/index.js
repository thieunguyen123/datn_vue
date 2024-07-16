import { createRouter, createWebHistory } from "vue-router";
import auth from "./auth";
import home from "./home";
import admin from "./admin";
import owner from "./owner";
import user from "./user";
import favouriteCourt from './favourite';
import PageNotFound  from "./404";
const routes = [...auth, ...home, ...admin, ...owner, ...user, ...favouriteCourt, ...PageNotFound];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;
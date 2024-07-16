const auth = [
    {
        path: "/register",
        name: "register",
        component: () => import("../pages/RegisterPage.vue"),
    },
    {
        path: "/login",
        name: "login",
        component: () => import("../pages/LoginPage.vue"),
    },
    {
        path: "/auth/google/callback",
        name: "google_callback",
        component: () => import("../pages/LoginGooglePage.vue"),
    },
    {
        path: '/auth/facebook/callback',
        name: 'facebook_callback',
        component: () => import("../pages/LoginFacebookPage.vue"),
    },
    {
        path: '/forgot-password',
        name: 'forgot_password',
        component: () => import("../pages/ForgotPasswordPage.vue"),
    },
    {
        path: '/reset-password',
        name: 'reset_password',
        component: () => import("../pages/ResetPasswordPage.vue"),
    }
]

export default auth;

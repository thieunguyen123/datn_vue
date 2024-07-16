const PageNotFound = [
    {
        path: "/404",
        name: "404",
        component: () => import('../pages/404Page.vue'),
    },

    {
        path: '/:pathMatch(.*)*',
        component: () => import('../pages/404Page.vue'),
    },
]

export default PageNotFound;
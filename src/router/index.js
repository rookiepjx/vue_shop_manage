import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: () => import("../components/Login.vue")
  },
  {
    path: "/home",
    component: () => import("../components/Home.vue"),
    redirect: "/welcome",
    children: [
      {
        path: "/welcome",
        component: () => import("../components/Welcome.vue")
      },
      {
        path: "/users",
        component: () => import("../components/user/Users.vue")
      }
    ]
  }
];
const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  // 如果访问登录页面，放行
  if (to.path === "/login") {
    return next();
  } else {
    // 如果不是访问登录，判断有无token
    const token = window.sessionStorage.getItem("token");
    if (!token) {
      return next("/login");
    } else {
      next();
    }
  }
});

export default router;

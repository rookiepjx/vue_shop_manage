// import Vue from "vue";
// import VueRouter from "vue-router";
import nprogress from "nprogress";

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
      },
      {
        path: "/rights",
        component: () => import("../components/power/Rights.vue")
      },
      {
        path: "/roles",
        component: () => import("../components/power/Roles.vue")
      },
      {
        path: "/categories",
        component: () => import("../components/goods/Category.vue")
      },
      {
        path: "/params",
        component: () => import("../components/goods/Params.vue")
      },
      {
        path: "/goods",
        component: () => import("../components/goods/GoodsList.vue")
      },
      {
        path: "/goods/add",
        component: () => import("../components/goods/Add.vue")
      },
      {
        path: "/orders",
        component: () => import("../components/order/Order.vue")
      },
      {
        path: "/reports",
        component: () => import("../components/report/Report.vue")
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
  // 开始进度条动画
  nprogress.start();

  // 如果访问登录页面，放行
  if (to.path === "/login") {
    nprogress.done();
    return next();
  } else {
    // 如果不是访问登录，判断有无token
    const token = window.sessionStorage.getItem("token");
    if (!token) {
      nprogress.done();
      return next("/login");
    } else {
      nprogress.done();
      next();
    }
  }
});

export default router;

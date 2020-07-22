import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/global.css"
import "./assets/fonts/font_gp67ym8q5c/iconfont.css"
import axios from "axios"
import Router from "vue-router"

// 重写push方法
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};

// 配置axios
axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/";
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

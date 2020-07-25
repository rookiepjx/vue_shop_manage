import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/global.css";
import "./assets/fonts/font_gp67ym8q5c/iconfont.css";
import axios from "axios";
import Router from "vue-router";
import TreeTable from "vue-table-with-tree-grid";
// vue-quill-editor富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 重写push方法
const routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};

// 配置axios
axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/";
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
Vue.use(ElementUI);

// 注册为全局组件
Vue.component("tree-table", TreeTable);

// 使用富文本编辑器
Vue.use(VueQuillEditor);

// 定义全局时间过滤器
Vue.filter("dateFormat", function(date) {
  const dt = new Date(date);
  const year = dt.getFullYear();
  const month = (dt.getMonth() + 1 + "").padStart(2, '0');
  const day = (dt.getDate() + "").padStart(2, '0');
  const hour = (dt.getHours() + "").padStart(2, '0');
  const minutes = (dt.getMinutes() + "").padStart(2, '0');
  const second = (dt.getSeconds() + "").padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minutes}:${second}`;
});

// 

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");

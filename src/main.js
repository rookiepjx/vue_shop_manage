import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/global.css"
import axios from "axios"

axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/";
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

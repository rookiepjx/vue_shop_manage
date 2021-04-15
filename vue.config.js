module.exports = {
  lintOnSave: false,
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === "production", config => {
      config
        .entry("app")
        .clear()
        .add("./src/main.js");
        // 使用externals加载外部cdn资源
      config.set("externals", {
        vue: "Vue",
        "vue-router": "VueRouter",
        axios: "axios",
        lodash: "_",
        echarts: "echarts",
        nporgress: "NProgress",
        "vue-quill-editor": "VueQuillEditor"
      });
    });
    // 开发模式
    config.when(process.env.NODE_ENV === "development", config => {
      config
        .entry("app")
        .clear()
        .add("./src/main.js");
    });
  }
};

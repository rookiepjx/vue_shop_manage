## 功能

![](https://cdn.jsdelivr.net/gh/rookiepjx/image-bed/img/Snipaste_2020-07-27_15-16-09.jpg)

## 项目所用依赖(vue全家桶不描述)

1. 运行依赖

- axios => 发送请求
- echarts => 图表
- element-ui => element ui组件
- lodash => js工具库,该项目用到深拷贝与对象合并
- moment => 时间处理工具库
- nprogress => 进度条库
- v-viewer => 图片预览工具库
- vue-quill-editor => 富文本编辑器
- vue-table-with-tree-grid => 树形菜单/表格

2. 开发依赖

- babel => es6+语法转换
- less/less-loader => less语法
- babel-plugin-transform-remove-console => 移除console插件

## Git使用

**推送顺序**

1. 查看所处分支` git branch`
2. 将新完成的模块放在新分支 `git checkout -b 新分支`
3. 查看所处分支` git branch`
4. 查看修改状态` git status `
5. 将所有修改推送到暂存区 `git add .`
6. 查看修改状态确认代码是最新的 `git status`
7. 提交到本地仓库 `git commit -m 备注信息`
8. 查看是否成功提交仓库 `git status`
9. 查看当前本地分支 `git branch`
10. 将本地分支推送至云端仓库 `git push -u origin 新分支名`
11. 切换至主分支` git checkout master`
12. 更新本地分支  `git merge 新分支`
13. 更新云端分支 ` git push `

**常用命令`*

- 查看生产环境中的状态（修改和未修改）

  git status

- 切换分支

  git checkout 分支名

- 新建分支

  git checkout -b 分支名

- 查看所有分支

  git branch

- 合并分支

  - 先切换到主分支 master  

    git checkout master

  - 合并

    git merge login

- 将所有文件提交到暂存区

  git add .

- 提交到仓库

  git commit -m "提交的备注信息" 

- 提交到云端

  git push

- 推送分支到云端

  git push -u origin 分支名



## 登录/退出功能

**登录**

用户点击登录，向服务器发送请求。服务器返回信息中包含token,浏览器将`token`存储在**sessionStorage**中，因为后续所有请求都需要确保用户已经登录(有token)。

![](https://cdn.jsdelivr.net/gh/rookiepjx/image-bed/img/Snipaste_2020-07-27_15-20-33.jpg)

**sessionStorage使用**

~~~javascript
// 设置 键值对
window.sessionStorage.setItem('token',res.data.token)

// 获取 
window.sessionStorage.getItem('token')

// 清除
window.sessionStorage.clear()
~~~



**路由导航守卫控制访问权限**

如果用户没有登录，但是通过URL访问除登录以外的页面，需要重定向到登录页面。

使用 beforeEach 路由导航守卫

~~~javascript
router.beforeEach((to,from,next) => {
    // 如果访问登录页面，放行
    if (to.path === '/login') {
        return next()
    } else {
        // 如果不是访问登录，判断有无token
        const token = window.sessionStorage.getItem('token')
        if (!token) {
            return next('/login')
        } else {
            next()
        }
    } 
})
~~~

**退出**

清除token并且重定向到登录页面

## 授权API

需要授权的API，必须在**请求头**中使用 Authorization 字段提供token令牌

通过axios请求拦截器添加token

~~~javascript
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
~~~

- 

## 项目优化

- 生成打包报告

  - 通过命令行参数形式生成报告=>vue-cli-service build --report
  - 通过可视化ui面板直接查看报告(通过控制台和分析面板)

- 通过vue.config.js**修改webpack的默认配置**

  > 通过vue-cli 3.0工具生成的项目,默认隐藏了所有webpack的配置项,目的是为了屏蔽项目的配置过程,让开发人员把工作的   重心,放在具体功能和业务逻辑的实现上

- **为开发模式与发布模式指定不同的打包入口**

  > 默认情况下,vue项目的开发与发布模式,共用同一个打包的入口文件(即src/main.js),为了将项目的开发过程与发布过程分离,可以为两种模式,各自指定打包的入口文件,即:
  >
  > 1. 开发模式入口文件 src/main-dev.js
  > 2. 发布模式入口文件 src/main-prod.js
  >
  > 方案：configureWebpack(通过链式编程形式)和chainWebpack(通过操作对象形式)
  >
  > 在vue.config.js导出的配置文件中,新增configureWebpack或chainWebpack节点,来自定义webpack的打包配置

  ```js
  // 代码示例
  module.exports = {
      chainWebpack: config => {
          // 发布模式
          config.when(process.env.NODE_ENV === 'production', config => {
              config.entry('app').clear().add('./src/main-prod.js')
          })
          // 开发模式
          config.when(process.env.NODE_ENV === 'development', config => {
              config.entry('app').clear().add('./src/main-dev.js')
          })
      }
  }
  ```

- 第三方库启用CDN

  - 通过**externals加载外部cdn资源**

  > 默认情况下,通过import语法导入的第三方依赖包,最终会打包合并到同一个文件中,从而导致打包成功后,单文件体积过大的问题 => **chunk-vendors**体积过大
  >
  > 为了解决上述问题,可以通过webpack的externals节点,来配置加载外部的cdn资源,凡是声明在externals中的第三方依赖包,都不会被打包

  1. 步骤1

  ```js
  module.exports = {
      chainWebpack: config => {
          config.when(process.env.NODE_ENV === 'production', config => {
              config.entry('app').clear().add('./src/main-prod.js')
              // 在vue.config.js如下配置
              config.set('externals', {
                  vue: 'Vue',
                  'vue-router': 'VueRouter',
                  axios: 'axios',
                  lodash: '_',
                  echarts: 'echarts',
                  nporgress: 'NProgress',
                  'vue-quill-editor': 'VueQuillEditor'
              })
          })
          config.when(process.env.NODE_ENV === 'development', config => {
              config.entry('app').clear().add('./src/main-dev.js')
          })
      }
  }
  ```

  2. 步骤2

  > 在public/index.html文件头部,将main-prod中的已经进行配置的import(<code>样式表</code>)删除替换为cdn引入

```css
<link href="https://cdn.bootcss.com/viewerjs/1.3.7/viewer.min.css" rel="stylesheet">

<link href="https://cdn.bootcss.com/quill/2.0.0-dev.3/quill.bubble.min.css" rel="stylesheet">

​<link href="https://cdn.bootcss.com/quill/2.0.0-dev.3/quill.core.min.css" rel="stylesheet">

<link href="https://cdn.bootcss.com/quill/2.0.0-dev.3/quill.snow.min.css" rel="stylesheet">

<link href="https://cdn.bootcss.com/nprogress/0.2.0/nprogress.min.css" rel="stylesheet">

<link href="https://cdn.bootcss.com/element-ui/2.12.0/theme-chalk/index.css" rel="stylesheet">
```

    3. 步骤3

  > 在public/index.html文件头部,将main-prod中的已经进行配置的import(<code>js文件</code>)删除替换为cdn引入

```css
 <script src="https://cdn.bootcss.com/vue/2.6.10/vue.min.js"></script>
 
 <script src="https://cdn.bootcss.com/vue-router/3.1.3/vue-router.min.js"></script>

<script src="https://cdn.bootcss.com/axios/0.19.0/axios.min.js"></script>

<script src="https://cdn.bootcss.com/lodash.js/4.17.15/lodash.min.js"></script>

<script src="https://cdn.bootcss.com/echarts/4.4.0-rc.1/echarts.min.js"></script>

<script src="https://cdn.bootcss.com/nprogress/0.2.0/nprogress.min.js"></script>

<script src="https://cdn.bootcss.com/quill/2.0.0-dev.3/quill.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/vue-quill-editor@3.0.4/dist/vue-quill-editor.js"></script>

<script src="https://cdn.bootcss.com/viewerjs/1.3.7/viewer.min.js"></script>

<script src="https://cdn.bootcss.com/moment.js/2.24.0/moment.min.js"></script>
```

    4. cdn加速前后对比( **chunk-vendors**打包文件)

  > Parsed大小 2.6m=> **596.9kB**

  - 使用cdn优化elementui打包

    > 具体操作流程
    >
    > 1. 在main-prod.js中,注释掉element-ui按需加载的代码
    >
    > 2. 在index.html头部区域中,通过cdn加载element-ui的js和css样式
    >
    >         `<link href="https://cdn.bootcss.com/element-ui/2.12.0/theme-chalk/index.css" rel="stylesheet">`
    >        
    >            `<script src="https://cdn.bootcss.com/element-ui/2.12.0/index.js"></script>`

- 首页内容定制

  > 不同打包环境下,首页内容可能会有所不同,通过插件方式定制

  - vue.config.js配置

  ```js
  config.plugin('html').tap(args => {
      args[0].isProd = true或false
      return args
  })
  ```

  - index.html修改

  ```html
  <!-- 开发模式:使用import,发布模式:使用cdn -->
  <title><%= htmlWebpackPlugin.options.isProd ? '' : 'dev-' %>vue-mall</title>
  <% if(htmlWebpackPlugin.options.isProd) { %>
      css | js放在这儿
  <% } %>
  ```

- Element-UI组件按需加载

- 路由懒加载

  > 在打包构建项目时,javascript包会变得特别大,影响页面加载,如果我们能把不同路由对应的组件分隔成不同的代码块,然后当路由被访问的时候才加载对应组件,这样更加高效

  - 安装@babel/plugin-syntax-dynamic-import包
  - 在babel.config.js配置文件声明该插件
  - 将路由改为按需加载形式

  ```js
  // 示例:
  const Foo = () => import(/* webpackChunkName: "group-foo" */ './Foo.vue')
  const Bar = () => import(/* webpackChunkName: "group-foo" */ './Bar.vue')
  const Baz = () => import(/* webpackChunkName: "group-foo" */ './Baz.vue')
  
  // import Login from '../components/Login.vue'
  const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
  // import Home from '../components/Home.vue'
  const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
  // import Welcome from '../components/Welcome.vue'
  const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
  ...
  ```

   <code>具体内容参考文章底部链接</code>

---

[接口API](./api接口文档.md)

[vue.config.js配置](https://cli.vuejs.org/zh/config/#lintonsave)

[路由懒加载](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)

[babel配置](https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import/)





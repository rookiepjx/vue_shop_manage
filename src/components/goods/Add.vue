<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="card">
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- Tab页区域 -->
      <el-form
        :model="addForm"
        :rules="addFromRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <!-- name值和v-model绑定 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expandTrigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(item1,index) in item.attr_vals"
                  :label="item1"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :headers="headersObj"
              :on-success="handleSuccess"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <!-- 使用富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="addBtn" type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img width="100%" :src="previewURL" alt />
    </el-dialog>
  </div>
</template>

<script>
// import _ from "lodash";
export default {
  data() {
    return {
      // 进度条默认激活index
      activeIndex: "0",
      // 添加表单对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择框的选择
        goods_cat: [],
        // 图片上传结果数组
        pics: [],
        // 商品内容
        goods_introduce: "",
        // 动态参数和静态属性的数组
        attrs: [],
      },
      // 添加表单验证规则
      addFromRules: {
        goods_name: [{ required: true, message: "请输入商品名称" }],
        goods_price: [{ required: true, message: "请输入商品价格" }],
        goods_weight: [{ required: true, message: "请输入商品重量" }],
        goods_number: [{ required: true, message: "请输入商品数量" }],
        goods_cat: [{ required: true, message: "请选择商品分类" }],
      },
      //商品分类列表
      cateList: [],
      // 级联选择器绑定
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 图片上传URL
      uploadURL: "https://www.liulongbin.top:8888/api/private/v1/upload",
      // 图片上传请求头
      headersObj: { Authorization: window.sessionStorage.getItem("token") },
      // 图片预览URL
      previewURL: "",
      // 图片预览框显示/隐藏
      previewDialogVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },

  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取分类数据失败",
          type: "error",
          center: "true",
        });
      }
      this.cateList = res.data;
    },
    // 级联选择器变化触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // Tab切换控制 参数1点击tab页码 参数2当前tab页码
    beforeTabLeave(activeName, oldActiveName) {
      if ((oldActiveName === "0") & (this.addForm.goods_cat.length !== 3)) {
        this.$message({
          message: "请先添加商品分类",
          type: "error",
          center: "true",
        });
        return false;
      }
    },
    // tab点击事件
    async tabClick() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes/`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "获取商品动态参数失败",
            type: "error",
            center: "true",
          });
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes/`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "获取静态属性失败",
            type: "error",
            center: "true",
          });
        }
        this.onlyTableData = res.data;
      }
    },
    // 图片预览
    handlePreview(file) {
      this.previewURL = file.response.data.url;
      this.previewDialogVisible = true;
    },
    // 图片移除
    handleRemove(file) {
      const path = file.response.data.tem_path;
      // findIndex 函数返回数组中符合条件的item 的index
      const index = this.addForm.pics.findIndex((x) => {
        x.pic === path;
      });
      this.addForm.pics.splice(index, 1);
    },
    // 图片上传成功
    handleSuccess(response) {
      // 图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      this.addForm.pics.push(picInfo);
    },
    // 添加商品
    async addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message({
            message: "请填写必填项",
            type: "error",
            center: "true",
          });
        }
        // lodash库 深拷贝对象
        // 因为 级联选择器要求绑定的是数组，所以如果直接转字符串会报错。
        const formObj = _.cloneDeep(this.addForm);
        formObj.goods_cat = formObj.goods_cat.join(",");
        // 处理动态参数
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals };
          this.addForm.attrs.push(newInfo);
        });
        formObj.attrs = this.addForm.attrs;
        const { data: res } = await this.$http.post("goods", formObj);
        if (res.meta.status !== 201) {
          return this.$message({
            message: "添加商品失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "添加商品成功",
          type: "success",
          center: "true",
        });
        this.$router.push('/goods')
      });
    },
  },
};
</script>
<style lang='less' scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.card {
  margin-bottom: 50px;
}
.addBtn {
  margin-top: 15px;
}
</style>
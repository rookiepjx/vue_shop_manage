<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
      <!-- 选择框 -->
      <el-row class="select_params">
        <el-col>
          <span class="select_params">选择分类参数：</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            expand-trigger="hover"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border stripe>
            <el-table-column type="expand" align="center">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyData" border stripe>
            <el-table-column type="expand" align="center">
                            <template slot-scope="scope">
                <el-tag
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+ dialogTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+ dialogTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 激活的页签 默认第一个tab
      activeName: "many",
      // 动态数据
      manyData: [],
      // 静态属性
      onlyData: [],
      // 对话框显示/隐藏
      addDialogVisible: false,
      // 添加参数表单对象
      addForm: {
        attr_name: "",
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: "请添加参数名" }],
      },
      // 修改对话框显示/隐藏
      editDialogVisible: false,
      // 修改表单对象
      editForm: {},
      // 修改表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: "请添加参数名称" }],
      },
    };
  },
  created() {
    this.getCatList();
  },
  computed: {
    // 按钮是否禁用
    isDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类Id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态对话框标题
    dialogTitle() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },

  methods: {
    // 获取所有商品分类列表
    async getCatList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取商品分类信息失败",
          type: "error",
          center: "true",
        });
      }
      this.cateList = res.data;
    },
    // 级联选择框变化触发
    handleChange() {
      this.getParamsData();
    },
    // Tab点击触发
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数列表数据
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyData = []
        this.onlyData = []
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      // 将返回结果字符串以空格分隔为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 每个字段添加自己的显示/隐藏和值
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取参数列表失败",
          type: "error",
          center: "true",
        });
      }
      if (this.activeName === "many") {
        this.manyData = res.data;
      } else {
        this.onlyData = res.data;
      }
    },
    // 对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.addDialogVisible = false;
    },
    // 点击确定添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message({
            message: "添加参数失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "添加参数成功",
          type: "success",
          center: "true",
        });
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 展示修改对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取参数信息失败",
          type: "error",
          center: "true",
        });
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 关闭修改对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
      this.editDialogVisible = false;
    },
    // 确认修改表单
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "修改参数失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "修改参数成功",
          type: "success",
          center: "true",
        });
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 删除参数
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm("永久删除该参数?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      if (confirmResult !== "confirm") {
        this.$message({
          type: "info",
          message: "已取消删除",
          center: "true",
        });
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          message: "删除参数失败",
          type: "error",
          center: "true",
        });
      }
      this.$message({
        message: "删除参数成功",
        type: "success",
        center: "true",
      });
      this.getParamsData();
    },
    // input水球焦点或者Enter触发事件
    async handleInputConfirm(row) {
      // 文本框输入空值
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue);
      row.inputValue = "";
      row.inputVisible = false;
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if(res.meta.status !== 200) {
        return this.$message({
                    message: "修改参数失败",
                    type: "error",
                    center: "true",
                  });
      }
      this.$message({
                  message: "修改参数成功",
                  type: "success",
                  center: "true",
                });
    },
    // 切换Tag和Input
    showInput(row) {
      row.inputVisible = true;
      // 文本框自动聚焦
      // nextTick函数的作用：当页面上的元素被重新渲染后（inputVisible的值从false转化为true），才执行回调函数的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除标签
    async handleClose(index,row) {
      row.attr_vals.splice(index,1)
            const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if(res.meta.status !== 200) {
        return this.$message({
                    message: "删除参数失败",
                    type: "error",
                    center: "true",
                  });
      }
      this.$message({
                  message: "删除参数成功",
                  type: "success",
                  center: "true",
                });
    }
  },
};
</script>
<style lang='less' scoped>
.select_params {
  margin-top: 10px;
}
.el-tag {
  margin: 10px;
}
.el-input {
  width: 100px;
}
</style>
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 分类卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" style="color:lightgreen" v-else></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.cat_level === 1">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 2">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="order" slot-scope="scope">
          <el-button size="mini" type="primary" @click="showEditDialog(scope.row.cat_id)">
            <i class="el-icon-edit"></i>编辑
          </el-button>
          <el-button size="mini" type="danger" @click="deleteCate(scope.row.cat_id)">
            <i class="el-icon-delete"></i>删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader 
          class="cascader"
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为表格指定列的定义
      columns: [
        {
          // 绑定列名
          label: "分类名称",
          // 绑定列值
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 控制添加对话框显示/隐藏
      addCateDialogVisible: false,
      // 添加表单对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      // 添加表单对象验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: "请添加分类名称" }],
      },
      // 父级分类列表数据
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 选中的腹肌分类id数组
      selectedKeys: [],
      // 修改分类对话框显示/隐藏
      editCateDialogVisible: false,
      // 修改分类表单对象
      editCateForm: {
        cat_name: "",
      },
      // 修改分类表单验证规则
      editCateFormRules: {
        cat_name: [{ required: true, message: "请添加分类名称" }],
      },
      cat_id: 0,
    };
  },
  created() {
    // 获取分类数据
    this.getCategories();
  },
  methods: {
    // 获取分类数据
    async getCategories() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取商品分类失败",
          type: "error",
          center: "true",
        });
      }
      this.total = res.data.total;
      this.cateList = res.data.result;
    },
    // 监听 pageSize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCategories();
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCategories();
    },
    // 显示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取父级分类数据失败",
          type: "error",
          center: "true",
        });
      }
      this.parentCateList = res.data;
    },
    // 选择项变化触发
    parentCateChange() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message({
            message: "添加分类失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "添加分类成功",
          type: "success",
          center: "true",
        });
        this.getCategories();
        this.addCateDialogVisible = false;
      });
    },
    // 关闭添加分类对话框 重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
      this.addCateDialogVisible = false;
    },
    // 显示修改分类对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`categories/${id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取分类数据失败",
          type: "error",
          center: "true",
        });
      }
      this.editCateForm.cat_name = res.data.cat_name;
      this.cat_id = res.data.cat_id;
      this.editCateDialogVisible = true;
    },
    // 修改分类
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cat_id}`,
          { cat_name: this.editCateForm.cat_name }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "修改分类失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "修改分类成功",
          type: "success",
          center: "true",
        });
        this.getCategories();
        this.editCateDialogVisible = false;
      });
    },
    // 关闭修改分类对话框
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields();
      this.editCateDialogVisible = false;
    },
    // 删除分类
    async deleteCate(id) {
      const confirmResult = await this.$confirm("永久删除该分类?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      if (confirmResult !== "confirm") {
        this.$message({
          type: "info",
          message: "已取消删除",
          center: "true",
        });
      }
      const { data: res } = await this.$http.delete(`categories/${id}`);
      if (res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "删除分类失败",
          center: "true",
        });
      }
      this.$message({
        type: "success",
        message: "删除分类成功",
        center: "true",
      });
      this.getCategories();
    },
  },
};
</script>
<style lang='less' scoped>
.tree-table {
  margin-top: 15px;
}
</style>
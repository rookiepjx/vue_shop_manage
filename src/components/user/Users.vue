<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" align="center" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" align="center"></el-table-column>
        <el-table-column prop="mobile" label="电话" align="center"></el-table-column>
        <el-table-column prop="role_name" label="角色" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <!-- scope.row获取当前行的数据 -->
            <!-- {{scope.row.mg_state}} -->
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改用户" placement="top" :enterable="false">
              <!-- 修改按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除用户" placement="top" :enterable="false">
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <!-- 分配角色按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                @click="showSetRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalnum"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!-- 对话框内容区域 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户:{{userInfo.username}}</p>
        <p>当前的角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法邮箱"));
    };
    // 验证手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^0?(13|14|15|17|18|19)[0-9]{9}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法手机号"));
    };

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前页数
        pagenum: 1,
        // 每页数据数
        pagesize: 2,
      },
      userList: [],
      // 数据总数
      totalnum: 0,
      // 控制添加用户对话框显示/隐藏
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加用户表单规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "用户名长度在 3-10 个字符之间" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "用户名长度在 6-15 个字符之间" },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      // 修改表单验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入用户邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入用户手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
        // 控制分配角色对话框显示/隐藏
        setRoleDialogVisible: false,
      },
      setRoleDialogVisible: false,
      // 分配角色表单
      setRoleForm: {},
      userInfo: {},
      // 所有角色列表信息
      rolesList: [],
      // 已选中角色id
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取用户列表失败",
          type: "error",
          center: "true",
        });
      }
      this.userList = res.data.users;
      this.totalnum = res.data.total;
    },
    // 监听pageSize改变 newSize是自带参数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch开关状态改变
    async changeState(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 如果更新失败，将页面上的状态还原
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message({
          message: "更新用户状态失败",
          type: "error",
          center: "true",
        });
      }
      this.$message({
        message: "更新用户状态成功",
        type: "success",
        center: "true",
      });
    },
    // 监听添加用户对话框关闭 重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) {
          this.$message({
            message: "添加用户失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "添加用户成功",
          type: "success",
          center: "true",
        });
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message({
          message: "查询用户信息失败",
          type: "error",
          center: "true",
        });
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框关闭 重置表单
    editFormClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "更新用户失败",
            type: "error",
            center: "true",
          });
        }
        this.editDialogVisible = false;
        this.getUserList();
        this.$message({
          message: "更新用户成功",
          type: "success",
          center: "true",
        });
      });
    },
    // 删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm("永久删除该用户?", "提示", {
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
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "删除用户失败",
          center: "true",
        });
      }
      this.$message({
        type: "success",
        message: "删除用户成功",
        center: "true",
      });
      this.getUserList();
    },
    // 展示分配角色对话框
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "请求角色列表失败",
          center: "true",
        });
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 关闭分配角色对话框
    setRoleDialogClosed() {
      (this.selectedRoleId = ""), (this.userInfo = {});
    },
    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message({
          type: "error",
          message: "请选择分配角色",
          center: "true",
        });
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "更新角色失败",
          center: "true",
        });
      }
      this.$message({
        type: "success",
        message: "更新角色成功",
        center: "true",
      });
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
  },
};
</script>
<style lang='less' scoped>
</style>
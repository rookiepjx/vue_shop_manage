<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表数据 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand" align="center">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index === 0 ? 'bdtop':'','vcenter']"
              v-for="(item1,index) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="6">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="18">
                <!-- for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '':'bdtop','vcenter'],"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,index3) in item2.children"
                      :key="index3"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName" align="center"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click="showEditRoleDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                circle
                @click="removeRoleById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                @click="showSetRightDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="30%"
      @close="addRoleDialogClosed"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        label-width="80px"
        :rules="addRoleFormRules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleFormClosed"
    >
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName" label-width="100px">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="100px">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {},
      // 添加角色表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      // 查询到的角色信息
      editRoleForm: {},
      // 编辑角色对话框显示/隐藏
      editRoleDialogVisible: false,
      // 编辑角色表单验证规则
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
      },
      // 分配权限对话框显示/隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightsList: [],
      // 树形控件树形绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 默认选中的节点ID值
      defKeys: [],
      // 即将分配权限的roleID
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "获取角色列表失败",
          center: "true",
        });
      }
      this.rolesList = res.data;
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res1 } = await this.$http.post("roles", this.addRoleForm);
        if (res1.meta.status !== 201) {
          this.$message({
            messgae: "添加角色失败",
            type: "error",
            center: "true",
          });
        }
        this.$message({
          message: "添加角色成功",
          type: "success",
          center: "true",
        });
        this.addRoleDialogVisible = false;
        this.getRolesList();
      });
    },
    // 添加角色会话关闭 重置表单
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields();
    },
    // 展示编辑角色对话框
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message({
          messgae: "查询角色信息失败",
          type: "error",
          center: "true",
        });
      }
      this.editRoleForm = res.data;
      this.editRoleDialogVisible = true;
    },
    // 修改角色信息并提交
    editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message({
            message: "更新角色失败",
            type: "error",
            center: "true",
          });
        }
        this.editRoleDialogVisible = false;
        this.getRolesList();
        this.$message({
          message: "更新角色成功",
          type: "success",
          center: "true",
        });
      });
    },
    // 关闭修改对话框 重置表单
    editRoleFormClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 删除角色
    async removeRoleById(id) {
      const confirmResult = await this.$confirm("永久删除该角色?", "提示", {
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
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        this.$message({
          type: "error",
          message: "删除角色失败",
          center: "true",
        });
      }
      this.$message({
        type: "success",
        message: "删除角色成功",
        center: "true",
      });
      this.getRolesList();
    },
    // 弹框提示是否删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm("永久删除该权限?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message({
          type: "info",
          message: "取消了删除",
          center: "true",
        });
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "删除权限失败",
          center: "true",
        });
      }
      role.children = res.data;
    },
    // 显示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "获取权限数据失败",
          center: "true",
        });
      }
      this.rightsList = res.data;
      // 递归获取当前角色的所有三级权限
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 递归获取角色下所有的三级权限id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 分配权限对话框关闭 ，清空defKeys
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击分配角色权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message({
          type: "error",
          message: "权限分配失败",
          cneter: "true",
        });
      }
      this.$message({
        type: "success",
        message: "权限分配成功",
        center: "true",
      });
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>
<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
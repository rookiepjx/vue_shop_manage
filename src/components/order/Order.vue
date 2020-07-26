<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单数据表格 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" align="center"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" align="center"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" align="center"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" align="center">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="showDialog"></el-button>
            <el-button type="success" icon="el-icon-location" @click="showProgressDialog"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressDialogVisible"
        width="50%"
        @close="addressDialogClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              v-model="addressForm.address1"
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addressChange">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流进度对话框 -->
      <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
        <!-- 物流进度时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in progressInfo"
            :key="index"
            :timestamp="item.time"
          >{{item.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      // 查询订单对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 订单数据列表
      orderList: [],
      // 订单数据总数
      total: 0,
      // 对话框显示/隐藏
      addressDialogVisible: false,
      // 修改地址表单对象
      addressForm: {
        address1: [],
        address2: "",
      },
      // 修改地址表单验证规则
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 省市区匹配数据
      cityData,
      // 物流进度对话框显示/隐藏
      progressDialogVisible: false,
      // 物流信息
      progressInfo: [],
    };
  },
  created() {
    this.getOrderList();
  },

  methods: {
    // 获取订单数据
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取订单数据失败",
          type: "error",
          center: "true",
        });
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    },
    // 翻页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 切换每页条数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 展示对话框
    showDialog() {
      this.addressDialogVisible = true;
    },
    // 关闭修改地址对话框
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 修改地址
    addressChange() {
      this.$refs.addFormRef
        .validate(async (valid) => {
          if (!valid) return;
        })
        .catch((err) => err);
    },
    // 展示物流进度对话框
    async showProgressDialog() {
      const { data: res } = await this.$http.get("/kuaidi/1106975712662");
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取物流进度信息失败",
          type: "error",
          center: "true",
        });
      }
      this.progressInfo = res.data;
      this.progressDialogVisible = true;
    },
  },
};
</script>
<style lang='less' scoped>
.el-cascader {
  width: 100%;
}
</style>
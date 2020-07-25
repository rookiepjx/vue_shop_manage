<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-row>
        <el-table :data="goodsList" border stripe>
          <el-table-column type="index" label="#" align="center"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name" align="center"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" align="center" width="95px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" align="center" width="70px"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" align="center" width="140px">
            <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="130px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeById(scope.row.goods_id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-size="queryInfo.pagesize"
          :page-sizes="[5,10,20]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
        ></el-pagination>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      // 商品列表
      goodsList: [],
      // 商品总数
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },

  methods: {
    // 获取商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message({
          message: "获取商品列表失败",
          type: "error",
          center: "true",
        });
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
    },
    // 每页数据量
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    // 翻页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    // 删除
    async removeById(id) {
      const confirmResult = await this.$confirm("永久删除该商品?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message({
          message: "已取消删除",
          type: "info",
          center: "true",
        });
      }
      const { data: res } = await this.$http.delete(`goods/${id}`);
      if (res.meta.status !== 200) {
        return this.$message({
          message: "删除商品失败",
          type: "error",
          center: "true",
        });
      }
      this.$message({
        message: "删除商品成功",
        type: "success",
        center: "true",
      });
      this.getGoodsList()
    },
    // 跳转添加页面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  },
};
</script>
<style lang='less' scoped>
.el-pagination {
  margin-bottom: 50px;
}
</style>
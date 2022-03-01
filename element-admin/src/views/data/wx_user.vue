<template>
  <div
    style="
      background-color: #ffffff;
      padding: 5px 20px 0px 10px;
      margin-bottom: 5px;
    "
  >
    <div
      style="
        color: #aaaaaa;
        font-weight: 500;
        border-bottom: thick solid #ececec;
        padding-left: 5px;
      "
    >
      <span style="font-size: 24px">用户管理</span>
    </div>
    <div style="height: 40px; padding-left: 5px; padding-top: 5px">
      <span style="float: left; color: #909399">用户列表</span>
    </div>
    <!-- Form表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @closed="closeDialog"
    >
      <el-form :model="form" :inline="false">
        <el-form-item label="头像">
          <img
            style="width: 80px; height: 80px; border: 1px solid #e2e2e2"
            v-if="form.avatar"
            :src="form.avatar"
            class="avatar"
          />
        </el-form-item>
        <el-form-item label="昵称">
          {{form.nick_name}}
        </el-form-item>
        <el-form-item label="允许接收新订单订阅消息">
          <el-switch v-model="form.neworder_subscribe_message"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-table
      :data="list"
      style="width: 100%"
      @cell-dblclick="dblhandle"
      :row-style="{ height: '35px' }"
      :cell-style="{ padding: '0' }"
      border
    >
      <el-table-column prop="avatar" label="头像">
        <template slot-scope="scope">
          <img
            :src="scope.row.avatar"
            width="40"
            height="40"
            style="margin-top: 5px; border: 0px solid #e2e2e2"
          />
        </template>
      </el-table-column>
      <el-table-column prop="nick_name" label="昵称"> </el-table-column>
      <el-table-column fixed="right" label="操作" width="110">
        <template slot-scope="scope">
          <el-button-group>
            <el-button
              @click="edit(scope.row)"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <el-button
              @click="remove(scope.row)"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [], //数据列表
      parents: {}, //父对象
      dialogVisible: false, // 控制对话框弹出
      form: {}, //对话框
      dialogTitle: "", //对话框标题
      editting: false, //编辑模式
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    dblhandle(row, column, cell, event) {
      // 表格双击事件
      this.edit(row);
    },
    closeDialog() {
      this.form = {};
    },
    async add() {
      this.dialogVisible = true;
      this.editting = false;
      this.dialogTitle = this.editting ? "编辑用户" : "增加用户";
    },
    async formSubmit() {
      let res = await this.$http.put(
        `wx_user/edit/${this.form._id}`,
        this.form
      );
      this.dialogVisible = false;
      window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      this.fetchList();
    },
    async fetchList() {
      //刷新列表
      let res = await this.$http.get("wx_user/list");
      this.list = res.data;
      this.parents = res.data;
    },
    async edit(row) {
      this.dialogVisible = true;
      window.console.log(row._id);
      let res = await this.$http.get(`wx_user/edit/${row._id}`);
      window.console.log(res);
      this.form = res.data;
      this.editting = true;
      this.dialogTitle = this.editting ? "编辑用户" : "增加用户";
    },
    async remove(row) {
      this.$confirm('是否删除"' + row.nick_name + '"?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        //请求 删除用户接口
        let res = await this.$http.delete(`wx_user/delete/${row._id}`);
        window.console.log(res);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
        this.fetchList();
      });
    },
  },
  created() {
    this.fetchList();
  },
};
</script>
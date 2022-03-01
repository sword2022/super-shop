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
      <span style="font-size: 24px">{{ pageTitle }}</span>
    </div>

    <div style="height: 40px; padding-left: 5px; padding-top: 5px">
      <span style="float: left; color: #909399">{{ pageTitle }}列表</span>
      <el-button
        style="float: right"
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="add"
        >新增</el-button
      >
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @closed="closeDialog"
    >
      <el-form :model="form" :inline="false">
        <el-form-item label="优惠卷名称：">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="优惠方式：">
          <el-radio v-model="mode" label="1">满减</el-radio>
          <el-radio v-model="mode" label="2">立减</el-radio>
        </el-form-item>
        <el-form-item label="买满金额">
          <el-input v-model="form.satisfy" placeholder="满"></el-input>
        </el-form-item>
        <el-form-item label="优惠金额">
          <el-input v-model="form.reduce" placeholder="减"></el-input>
        </el-form-item>
        <el-form-item label="发券总量">
          <el-input v-model="form.total"></el-input>
        </el-form-item>
        <el-form-item label="领券开始时间">
          <el-date-picker
            v-model="form.release_start_time"
            type="datetime"
            placeholder="领券开始时间"
            align="right"
            :picker-options="pickerOptions1"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="领券结束时间">
          <el-date-picker
            v-model="form.release_end_time"
            type="datetime"
            placeholder="领券结束时间"
            align="right"
            :picker-options="pickerOptions1"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="用券开始时间">
          <el-date-picker
            v-model="form.use_start_time"
            type="datetime"
            placeholder="用券开始时间"
            align="right"
            :picker-options="pickerOptions1"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="用券结束时间">
          <el-date-picker
            v-model="form.use_end_time"
            type="datetime"
            placeholder="用券结束时间"
            align="right"
            :picker-options="pickerOptions1"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <div style="width: 100%; max-width: 7680px">
      <el-table
        :data="list"
        :row-style="{ height: '35px' }"
        :cell-style="{ padding: '0' }"
        border
      >
        <el-table-column prop="name" label="优惠卷名称" width="180">
        </el-table-column>
        <el-table-column label="优惠方式" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.mode == 1 ? "满减" : "立减" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reduce" label="优惠额度" width="180">
        </el-table-column>
        <el-table-column prop="gets" label="已领" width="180">
        </el-table-column>
        <el-table-column prop="used" label="已用" width="180">
        </el-table-column>
        <el-table-column label="创建时间" width="230">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span> {{ scope.row.create_time }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="" label="" width="auto"> </el-table-column>
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      pageTitle: "优惠券",
      list: [], //数据列表
      dialogVisible: false, // 控制对话框弹出
      form: {
        release_start_time: "",
        release_end_time: "",
        use_start_time: "",
        use_end_time: "",
      }, //对话框
      dialogTitle: "", //对话框标题
      editting: false, //编辑模式
      mode: "1", //优惠方式
      pickerOptions1: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
    };
  },
  methods: {
    closeDialog() {
      this.form = {};
    },
    async add() {
      this.dialogVisible = true;
      this.form = {};
      this.editting = false;
      this.dialogTitle = this.editting ? "编辑分类" : "增加分类";
    },
    async formSubmit() {
      this.form.mode = this.mode;

      if (this.editting) {
        let res = await this.$http.put(
          `coupon/edit/${this.form._id}`,
          this.form
        );
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        this.form.create_time = new Date();
        this.form.gets = 0;
        this.form.used = 0;
        let res = await this.$http.post("coupon/create", this.form);
        if (res.data.type == "success") {
          this.dialogVisible = false;
        }
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      }
      this.fetch();
    },
    async fetch() {
      //刷新列表
      let res = await this.$http.get("coupon/list");
      this.list = res.data;
    },
    async edit(row) {
      this.dialogVisible = true;
      window.console.log(row._id);
      let res = await this.$http.get(`coupon/edit/${row._id}`);
      window.console.log(res);
      this.form = res.data;
      this.mode = res.data.mode;
      this.editting = true;
      this.dialogTitle = this.editting ? "编辑分类" : "增加分类";
    },
    async remove(row) {
      this.$confirm('是否删除"' + row.name + '"?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        //请求 删除分类接口
        let res = await this.$http.delete(`coupon/delete/${row._id}`);
        window.console.log(res);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
        this.fetch();
      });
    },
  },
  created() {
    this.fetch();
  },
};
</script>
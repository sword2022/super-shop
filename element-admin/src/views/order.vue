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
      <span style="font-size: 24px">订单 </span>
      <div style="float: right">
        <el-input
          style="width: 140px"
          v-model="searchAddressDetail"
          size="mini"
          placeholder="搜索订单"
        ></el-input>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="search"
        ></el-button>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @closed="closeDialog"
    >
      <el-form :model="dialogForm">
        <el-form-item label="订单ID">
          <el-input v-model="dialogForm.order_id"></el-input>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-input v-model="dialogForm.pay_time"></el-input>
        </el-form-item>
        <el-form-item label="订单类型">
          <el-input v-model="dialogForm.delivery_method"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-input v-model="dialogForm.status"></el-input>
        </el-form-item>
        <el-form-item label="姓名,电话">
          <el-input v-model="name_phone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="address"></el-input>
        </el-form-item>
        <el-form-item label="商品详情">
          <el-table :data="dialogForm.goods_list">
            <el-table-column property="name" label="商品名称"></el-table-column>
            <el-table-column property="number" label="数量"></el-table-column>
            <el-table-column property="price" label="价格"></el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialogForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="订单操作记录">
          <el-table :data="log">
            <el-table-column property="time" label="时间"></el-table-column>
            <el-table-column property="content" label="内容"></el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="取消订单"
      :visible.sync="cancelDialogVisible"
      @closed="closeDialog"
    >
      <span class="">取消原因 </span>
      <el-select v-model="cancel_reason" placeholder="选择取消原因">
        <el-option
          v-for="item in cancelList"
          :key="item.id"
          :label="item.reason"
          :value="item.id"
        ></el-option>
      </el-select>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="click_cancelSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="新订单" name="已付款"></el-tab-pane>
      <el-tab-pane label="配送中" name="配送中"></el-tab-pane>
      <el-tab-pane label="已完成" name="已完成"></el-tab-pane>
      <el-tab-pane label="等待付款" name="待付款"></el-tab-pane>
      <el-tab-pane label="异常订单" name="已关闭"></el-tab-pane>
    </el-tabs>

    <el-table
      :data="list"
      class="order-list-style"
      style="width: 100%"
      @cell-dblclick="dblhandle"
      :cell-style="cellStyle"
      border
    >
      <!-- <el-table-column prop="order_id" label="订单ID"> </el-table-column> -->
      <el-table-column width="100" align="center" prop="today_no" label="自取号">
      <template slot-scope="scope">
          <div style="color:red;font-size:26px;">
            {{ scope.row.today_no }}
          </div>
      </template>
      </el-table-column>
      <el-table-column prop="pay_time" label="下单时间"> </el-table-column>
      <el-table-column  width="70" prop="status" label="状态"> </el-table-column>
      <el-table-column width="200" align="left" label="商品">
        <template slot-scope="scope">
          <div>
            <li v-for="item in scope.row.goods_list" :key="item._id">
              {{ item.name }} x{{ item.number }}
            </li>
          </div>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="remark" label="备注">
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="auto">
        <template slot-scope="scope">
          <el-button @click="detail(scope.row)" type="info">详情</el-button>

          <el-button
            v-if="
              activeName == '已付款' &&
              !settings.store_self_send &&
              scope.row.delivery_method == '外卖' &&
              scope.row.status == '已付款'
            "
            @click="ready(scope.row)"
            type="success"
            >已拣货</el-button
          >

          <el-button
            v-if="
              (activeName == '已付款' &&
                (scope.row.delivery_method == '自取' ||
                  scope.row.delivery_method == '团购')) ||
              (settings.store_self_send && scope.row.delivery_method == '外卖')
            "
            @click="finished(scope.row)"
            type="success"
            >已完成</el-button
          >

          <el-button
            v-if="activeName == '已付款' && scope.row.delivery_method == '外卖'"
            @click="click_cancel(scope.row)"
            type="danger"
            >取消</el-button
          >

          <el-button
            v-if="
              activeName == '已付款' &&
              (scope.row.delivery_method == '自取' ||
                scope.row.delivery_method == '团购')
            "
            @click="click_cancel(scope.row)"
            type="danger"
            >取消</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="block">
      <!-- <span class="demonstration">分页</span> -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="1"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="dataTotal"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [], //数据列表
      pageSize: 20, //默认获取的数据量
      page: 1, //当前数据位置
      dataTotal: 0, //数据总数
      activeName: "已付款",
      searchAddressDetail: "",
      dialogVisible: false,
      dialogForm: {},
      dialogTitle: "订单详情",
      address: "",
      cancelDialogVisible: false,
      cancelList: [], //取消原因列表
      cancel_reason: null, //取消原因
      cancel_id: "",
      settings: {}, //设置
      name_phone: "",
      timer: null, //自动刷新用的定时器
      log: [], //当前行日志
      pause: 0,//0刷新,3暂停刷新
    };
  },
  beforeDestroy() {
    //自动刷新用的定时器
    clearInterval(this.timer);
    this.timer = null;
  },
  mounted() {
    //自动刷新用的定时器//自动刷新用的定时器
    this.queryInfo();
    this.timer = setInterval(() => {
      setTimeout(this.queryInfo, 0);
    }, 2000);
  },
  methods: {
    //自动刷新方法
    async queryInfo() {
      //每两秒执行一次
      if (this.pause>0) {
        this.pause--;
        return;
      }
      window.console.log("do something");
      //获取列表
      let res = await this.$http.post(`order/list`, {
        status: this.activeName,
      });
      // window.console.log(res.data);
      if (res.data.message == "success") {
        this.list = res.data.orderList;
      } else {
        // window.console.log(res.data.message);
        this.list = [];
      }
    },
    closeDialog() {
      window.console.log("closeDialog");
      this.dialogForm = {};
      this.cancelList = [];
      this.cancel_reason = null;
      this.cancel_id = "";
    },
    // eslint-disable-next-line no-unused-vars
    cellStyle({ row, column, rowIndex, columnIndex }) {
      // window.console.log('row:',row,'column:',column)
      if (row.status == "已付款") {
        return "background:pink;";
      } else if (row.status == "待取货") {
        return "background:yellow;";
      }
    },
    // eslint-disable-next-line no-unused-vars
    dblhandle(row, column, cell, event) {
      // 表格双击事件
      this.detail(row);
    },
    async detail(row) {
      this.dialogVisible = true;
      this.dialogForm = row;
      this.name_phone = row.userDetails.userName + "," + row.userDetails.telNumber;
      if (row.userDetails) {
        this.address =
          row.userDetails.cityName +
          row.userDetails.countyName +
          row.userDetails.detailInfo;
      } else {
        this.address = "";
      }
      let log = [];
      for (let i = 0; i < this.dialogForm.log.length; i++) {
        let time = this.dialogForm.log[i].slice(0, 18);
        let content = this.dialogForm.log[i].slice(19, -1);
        log.push({
          time,
          content,
        });
      }
      this.log = log;
    },
    async click_cancelSubmit() {
      if (this.cancel_reason > 0 && this.cancel_reason < 999) {
        let res = await this.$http.get(
          `order/cancel/${this.cancel_id}/${this.cancel_reason}`
        );
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
        this.cancelDialogVisible = false;
        if (res.data.type == "success") {
          this.fetchList();
        }
      } else {
        this.$message({
          type: "error",
          message: "请选择取消原因后再点击确定",
        });
      }
    },
    async click_cancel(row) {
      this.cancel_id = row._id;
      window.console.log(row);
      //获取设置
      let res = await this.$http.get("setting/fetch");
      window.console.log(res);
      if (res.data.store_self_send) {
        this.$confirm(
          "是否取消" + row.order_id + "订单,取消后将自动退款",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(async () => {
          let res = await this.$http.get(`order/cancel/${this.cancel_id}/0`);
          window.console.log(res);
          this.$message({
            type: res.data.type,
            message: res.data.message,
          });
          this.cancelDialogVisible = false;
          if (res.data.type == "success") {
            this.fetchList();
          }
        });
      } else {
        //请求取消原因接口
        let res = await this.$http.get(`order/cancel_reasons`);
        window.console.log(res);
        if (res.data.type == "success") {
          this.cancelDialogVisible = true;
          this.cancelList = res.data.data;
        } else {
          this.$message({
            type: res.data.type,
            message: res.data.message,
          });
        }
      }

      this.fetchList();
    },
    async ready(row) {
      this.$confirm(
        row.today_no + "# 订单完成配货？确认后送货人员很快将上门取货",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "success",
        }
      ).then(async () => {
        //请求配货完成接口
        let res = await this.$http.get(`order/ready/${row._id}`);
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
        this.fetchList();
      });
    },
    async finished(row) {
      this.$confirm(
        row.name +
          "的" +
          row.delivery_method +
          "订单已完成配货和取货(送货)？确认订单完成",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        //请求订单完成接口
        let res = await this.$http.get(`order/finished/${row._id}`);
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
        this.fetchList();
      });
    },
    async refund(row) {
      this.$confirm(
        '是否退款给"' + row.name + '"?',
        "注意 - 正在执行退款操作",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        //请求 删除分类接口
        let res = await this.$http.get(`order/refund/${row._id}`);
        window.console.log(res);
        this.$message({
          type: "success",
          message: "退款成功!",
        });
        this.fetchList();
      });
    },
    async search() {
      this.pause = 3;
      this.list = [];
      let res = await this.$http.get(
        `order/order_search/${this.activeName}/${this.searchAddressDetail}`
      );
      // window.console.log(res.data)
      this.list = res.data;
    },
    // eslint-disable-next-line no-unused-vars
    handleClick(tab, event) {
      // window.console.log(tab, event)
      window.console.log(this.activeName);
      this.fetchList();
    },
    handleSizeChange(val) {
      window.console.log(`每页 ${val} 条`);
      this.pageSize = val;
      this.fetchList();
    },
    handleCurrentChange(val) {
      window.console.log(`当前页: ${val}`);
      this.page = val;
      this.fetchList();
    },
    async fetchList() {
      //获取设置
      let settings = await this.$http.get("setting/fetch");
      window.console.log(settings);
      this.settings = settings.data;
      //清空列表
      this.list = [];
      //获取列表
      let res = await this.$http.post(`order/list`, {
        status: this.activeName,
      });
      if (res.data.message == "success") {
        this.list = res.data.orderList;
      } else {
        window.console.log(res.data.message);
      }
    },
    // async remove(row) {
    //   this.$confirm('是否取消"' + row.order_id + '订单"?', "提示", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning",
    //   }).then(async () => {
    //     //请求删除接口
    //     let res = await this.$http.get(`order/remove/${row._id}`);
    //     window.console.log(res);
    //     this.$message({
    //       type: res.data.type,
    //       message: res.data.message,
    //     });
    //     this.fetchList();
    //   });
    // },
  },
  async created() {
    let res = await this.$http.get(`order/list`);
    this.dataTotal = res.data.length;
    this.fetchList();
  },
};
</script>
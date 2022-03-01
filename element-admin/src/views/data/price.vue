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
      <span style="font-size: 24px">价格调整</span>
    </div>
    <div style="height: 40px; padding-left: 5px; padding-top: 5px">
      <span style="float: left; color: #909399">调价单</span>
      <el-button
        style="float: right"
        type="primary"
        icon="el-icon-check"
        size="mini"
        @click="save"
        >保存</el-button
      >
    </div>
    <el-table
      :data="list"
      style="width: 100%"
      :row-style="{ height: '35px' }"
      :cell-style="{ padding: '0' }"
      border
    >
      <el-table-column prop="number" label="行号"> </el-table-column>
      <el-table-column label="条码" show-overflow-tooltip>
        <template slot-scope="scope">
          <template v-if="scope.row.edit_barcode">
            <el-input
              @keyup.enter.native="jumpNextCell(scope.row)"
              size="small"
              v-model="scope.row.barcode"
              placeholder="请输入条码"
              :ref="'barcode' + scope.row.number"
              clearable
            ></el-input>
          </template>
          <span v-else>{{ scope.row.barcode }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="name" label="商品名称">
      </el-table-column>
      <el-table-column prop="old_price" label="原价"> </el-table-column>
      <el-table-column label="现价">
        <template slot-scope="scope">
          <template v-if="scope.row.edit_price">
            <el-input
              @keyup.enter.native="jumpNextRow(scope.row)"
              size="small"
              v-model="scope.row.new_price"
              placeholder="请输入价格"
              :ref="'new_price' + scope.row.number"
              clearable
            ></el-input>
          </template>
          <span v-else>{{ scope.row.new_price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="line_price" label="划线价"> </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: [
        {
          number: 1,
          edit_barcode: true,
          edit_price: false,
          barcode: "",
          name: "",
          old_price: "",
          new_price: "",
          line_price: "",
        },
      ], //数据列表
    };
  },
  methods: {
    async save() {
      let res = await this.$http.post(`goods/update_price`, this.list);
      this.$message({
        type: res.data.type,
        message: res.data.message,
      });
      if (res.data.type == "success") {
        window.console.log("success");
      }
    },
    async jumpNextRow(row) {
      var newData = {
        number: row.number + 1,
        edit_barcode: true,
        edit_price: false,
        barcode: "",
        name: "",
        old_price: "",
        new_price: "",
        line_price: "",
      };
      this.list.push(newData);
      row.edit_price = false;
      this.$nextTick(() => {
        this.$refs["barcode" + (row.number + 1)].focus();
      });
    },
    async jumpNextCell(row) {
      //检查重复条码
      const list = this.list;
      var has = 0;
      for (let i = 0; i < list.length; i++) {
        if (row.barcode == list[i].barcode) {
          has++;
        }
      }
      if (has > 1) {
        this.$message({
          type: "error",
          message: "条码不可重复录入",
        });
        return;
      }

      let res = await this.$http.get(`goods/barcode_search/${row.barcode}`);
      this.$message({
        type: res.data.type,
        message: res.data.message,
      });
      if (res.data.data) {
        row.name = res.data.data.name;
        row.old_price = res.data.data.price;
        row.line_price = res.data.data.line_price;
        row.edit_barcode = false;
        row.edit_price = true;
        window.console.log(row.number);
        this.$nextTick(() => {
          if (row.number === 1) {
            this.$refs["new_price" + 1].focus();
          } else {
            this.$refs["new_price" + row.number].focus();
          }
        });
      }
    },
  },
  created() {
    this.$nextTick(() => {
      this.$refs["barcode" + 1].focus();
    });
  },
};
</script>

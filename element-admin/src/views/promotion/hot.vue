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
      <span style="font-size: 24px">热卖</span>
    </div>
    <div
      style="
        padding-top: 10px;
        padding-left: 5px;
        border-bottom: thick solid #ececec;
      "
    >
      <el-form ref="settingsForm" :model="settingsForm" :inline="false">
        <el-form-item :label="`首页展示${pageTitle}`">
          <el-switch v-model="settingsForm.show_hot"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="onSubmit"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
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
      :title="dialogTitle + pageTitle"
      :visible.sync="dialogVisible"
    >
      <el-form :model="dialogForm" :inline="false">
        <el-form-item label="选择排序号" label-width="120px">
          <el-select v-model="dialogForm.sort" placeholder="请选择序号">
            <el-option
              v-for="item in sort"
              :key="item.value"
              :label="item.value"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" label-width="120px">
          <el-autocomplete
            class="inline-input"
            v-model="dialogForm.parent.name"
            placeholder="请输入内容"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
          <p style="float: right; margin-top: 0px; color: red">搜索商品</p>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-table
      :data="list"
      :row-style="{ height: '35px' }"
      :cell-style="{ padding: '0' }"
      border
    >
      <el-table-column prop="parent.image" label="商品图片">
        <template slot-scope="scope">
          <img
            :src="scope.row.parent.image"
            width="40"
            height="40"
            style="margin-top: 5px; border: 0px solid #e2e2e2"
          />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序"> </el-table-column>
      <el-table-column prop="parent.barcode" label="条码"> </el-table-column>
      <el-table-column prop="parent.name" label="商品名称"> </el-table-column>
      <el-table-column prop="parent.price" label="价格"> </el-table-column>
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
      pageTitle: "热卖",
      list: [], //数据列表
      dialogVisible: false, // 控制对话框弹出
      settingsForm: {}, //对话框
      dialogForm: {
        parent: {},
      }, //对话框
      dialogTitle: "", //对话框标题
      sort: [], //序号
      searchList: [], //搜索到的数据
      editting: false, //编辑模式
    };
  },
  methods: {
    async onSubmit() {
      let res = await this.$http.put("setting/update", this.settingsForm);
      window.console.log(res);
      if (res.data) {
        this.settingsForm = res.data;
        this.$message({
          type: "success",
          message: "保存成功!",
        });
      } else {
        this.$message({
          type: "error",
          message: "保存失败!",
        });
      }
    },
    async querySearch(queryString, cb) {
      let res = await this.$http.get(`goods/search/${queryString}`);
      this.searchList = res.data;
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].value = res.data[i].name;
      }
      cb(res.data);
    },
    handleSelect(item) {
      // window.console.log(item)
      var results = this.searchList.filter((entity) => {
        return entity.name == item.value ? true : false;
      });
      // window.console.log(results)
      this.dialogForm.parent = results[0];
    },
    async add() {
      this.dialogVisible = true;
      this.dialogForm = {
        parent: {},
      };
      this.editting = false;
      this.dialogTitle = this.editting ? "编辑" : "增加";
    },
    async dialogFormSubmit() {
      if (this.editting) {
        let res = await this.$http.put(`hot/edit/${this.dialogForm._id}`, this.dialogForm);
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        let res = await this.$http.post("hot/create", this.dialogForm);
        if(res.data.type == 'success'){
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
      //获取设置
      let res = await this.$http.get("setting/fetch");
      if (res.data) {
        window.console.log(res);
        this.settingsForm = res.data;
      }
      //获取列表
      res = await this.$http.get("hot/list");
      this.list = res.data;
    },
    async edit(row) {
      this.dialogVisible = true;
      let res = await this.$http.get(`hot/edit/${row._id}`);
      this.dialogForm = res.data;
      this.dialogForm.parent = row.parent;
      this.editting = true;
      this.dialogTitle = this.editting ? "编辑" : "增加";
    },
    async remove(row) {
      this.$confirm('是否删除"' + row.parent.name + '"?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        //请求 删除分类接口
        let res = await this.$http.delete(`hot/delete/${row._id}`);
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
    for (let i = 0; i < 10; i++) {
      this.sort.push({ value: i + 1 });
    }
  },
};
</script>
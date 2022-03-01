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
    <div
      style="
        padding-top: 10px;
        padding-left: 5px;
        border-bottom: thick solid #ececec;
      "
    >
      <el-form ref="settingsForm" :model="settingsForm" :inline="false">
        <el-form-item :label="`首页展示${pageTitle}`">
          <el-switch v-model="settingsForm.show_seckilling"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="mini" @click="onSubmit"
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
      @closed="closeDialog"
    >
      <el-form :model="dialogForm" :inline="false">
        <el-form-item label="选择排序号">
          <el-select v-model="dialogForm.sort" placeholder="请选择序号">
            <el-option
              v-for="item in sort"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-autocomplete
            class="inline-input"
            v-model="dialogForm.parent.name"
            placeholder="请输入商名搜索商品"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="dialogForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="dialogForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formSubmit">确 定</el-button>
      </div>
    </el-dialog>
    <div style="width: 100%; max-width: 7680px; margin-left: -1px">
      <el-table
        :data="list"
        :row-style="{ height: '35px' }"
        :cell-style="{ padding: '0' }"
        border
      >
        <el-table-column prop="parent.image" label="图片">
          <template slot-scope="scope">
            <img
              :src="scope.row.parent.image"
              width="40"
              height="40"
              style="margin-top: 5px; border: 0px solid #e2e2e2"
            />
          </template>
        </el-table-column>
        <el-table-column prop="parent.name" label="名称"> </el-table-column>
        <el-table-column prop="sort" label="排序"> </el-table-column>
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
      pageTitle: "秒杀",
      list: [], //数据列表
      dialogVisible: false, // 控制对话框弹出
      settingsForm: {}, //设置
      dialogForm: {
        parent: {},
      }, //对话框
      dialogTitle: "", //对话框标题
      sort: [], //序号
      searchList: [], //搜索到的数据
      editting: false, //编辑模式
      selectedFile: false, //是否已选择文件
      myCroppa: {}, //裁剪图片并上传
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    dblhandle(row, column, cell, event) {
      // 表格双击事件
      this.edit(row);
    },
    closeDialog() {
      this.dialogForm = {};
    },
    async formSubmit() {
      if (this.editting) {
        let res = await this.$http.put(`seckilling/edit/${this.dialogForm._id}`, this.dialogForm);
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        let res = await this.$http.post("seckilling/create", this.dialogForm);
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
      this.tempList = res.data;
      for (var i = 0; i < res.data.length; i++) {
        res.data[i].value = res.data[i].name;
      }
      cb(res.data);
    },
    handleSelect(item) {
      window.console.log("item");
      window.console.log(item);
      var results = this.tempList.filter((entity) => {
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

    async fetch() {
      //获取设置
      let res = await this.$http.get("setting/fetch");
      if (res.data) {
        window.console.log(res);
        this.settingsForm = res.data;
      }
      //获取列表
      res = await this.$http.get("seckilling/list");
      this.list = res.data;
      window.console.log("list");
      window.console.log(this.list);
    },
    async edit(row) {
      this.dialogVisible = true;
      let res = await this.$http.get(`seckilling/edit/${row._id}`);
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
        let res = await this.$http.delete(`seckilling/delete/${row._id}`);
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
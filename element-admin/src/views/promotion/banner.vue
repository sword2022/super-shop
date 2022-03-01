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
        border-bottom: thick solid #f8f8f8;
        padding-left: 5px;
      "
    >
      <span style="font-size: 24px">Banner</span>
    </div>
    <div
      style="
        padding-top: 10px;
        padding-left: 5px;
        border-bottom: thick solid #f8f8f8;
      "
    >
      <el-form ref="settingsForm" :model="settingsForm" :inline="false">
        <el-form-item label="自动切换">
          <el-switch v-model="settingsForm.autoplay"></el-switch>
        </el-form-item>
        <el-form-item label="间隔时间">
          <el-input size="normal" v-model="settingsForm.interval"></el-input>
        </el-form-item>
        <el-form-item label="切换速度">
          <el-input size="normal" v-model="settingsForm.duration"></el-input>
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
        <el-form-item label="选择推荐项类型">
          <el-radio v-model="radio" label="1">商品</el-radio>
          <el-radio v-model="radio" label="2">类别</el-radio>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-autocomplete
            class="inline-input"
            v-model="dialogForm.name"
            placeholder="请输入内容"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            @select="handleSelect"
          ></el-autocomplete>
          <p style="float: right; margin-top: 0px; color: red">搜索商品</p>
        </el-form-item>
        <el-form-item label="设置图片">
          <div style="float: right; color: #d2691e">
            <div>原图预览</div>
            <img
              style="
                width: 160px;
                height: 80px;
                float: right;
                border: 1px solid #e2e2e2;
              "
              v-if="dialogForm.image"
              :src="dialogForm.image"
              class="avatar"
            />
          </div>
          <div>支持jpg/png文件，请调整图片大小并居中后再提交</div>
          <croppa
            style="width: 400px; height: 176.5px; border: 1px solid #e2e2e2"
            v-bind:style="{ cursor: selectedFile ? 'move' : 'pointer' }"
            v-model="myCroppa"
            :width="400"
            :height="176.5"
            :placeholder="'点击选择图片'"
            :canvas-color="'white'"
            @file-choose="handleCroppaFileChoose"
            @image-remove="handleImageRemove"
          >
          </croppa>
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
      <el-table-column prop="image" label="图片">
        <template slot-scope="scope">
          <img
            :src="scope.row.image"
            width="80"
            height="40"
            style="margin-top: 5px; border: 0px solid #e2e2e2"
          />
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          <span v-if="scope.row.type == 1">{{
            scope.row.parent_goods.name
          }}</span>
          <span v-else>{{ scope.row.parent_category.name }}</span>
        </template>
      </el-table-column>
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
</template>

<script>
export default {
  data() {
    return {
      pageTitle: "Banner",
      list: [], //数据列表
      dialogVisible: false, // 控制对话框弹出
      settingsForm: {}, //设置
      dialogForm: {}, //弹框内容
      parent: {}, //
      dialogTitle: "", //对话框标题
      sort: [], //序号
      searchList: [], //搜索到的数据
      editting: false, //编辑模式
      selectedFile: false, //是否已选择文件
      myCroppa: {}, //裁剪图片并上传
      radio: "1", //链接类型
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    dblhandle(row, column, cell, event) {
      // 表格双击事件
      this.edit(row);
    },
    async uploadCroppedImage() {
      let that = this;
      this.myCroppa.generateBlob(
        (blob) => {
          let formdata = new FormData();
          formdata.append("file", blob); //封装到formdata中
          let config = {
            formpost: "formpost",
            headers: {
              "Content-Type": "multipart/form-data", //之前说的以表单传数据的格式来传递fromdata
            },
          };
          that.$http.post("/upload", formdata, config).then((res) => {
            this.afterUpload(res);
          });
        },
        "image/jpeg",
        0.8
      ); // 80% compressed jpeg file
    },
    closeDialog() {
      this.settingsForm = {};
      this.myCroppa.remove();
      this.selectedFile = false;
    },
    handleCroppaFileChoose(file) {
      window.console.log(file);
      this.selectedFile = true;
    },
    handleImageRemove() {
      this.selectedFile = false;
    },
    async afterUpload(res) {
      this.dialogForm.image = res.data.url;
      if (this.radio == "1") {
        this.dialogForm.type = 1;
        this.dialogForm.parent_goods = this.parent;
      } else {
        this.dialogForm.type = 2;
        this.dialogForm.parent_category = this.parent;
      }
      if (this.editting) {
        let res = await this.$http.put(`banner/edit/${this.dialogForm._id}`, this.dialogForm);
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        let res = await this.$http.post("banner/create", this.dialogForm);
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
    async formSubmit() {
      if (this.editting) {
        if (!this.selectedFile) {
          //将已有的图片url存入
          let res = { data: { url: this.dialogForm.image } };
          this.afterUpload(res);
          return;
        }
      } else {
        if (!this.selectedFile) {
          this.$message({
            type: "success",
            message: "请添加商品图片!",
          });
          return;
        }
      }
      this.uploadCroppedImage();
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
      var str = "";
      if (this.radio == "1") {
        str = "goods";
      } else {
        str = "category";
      }
      let res = await this.$http.get(`${str}/search/${queryString}`);
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
      window.console.log(results);
      this.parent = results[0];
    },
    async add() {
      this.dialogVisible = true;
      this.dialogForm = {};
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
      res = await this.$http.get("banner/banner_list");
      this.list = res.data;
      window.console.log("list");
      window.console.log(this.list);
    },
    async edit(row) {
      this.dialogVisible = true;
      let res = await this.$http.get(`banner/edit/${row._id}`);
      this.dialogForm = res.data;
      this.editting = true;
      this.dialogTitle = this.editting ? "编辑" : "增加";
    },
    async remove(row) {
      var objtype = "";
      if (row.type == 1) {
        objtype = row.parent_goods.name;
      } else {
        objtype = row.parent_category.name;
      }
      this.$confirm('是否删除Banner"' + objtype + '"?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        //请求 删除分类接口
        let res = await this.$http.delete(`banner/delete/${row._id}`);
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
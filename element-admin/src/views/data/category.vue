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
      <span style="font-size: 24px">分类</span>
    </div>
    <div style="height: 40px; padding-left: 5px; padding-top: 5px">
      <span style="float: left; color: #909399">分类列表</span>
      <el-button
        style="float: right"
        type="primary"
        icon="el-icon-plus"
        size="mini"
        @click="add"
        >新增</el-button
      >
    </div>
    <!-- Form表单 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @closed="closeDialog"
    >
      <el-form :model="form" :inline="false">
        <el-form-item label="上级分类">
          <div style="height: 50px; width: 100%;color: #d2691e">创建一级分类请忽略此选项</div>
          <el-select v-model="form.parent" placeholder="请选择上级分类">
            <el-option
              v-for="item in parents"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称 *">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="图片 *">
          <div style="float: right; color: #d2691e">
            <div>原图预览</div>
            <img
              style="
                width: 80px;
                height: 80px;
                float: right;
                border: 1px solid #e2e2e2;
              "
              v-if="form.image"
              :src="form.image"
              class="avatar"
            />
          </div>
          <div style="height: 50px; width: 100%;color: #d2691e">支持jpg/png文件，请调整图片大小并居中后再提交</div>
          <croppa
            style="width: 150px; height: 150px; border: 1px solid #e2e2e2"
            v-bind:style="{ cursor: selectedFile ? 'move' : 'pointer' }"
            v-model="myCroppa"
            :width="150"
            :height="150"
            :placeholder="'点击选择图标'"
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
      <el-table-column prop="image" label="类别图片">
        <template slot-scope="scope">
          <img
            :src="scope.row.image"
            width="40"
            height="40"
            style="margin-top: 5px; border: 0px solid #e2e2e2"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称"> </el-table-column>
      <el-table-column prop="parent.name" label="上级分类"> </el-table-column>
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
      myCroppa: {}, //裁剪图片并上传
      selectedFile: false, //是否已选择文件
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
      this.form.image = res.data.url;
      if (this.editting) {
        let res = await this.$http.put(`category/edit/${this.form._id}`, this.form);
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        let res = await this.$http.post("category/create", this.form);
        if(res.data.type == 'success'){
          this.dialogVisible = false; 
        }
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      }
      this.fetchList();
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
    async add() {
      this.dialogVisible = true;
      this.editting = false;
      this.dialogTitle = this.editting ? "编辑分类" : "增加分类";
    },
    async formSubmit() {
      if (this.editting) {
        if (!this.selectedFile) {
          //将已有的图片url存入
          let res = { data: { url: this.form.image } };
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
    async fetchList() {
      //刷新列表
      let res = await this.$http.get("category/list");
      this.list = res.data;
      this.parents = res.data;
    },
    async edit(row) {
      this.dialogVisible = true;
      window.console.log(row._id);
      let res = await this.$http.get(`category/edit/${row._id}`);
      window.console.log(res);
      this.form = res.data;
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
        let res = await this.$http.delete(`category/delete/${row._id}`);
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
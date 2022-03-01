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
      <span style="font-size: 24px">商品</span>
      <div style="float: right">
        <el-input
          style="width: 160px"
          @keyup.enter.native="search"
          v-model="searchGoods"
          size="mini"
          placeholder="搜索品名"
        ></el-input>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="search"
        ></el-button>
      </div>
    </div>

    <div style="height: 40px; padding-left: 5px; padding-top: 5px">
      <span style="float: left; color: #909399">商品列表</span>
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
      :close-on-click-modal="false"
      @closed="closeDialog"
    >
      <el-form :model="form" :inline="false">
        <el-form-item label="允许销售">
          <el-switch
            v-model="form.enable_sale"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </el-form-item>
        <el-form-item label="商品类别 *">
          <el-select v-model="form.parent" placeholder="请选择商品分类">
            <el-option
              v-for="item in parents"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称 *">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="条码">
          <el-input v-model="form.barcode"></el-input>
        </el-form-item>
        <el-form-item label="详情">
          <el-input v-model="form.detail"></el-input>
        </el-form-item>
        <el-form-item label="商品毛重(生鲜每份的重量 必填！普通商品可不填)">
          <el-input v-model="form.weight"></el-input>
        </el-form-item>
        <el-form-item label="价格(生鲜填公斤价格) *">
          <el-input v-model="form.price"></el-input>
        </el-form-item>
        <el-form-item label="划线价">
          <el-input v-model="form.line_price"></el-input>
        </el-form-item>
        <el-form-item label="库存数量 *">
          <el-input v-model="form.inventory"></el-input>
        </el-form-item>
        <el-form-item label="销量">
          <el-input v-model="form.sales"></el-input>
        </el-form-item>
        <el-form-item label="图片 *">
          <div v-if="form.image" style="color: #d2691e">
            <div>原图预览</div>
            <div style="height: 302px; width: 100%">
              <img
                style="width: 300px; height: 300px; border: 1px solid #e2e2e2"
                :src="form.image"
              />
            </div>

            <el-button @click="changeImage" size="small" type="primary"
              >更换原图</el-button
            >
          </div>

          <div v-else style="color: #d2691e">
            支持jpg/png文件 请调整图片大小并居中后再提交
            <croppa
              style="width: 300px; height: 300px; border: 1px solid #e2e2e2"
              v-bind:style="{ cursor: selectedFile ? 'move' : 'pointer' }"
              v-model="myCroppa"
              :width="300"
              :height="300"
              :placeholder="'选择主图'"
              :canvas-color="'white'"
              @file-choose="handleCroppaFileChoose"
              @image-remove="handleImageRemove"
            >
            </croppa>
          </div>
          <!-- 防止图像重叠 -->
          <div v-if="selectedFile" style="height: 50px; width: 100%"></div>
        </el-form-item>
        <el-form-item label="更多图片">
          <div style="height: 50px; width: 100%; color: #d2691e">
            添加副图能在商品详情中看到更多图片
            只能上传jpg/png文件，且不超过500kb
            <el-upload
              class="upload-demo"
              :action="$http.defaults.baseURL + '/upload'"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-remove="beforeRemove"
              :on-change="handleChange"
              :on-success="afterUpload"
              multiple
              :limit="3"
              :on-exceed="handleExceed"
              :file-list="fileList"
            >
              <el-button size="small" type="primary">选择副图片</el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="formSubmit">提 交</el-button>
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
      <el-table-column prop="image" label="商品图片">
        <template slot-scope="scope">
          <img
            :src="scope.row.image"
            width="40"
            height="40"
            style="margin-top: 5px; border: 0px solid #e2e2e2"
          />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="barcode" label="条码">
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="name" label="商品名称">
      </el-table-column>
      <el-table-column prop="price" label="价格"> </el-table-column>
      <el-table-column prop="line_price" label="划线价"> </el-table-column>
      <el-table-column prop="parent.name" label="类别名称"> </el-table-column>
      <el-table-column prop="inventory" label="库存"> </el-table-column>
      <el-table-column prop="sales" label="销量"> </el-table-column>
      <el-table-column label="允许销售">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enable_sale"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeStatus($event, scope.row._id)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip prop="detail" label="商品描述">
      </el-table-column>
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
      parents: {}, //父对象
      dialogVisible: false, // 控制对话框弹出
      form: {}, //对话框
      dialogTitle: "", //对话框标题
      editting: false, //编辑模式
      pageSize: 10, //默认获取的数据量
      page: 1, //当前数据位置
      dataTotal: 0, //数据总数
      selectedFile: false, //是否已选择文件
      myCroppa: {}, //裁剪图片并上传
      searchGoods: "",
      fileList: [], //图片组
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    dblhandle(row, column, cell, event) {
      // 表格双击事件
      this.edit(row);
    },
    // eslint-disable-next-line no-unused-vars
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-3);
    },
    // eslint-disable-next-line no-unused-vars
    async afterUpload(res) {
      //此方法文件上传后触发
      var tempList = [];
      for (let i = 0; i < this.fileList.length; i++) {
        let tempItem = {};
        tempItem.name = this.fileList[i].response.originalname;
        tempItem.url = this.fileList[i].response.url;
        tempList.push(tempItem);
      }
      this.form.images = tempList;
      window.console.log(tempList);
    },
    // element-ui自带上传
    async handleRemove(file, fileList) {
      window.console.log("handleRemove");
      window.console.log(file, fileList);
      const image_string = file.url.split("/");
      let res = await this.$http.delete(
        `goods/deleteImage/${file.name}/${image_string.pop()}`
      );
      this.$message({
        type: res.data.type,
        message: res.data.message,
      });
      var tempList = [];
      for (let i = 0; i < fileList.length; i++) {
        let tempItem = {};
        tempItem.name = fileList[i].name;
        tempItem.url = fileList[i].url;
        tempList.push(tempItem);
      }
      this.form.images = tempList;
      window.console.log(tempList);
    },
    handlePreview(file) {
      window.console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    // eslint-disable-next-line no-unused-vars
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },

    async changeStatus($event, _id) {
      window.console.log($event);
      window.console.log(_id);
      var enable_sale = { enable_sale: $event };
      let res = await this.$http.put(`goods/update/${_id}`, enable_sale);
      window.console.log(res);
      this.$message({
        type: res.data.type,
        message: res.data.message,
      });
      this.fetchList();
    },
    async search() {
      this.list = [];
      let res = await this.$http.get(`goods/goods_search/${this.searchGoods}`);
      // window.console.log(res.data)
      this.list = res.data;
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
            that.uploaded(res);
          });
        },
        "image/jpeg",
        0.8
      ); // 80% compressed jpeg file
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
    async uploaded(res) {
      this.form.image = res.data.url;
      if (this.editting) {
        let res = await this.$http.put(
          `goods/edit/${this.form._id}`,
          this.form
        );
        this.dialogVisible = false;
        window.console.log(res);
        this.$message({
          type: res.data.type,
          message: res.data.message,
        });
      } else {
        let randNum = Math.floor(Math.random()*(100-1)+1);
        this.form.sales = this.form.sales ? this.form.sales : randNum;
        this.form.score = 10;
        this.form.weight = this.form.weight ? this.form.weight : 1;

        let res = await this.$http.post("goods/create", this.form);
        if (res.data.type == "success") {
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
    async add() {
      this.dialogVisible = true;
      this.editting = false;
      this.dialogTitle = this.editting ? "编辑商品" : "增加新品";
    },
    async changeImage() {
      this.form.image = null;
    },
    async formSubmit() {
      if (this.editting) {
        if (!this.selectedFile) {
          //将已有的图片url存入
          let res = { data: { url: this.form.image } };
          this.uploaded(res);
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
      //刷新商品列表
      let res = await this.$http.get(
        `goods/list_size_id/${this.pageSize}/${this.page}`
      );
      this.list = res.data;
      window.console.log(this.$http);
    },
    async fetchParentList() {
      //刷新分类列表
      let res = await this.$http.get("category/list");
      this.parents = res.data;
    },
    async edit(row) {
      this.dialogVisible = true;
      let res = await this.$http.get(`goods/edit/${row._id}`);
      this.form = res.data;
      this.fileList = this.form.images;
      this.editting = true;
      this.dialogTitle = this.editting ? "编辑商品" : "增加新品";
    },
    async remove(row) {
      this.$confirm('是否删除"' + row.name + '"?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        //请求 删除分类接口
        let res = await this.$http.delete(`goods/delete/${row._id}`);
        window.console.log(res);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
        this.fetchList();
        this.fetchParentList();
      });
    },
  },
  async created() {
    let res = await this.$http.get(`goods/list`);
    this.dataTotal = res.data.length;
    this.fetchList();
    this.fetchParentList();
  },
};
</script>
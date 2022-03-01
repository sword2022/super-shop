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
      <span style="font-size: 24px">配送</span>
    </div>
    <div
      style="
        padding-top: 10px;
        padding-left: 5px;
        border-bottom: thick solid #f8f8f8;
      "
    >
      <el-form ref="form" :model="form" :inline="false">
        <el-form-item label="配送开关 ">
          自取
          <el-switch v-model="form.self_pickup_method"></el-switch>
          外卖
          <el-switch
            v-model="form.takeout_method"
            @change="onTakeoutChange"
          ></el-switch>
          团购
          <el-switch v-model="form.groupon_method"></el-switch>
        </el-form-item>
        <el-form-item label="商家配送 ">
          商家自己配送
          <el-switch
            v-model="form.store_self_send"
            @change="onStoreSelfSendChange"
          ></el-switch>
        </el-form-item>

        <el-form-item label="团购送货日期">
          <el-date-picker
            v-model="form.pickup_date"
            type="date"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
          >
          </el-date-picker>
          启用自动更新
          <el-switch v-model="form.auto_update_pickup_date"></el-switch>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-time-select
            v-model="form.update_time"
            :picker-options="{
              start: '00:00',
              step: '00:60',
              end: '23:00',
            }"
            placeholder="选择时间"
          >
          </el-time-select>
        </el-form-item>

        <el-form-item label="配送费 (元)">
          <el-input size="normal" v-model="form.freight"></el-input>
        </el-form-item>
        <el-form-item label="最大距离(米)">
          <el-input size="normal" v-model="form.max_distance"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="mini" @click="onSubmit"
            >保存</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="success" size="mini" @click="dadaClick"
            >达达设置</el-button
          >
        </el-form-item>
      </el-form>

      <!-- dada设置 -->
      <el-dialog
        :title="dada_dialogTitle"
        :visible.sync="dialogVisible"
      >
        <el-form :model="dada_setting" :inline="false">
          <el-form-item label="达达商户SourceID">
            <el-input v-model="dada_setting.source_id"></el-input>
          </el-form-item>
          <el-form-item label="达达门店编号">
            <el-input v-model="dada_setting.shop_no"></el-input>
          </el-form-item>
          <el-form-item label="达达开发者app key">
            <el-input v-model="dada_setting.app_key"></el-input>
          </el-form-item>
          <el-form-item label="达达开发者app sercret">
            <el-input v-model="dada_setting.app_sercret"></el-input>
          </el-form-item>
          
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dadaSettingOnSubmit">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dada_dialogTitle:'达达设置',
      form: {}, //对话框
      dialogVisible: false,
      dada_setting: {}, //达达设置
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    async onTakeoutChange(val) {
      if (!this.form.takeout_method) {
        this.form.store_self_send = false;
      }
    },
    // eslint-disable-next-line no-unused-vars
    async onStoreSelfSendChange(val) {
      if (!this.form.takeout_method) {
        this.form.store_self_send = false;
      }
    },
    async dadaClick() {
      this.dialogVisible = true;
    },
    async onSubmit() {
      //时间转换为数字
      let tempArr = this.form.update_time.split(":");
      this.form.update_time = parseInt(tempArr[0]);
      window.console.log(this.form);
      let res = await this.$http.put("setting/update", this.form);

      window.console.log(res);
      if (res.data) {
        //防止Int时间赋值到String控件上报错
        res.data.update_time += ":00";
        this.form = res.data;
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
    async dadaSettingOnSubmit() {
     
      window.console.log(this.dada_setting);
      let res = await this.$http.put("dada_setting/update", this.dada_setting);

      window.console.log(res);
      if (res.data) {
        this.dada_setting = res.data;
        this.$message({
          type: "success",
          message: "保存成功!",
        });
        this.dialogVisible = false;
      } else {
        this.$message({
          type: "error",
          message: "保存失败!",
        });
      }
    },
    async fetch() {
      //获取设置
      let res = await this.$http.get("setting/fetch");
      if (res.data) {
        window.console.log(res);
        //防止Int时间赋值到String控件上报错
        res.data.update_time += ":00";
        this.form = res.data;
      }
      //获取达达设置
      let dada_setting = await this.$http.get("dada_setting/fetch");
      if (dada_setting.data) {
        window.console.log(dada_setting);
        this.dada_setting = dada_setting.data;
      }
    },
  },
  created() {
    this.fetch();
  },
};
</script>
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
      <span style="font-size: 24px">打印机</span>
    </div>
    <el-form :model="feie_setting" :inline="false">
      <el-form-item label="飞鹅云账号名USER">
        <el-input v-model="feie_setting.user"></el-input>
      </el-form-item>
      <el-form-item label="飞鹅云UKEY">
        <el-input v-model="feie_setting.ukey"></el-input>
      </el-form-item>
      <el-form-item label="飞鹅云打印机SN">
        <el-input v-model="feie_setting.printer_sn"></el-input>
      </el-form-item>
      <el-form-item label="飞鹅云打印机KEY">
        <el-input v-model="feie_setting.printer_key"></el-input>
      </el-form-item>
      <el-button type="primary" @click="wxSettingOnSubmit">确 定</el-button>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      feie_setting: {}, //微信设置
    };
  },
  methods: {
    async wxSettingOnSubmit() {
      window.console.log(this.feie_setting);
      let res = await this.$http.put("feie_setting/update", this.feie_setting);
      window.console.log(res);
      if (res.data) {
        this.feie_setting = res.data;
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
    async fetch() {
      window.console.log('fetch');
      let feie_setting = await this.$http.get("feie_setting/fetch");
      if (feie_setting.data) {
        window.console.log(feie_setting);
        this.feie_setting = feie_setting.data;
      }
    },
  },
  created() {
    this.fetch();
  },
};
</script>
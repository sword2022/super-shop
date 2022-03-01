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
      <span style="font-size: 24px">支付</span>
    </div>
    <el-form :model="wx_setting" :inline="false">
      <el-form-item label="微信小程序 appid">
        <el-input v-model="wx_setting.appid"></el-input>
      </el-form-item>
      <el-form-item label="微信小程序 secret">
        <el-input v-model="wx_setting.secret"></el-input>
      </el-form-item>
      <el-form-item label="微信支付 商户id">
        <el-input v-model="wx_setting.mchid"></el-input>
      </el-form-item>
      <el-form-item label="微信支付 商户key">
        <el-input v-model="wx_setting.mchkey"></el-input>
      </el-form-item>
      <el-button type="primary" @click="wxSettingOnSubmit">确 定</el-button>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      wx_setting: {}, //微信设置
    };
  },
  methods: {
    async wxSettingOnSubmit() {
      window.console.log(this.wx_setting);
      let res = await this.$http.put("wx_setting/update", this.wx_setting);
      window.console.log(res);
      if (res.data) {
        this.wx_setting = res.data;
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
      let wx_setting = await this.$http.get("wx_setting/fetch");
      if (wx_setting.data) {
        window.console.log(wx_setting);
        this.wx_setting = wx_setting.data;
      }
    },
  },
  created() {
    this.fetch();
  },
};
</script>
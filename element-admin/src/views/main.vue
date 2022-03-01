<template>
  <el-container class="container">
    <el-menu
      router
      class="el-menu-demo"
      mode="horizontal"
      style="width: 100%; position: fixed; z-index: 99"
    >
      <el-menu-item index="/order">
        <i class="el-icon-mobile-phone"></i>
        <span slot="title">订单</span>
      </el-menu-item>

      <el-submenu index="2">
        <template slot="title">档案</template>
        
        <el-menu-item index="/data/goods">
          <i class="el-icon-s-order"></i>
          <span slot="title">商品档案</span>
        </el-menu-item>
        <el-menu-item index="/data/category">
          <i class="el-icon-menu"></i>
          <span slot="title">分类管理</span>
        </el-menu-item>
        <el-menu-item index="/data/price">
          <i class="el-icon-money"></i>
          <span slot="title">价格调整</span>
        </el-menu-item>
        <el-menu-item index="/data/wx_user">
          <i class="el-icon-user"></i>
          <span slot="title">用户档案</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="3">
        <template slot="title">营销</template>

        <el-menu-item index="/promotion/banner">
          <i class="el-icon-picture"></i>
          <span slot="title">Banner</span>
        </el-menu-item>
        <el-menu-item index="/promotion/seckilling">
          <i class="el-icon-finished"></i>
          <span slot="title">秒杀商品</span>
        </el-menu-item>
        <el-menu-item index="/promotion/recommend">
          <i class="el-icon-star-on"></i>
          <span slot="title">推荐商品</span>
        </el-menu-item>
        <el-menu-item index="/promotion/hot">
          <i class="el-icon-top"></i>
          <span slot="title">热卖商品</span>
        </el-menu-item>
        <el-menu-item index="/promotion/coupon">
          <i class="el-icon-s-ticket"></i>
          <span slot="title">优惠卷</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="4">
        <template slot="title">设置</template>

        <el-menu-item index="/setting/store">
          <i class="el-icon-house"></i>
          <span slot="title">店铺设置</span>
        </el-menu-item>
        <el-menu-item index="/setting/freight">
          <i class="el-icon-share"></i>
          <span slot="title">配送设置</span>
        </el-menu-item>
        <el-menu-item index="/setting/pay">
          <i class="el-icon-money"></i>
          <span slot="title">支付设置</span>
        </el-menu-item>
        <el-menu-item index="/setting/printer">
          <i class="el-icon-printer"></i>
          <span slot="title">打印设置</span>
        </el-menu-item>
        <el-menu-item @click.native="logout">
          <i class="el-icon-error"></i>
          <span slot="title">退出</span>
        </el-menu-item>
      </el-submenu>

      <!-- <el-button style="width:80px;margin:10px 18px;" @click.native="logout" size="mini" round>退出登录</el-button> -->
    </el-menu>

    <!-- <el-header style="width:100%;background-color: #FFFFFF;box-shadow: 0px 0px 5px #555555;position: fixed;z-index:99;">
      <div style="line-height: 55px;margin-bottom:14px;text-align: left; font-style:italic;font-size:28px;font-weight:600;">{{form.storeName}}小程序后台管理系统</div>
    </el-header> -->

    <!-- 路由外链 -->
    <el-main style="padding: 0; margin-top: 61px">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      form: {},
    };
  },
  async created() {
    window.console.log("获取设置");
    let res = await this.$http.get("setting/fetch");
    if (res.data) {
      this.form = res.data;
    }
  },
  methods: {
    async logout() {
      localStorage.clear();
      //localStorage.removeItem('token')
      this.$router.push({ path: "/login" });
      this.$message("已退出登录");
    },
  },
};
</script>
<style>
.container {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}
.el-dialog {
  /* 控制弹出框大小 */
  max-width: 680px;
  min-width: 340px;
}
/* .el-table--border td:first-child .cell{
  padding: 0px;
} */
</style>
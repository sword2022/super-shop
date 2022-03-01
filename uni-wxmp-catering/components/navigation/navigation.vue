<template>
  <view>
    <view
      class="header"
      :style="
        'height:' + titleBarHeight + 'px;padding-top:' + statusBarHeight + 'px'
      "
    >
      <view v-if="showIcon" class="back" @tap="headerBack">
        <image class="image" src="/static/components/navigation/back.png" />
      </view>
      <view v-if="showTitle" class="header-title">{{ title }}</view>
      <view v-if="showSearch" class="search-box" @tap="headerSearch">
        <image class="image" src="/static/public/search.png" />
        <text class="text">搜索商品</text>
      </view>
    </view>
  </view>
</template>

<script>
const app = getApp();

export default {
  data() {
    return {
      statusBarHeight: 0,
      titleBarHeight: 0,
    };
  },

  props: {
    //小程序页面的表头
    title: {
      type: String,
      default: "default value",
    },
    //是否展示返回和主页按钮
    showIcon: {
      type: Boolean,
      default: true,
    },
    //是否显示标题
    showTitle: {
      type: Boolean,
      default: true,
    },
    //是否显示搜索框
    showSearch: {
      type: Boolean,
      default: false,
    },
  },
  mounted: function () {
    if (app.globalData.statusBarHeight && app.globalData.titleBarHeight) {
      this.statusBarHeight = app.globalData.statusBarHeight;
      this.titleBarHeight = app.globalData.titleBarHeight;
    } else {
      let _this = this;
      uni.getSystemInfo({
        success: function (res) {
          console.log("getSystemInfo:", res);

          if (res.model.indexOf("iPhone") !== -1) {
            console.log("iphone");
            app.globalData.titleBarHeight = 44;
          } else {
            console.log("other");
            app.globalData.titleBarHeight = 48;
          }
          app.globalData.windowHeight = res.windowHeight;
          app.globalData.statusBarHeight = res.statusBarHeight;
          _this.statusBarHeight = app.globalData.statusBarHeight;
          _this.titleBarHeight = app.globalData.titleBarHeight;
        },

        failure() {
          _this.statusBarHeight = 0;
          _this.titleBarHeight = 0;
        },
      });
    }
  },
  methods: {
    headerBack() {
      uni.navigateBack({
        delta: 1,

        fail(e) {
          uni.switchTab({
            url: "/pages/home/index",
          });
        },
      });
    },

    headerSearch() {
      uni.navigateTo({
        url: "/pages/search/index",
      });
    },
  },
};
</script>
<template>
  <view>
    <Navigation
      id="Navigation"
      show-icon="true"
      title="搜索"
      show-title="true"
      class
    ></Navigation>
    <view
      class="container"
      :style="
        'height:' +
        (windowHeight - container_top) +
        'px;margin-top:' +
        container_top +
        'px'
      "
    >
      <view class="type-header-menu">
        <view class="type-search">
          <image src="/static/public/search.png"></image>
          <input
            :class="'input ' + (searchInput == true ? 'active' : '')"
            type="text"
            confirm-type="search"
            placeholder="请输入商品名称"
            @focus="searchFocus"
            bindinput="talk"
            @confirm="searchFun"
            focus="true"
          />
        </view>
      </view>
      <view class="search-cont-box" v-if="recentSearch.length && searchHidden">
        <view class="title-and-btn">
          <view class="title">最近搜索</view>
          <view class="btn" @tap="clearHistory">
            <image src="/static/search/del.png"></image>
          </view>
        </view>
        <view class="keywords-li">
          <block v-for="(item, index) in recentSearch" :key="index">
            <view @tap="goSearch" class="item" :data-text="item">{{
              item
            }}</view>
          </block>
        </view>
      </view>
      <view :hidden="search" :class="'search-box ' + iponesc">
        <view
          v-for="(item, index) in searchs"
          :key="index"
          :hidden="searchHidden"
          class="goods-box"
          :data-id="item._id"
        >
          <view class="img-box">
            <image
              :src="item.image"
              class="image"
              mode="aspectFill"
              lazy-load="true"
            ></image>
            <view class="goods-characteristic">
              <text>{{ item.detail }}</text>
            </view>
          </view>
          <view class="goods-title">{{ item.name }}</view>
          <view class="bottom-box">
              <text class="price"
                >¥{{ filters.toFix2(item.price * item.weight) }}</text
              >
              <text class="line-price"
                >¥{{ filters.toFix2(item.line_price * item.weight) }}</text
              >
              <icon
                type="jia"
                @click="click_increase_or_decrease(item, 'increase')"
                size="26"
                :color="
                  item.number >= item.inventory ? '#cccccc' : button_color
                "
              ></icon>
            </view>
        </view>
        <view :hidden="noneHidden" class="goods-none">
          <image src="/static/search/search_empty.png"></image>
          <text>未找到您需要的商品</text>
        </view>
      </view>
      <view class="top-line"></view>
      <view class="bottom-lin"></view>
    </view>
  </view>
</template>

<script module="filters" lang="wxs" src="../../utils/addmul.wxs"></script>

<script>
const app = getApp();
import api from "../../api/api";
import Navigation from "../../components/navigation/navigation";
import Icon from "@/components/icon/icon.vue";
export default {
  data() {
    return {
      search: true,
      noneHidden: true,
      searchHidden: true,
      recentSearch: [],
      searchValue: "",
      searchInput: false,
      searchs: "",
      //样式控制
      container_top: 0,
      windowHeight: 0,
      button_color: "SpringGreen",
    };
  },

  components: {
    Navigation,
    Icon,
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.container_top =
      app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    this.windowHeight = app.globalData.windowHeight;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getRecentSearch();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.storeName,
    };
  },
  methods: {
    //点击增加或减少
    click_increase_or_decrease: function (object, type) {
      let _value = this.editCart(object, type, app.globalData.cartList)
      app.globalData.cartList = _value ? _value : app.globalData.cartList;
    },
    getRecentSearch: function () {
      var recentSearch = uni.getStorageSync("recentSearch");
      this.setData({
        recentSearch,
      });
    },
    clearHistory: function () {
      uni.clearStorageSync("recentSearch");
      this.setData({
        recentSearch: [],
      });
    },
    goSearch: function (e) {
      this.searchFun(e);
    },
    searchFun: function (e) {
      var _this = this;

      var keywords;
      e.detail.value
        ? (keywords = e.detail.value)
        : (keywords = e.currentTarget.dataset.text),
        (_this.searchValue = keywords);

      if (_this.searchValue) {
        // 记录最近搜索
        var recentSearch = uni.getStorageSync("recentSearch") || [];

        if (!app.globalData.isStrInArray(keywords, recentSearch)) {
          recentSearch.unshift(_this.searchValue);
          uni.setStorageSync("recentSearch", recentSearch);

          _this.setData({
            recentSearch: recentSearch,
          });
        }
      }

      console.log(keywords);
      api
        .get(`goods/goods_search/${keywords}`, {
          data: "",
        })
        .then((res) => {
          console.log(res);
          this.setData({
            searchs: res,
            searchHidden: false,
            noneHidden: true,
          });
        })
        .catch((err) => {
          uni.showToast({
            title: err,
            icon: "none",
          });
        });
    },
    searchFocus: function () {
      this.setData({
        search: false,
        searchInput: true,
      });
    },
    searchClose: function () {
      this.setData({
        search: true,
        searchInput: false,
        searchHidden: true,
      });
    },
  },
};
</script>
<style lang="less">
.type-header-menu {
  height: 120rpx;
  width: 100%;
  background-color: #fff;
  z-index: 99999;
  border-bottom: 1rpx solid #f8f8f8;
  box-sizing: border-box;
  overflow: hidden;
}

.type-header-menu .type-search {
  width: 690rpx;
  margin-left: 30rpx;
  position: relative;
  height: 66rpx;
  overflow: hidden;
  margin-top: 30rpx;
  box-sizing: border-box;
}

.type-header-menu .type-search image {
  width: 16px;
  height: 16px;
  position: absolute;
  top: 14rpx;
  left: 16rpx;
}

.type-header-menu .type-search .input {
  width: 625rpx;
  height: 60rpx;
  background-color: #f5f5f5;
  border-radius: 50rpx;
  font-size: 28rpx;
  padding-left: 65rpx;
  display: inline-block;
  transition: all 0.6s;
}

.type-header-menu .type-search .active {
  width: 625rpx;
  transition: all 0.6s;
}

.goods-none {
  margin-top: 25%;
}

.goods-none image {
  width: 200rpx;
  height: 200rpx;
  display: block;
  margin: 0 auto;
}

.goods-none text {
  font-size: 28rpx;
  display: block;
  color: #999;
  text-align: center;
  margin-top: 10rpx;
}
/* 商品信息 */
.goods-box {
  width: 45%;
  margin: 20px 0 0 13px;
  display: inline-block;
}
.img-box image {
  width: 100%;
  height: 180px;
  display: block;
}
.img-box {
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
.goods-characteristic {
  font-size: 22rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: rgba(0, 152, 50, 0.6);
  color: #ffffff;
  height: 35px;
  line-height: 35px;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}

.goods-characteristic text {
  padding-left: 5px;
}

.goods-title {
  font-size: 28rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 5px 5px 0 5px;
}
.bottom-box {
  width: 350rpx;
  margin-top: 10rpx;
  .price {
    color: #d81e06;
    width: auto;
    height: auto;
    font-size: 18px;
    font-weight: bold;
    line-height: 40rpx;
    float: left;
  }
  .line-price {
    width: auto;
    height: auto;
    font-size: 12px;
    padding-top: 6rpx;
    float: left;
    padding-left: 3px;
    color: #555;
    text-decoration: line-through;
  }
  icon {
    float: right;
    margin-right: 30rpx;
  }
}

.goods-price-naver {
  color: #999;
  font-size: 24rpx;
  line-height: 28px;
  width: 100%;
  text-align: right;
  padding: 0 3px;
}
.search-cont-box {
  padding: 0 30rpx;
}
.search-cont-box .title-and-btn {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 0 20rpx 0;
}
.search-cont-box .title-and-btn .btn image {
  height: 48rpx;
  width: 48rpx;
}
.search-cont-box .title-and-btn .title {
  color: #777;
  font-size: 28rpx;
}
.search-cont-box .keywords-li {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.search-cont-box .keywords-li .item {
  font-size: 22rpx;
  color: #777;
  border: 1rpx solid #777;
  padding: 4rpx 12rpx;
  border-radius: 5rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}
</style>
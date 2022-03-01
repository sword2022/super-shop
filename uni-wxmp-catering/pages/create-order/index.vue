<template>
  <view>
    <Navigation
      id="Navigation"
      show-icon="true"
      title="确认订单"
      show-title="true"
    ></Navigation>
    <view
      class="container"
      :style="
        'height:' +
        (windowHeight - container_top + 50) +
        'px;margin-top:' +
        container_top +
        'px'
      "
    >
      <view
        class="top-float-box"
        :style="delivery_type == 1 ? 'height: 50px;' : 'height: 100px;'"
      >
        <view class="type">
          <view
            v-if="settings.self_pickup_method"
            @click="selectTypeTap(1)"
            :class="delivery_type === 1 ? 'name' : 'text'"
            :style="
              'width:' +
              type_width +
              '%;' +
              (delivery_type === 1
                ? 'color:#000;background-color:' + button_color
                : '')
            "
            >自取</view
          >
          <view
            v-if="settings.takeout_method"
            @click="selectTypeTap(2)"
            :class="delivery_type === 2 ? 'name' : 'text'"
            :style="
              'width:' +
              type_width +
              '%;' +
              (delivery_type === 2
                ? 'color:#000;background-color:' + button_color
                : '')
            "
            >外卖</view
          >
          <view
            v-if="settings.groupon_method"
            @click="selectTypeTap(3)"
            :class="delivery_type === 3 ? 'name' : 'text'"
            :style="
              'width:' +
              type_width +
              '%;' +
              (delivery_type === 3
                ? 'color:#000;background-color:' + button_color
                : '')
            "
            >团购</view
          >
        </view>
        <view
          v-if="delivery_type == 2 || delivery_type == 3"
          class="address-box"
        >
          <view
            v-if="!userDetails.telNumber"
            class="add-address"
            @tap="SelectAddress"
          >
            <view class="title">新增收货地址</view>
          </view>
          <view v-else class="show-address" @tap="SelectAddress">
            <view class="name-tel"
              >收货人:{{ userDetails.userName
              }}{{ userDetails.telNumber }}</view
            >
            <view class="addr-text"
              >地址:{{ userDetails.cityName }}{{ userDetails.countyName
              }}{{ userDetails.detailInfo }}</view
            >
          </view>
        </view>
      </view>

      <view
        class="content-box"
        :style="
          delivery_type == 1 ? 'padding-top: 50px;' : 'padding-top: 100px;'
        "
      >
        <view class="goods-list">
          <view class="list-title">商品列表</view>
          <view
            v-for="(item, index) in cart_list"
            :key="index"
            class="goods-item"
          >
            <view class="img-box">
              <image mode="aspectFill" :src="item.image" class="img"></image>
            </view>
            <view class="text-box">
              <view class="row">
                <view class="goods-name">{{ item.name }}</view>
                <view class="goods-price"
                  >小计 ¥
                  {{
                    filters.toFix2(item.price * item.weight * item.number)
                  }}</view
                >
              </view>
              <view class="row">
                <view class="goods-num"
                  >￥{{ filters.toFix2(item.price * item.weight) }} x{{
                    item.number
                  }}</view
                >
              </view>
            </view>
          </view>
        </view>
        <view class="order-info">
          <view class="row-box">
            <view class="row-label">配送方式</view>
            <view v-if="delivery_type == 1">
              <view class="right-text">
                <view class="location-text"
                  >自取
                  <text
                    style="padding-left: 10px; color: #0080ff"
                    @tap="openMap"
                    >查看自取点位置</text
                  ></view
                >
              </view>
            </view>
            <view v-else-if="delivery_type == 2">
              <view class="right-text"
                >外卖 配送费: ￥{{ settings.freight }}</view
              >
            </view>
            <view v-else-if="delivery_type == 3">
              <view class="right-text"
                >团购 提货日期{{ settings.pickup_date }}</view
              >
            </view>
          </view>
        </view>
        <view class="order-info">
          <view class="row-box">
            <view class="row-label">备注</view>
            <view class="right-text">
              <input
                @input="remarkChange"
                name="remark"
                type="text"
                class="liuyan"
                placeholder="如需备注请在此处输入"
              />
            </view>
          </view>
        </view>
        <view class="order-info">
          <view class="row-box">
            <view class="row-label">选择优惠券（已自动选择）</view>
            <view style="right: 0px">
              <picker-view
                :indicator-style="indicatorStyle"
                :value="picker_value"
                @change="bindChange"
                class="picker-view"
              >
                <picker-view-column>
                  <view
                    class="item"
                    v-for="(item, index) in coupon_list"
                    :key="index"
                    >{{ item.name }}</view
                  >
                </picker-view-column>
              </picker-view>
            </view>
          </view>
        </view>
        <view class="order-info" style="margin-top: 24rpx">
          <view class="row-box">
            <view class="row-label">商品金额</view>
            <view class="right-text">¥ {{ cart_total }}</view>
          </view>

          <view class="row-box">
            <view class="row-label">优惠金额</view>
            <view class="right-text">- ¥ {{ reduce }}</view>
          </view>

          <view class="row-box">
            <view class="row-label">配送费</view>
            <view class="right-text"
              >+ ¥ {{ delivery_type == 1 ? 0 : settings.freight }}</view
            >
          </view>
        </view>
      </view>
      <view class="bottom-float-box">
        <view class="left-part">
          <view class="total" v-if="delivery_type == 1">
            合计:¥ {{ filters.toFix2(cart_total - reduce) }}</view
          >
          <view class="total" v-else>
            合计:¥
            {{ filters.toFix2(cart_total - reduce + settings.freight) }}
            <text style="font-size: 12px; padding-left: 10rpx"
              >其中包含配送费:{{ settings.freight }}元</text
            >
          </view>
        </view>
        <view
          class="button"
          :style="'color:#000;background-color:' + button_color"
          @tap="createOrder"
          >确认订单</view
        >
      </view>
    </view>
  </view>
</template>
// 保留小数点后两位
<script module="filters" lang="wxs" src="../../utils/addmul.wxs"></script>

<script>
const app = getApp();
import api from "../../api/api";
import Navigation from "../../components/navigation/navigation";

export default {
  data() {
    return {
      cart_list: [], //商品列表
      cart_total: 0, //商品总价
      userDetails: {}, //用户详情
      remark: "", //备注
      delivery_method: "", //交货方式
      no_use: { name: "不使用优惠券", reduce: 0, satisfy: 0, _id: 0 },
      coupon_list: [],
      picker_value: [], //picker-view默认值
      reduce: 0, //优惠金额
      delivery_type: 0, //交货方式
      settings: {},
      //样式控制
      container_top: 0,
      windowHeight: 0,
      type_width: 0,
      button_color: "SpringGreen",
    };
  },

  components: {
    Navigation,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
    var _this = this;
    _this.settings = app.globalData.store_settings;
    //控制取餐类型样式
    let width = 0;
    if (_this.settings.groupon_method) {
      width += 1;
    }
    if (_this.settings.takeout_method) {
      width += 1;
    }
    if (_this.settings.self_pickup_method) {
      width += 1;
    }
    if (width == 1) {
      _this.type_width = 100;
    }
    if (width == 2) {
      _this.type_width = 50;
    }
    if (width == 3) {
      _this.type_width = 33;
    }
    //导入送货方式配置
    _this.delivery_type = app.globalData.delivery_type;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.container_top =
      app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    this.windowHeight = app.globalData.windowHeight;
    //设置picker-view默认值
    console.log("this.coupon_list:", this.coupon_list);
    this.picker_value = [this.coupon_list.length - 1];
    this.reduce = this.coupon_list[this.coupon_list.length - 1].reduce;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
    var _this = this;
    //读取购物车
    if (app.globalData.cartList.length > 0) {
      _this.cart_list = app.globalData.cartList;
      _this.getTotalPrice();
      _this.coupon_list.push(_this.no_use);
      for (let i = 0; i < app.globalData.coupons.length; i++) {
        if (_this.cart_total >= app.globalData.coupons[i].satisfy) {
          _this.coupon_list.push(app.globalData.coupons[i]);
        }
      }
    } else {
      console.log("购物车是空的...");
      uni.navigateBack({
        delta: 1,
      });
    }
    //读取本地保存的地址缓存
    try {
      var value = uni.getStorageSync("userDetails");
      if (value) {
        console.log("成功获取到地址数据");
        _this.userDetails = value;
      } else {
        console.log("获取地址数据为空");
      }
    } catch (e) {
      console.log("获取地址数据失败");
    }
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
    //切换取货方式
    selectTypeTap(type) {
      if (app.globalData.hasLogin) {
        this.delivery_type = type;
      } else {
        uni.navigateTo({ url: "/pages/personal" });
      }
    },
    bindChange: function (e) {
      const val = e.detail.value;
      //设置picker-view :value值为当前选择项
      this.picker_value = [val[0]];
      //当前优惠金额
      this.reduce = this.coupon_list[val[0]].reduce;
    },
    // 打开地图
    openMap() {
      uni.openLocation({
        latitude: app.globalData.store_location.latitude,
        longitude: app.globalData.store_location.longitude,
        name: app.globalData.store_location.storeName,
        address: app.globalData.store_location.address,
      });
    },
    //创建订单
    createOrder() {
      console.log("createOrder");
      uni.showLoading();
      console.log("提交给服务器并返回订单号");
      if (this.delivery_type == 1) {
        this.delivery_method = "自取";
      } else if (this.delivery_type == 2) {
        this.delivery_method = "外卖";
      } else if (this.delivery_type == 3) {
        this.delivery_method = "团购";
      }
      api
        .post(`order/create_order`, {
          openid: app.globalData.userInfo.openid,
          cart_list: this.cart_list,
          cart_total: this.cart_total,
          coupon: this.coupon_list[this.picker_value],
          userDetails: this.userDetails,
          receiver_lat: app.globalData.store_location.latitude,
          receiver_lng: app.globalData.store_location.longitude,
          remark: this.remark,
          delivery_method: this.delivery_method,
        })
        .then((res) => {
          uni.hideLoading();
          //收到服务器返回的信息
          console.log(res);
          if (res.order_id) {
            //清除本地购物车缓存
            app.globalData.cartList = [];
            app.globalData.orderFinished = true;
            //5.跳转到订单详情
            uni.navigateTo({
              url: `/pages/order-detail/index?id=${res.order_id}`,
            });
          } else {
            uni.showToast({
              title: res.message,
              icon: "none",
              duration: 2000,
            });
          }
        })
        .catch((err) => {
          uni.hideLoading();
          uni.showToast({
            title: err,
            icon: "none",
          });
        });
    },

    // 获取总价
    getTotalPrice: function () {
      var _this = this;

      var list = this.cart_list;
      var cart_total = 0;

      for (let i = 0; i < list.length; i++) {
        cart_total += parseFloat(
          list[i].price * list[i].weight * list[i].number
        );
      }

      cart_total = parseFloat(cart_total.toFixed(2)); //js浮点计算bug，取两位小数精度

      _this.setData({
        cart_total: cart_total,
      });

      console.log("总价已更新:", _this.cart_total);
    },

    // 备注信息
    remarkChange(e) {
      this.remark = e.detail.value;
    },

    // 设置用户名,电话,地址详细
    SetAddress: function (res) {
      var _this = this;
      _this.userDetails = res;
      //写入到本地订单缓存
      uni.setStorage({
        key: "userDetails",
        data: res,
      });
    },
    //从微信获取用户地址详情
    SelectAddress: function () {
      var _this = this;
      uni.getSetting({
        success(res) {
          console.log(
            "res.authSetting['scope.address']:",
            res.authSetting["scope.address"]
          );
          if (res.authSetting["scope.address"]) {
            console.log("已打开地址选择页");
            uni.chooseAddress({
              success(res) {
                console.log(res);
                _this.SetAddress(res);
              },
            });
          } else {
            if (res.authSetting["scope.address"] == false) {
              console.log("打开地址选择页-失败");
              uni.openSetting({
                success(res) {
                  console.log(res.authSetting);
                },
              });
            } else {
              console.log("err");
              uni.chooseAddress({
                success(res) {
                  console.log(res);

                  _this.SetAddress(res);
                },
              });
            }
          }
        },
      });
    },
  },
};
</script>
<style lang="less">
.container {
  background-color: #f3f3f3;
}
.header-container {
  background-color: #fff;
}
.top-float-box {
  position: fixed;
  width: 100%;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  .type {
    width: 100vw;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    background-color: #eee;
    .name {
      height: 100%;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }
    .text {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
  }
  .address-box {
    width: 100vw;
    height: 50px;
    background-color: #fff;
    .add-address {
      width: 100%;
      height: 50px;
      display: flex;
      align-items: center;
      background: url(../../static/create-order/location-off.png) no-repeat
          20rpx center,
        url(../../static/create-order/add.png) no-repeat 95% center;
      background-size: 60rpx auto;
      .title {
        font-size: 36rpx;
        color: #333;
        padding-left: 100rpx;
      }
    }
    .show-address {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      padding-left: 100rpx;
      background: url(../../static/create-order/location.png) no-repeat 20rpx
          center,
        url(../../static/create-order/change.png) no-repeat 95% center;
      background-size: 60rpx auto;
      .name-tel {
        width: 80%;
        font-size: 28rpx;
        color: #000;
        padding-top: 15rpx;
      }
      .addr-text {
        width: 80%;
        font-size: 24rpx;
        color: #888;
        padding-top: 10rpx;
        line-height: 26rpx;
      }
    }
  }
}
.content-box {
  width: 100%;
  padding-bottom: 60px;
  background-color: #eee;
}

.picker-view {
  width: 150px;
  height: 75px;
  padding-right: 30rpx;
  text-align: right;
  color: #000;
  .item {
    line-height: 35px;
  }
}
</style>

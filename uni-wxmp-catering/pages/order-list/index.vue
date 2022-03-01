<template>
  <view>
    <Navigation
      :showIcon="false"
      :showTitle="true"
      title="我的订单"
      :showSearch="false"
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
      <view class="status-box">
        <view
          v-for="(item, index) in statusList"
          :key="index"
          @tap="statusTap"
          :class="'status-label ' + (index == statusIndex ? 'active' : '')"
          :data-index="index"
        >
          {{ item }}
          <view :class="tabClass[index]"></view>
        </view>
      </view>
      <view class="empty" v-if="orderList.length == 0">
        <view class="empty-box">
          <image class="img" src="/static/order-list/no-order.png"></image>
          <view class="txt">暂无订单</view>
        </view>
      </view>
      <scroll-view
        class="order-list"
        v-if="orderList.length > 0"
        scroll-y="true"
        :scroll-top="scrolltop"
      >
        <view v-for="(item, index) in orderList" :key="index" class="a-order">
          <view
            @tap="navToDetail"
            :data-msg="item"
            class="weui-cell weui-cell_access"
            hover-class="weui-cell_active"
          >
            <view class="item-head"> 订单编号: {{ item.order_id }}</view>
            <scroll-view
              v-if="item.goods_list.length > 0"
              class="scroll-box"
              scroll-x="true"
            >
              <view
                v-for="(item2, index2) in item.goods_list"
                :key="index2"
                class="img-box"
              >
                <image
                  mode="aspectFill"
                  :src="item2.image"
                  class="goods-img"
                ></image>
              </view>
            </scroll-view>
            <view class="total-box">
              共 {{ item.goods_list.length }} 件商品 合计:
              <text class="price">¥ {{ item.amount_real }}</text>
            </view>
          </view>

          <view class="goods-info">
            <block
              v-if="
                item.status == '已付款' ||
                item.status == '待接单' ||
                item.status == '已接单' ||
                item.status == '配送中' ||
                item.status == '已完成'
              "
            >
              <view class="goods-des">下单时间: {{ item.pay_time }} </view>
              <view v-if="item.delivery_method == '自取'" class="goods-des"
                >当天自取号:{{ item.today_no }}号
              </view>
              <view v-if="item.delivery_method == '外卖'" class="goods-des"
                >送货时间:一小时左右
              </view>
              <view v-if="item.delivery_method == '团购'" class="goods-des"
                >送货日期:{{ item.pickup_date }}
              </view>
            </block>
            <block v-else>
              <view class="goods-des"
                >创建时间:{{ dateUtil.formatTime(item.create_time) }}</view
              >
              <view class="goods-des">订单状态:{{ item.status }}</view>
              <view v-if="item.status == '已关闭'" class="goods-des"
                >关闭原因:{{ item.log[item.log.length - 1] }}</view
              >
            </block>
          </view>
          <view class="button-box">
            <view
              class="btn"
              :hidden="
                item.status == '待付款' ||
                item.status == '待发货' ||
                item.status == '待收货'
                  ? false
                  : true
              "
              @tap="cancelOrderTap"
              :data-id="item._id"
              >取消订单</view
            >
            <view
              class="btn active"
              :hidden="item.status == '待付款' ? false : true"
              @tap="toPayTap"
              :data-msg="item"
              :data-money="item.amount_real"
              >马上付款</view
            >
          </view>
        </view>
      </scroll-view>
      <view class="safeAreaOldMarginBttom safeAreaNewMarginBttom"></view>
    </view>
    <float-menu></float-menu>
  </view>
</template>
<script lang="wxs"  module="dateUtil" src="../../utils/dateUtil.wxs"></script>
<script>
const app = getApp();
import api from "../../api/api";
import Navigation from "../../components/navigation/navigation";

export default {
  data() {
    return {
      statusList: ["全部订单", "待付款", "待取货", "待收货", "已完成"],
      statusIndex: 0,
      tabClass: ["", "", "", "", ""],
      orderList: [],
      //样式控制
      container_top: 0,
      windowHeight: 0,
    };
  },

  components: {
    Navigation,
  },
  props: {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.updateOrderList("全部订单");
    var tempList = []; //读取购物车列表
    tempList = app.globalData.cartList;

    if (tempList) {
      var totalNum = 0; //遍历订单

      for (var i = 0; i < tempList.length; i++) {
        totalNum += tempList[i].number;
      }
      //更新购物车角标
      if (totalNum > 0) {
        uni.setTabBarBadge({
          index: 0,
          text: String(totalNum),
        });
      } else {
        uni.removeTabBarBadge({
          index: 0,
        });
      }
    }
  },
  onReady: function () {
    this.container_top =
      app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    this.windowHeight = app.globalData.windowHeight;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  methods: {
    navToDetail: function (e) {
      uni.navigateTo({
        url: `/pages/order-detail/index?id=${e.currentTarget.dataset.msg.order_id}`,
      });
    },
    toPayTap: function (e) {
      const _this = this;
      const item = e.currentTarget.dataset.msg;
      console.log("wxpay", item.order_id);
      api
        .post(`order/wxpay`, {
          order_id: item.order_id,
          openid: app.globalData.userInfo.openid,
        })
        .then((res) => {
          console.log("开发者服务器:", res);
          const payargs = res;
          if (res.timeStamp) {
            uni.requestPayment({
              timeStamp: payargs.timeStamp,
              nonceStr: payargs.nonceStr,
              package: payargs.package,
              signType: "MD5",
              paySign: payargs.paySign,
              success: function (res) {
                console.log("success:", res);
                _this.updateOrderList(_this.statusList[_this.statusIndex]);
              },
              fail: function (res) {
                console.log("fail:", res);
              },
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
          uni.showToast({
            title: err,
            icon: "none",
          });
        });
    },
    // 订单列表通用方法
    updateOrderList: function (statusList) {
      var _this = this;
      //先清空订单
      _this.setData({
        orderList: [],
      });
      // 获取订单 有参数
      api
        .post(`order/list`, {
          userInfo: app.globalData.userInfo,
          status: statusList,
        })
        .then((res) => {
          console.log(res);

          if (res.message == "success") {
            res.orderList.reverse();
            //颠倒排序
            _this.setData({
              orderList: res.orderList,
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
    cancelOrderTap: function (e) {
      const order_id = e.currentTarget.dataset.id;
      var _this = this;
      console.log(order_id);
      // 删除订单
      api
        .get(`order/cancel/${order_id}`)
        .then((res) => {
          console.log(res);
          if (res.type == "success") {
            _this.updateOrderList(_this.statusList[_this.statusIndex]);
            uni.showToast({
              title: res.message,
              icon: "none",
              duration: 2000,
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
    //切换要查询列表的状态
    statusTap: function (e) {
      this.statusIndex = e.currentTarget.dataset.index;
      console.log(this.statusIndex);
      this.updateOrderList(this.statusList[this.statusIndex]);
      console.log(this.statusList[this.statusIndex]);
    },
  },
};
</script>
<style lang="less">
.status-box {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  .status-label {
    width: 150rpx;
    height: 100%;
    text-align: center;
    font-size: 14px;
    color: #353535;
    box-sizing: border-box;
    position: relative;
  }
  .status-label.active {
    color: #e64340;
    border-bottom: 6rpx solid #e64340;
  }
}
.container .empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .empty-box {
    width: 120px;
    height: 160px;
    .img {
      width: 120px;
      height: 120px;
    }
    .txt {
      width: 120px;
      text-align: center;
      color: #353535;
    }
  }
}
.order-list {
  width: 100%;
  height: 84%;
  position: fixed;
  top: 108px;
  background-color: #f5f5f5;
  padding-left: 3%;
  .a-order {
    width: 94%;
    background-color: #fff;
    margin-top: 20rpx;
    border-radius: 25rpx;
    .item-head {
      color: #999999;
      padding-left: 3%;
      padding-top: 10px;
    }
    .scroll-box {
      margin-left: 3%;
      display: flex;
      align-items: center;
      width: 94%;
      box-sizing: border-box;
      white-space: nowrap;
      .img-box {
        width: 120rpx;
        height: 120rpx;
        overflow: hidden;
        margin-right: 20rpx;
        background-color: #f7f7f7;
        display: inline-block;
        .goods-img {
          width: 120rpx;
          height: 120rpx;
        }
      }
    }
    .total-box {
      font-size: 26rpx;
      width: 94%;
      padding: 0 3%;
      text-align: right;
      .price {
        font-size: 36rpx;
        color: #e64340;
      }
    }
    .goods-info {
      margin-left: 3%;
      margin-top: 4rpx;
      .goods-des {
        margin-bottom: 4rpx;
        font-size: 26rpx;
        color: #000000;
      }
    }
    .button-box {
      width: 100%;
      display: flex;
      flex-direction: row-reverse;
      padding-bottom: 10rpx;
      padding-right: 20rpx;
      .btn {
        width: 166rpx;
        height: 60rpx;
        box-sizing: border-box;
        text-align: center;
        line-height: 60rpx;
        border: 1rpx solid #ccc;
        border-radius: 6rpx;
        margin-left: 20rpx;
        font-size: 26rpx;
      }
      .active {
        border: 1px solid #e64340;
        color: #e64340;
      }
    }
  }
}
</style>

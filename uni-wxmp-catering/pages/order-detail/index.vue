<template>
  <view>
    <Navigation
      id="Navigation"
      show-icon="true"
      title="订单详情"
      show-title="true"
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
        <view class="order-status">
          <view class="icon-box">
            <image
              v-if="order.status == '已关闭'"
              class="icon"
              src="/static/order-details/已关闭.png"
            ></image>
            <image
              v-else-if="order.status == '待付款'"
              class="icon"
              src="/static/order-details/待付款.png"
            ></image>
            <image
              v-else-if="order.status == '已付款'"
              class="icon"
              src="/static/order-details/待发货.png"
            ></image>
            <image
              v-else-if="order.status == '待收货'"
              class="icon"
              src="/static/order-details/待收货.png"
            ></image>
            <image
              v-else-if="order.status == '已完成'"
              class="icon"
              src="/static/order-details/已完成.png"
            ></image>
          </view>
          <view style="padding-left: 10px">
            <view class="status gray">{{ order.status }}</view>
          </view>
        </view>
        <view class="description" v-if="order.status == '待付款'"
          >剩余支付时间 {{ wxTimerList["wxTimer2"].wxTimer }}</view
        >
        <view
          class="description"
          v-else-if="order.status == '已付款' && order.delivery_method == '自取'"
          >当天自取号:{{ order.today_no }}号</view
        >
        <view
          class="description"
          v-else-if="order.status == '已付款' && order.delivery_method == '团购'"
        >
          商家正在准备商品 发货日期:{{ order.pickup_date }}</view
        >
        <view class="description" v-else>{{ lastLog }}</view>
      </view>
      <view class="goods-list">
        <view class="list-title">订单信息</view>
        <view
          v-for="(item, index) in order.goods_list"
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
          <view class="row-label">订单类型</view>
          <view class="right-text">{{ order.delivery_method }}</view>
        </view>
        <view class="row-box">
          <view class="row-label">订单号</view>
          <view class="right-text">{{ order.order_id }}</view>
        </view>
        <view class="row-box">
          <view class="row-label">创建时间</view>
          <view class="right-text">{{ dateUtil.formatTime(order.create_time)  }}</view>
        </view>
        <view class="row-box" v-if="order.status != '已关闭'">
          <view class="row-label">付款时间</view>
          <view class="right-text">{{ order.pay_time }}</view>
        </view>
        <view v-if="order.status == '已付款'">
          <view class="row-box" v-if="order.delivery_method == '团购'">
            <view class="row-label">送货日期</view>
            <view class="right-text">{{ order.pickup_date }}</view>
          </view>
          <view class="row-box" v-else-if="order.delivery_method == '自取'">
            <view class="row-label">配送方式</view>
            <view class="right-text">
              <view class="location-text"
                >自取
                <text style="padding-left: 10px; color: #0080ff" @tap="openMap"
                  >查看自取点位置</text
                ></view
              >
            </view>
          </view>
          <view class="row-box" v-else-if="order.delivery_method == '外卖'">
            <view class="row-label">收货地址</view>
            <view class="right-text">{{ order.userDetails.detailInfo }}</view>
          </view>
        </view>

        <view class="row-box">
          <view class="row-label">商品总价</view>
          <view class="right-text">¥ {{ order.total_price }}</view>
        </view>
        <view class="row-box">
          <view class="row-label">优惠金额</view>
          <view class="right-text">- ¥ {{ order.reduce }}</view>
        </view>
        <view class="row-box">
          <view class="row-label">运费</view>
          <view class="right-text">+ ¥ {{ order.freight }}</view>
        </view>
        <view class="row-box">
          <view class="row-label">实付金额</view>
          <view class="right-text">¥ {{ order.amount_real }}</view>
        </view>
      </view>
      <view
        class="bottom-float-box"
        v-if="order.status == '待付款' && show_pay_button"
      >
        <view class="left-part">
          <view class="total"
            >合计:¥ {{ order.amount_real }} (含运费{{
              order.freight > 0 ? order.freight : 0
            }}元)</view
          >
        </view>
        <view class="button" @tap="pay">支付</view>
      </view>
      <view class="bottom-float-box" v-if="accept_enable">
        <view class="btn" @tap="GetNewOrderMsg">接收通知</view>

        <view v-if="order.status == '已付款'">
          <view class="left-part" v-if="accepter == ''">
            <view class="total">未接单</view>
          </view>
          <view class="left-part" v-else>
            <view class="total">接单者昵称:{{ accepter }}</view>
          </view>
          <view class="btn acp" @tap="accept" v-if="accepter == ''">
            接单
          </view>
          <view
            class="btn fns"
            @tap="finish"
            v-else-if="order.delivery_method == '自取'"
            >已完成</view
          >
          <view
            class="btn fns"
            @tap="finish"
            v-else-if="
              order.delivery_method == '外卖' && settings.store_self_send
            "
            >已送达</view
          >
          <view
            class="btn fns"
            @tap="finish"
            v-else-if="
              order.delivery_method == '外卖' && !settings.store_self_send
            "
            >已拣货</view
          >
        </view>
      </view>
    </view>
  </view>
</template>
<script lang="wxs"  module="dateUtil" src="../../utils/dateUtil.wxs"></script>
<script lang="wxs" module="filters" src="../../utils/addmul.wxs"></script>

<script>
const app = getApp();
import api from "../../api/api";
import Navigation from "../../components/navigation/navigation";
const timer = app.globalData.timer;
export default {
  data() {
    return {
      //订单id
      order_id: "",
      //计时器对象
      wxTimerList: {},
      wxTimer2: {},
      //订单日志最后一个元素
      lastLog: "",
      //按钮禁用
      show_pay_button: true,
      expireTime: "",
      order: {},
      accept_enable: false,
      accepter: "",
      timer: null, //自动刷新用的定时器
      //样式控制
      container_top: 0,
      windowHeight: 0,
      settings: {},
    };
  },
  beforeDestroy() {
    //自动刷新用的定时器
    clearInterval(this.timer);
    this.timer = null;
  },
  mounted() {
    //自动刷新用的定时器//自动刷新用的定时器
    this.queryInfo();
    this.timer = setInterval(() => {
      setTimeout(this.queryInfo, 0);
    }, 1000);
  },
  components: {
    Navigation,
  },
  props: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this;
    _this.settings = app.globalData.store_settings;
    _this.order_id = options.id;
    _this.getOrderDetail();
  },

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
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.store_settings.storeName,
    };
  },
  methods: {
    // 打开地图
    openMap() {
      var _this = this;
      console.log("openMap");
      uni.openLocation({
        latitude: app.globalData.store_settings.latitude,
        longitude: app.globalData.store_settings.longitude,
        name: app.globalData.store_settings.store_name,
        address: app.globalData.store_settings.address,
      });
    },
    //自动刷新方法
    queryInfo() {
      const _this = this;
      //window.console.log("do something");
      api.get(`order/order_detail/${_this.order_id}`).then((res) => {
        if (res.order.order_id) {
          _this.setData({
            order: res.order,
            lastLog: res.order.log.pop(),
            accepter: res.order.accepter,
          });
        }
      });
    },
    GetNewOrderMsg: function () {
      console.log("订阅模板消息");
      uni.requestSubscribeMessage({
        tmplIds: ["bawImZQ7WHnK50MO-xBcLYpB9Y99xdng7fpYcqzgi6U"],
        success(res) {
          console.log(`订阅消息成功`);
          uni.showToast({
            title: `订阅消息成功`,
            icon: "none",
            duration: 2000,
          });
        },
        fail(res) {
          console.log(res);
          uni.showToast({
            title: `订阅消息失败`,
            icon: "none",
            duration: 2000,
          });
        },
      });
    },
    finish: function () {
      const _this = this;
      console.log("点击完成");
      api
        .post(`order/finish`, {
          order_id: _this.order_id,
          openid: app.globalData.userInfo.openid,
        })
        .then((res) => {
          console.log("开发者服务器:", res);
          if (res.order) {
            _this.setData({
              order: res.order,
              lastLog: res.order.log.pop(),
              accepter: res.order.accepter,
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
    accept: function () {
      const _this = this;
      console.log("点击接单");
      api
        .post(`order/accept`, {
          order_id: _this.order_id,
          openid: app.globalData.userInfo.openid,
        })
        .then((res) => {
          console.log("开发者服务器:", res);
          if (res.order) {
            _this.setData({
              order: res.order,
              lastLog: res.order.log.pop(),
              accepter: res.order.accepter,
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
    pay: function () {
      const _this = this;
      console.log("wxpay");
      api
        .post(`order/wxpay`, {
          order_id: _this.order_id,
          openid: app.globalData.userInfo.openid,
        })
        .then((res) => {
          console.log("开发者服务器:", res);
          if (res.timeStamp) {
            const payargs = res;
            uni.requestPayment({
              timeStamp: payargs.timeStamp,
              nonceStr: payargs.nonceStr,
              package: payargs.package,
              signType: "MD5",
              paySign: payargs.paySign,
              success: function (res) {
                console.log("success:", res);
                _this.getOrderDetail();
                _this.wxTimer2.stop();
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
    // 分秒位数补0
    fill_zero_prefix: function (num) {
      return num < 10 ? "0" + num : num;
    },
    // 获取订单详情
    getOrderDetail: function () {
      const _this = this;
      console.log("获取订单详情");
      api
        .get(`order/order_detail/${_this.order_id}`)
        .then((res) => {
          console.log(res);
          if (res.order.order_id) {
            _this.setData({
              order: res.order,
              lastLog: res.order.log.pop(),
              accepter: res.order.accepter,
            });

            if (res.order.status == "待付款") {
              console.log("设置过期时间");
              let create_time = new Date(res.order.create_time);
              // console.log("1111111:" + create_time.toString());
              let expireTime = create_time.setMinutes(
                create_time.getMinutes() + res.pay_expire
              );
              // console.log("1111111:" + expireTime.toString());
              var nowDate = new Date();
              // console.log("2222222:" + nowDate);
              // console.log("3333333:" + expireTime);
              var stime = Date.parse(new Date(nowDate));
              var etime = Date.parse(new Date(expireTime));
              // console.log("4444444:" + stime);
              // console.log("5555555:" + etime);

              var milli_second = etime - stime; //两个时间戳相差的毫秒数
              // 转换为秒数
              var second = Math.floor(milli_second / 1000);
              // 小时位
              var hr = _this.fill_zero_prefix(Math.floor(second / 3600));
              // 分钟位
              var min = _this.fill_zero_prefix(
                Math.floor((second - hr * 3600) / 60)
              );
              // 秒位
              var sec = _this.fill_zero_prefix(second % 60);
              console.log("初始化倒计时" + hr + ":" + min + ":" + sec);
              _this.wxTimer2 = new timer({
                beginTime: `${hr}:${min}:${sec} `,
                name: "wxTimer2",
                complete: function () {
                  console.log("计时结束回调");
                  _this.order.status = "已关闭",
                  _this.lastLog = '支付超时! 订单已关闭',
                  _this.show_pay_button = false;
                  _this.wxTimer2.stop();
                },
              });
              _this.wxTimer2.start(this);
            }
          } else {
            uni.showToast({
              title: res.message,
              icon: "none",
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
  },
};
</script>
<style lang="less">
.status-box {
  background-color: #fff;
  margin-top: 20rpx;
  padding-top: 30rpx;
}

.status-box .order-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 20px;
}
.status-box .description {
  margin-top: 20rpx;
  width: 100%;
  height: 60rpx;
  text-align: center;
  font-size: 14px;
}
.order-status .icon-box {
  width: 20px;
  height: 20px;
  overflow: hidden;
}

.order-status .icon-box .icon {
  width: 20px;
  height: 20px;
}

.bottom-float-box .btn {
  width: 250rpx;
  text-align: center;
  height: 100%;
  line-height: 100rpx;
  background-color: #fff;
  font-size: 32rpx;
  color: #303030;
}
.bottom-float-box .fns {
  background-color: #67c23a;
  color: #ffffff;
}
</style>

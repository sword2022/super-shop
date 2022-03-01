<template>
  <view>
    <Navigation
      :showIcon="false"
      :showTitle="true"
      title="我的信息"
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
      <!-- 头像 -->
      <view class="userinfo">
        <block v-if="hasUserInfo === false">
          <button type="primary" @tap="getUserProfile">授权头像昵称</button>
        </block>
        <block v-if="hasUserInfo === true">
          <image class="userinfo-avatar" :src="userInfo.avatar"></image>
          <text class="userinfo-nickname">{{ userInfo.nick_name }}</text>
          <button
            class="userinfo-btn"
            type="text"
            size="mini"
            @tap="getUserProfile"
          >
            重新授权
          </button>
        </block>
      </view>
      <!-- 功能列表 -->
      <view class="listview">
        <view class="item">
          <image class="hd" src="/static/personal/user.png"></image>
          <navigator
            class="bd"
            url="../../pages/login/index"
            open-type="navigate"
            hover-class="none"
            >个人资料
          </navigator>
          <view class="ft"></view>
        </view>
        <view class="item" @tap="SelectAddress">
          <image class="hd" src="/static/personal/region.png"></image>
          收货地址
          <view class="ft"></view>
        </view>
        <view class="item" @tap="openCouponList">
          <image class="hd" src="/static/personal/coupons.png"></image>
          我的购物券
          <view class="ft"></view>
        </view>
        <view class="item" @tap="callPhone">
          <image class="hd" src="/static/personal/call.png"></image>
          联系客服
          <view class="ft"></view>
        </view>
        <view
          class="item"
          v-if="showEmployeeInterface === true"
          @tap="GetNewOrderMsg"
        >
          <image class="hd" src="/static/personal/message.png"></image>
          员工接收新订单通知
          <view class="ft"></view>
        </view>
      </view>
      <view class="page-foot">
        <view class="foot" @tap="logoClick">
          <image src="/static/personal/empty_goods.png"></image>
          <text>乐佳超市</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const app = getApp();
import api from "../../api/api";
import Navigation from "../../components/navigation/navigation";

export default {
  data() {
    return {
      hasUserInfo: false,
      name: "",
      phone: "",
      address: {},
      storeTelephone: "",
      userInfo: {},
      showEmployeeInterface: false,
      //样式控制
      container_top: 0,
      windowHeight: 0,
    };
  },

  components: {
    Navigation,
  },

  props: {},

  onLoad: function () {
    var _this = this;
    console.log("从开发者服务器获取头像和名称");
    api
      .get(`wx_user/userinfo/${app.globalData.userInfo.openid}`)
      .then((res) => {
        console.log(res);
        uni.showToast({
          title: res.message,
          icon: "none",
          duration: 3000,
        });
        if (res.wx_user.avatar) {
          _this.setData({
            storeTelephone: app.globalData.storeTelephone,
            userInfo: {
              avatar: res.wx_user.avatar,
              nick_name: res.wx_user.nick_name,
            },
            hasUserInfo: true,
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: app.globalData.storeName,
    };
  },
  onReady: function () {
    this.container_top =
      app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    this.windowHeight = app.globalData.windowHeight;
  },
  methods: {
    logoClick() {
      this.setData({
        showEmployeeInterface: true,
      });
    },
    GetNewOrderMsg: function () {
      console.log("订阅模板消息");
      if (this.userInfo.nick_name) {
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
      } else {
        uni.showToast({
          title: "请先授权头像昵称,才能接收订阅信息",
          icon: "none",
          duration: 2000,
        });
      }
    },
    // 设置用户名,电话,地址详细
    SetAddress: function (res) {
      var _this = this;

      _this.setData({
        name: res.userName,
        phone: res.telNumber,
        address: {
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo,
        },
      });
      //写入到本地订单缓存
      uni.setStorage({
        key: "Address",
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
    openCouponList() {
      uni.navigateTo({
        url: "/pages/coupon-list/index",
      });
    },
    getUserProfile(e) {
      var _this = this;
      console.log("getUserProfile");
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: "用于完善会员资料", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log("res.userInfo:", res.userInfo);
          app.globalData.userInfo.avatar = res.userInfo.avatarUrl;
          app.globalData.userInfo.nick_name = res.userInfo.nickName;
          api
            .put(`wx_user/update`, {
              userInfo: app.globalData.userInfo,
            })
            .then((res) => {
              console.log(res);
              uni.showToast({
                title: res.message,
                icon: "none",
                duration: 3000,
              });
              if (res.wx_user.nick_name) {
                _this.setData({
                  userInfo: {
                    avatar: res.wx_user.avatar,
                    nick_name: res.wx_user.nick_name,
                  },
                  hasUserInfo: true,
                });
                app.globalData.hasLogin = true;
              }
            })
            .catch((err) => {
              uni.showToast({
                title: err,
                icon: "none",
              });
            });
          // _this.setData({
          //   userInfo: res.userInfo,
          //   hasUserInfo: true
          // })
        },
      });
    },

    // 呼叫此号码
    callPhone() {
      console.log("callPhone");
      uni.makePhoneCall({
        phoneNumber: this.storeTelephone,
      });
    },
  },
};
</script>
<style>
/* page {
  width: 100vw;
  height: 88vh;
}

.container {
  height: 100%;
} */

.userinfo {
  padding: 10px 0;
  display: flex;
  align-items: center;
  background-color: #fff;
}

/*.个人信息*/
.userinfo-avatar {
  border-radius: 128rpx;
  width: 128rpx;
  height: 128rpx;
  margin: 0 40rpx;
  background-color: coral;
}

.userinfo-nickname {
  font-size: 38rpx;
}

.userinfo-btn {
  background-color: rgb(231, 231, 231);
  color: rgb(165, 165, 165);
}

/*通用列表*/
.listview {
  /* margin-top: 10px; */
  border-top: 1px solid #eee;
}

/*列表项*/
.listview .item {
  background: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  margin-left: 0;
  height: 50px;
  border-bottom: 1px solid #eee;
}

/*箭头*/
.listview .item:after {
  content: " ";
  height: 8px;
  width: 8px;
  border-width: 2px 2px 0 0;
  border-color: #ccc;
  border-style: solid;
  transform: rotate(45deg);
  position: absolute;
  margin-top: -4px;
  top: 50%;
  right: 22px;
}

.listview .item .hd {
  width: 25px;
  height: 25px;
  margin: 5px 0;
  padding: 0 10px 0 20px;
}

.listview .item .bd {
  font-size: 16px;
  flex: 1;
}

.page-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.foot {
  margin-top: 40rpx;
  display: flex;
}

.foot image {
  width: 32px;
  height: 32px;
}

.foot text {
  height: 32px;
  line-height: 32px;
  color: #d3d3d3;
  font-size: 32rpx;
  font-weight: bold;
}
</style>

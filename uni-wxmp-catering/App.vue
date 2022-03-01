<script>
export default {
  onLaunch: function () {
    console.log("App Launch");
    var _this = this;
    uni.login({
      success: (res) => {
        uni.request({
          url: `${_this.globalData.host}wx_user/openid`,
          method: "POST",
          data: {
            code: res.code,
          },
          success(res) {
            console.log("通过openid获取用户身份信息:", res.data);
            _this.globalData.userInfo.openid = res.data.openid;
            _this.globalData.coupons = res.data.coupons;
            if (res.data.nick_name) {
              _this.globalData.hasLogin = true;
            }
          },
        });
      },
    });
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  globalData: {
    isStrInArray: function (item, arr) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == item) {
          return true;
        }
      }

      return false;
    },
    orderFinished:false,
    store_settings: {},
    hasLogin: false,
    host: "https://www123456789.qicp.vip/api/miniprogram/",
    userInfo: {},
    store_location: {},
    cartList: [],
    createOrderParam: {},
    enabledCreate: false, //允许创建订单
    activeCategoryId: "", //当前跳转分类的id
    timer: require("utils/wxTimer.js"),
    pickup_date: "",
    coupons: [],
  },
};
</script>

<style lang="less">

/*每个页面公共css */
.container {
  height: 100%;
  width: 100%;
}
// 导航栏
.header {
  display: flex;
  align-items: center;
  top: 0;
  position: fixed;
  width: 100%;
  height: 44px;
  background-color: white;
  z-index: 9999;
}

.header .back {
  height: 32rpx;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header .back {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 80rpx;
  height: 56rpx;
}

.header .back .image {
  width: 32rpx;
  height: 32rpx;
  background: transparent;
  vertical-align: top;
}

.header .header-title {
  position: absolute;
  left: 50%;
  font-size: 38rpx;
  transform: translateX(-50%);
}

.header .search-box {
  border-radius: 25px;
  height: 32px;
  width: 64%;
  background: #ddd;
  margin-left: 10px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.header .search-box .text {
  height: 30px;
  line-height: 30px;
  color: #333;
  font-size: 16px;
  margin-left: 8px;
}

.header .search-box .image {
  height: 18px;
  width: 18px;
  margin-left: 12px;
}


/* 商品列表 */
.goods-list {
  width: 92%;
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
  .list-title {
    font-size: 28rpx;
    color: #000;
    padding: 10rpx 0 5rpx 0;
  }

  .goods-item {
    width: 100%;
    display: flex;
    border-top: 1px solid #eee;
    padding: 5rpx 0;
    .img-box {
      width: 120rpx;
      height: 120rpx;
      margin-right: 30rpx;
      background-color: #d8d8d8;
      .img {
        width: 120rpx;
        height: 120rpx;
      }
    }
    .text-box {
      width: 100%;
      box-sizing: border-box;
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .goods-name {
          width: 360rpx;
          font-size: 26rpx;
          color: #000;
          line-height: 1.6;
          overflow: hidden;
        }
        .goods-price {
          font-size: 26rpx;
          color: #000;
          align-self: flex-start;
        }
        .goods-label {
          font-size: 26rpx;
          color: #999;
        }
        .goods-num {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }
}
//订单信息
.order-info {
  width: 100%;
  background-color: #fff;
  padding-bottom: 24rpx;
  .row-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 24rpx 30rpx 12rpx 30rpx;
    font-size: 14px;
    color: #000;
    .right-text {
      text-align: right;
    }
  }
}

/* 底部浮动栏 */
.bottom-float-box {
  display: flex;
  justify-content: left;
  width: 100%;
  height: 100rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  border-bottom: 1px solid #f5f5f5;
  background-color: #fff;
  z-index: 999999;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-float-box .button {
  width: 250rpx;
  text-align: center;
  line-height: 100rpx;
  background-color: #00ff7f;
  font-size: 32rpx;
  color: #000;
}

.bottom-float-box .left-part {
  display: flex;
  justify-content: left;
  width: 510rpx;
  padding-left: 30rpx;
  line-height: 100rpx;
  font-size: 35rpx;
}

.bottom-float-box .left-part .total {
  color: #d31f28;
}
</style>

<template>
  <view>
    <!-- 自定义导航栏 -->
    <Navigation
      :showIcon="false"
      :showTitle="false"
      :title="settings.store_name"
      :showSearch="true"
    ></Navigation>
    <!-- 弹框子组件 -->
    <Dialog :Visible="showPopup"></Dialog>
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
      <view class="store-info">
        <view class="left">
          <view class="title">{{ settings.store_name }}</view>
          <view v-if="distance" class="address"
            >距离您
            {{
              distance / 1000 > 1 ? distance / 1000 + "千米" : distance + "米"
            }}</view
          >
          <view v-else class="address">{{ settings.address }}</view>
        </view>
        <view class="right">
          <view class="type-box">
            <view class="type" :style="'width:' + type_width + 'rpx;'">
              <view
                v-if="settings.self_pickup_method"
                @click="selectTypeTap(1)"
                :class="delivery_type === 1 ? 'name' : 'text'"
                :style="
                  delivery_type === 1
                    ? 'color:#000;background-color:' + button_color
                    : ''
                "
                >自取</view
              >
              <view
                v-if="settings.takeout_method"
                @click="selectTypeTap(2)"
                :class="delivery_type === 2 ? 'name' : 'text'"
                :style="
                  delivery_type === 2
                    ? 'color:#000;background-color:' + button_color
                    : ''
                "
                >外卖</view
              >
              <view
                v-if="settings.groupon_method"
                @click="selectTypeTap(3)"
                :class="delivery_type === 3 ? 'name' : 'text'"
                :style="
                  delivery_type === 3
                    ? 'color:#000;background-color:' + button_color
                    : ''
                "
                >团购</view
              >
            </view>
          </view>
          <view class="more" @click="infoShow = !infoShow">
            {{ infoShow ? "收起店铺信息" : "查看更多店铺信息" }}
            <icon
              :type="infoShow ? 'up' : 'down'"
              size="15"
              color="#999"
            ></icon>
          </view>
        </view>
      </view>

      <view v-if="infoShow" class="showPopBox" style="z-index: 899">
        <view class="bg" @click="infoShow = false"></view>
        <view class="infoContent">
          <view v-if="settings.address" class="label">
            <view class="title">店铺地址</view>
            <view class="text">
              <text>{{ settings.address }}</text>
            </view>
          </view>
          <view v-if="settings.opening_times.length > 0" class="label">
            <view class="title">营业时间</view>
            <view v-if="settings.opening_times[0]" class="text">
              <text
                >{{ settings.opening_times[0].startTime }}-{{
                  settings.opening_times[0].endTime
                }}</text
              >
            </view>
            <view v-if="settings.opening_times[1]" class="text">
              <text
                >{{ settings.opening_times[1].startTime }}-{{
                  settings.opening_times[1].endTime
                }}</text
              >
            </view>
            <view v-if="settings.opening_times[2]" class="text">
              <text
                >{{ settings.opening_times[2].startTime }}-{{
                  settings.opening_times[2].endTime
                }}</text
              >
            </view>
          </view>
          <view v-if="settings.licence_list.length > 0" class="label">
            <view class="title">店铺展示</view>
            <view class="images">
              <view
                class="image"
                v-for="(item, index) in settings.licence_list"
                :key="index"
                @click="previewImage(index)"
              >
                <image mode="aspectFill" :src="item.pics" lazy-load></image>
                <view
                  v-if="item.title"
                  class="text"
                  :style="'color:' + template.color.color3"
                  >{{ item.title }}</view
                >
              </view>
            </view>
          </view>
        </view>
      </view>

      <view
        class="content-box"
        :style="'height:' + (windowHeight - (container_top + 66 + 70)) + 'px;'"
      >
        <!-- 父类 -->
        <scroll-view
          class="parent-category"
          scroll-y="true"
          scroll-with-animation="true"
        >
          <view
            v-for="(item, index) in parent_list"
            :key="index"
            class="type-box"
            @tap="tabParent"
            :id="item._id"
          >
            <view
              class="type-navbar-item"
              :style="
                activeParentId == item._id
                  ? 'background-color:' + button_color + ';'
                  : ''
              "
              >{{ item.name }}</view
            >
          </view>
        </scroll-view>
        <!-- 子类 -->
        <scroll-view
          v-if="child_list.length > 1"
          class="child-category"
          scroll-x
          scroll-with-animation
        >
          <view
            v-for="(item, index) in child_list"
            :key="index"
            class="type-box"
            @tap="tabChild"
            :id="item._id"
          >
            <view
              class="type-navbar-item"
              :style="
                activeChildId == item._id
                  ? 'background-color:' + button_color + ';'
                  : ''
              "
              >{{ item.name }}</view
            >
          </view>
        </scroll-view>

        <!-- 商品 -->
        <scroll-view
          class="goods-container"
          scroll-y="true"
          :scroll-top="scrolltop"
        >
          <view v-if="goods_list.length == 0" class="no-data">
            <view class="line"></view>
            <view class="txt">暂无商品</view>
            <view class="line"></view>
          </view>
          <view
            v-for="(item, index) in goods_list"
            :key="index"
            class="item"
            :data-id="item._id"
            @tap="toDetailsTap"
          >
            <image class="pic" mode="aspectFill" :src="item.image"></image>
            <view class="info">
              <view class="name">{{ item.name }}</view>

              <view class="middle-box">
                <text class="price"
                  >¥{{ filters.toFix2(item.price * item.weight) }}</text
                >
                <text class="line-price"
                  >¥{{ filters.toFix2(item.line_price * item.weight) }}</text
                >
                <icon
                  type="jia"
                  @click="clickIncreaseOrDecrease(item, 'increase')"
                  size="26"
                  :color="
                    item.number >= item.inventory ? '#cccccc' : button_color
                  "
                ></icon>
              </view>
              <view class="soldInfo">
                <view class="good-sales-box">
                  <text class="number">已售{{ item.sales }}件</text>
                  <text class="score">库存{{ item.inventory }}个</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view
        v-if="settings.opening"
        class="footer"
        :style="'background-color:' + button_color"
      >
        <view class="left">
          <view class="cart-box">
            <view
              class="cart"
              @click="cartList.length > 0 ? (cartShow = !cartShow) : 0"
            >
              <img src="/static/public/order.png" />
              <text v-if="cartNumber > 0">{{ cartNumber }}</text>
            </view>
          </view>
          <view class="center">
            <view class="price-box">
              <view class="price">¥{{ cartTotal }}</view>
              <view class="line-price">¥{{ cartLineTotal }}</view>
            </view>
            <view v-if="delivery_type == 1" class="more"
              >下单后请按取餐号取餐</view
            >
            <view v-else-if="delivery_type == 2" class="more"
              >预计需要支付配送费 {{ settings.freight }}元</view
            >
            <view v-else-if="delivery_type == 3" class="more"
              >配送日期 {{ settings.pickup_date }}</view
            >
          </view>
        </view>
        <view class="right">
          <block v-if="delivery_type === 1">
            <view v-if="cartNumber > 0" class="button" @click="clickToPay()"
              >去结算</view
            >
            <view v-else class="button none">去结算</view>
          </block>
          <block v-if="delivery_type === 2">
            <view
              v-if="cartTotal >= settings.minimum_fee"
              class="button"
              @click="clickToPay()"
              >去结算</view
            >
            <view v-else class="button none"
              >{{ settings.minimum_fee }}元起送</view
            >
          </block>
          <block v-if="delivery_type === 3">
            <view
              v-if="cartTotal >= settings.minimum_fee"
              class="button"
              @click="clickToPay()"
              >去结算</view
            >
            <view v-else class="button none">
              {{ settings.minimum_fee }}元起送</view
            >
          </block>
        </view>
      </view>
      <view
        v-if="!settings.opening"
        class="footer"
        :style="'overflow: hidden;background-color:' + button_color"
      >
        <view class="label"
          >本店已休息，营业时间:{{ settings.opening_times[0].startTime }}</view
        >
      </view>
      <view
        v-if="cartShow && cartList.length > 0"
        class="showPopBox"
        style="z-index: 898"
      >
        <view class="bg" @click="cartShow = false"></view>
        <view class="showContent">
          <view class="sheade">
            <view class="left">
              <view class="text">共{{ cartNumber }}件商品</view>
            </view>
            <view class="right">
              <view class="text" @click="clearCart()"
                ><icon type="shanchu" size="14"></icon> 清空购物车</view
              >
            </view>
          </view>
          <view class="sconten">
            <view
              class="goods"
              v-for="(item, index) in cartList"
              :key="index"
              :style="
                cartList.length == index + 1 ? 'border-bottom: none;' : ''
              "
            >
              <view class="left">
                <view class="title">{{ item.name }}</view>
                <view class="label" v-if="item.name"></view>
              </view>
              <view class="right">
                <view class="price">¥{{ item.price * item.weight }}</view>
                <view class="buy">
                  <block v-if="item.enable_sale">
                    <block v-if="item.inventory > 0">
                      <icon
                        type="jian"
                        @click="clickIncreaseOrDecrease(item, 'decrease')"
                        size="23"
                        :color="item.number == 0 ? '#cccccc' : button_color"
                      ></icon>
                      <input type="number" :value="item.number" disabled />
                      <icon
                        type="jia"
                        @click="clickIncreaseOrDecrease(item, 'increase')"
                        size="23"
                        :color="
                          item.number >= item.inventory
                            ? '#cccccc'
                            : button_color
                        "
                      ></icon>
                    </block>
                    <block v-else>
                      <text>商品已售罄</text>
                    </block>
                  </block>
                  <block v-else>
                    <text>商品已下架</text>
                  </block>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- <view class="bottom-lin"></view> -->
  </view>
</template>

<script module="filters" lang="wxs" src="../../utils/addmul.wxs"></script>

<script>
const app = getApp();
import api from "../../api/api";
// 引入子组件
import Dialog from "../../components/dialog/dialog";
import Navigation from "../../components/navigation/navigation";
import Icon from "@/components/icon/icon.vue";
export default {
  data() {
    return {
      category_list: [],
      goods_list: [],
      activeParentId: "",
      activeChildId: "",
      parent_list: [],
      child_list: [],
      // 控制弹窗的显示与隐藏
      showPopup: false,
      settings: {},
      opening: false,
      opening_times: [],
      // groupon_method: "",
      distance: 0,
      infoShow: false,
      cartList: [],
      cartShow: false,
      cartNumber: 0,
      cartTotal: 0,
      cartLineTotal: 0,
      //取货方式
      self_pickup_method: false,
      takeout_method: false,
      groupon_method: false,
      delivery_type: 1,
      //样式控制
      container_top: 0,
      windowHeight: 0,
      type_width: 0,
      button_color: "SpringGreen",
    };
  },

  components: {
    Navigation,
    Dialog,
    Icon,
  },
  props: {},
  watch: {
    showPopup(oldVal, newVal) {
      console.log("watch--showPopup--changed");
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;

    //获取店铺设置
    api
      .get(`setting/index`)
      .then((res) => {
        console.log(res);

        _this.setData({
          settings: res.settings,
          store_name: res.settings.store_name,
          opening: res.settings.opening,
          opening_times: res.settings.opening_times,
          groupon_method: res.settings.groupon_method,
        });
        //控制取餐类型样式
        if (res.settings.groupon_method) {
          this.type_width += 90;
          this.delivery_type = 3;
        }
        if (res.settings.takeout_method) {
          this.type_width += 90;
          this.delivery_type = 2;
        }
        if (res.settings.self_pickup_method) {
          this.type_width += 90;
          this.delivery_type = 1;
        }
        app.globalData.store_settings = res.settings;
        app.globalData.store_location = {
          latitude: res.settings.latitude,
          longitude: res.settings.longitude,
        };
        //获取距离
        _this.getLocation();
      })
      .catch((err) => {
        uni.showToast({
          title: err,
          icon: "none",
        });
      });

    //获取分类和商品列表
    api
      .get(`category/list`)
      .then((res) => {
        console.log(res); //一级二级分组

        var parent_list = [];
        var child_list = [];

        for (var i = 0; i < res.length; i++) {
          if (res[i].parent) {
            if (res[i].parent._id == res[0]._id) {
              child_list.push(res[i]);
            }
          } else {
            parent_list.push(res[i]);
          }
        }

        _this.setData({
          category_list: res,
          activeParentId: res[0]._id,
          parent_list: parent_list,
          child_list: child_list,
        });

        if (!app.globalData.activeCategoryId) {
          app.globalData.activeCategoryId = _this.activeParentId;
        }

        console.log("分类页数据获取成功");

        _this.toActiveCategories();
        
        
      })
      .catch((err) => {
        uni.showToast({
          title: err,
          icon: "none",
        });
      });
    //异步监视变量值
    const asyncFunc = async () => {
      for (let i = 0; i < 10; i++) {
        //如果用户的优惠券已下载则显示可用券弹窗
        if (app.globalData.coupons.length > 0) {
          console.log("showPopup");
          _this.showPopup = app.globalData.store_settings.showPopup;
          i = 10;
        }
        //异步中要用Promise调用setTimeout实现延迟
        await (() => {
          return new Promise((res) => {
            setTimeout(res, 1000);
          });
        })();
      }
    };
    asyncFunc();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      container_top:
        app.globalData.statusBarHeight + app.globalData.titleBarHeight,
      windowHeight: app.globalData.windowHeight,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.orderFinished) {
      //订单完成后重新打开本页清空购物车数据
      app.globalData.orderFinished = false;
      this.clearCart();
    } else {
      //从搜索切换至本页面后需要更新的数据
      //加入购物车列表
      this.cartList = app.globalData.cartList;
      //设置缺货商品按钮为灰色
      let cartList = this.cartList;
      let goods_list = this.goods_list;
      for (var i = 0; i < goods_list.length; i++) {
        for (var k = 0; k < cartList.length; k++) {
          if (goods_list[i]._id == cartList[k]._id) {
            goods_list[i].number = cartList[k].number;
          }
        }
      }
      this.goods_list = goods_list;
      this.getCartTotal();
    }
    //更新购物车角标
    uni.removeTabBarBadge({
      index: 0,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.activeCategoryId = "";
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
    //点击结算
    clickToPay() {
      uni.showLoading();
      var _this = this;
      var list = _this.cartList;
      app.globalData.delivery_type = _this.delivery_type;
      //是否已登录
      if (!app.globalData.hasLogin) {
        uni.hideLoading();
        uni.showToast({
          title: `请点击右下角“个人”授权头像昵称后重试！`,
          icon: "none",
          duration: 2000,
        });
        return;
      }
      // 检查配送距离
      if (_this.distance > _this.settings.max_distance) {
        uni.hideLoading();
        uni.showToast({
          title: `距离店铺太远，配送距离超过${_this.settings.max_distance}米，下单失败！`,
          icon: "none",
          duration: 2000,
        });
        return;
      }
      // 检查商品数量大于0并小于11的
      for (let i = 0; i < list.length; i++) {
        if (list[i].number < 0 || list[i].number > 10) {
          uni.hideLoading();
          uni.showToast({
            title: `购买商品数量不是正常范围，下单失败！`,
            icon: "none",
            duration: 2000,
          });
          return;
        }
      }

      // 检查如果未选购任何商品
      if (list.length == 0) {
        uni.hideLoading();
        uni.showToast({
          title: "未选购任何商品，下单失败！",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      // 连接服务器检查商品库存 价格 运费 优惠卷
      console.log("检查商品库存 价格 运费 优惠卷");
      api
        .post(`order/cart_check`, {
          cart_list: _this.cartList,
          cart_total: _this.cartTotal,
        })
        .then((res) => {
          uni.hideLoading();
          console.log(res);
          if (res.msg == "success") {
            // 跳转到创建订单页
            uni.navigateTo({
              url: "/pages/create-order/index",
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
    //清空购物车
    clearCart: function () {
      app.globalData.cartList = [];
      this.cartList = [];
      this.cartTotal = 0;
      this.cartNumber = 0;
      this.cartLineTotal = 0;
      this.cartShow = false;
      let goods_list = this.goods_list;
      for (var i = 0; i < goods_list.length; i++) {
        goods_list[i].number = 0;
      }
      this.goods_list = goods_list;
    },
    //切换取货方式
    selectTypeTap(type) {
      this.delivery_type = type;
    },
    // 获取总数和总价
    getCartTotal: function () {
      console.log("获取总数和总价");
      var _this = this;
      var list = this.cartList;
      var cartNumber = 0;
      var cartTotal = 0;
      var cartLineTotal = 0;
      var item;

      for (let i = 0; i < list.length; i++) {
        item = list[i];
        cartNumber += item.number;
        cartTotal += parseFloat(item.price * item.weight) * item.number;
        cartLineTotal +=
          parseFloat(item.line_price * item.weight) * item.number;
      }

      cartTotal = parseFloat(cartTotal.toFixed(2)); //js浮点计算bug，取两位小数精度
      cartLineTotal = parseFloat(cartLineTotal.toFixed(2)); //js浮点计算bug，取两位小数精度

      _this.cartNumber = cartNumber;
      _this.cartTotal = cartTotal;
      _this.cartLineTotal = cartLineTotal;

      if (cartNumber < 1) {
        console.log("关闭订单弹出层");
        this.cartShow = false;
      }
      console.log("总数和总价已更新");
    },
    //计算两坐标点之间的距离
    getDistance: function (lat1, lng1, lat2, lng2) {
      lat1 = lat1 || 0;
      lng1 = lng1 || 0;
      lat2 = lat2 || 0;
      lng2 = lng2 || 0;
      var rad1 = (lat1 * Math.PI) / 180.0;
      var rad2 = (lat2 * Math.PI) / 180.0;
      var a = rad1 - rad2;
      var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
      var r = 6378137;
      return (
        r *
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(a / 2), 2) +
              Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)
          )
        )
      ).toFixed(0);
    },
    getShopDistance() {
      var d = this.getDistance(
        app.globalData.store_location.latitude,
        app.globalData.store_location.longitude,
        app.globalData.location.latitude,
        app.globalData.location.longitude
      );
      this.distance = d;
      app.globalData.enabledCreate = true;
      if (Number(d) > this.settings.max_distance) {
        app.globalData.enabledCreate = false;
        uni.showModal({
          title: "提示",
          content: "您所在的位置已超出配送范围",
          confirmText: "明白",
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log("用户点击确定");
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      }
    },
    getLocation() {
      var _this = this;
      // 获取位置和距离
      uni.getLocation({
        success(res) {
          app.globalData.location = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
          _this.getShopDistance();
        },
        fail(res) {
          app.globalData.enabledCreate = false;
          uni.showModal({
            title: "提示",
            content: "您未同意授权位置程序将无法正常使用",
            confirmText: "明白",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log("用户点击确定");
              } else if (res.cancel) {
                console.log("用户点击取消");
              }
            },
          });
        },
      });
    },
    //修改商品列表的商品数量和订单一致
    buttonColorSet: function () {
      console.log("按钮颜色设置");
      let cartList = this.cartList;
      let goods_list = this.goods_list;
      for (var i = 0; i < goods_list.length; i++) {
        goods_list[i].number = 0;
        for (var k = 0; k < cartList.length; k++) {
          if (goods_list[i]._id == cartList[k]._id) {
            goods_list[i].number = cartList[k].number;
          }
        }
      }
      this.goods_list = goods_list;
    },
    //点击增加或减少
    clickIncreaseOrDecrease: function (object, type) {
      var _this = this;
      let _value = this.editCart(object, type, _this.cartList);
      _this.cartList = _value ? _value : _this.cartList;
      app.globalData.cartList = _this.cartList;
      this.getCartTotal();
    },
    // 点击商品事件
    toDetailsTap: function (e) {},
    //点击子类事件
    tabChild: function (e) {
      this.fetchChild(e.currentTarget.id);
    },
    //获取子类商品列表
    fetchChild: function (categoryId) {
      this.activeChildId = categoryId;
      var category_list = this.category_list;
      var child_list = [];
      for (var i = 0; i < category_list.length; i++) {
        if (category_list[i].parent) {
          if (category_list[i].parent._id == categoryId) {
            child_list.push(category_list[i]);
          }
        }
      }
      child_list.push({
        _id: categoryId,
      });
      this.getGoodsList(child_list);
    },
    // 点击父类事件
    tabParent: function (e) {
      this.fetchParent(e.currentTarget.id);
    },
    //父类商品列表刷新方法
    fetchParent: function (categoryId) {
      //更新二级类菜单
      var category_list = this.category_list;
      var child_list = [];
      //将父类放入类表
      child_list.push({
        _id: categoryId,
        name: "全部",
      });
      for (var i = 0; i < category_list.length; i++) {
        if (category_list[i].parent) {
          if (category_list[i].parent._id == categoryId) {
            child_list.push(category_list[i]);
          }
        }
      }

      this.setData({
        activeParentId: categoryId,
        activeChildId: "",
        child_list: child_list,
      });

      // console.log("child_list.length:" + child_list.length);
      this.getGoodsList(child_list);
    },

    /**
     * 获取商品列表
     */
    getGoodsList: function (categorys) {
      console.log(categorys);
      api
        .post(`goods/assign_list/${1}/${100}`, {
          category_list: categorys,
        })
        .then((res) => {
          this.setData({
            goods_list: res,
          });
          //刷新商品后需要设置缺货商品按钮为灰色
          this.buttonColorSet();
        })
        .catch((err) => {
          uni.showToast({
            title: err,
            icon: "none",
          });
        });
    },
    toActiveCategories: function () {
      var _this = this;
      if (app.globalData.activeCategoryId) {
        console.log("跳转到激活的商品分类");
        var category_list = _this.category_list;
        var parent_list = _this.parent_list;
        for (var i = 0; i < parent_list.length; i++) {
          if (parent_list[i]._id == app.globalData.activeCategoryId) {
            console.log("属于父类:" + category_list[i].name);
            _this.setData({
              activeParentId: parent_list[i]._id,
            });
            _this.fetchParent(app.globalData.activeCategoryId);
            return;
          }
        }
        //更新子类菜单
        var child_list = [];
        var parent = {};
        for (var i = 0; i < category_list.length; i++) {
          if (category_list[i]._id == app.globalData.activeCategoryId) {
            parent = category_list[i].parent;
            break;
          }
        }

        for (var j = 0; j < category_list.length; j++) {
          if (category_list[j].parent) {
            if (category_list[j].parent._id == parent._id) {
              console.log(category_list[j].name);
              child_list.push(category_list[j]);
            }
          }
        }

        for (var i = 0; i < category_list.length; i++) {
          if (category_list[i]._id == app.globalData.activeCategoryId) {
            console.log(
              "子类:" +
                category_list[i].name +
                " 属于:" +
                category_list[i].parent.name
            );

            _this.setData({
              activeParentId: category_list[i].parent._id,
              activeChildId: category_list[i]._id,
              child_list: child_list,
            });

            _this.fetchChild(category_list[i]._id);

            return;
          }
        }
        console.log("未搜索到当前激活的分类ID");
      }
    },
  },
};
</script>
<style lang="less">
.store-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 66px;

  .left {
    flex: 0 0 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
      width: auto;
      color: #343434;
      font-size: 16px;
      font-weight: bold;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .address {
      width: auto;
      color: #999;
      font-size: 12px;
      padding-top: 6rpx;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .right {
    flex: 0 0 45%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    .type-box {
      .type {
        display: flex;
        height: 60rpx;
        border-radius: 100rpx;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        background-color: #bbbbbb;
        .name {
          color: #fff;
          width: 86rpx;
          height: 52rpx;
          border-radius: 100rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s;
        }

        .text {
          width: 90rpx;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
      }
    }

    .more {
      color: #999;
      font-size: 12px;
      display: flex;
      align-items: center;
      padding-top: 6rpx;

      icon {
        padding-left: 4rpx;
      }
    }
  }
}
.showPopBox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 970;
  transition: all 0.3s;
  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 971;
  }
  .infoContent {
    position: absolute;
    z-index: 972;
    width: 100%;
    max-height: 55vh;
    top: 130rpx;
    background-color: #fff;
    left: 0;
    overflow-y: scroll;
    padding-bottom: 20rpx;
    padding-top: 10rpx;
    .label {
      width: 95%;
      margin: 0 auto;
      padding: 12rpx 0;
      .title {
        color: #343434;
        font-size: 12px;
      }
      .text {
        color: #999;
        font-size: 12px;
        padding-top: 4rpx;
        text {
          width: 100%;
        }
      }
    }
    .images {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding-top: 6rpx;
      .image {
        width: 200rpx;
        height: 200rpx;
        border: 2rpx solid #f5f5f5;
        background-color: #f5f5f5;
        margin-right: 20rpx;
        position: relative;
        .text {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(255, 255, 255, 0.6);
          height: 50rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 12px;
        }
      }
    }
  }
  .showContent {
    position: absolute;
    z-index: 972;
    width: 100%;
    max-height: 600rpx;
    bottom: 0rpx;
    padding-bottom: 150rpx;
    background-color: #fff;
    left: 0;
    .sheade {
      width: 100%;
      background-color: #f2f2f2;
      font-size: 12px;
      height: 56rpx;
      display: flex;
      align-items: center;
      .left {
        flex: 0 0 50%;
        .text {
          color: #999;
          padding-left: 20rpx;
        }
      }
      .right {
        flex: 0 0 50%;
        .text {
          color: #999;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 20rpx;
          icon {
            padding-right: 6rpx;
          }
        }
      }
    }
    .sconten {
      max-height: 544rpx;
      overflow-y: scroll;
      .goods {
        width: 95%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        border-bottom: 1px dashed #f5f5f5;
        height: 110rpx;
        .left {
          flex: 0 0 60%;
          .title {
            color: #343434;
          }
          .label {
            color: #999;
            font-size: 12px;
          }
        }
        .right {
          flex: 0 0 40%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .price {
            flex: 0 0 40%;
            color: #343434;
          }
          .buy {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 60%;
            input {
              text-align: center;
              color: #343434;
            }
            text {
              color: #999;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
.content-box {
  width: 100%;
  z-index: 999;
  // background-color: #f5f5f5;
  // 一级类
  .parent-category {
    float: left;
    width: 25%;
    height: 100%;
    // background-color: #fff;
    .type-box {
      width: 22vw;
      margin: 5px 0;
      line-height: 90rpx;
    }

    .type-navbar-item {
      text-align: center;
      font-size: 32rpx;
      background-color: #fff;
      border-top-right-radius: 10rpx;
      border-bottom-right-radius: 10rpx;
    }
  }

  /* 二级分类 */
  .child-category {
    float: right;
    padding: 5px 0;
    white-space: nowrap;
    height: auto;
    width: 75%;
    .type-box {
      display: inline-flex;
      height: auto;
    }
    .type-navbar-item {
      margin-right: 10rpx;
      background-color: #fff;
      padding: 3px 12rpx;
      border-radius: 8rpx;
      text-align: center;
      font-size: 12px;
    }
  }

  // 商品
  .goods-container {
    float: right;
    height: 89%;
    width: 75%;
    .item {
      padding: 20rpx;
      margin: 0 20rpx 20rpx 0;
      background-color: #fff;
      border-radius: 15rpx;
      border: 1px solid #eeeeee;
      box-shadow: 0 2rpx 10rpx 2rpx #e5e5e5;
      -webkit-box-shadow: 0px 1px 5px 1px #e5e5e5;
      .pic {
        float: left;
        width: 140rpx;
        height: 140rpx;
        border-radius: 10rpx;
        overflow: hidden;
      }

      .info {
        display: flex;
        flex-direction: column;
        padding-left: 20rpx;

        .name {
          color: #000;
          font-size: 14px;
          line-height: 46rpx;
          font-weight: bold;
        }

        .middle-box {
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

        .soldInfo {
          display: flex;
          flex-direction: column;
          margin-top: 5rpx;
          font-size: 12px;
          color: #aaaaaa;
          .number {
            float: left;
          }

          .score {
            float: right;
          }
        }
      }
    }
  }
}
.footer {
  position: fixed;
  bottom: 10px;
  width: 92%;
  left: 0;
  right: 0;
  height: 50px;
  margin: 0 auto;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  z-index: 899;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.05);
  .left {
    flex: 0 0 70%;
    display: flex;
    align-items: center;
    justify-content: start;
    height: 100%;
    .cart-box {
      width: 100rpx;
      height: 100%;
      .cart {
        position: absolute;
        width: 100rpx;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        image {
          width: 100rpx;
          height: 68rpx;
          padding-left: 25rpx;
        }
        text {
          position: absolute;
          top: 8rpx;
          right: -10rpx;
          background-color: #fa3a3a;
          border-radius: 100%;
          width: 42rpx;
          height: 42rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 12px;
        }
      }
    }
    .center {
      width: 75%;
      height: 100%;
      padding-left: 10px;
      color: #000;
      .price-box {
        width: 100%;
        height: 28px;
        .price {
          width: auto;
          height: auto;
          font-size: 42rpx;
          font-weight: bold;
          float: left;
        }
        .line-price {
          width: auto;
          height: auto;
          float: left;
          padding-left: 3px;
          color: #333;
          font-size: 12px;
          padding-top: 15rpx;
          text-decoration: line-through;
        }
      }
      .more {
        width: auto;
        height: 40%;
        font-size: 12px;
      }
    }
  }
  .right {
    flex: 0 0 30%;
    height: 100%;
    border-top-right-radius: 100rpx;
    border-bottom-right-radius: 100rpx;
    overflow: hidden;
    .button {
      width: 100%;
      height: 100%;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #d3aa79;
    }
    .none {
      background-color: #bbbbbb;
    }
  }
}
.bottom-lin {
  width: 100%;
  height: 1px;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: #f5f5f5;
  z-index: 99999;
}
</style>

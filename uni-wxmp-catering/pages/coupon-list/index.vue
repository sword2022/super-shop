<template>
  <view>
    <Navigation
      id="Navigation"
      show-icon="true"
      title="优惠券列表"
      show-title="true"
      class
    ></Navigation>
    <view
      class="container"
      :style="
        'height:' +
        (windowHeight - 16) +
        'px;margin-top:' +
        container_top +
        'px'
      "
    >
      <view class="empty" v-if="coupons.length == 0">
				<image src="/static/public/empty.png" class="empty-img"></image>
				<view class="text">暂无可用券</view>
			</view>
      <scroll-view
        class="coupon-box"
        v-if="coupons.length > 0"
        scroll-y="true"
        :scroll-top="scrolltop"
      >
        <view
          class="coupon"
          v-for="(item, index) in coupons"
          :key="index"
          @click="message"
        >
          <view class="price-box">
            <text class="price">{{ item.reduce }}</text>
            <text class="mony-symbol">元</text>
            <view class="cro_right_top"> </view>
            <view class="cro_right_bottom"> </view>
          </view>
          <view class="button-box" @click="message">
            <view class="title-more">
              <text class="title">{{ item.name }}</text>
              <text class="more">立即使用</text>
            </view>
            <text>满{{ item.satisfy }}元可用 有效期:</text>
            <view class="date">
              <text>{{ item.use_start_time }}</text>
              <text> - </text>
              <text>{{ item.use_end_time }}</text>
            </view>
            <view class="cro_left_top"> </view>
            <view class="cro_left_bottom"> </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
const app = getApp();
import Navigation from "../../components/navigation/navigation";

export default {
  data() {
    return {
       //样式控制
      container_top: 0,
      windowHeight: 0,
      coupons: [],
    };
  },
  components: {
    Navigation,
  },
  onReady: function () {
    this.container_top =
      app.globalData.statusBarHeight + app.globalData.titleBarHeight;
    this.windowHeight = app.globalData.windowHeight;
  },
  methods: {
    message() {
      uni.showToast({
        title: "下单自动使用",
        icon: "none",
        duration: 2000,
      });
    },
  },
  onLoad: function (options) {
    let coupons = app.globalData.coupons;
    console.log(coupons);
    for (let i = 0; i < coupons.length; i++) {
      coupons[i].use_start_time = coupons[i].use_start_time.slice(0, 10);
      coupons[i].use_end_time = coupons[i].use_end_time.slice(0, 10);
      this.coupons.push(coupons[i]);
    }
  },
};
</script>


<style lang="less">
@bg-color: #ff0000;
@cro-size: 10px;
.container {
  background-color: @bg-color;
  .coupon-box {
    width: 100vw;
    height: auto;

    padding: 20px 0 0 0;
    .coupon {
      width: auto;
      height: 100px;
      color: lightslategray;
      display: flex;
      justify-content: right;
      margin: 5px 10%;
      .price-box {
        width: 80px;
        height: 80px;
        position: relative;
        background: #fff;
        border-top-left-radius: @cro-size;
        border-bottom-left-radius: @cro-size;

        display: flex;
        justify-content: center;
        color: crimson;
        font-weight: 600;
        .price {
          line-height: 36px;
          font-size: 36px;
          margin-top: 20px;
        }
        .mony-symbol {
          line-height: 14px;
          font-size: 14px;
          margin-top: 38px;
        }
      }

      .button-box {
        width: 200px;
        height: 80px;
        padding-left: 20px;
        padding-right: 5px;
        position: relative;
        border-top-right-radius: @cro-size;
        border-bottom-right-radius: @cro-size;
        border-left: 1px dashed @bg-color;
        background: #fff;
        color: #888;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .title-more {
          color: #666;
          font-size: 12px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          .title {
            color: #000;
            font-size: 16px;
          }
          .more {
            color: #666;
            font-size: 12px;
          }
        }
        .date {
          color: #666;
          font-size: 12px;
          display: flex;
          justify-content: right;
        }
      }

      .cro_left_top,
      .cro_right_top,
      .cro_left_bottom,
      .cro_right_bottom {
        position: absolute;
        width: @cro-size;
        height: @cro-size;
        z-index: 1;
        background-color: @bg-color;
      }
      .cro_left_top {
        top: -1px;
        left: -1px;
        border-radius: 0 0 @cro-size 0;
      }
      .cro_right_top {
        top: -1px;
        right: -1px;
        border-radius: 0 0 0 @cro-size;
      }
      .cro_left_bottom {
        left: -1px;
        bottom: -1px;
        border-radius: 0 @cro-size 0 0;
      }
      .cro_right_bottom {
        right: -1px;
        bottom: -1px;
        border-radius: @cro-size 0 0 0;
      }
    }
  }
}
</style>


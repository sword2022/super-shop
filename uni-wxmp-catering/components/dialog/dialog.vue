<template>
  <view>
    <uni-popup ref="popup" type="center" mask-click="true">
      <view class="coupon-box">
        <text>可用券</text>
        <view class="coupon" v-for="(item, index) in coupons" :key="index">
          <view class="price-box">
            <text class="price">{{ item.reduce }}</text>
            <text class="mony-symbol">元</text>
            <view class="cro_right_top"> </view>
            <view class="cro_right_bottom"> </view>
          </view>
          <view class="button-box" @click="navTo">
            <view class="title-more">
              <text class="title">{{ item.name }}</text>
              <text class="more">立即查看></text>
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
      </view>
      <view class="close-box">
        <view class="close" @click="close">
          <image class="image" src="/static/components/dialog/close.png" />
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
const app = getApp();
export default {
  // 接受父组件传递的值
  props: {
    Visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      coupons: [],
    };
  },
  methods: {
    // 弹出框关闭后触发
    close() {
      this.$refs.popup.close();
    },
    //弹出框关闭并跳转到优惠券列表页
    navTo() {
      this.$refs.popup.close();
      uni.navigateTo({
        url: `/pages/coupon-list/index`,
      });
    },
  },
  watch: {
    // 监听 Visible 改变
    Visible(oldVal, newVal) {
      console.log("watch--Visible--changed");
      let coupons = app.globalData.coupons;
      //过滤已过期的券
      let nt = new Date();
      for (let i = 0; i < coupons.length; i++) {
        let st = new Date(Date.parse(coupons[i].use_start_time));
        let et = new Date(Date.parse(coupons[i].use_end_time));
        // console.log('use_start_time:',st)
        // console.log('use_end_time:',et)
        if (nt < st || nt > et) {
          console.log("删除已过期:", coupons[i].name);
          coupons.splice(i, 1);
          i--;
        }
      }
      for (let i = 0; i < coupons.length; i++) {
        //替换日期符合
        coupons[i].use_start_time = coupons[i].use_start_time.replace(
          /-/g,
          "."
        );
        coupons[i].use_end_time = coupons[i].use_end_time.replace(/-/g, ".");
        //截取日期段
        coupons[i].use_start_time = coupons[i].use_start_time.slice(0, 10);
        coupons[i].use_end_time = coupons[i].use_end_time.slice(0, 10);
        this.coupons.push(coupons[i]);
      }

      //显示弹出框
      this.$refs.popup.open();
    },
  },
};
</script>

<style lang="less">
@bg-color: #ff0000;
@cro-size: 10px;
.coupon-box {
  width: 90vw;
  height: auto;
  min-height: 150px;
  border-radius: 20px;
  background-color: @bg-color;
  display: flex;
  flex-direction: column; // 纵向排列
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 0;
  color: #fff;
  font-weight: 500;
  .coupon {
    width: auto;
    height: 100px;
    color: lightslategray;
    display: flex;
    justify-content: right;
    margin: 5px 0;
    .price-box {
      // 80长宽
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
      width: 178px;
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
.close-box {
  width: 90vw;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  .close {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    .image {
      width: 42px;
      height: 42px;
    }
  }
}
</style>
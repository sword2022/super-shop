import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false

//定义setData()
Vue.mixin({
	methods: {
		//编辑购物车
		editCart: function (object, type,list) {
			let find_this = false;
			let msg = "";
			for (var i = 0; i < list.length; i++) {
				if (list[i]._id == object._id) {
					console.log("购物车列表中存在:", object._id);
					find_this = true;
					if (type == "decrease") {
						if (list[i].number == 1 && object.inventory == 1) {
							console.log("按钮颜色恢复");
							object.number--;
						}
						if (list[i].number <= 1) {
							list.splice(i, 1);
							msg = object.name + " 已从订单移除";
						} else {
							list[i].number--;
							msg = object.name + " 数量 - 1";
						}
					} else {
						if (list[i].number >= object.inventory) {
							uni.showModal({
								title: "库存不足",
								content: "购买数量已经超过最大库存数量",
								showCancel: false,
							});
							return false;
						} else {
							list[i].number++;
							msg = object.name + " 数量 + 1";
						}
					}
					break;
				}
			}
			if (object.inventory > 0) {
				//在订单中未找到对象就新增
				if (!find_this) {
					object.number = 1;
					list.push(object);
					msg = object.name + "加入了订单";
				}
			} else {
				uni.showModal({
					title: "库存不足",
					content: "购买数量已经超过最大库存数量",
					showCancel: false,
				});
				return false;
			}
			uni.showToast({
				title: msg,
				icon: "none",
				duration: 1000,
			});
			return list
		},
		setData: function (obj, callback) {
			let that = this;
			const handleData = (tepData, tepKey, afterKey) => {
				tepKey = tepKey.split('.');
				tepKey.forEach(item => {
					if (tepData[item] === null || tepData[item] === undefined) {
						let reg = /^[0-9]+$/;
						tepData[item] = reg.test(afterKey) ? [] : {};
						tepData = tepData[item];
					} else {
						tepData = tepData[item];
					}
				});
				return tepData;
			};
			const isFn = function (value) {
				return typeof value == 'function' || false;
			};
			Object.keys(obj).forEach(function (key) {
				let val = obj[key];
				key = key.replace(/\]/g, '').replace(/\[/g, '.');
				let front, after;
				let index_after = key.lastIndexOf('.');
				if (index_after != -1) {
					after = key.slice(index_after + 1);
					front = handleData(that, key.slice(0, index_after), after);
				} else {
					after = key;
					front = that;
				}
				if (front.$data && front.$data[after] === undefined) {
					Object.defineProperty(front, after, {
						get() {
							return front.$data[after];
						},
						set(newValue) {
							front.$data[after] = newValue;
							that.$forceUpdate();
						},
						enumerable: true,
						configurable: true
					});
					front[after] = val;
				} else {
					that.$set(front, after, val);
				}
			});
			// this.$forceUpdate();
			isFn(callback) && this.$nextTick(callback);
		}
	}
});


App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
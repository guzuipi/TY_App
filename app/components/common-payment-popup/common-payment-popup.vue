<!-- 支付方式弹窗 -->
<template>
	<uni-popup ref="popup" class="popup">
		<view class="popup-main">
			<view class="popup-title flex-center-between">
				<view class="title">支付方式</view>
				<image @click="closePay" class="icon-close" src="../../static/images/icons/icon-cha.svg" mode="aspectFill"></image>
			</view>
			<view class="popup-content">
				<view class="flex-center-center row" @click="selectPay(2)">
					<image class="image" src="../../static/images/login/wx.png" mode="aspectFill"></image>
					<text class="text flex-1">微信支付</text>
					<view class="radio" :class="{ on: payIndex === 2 }"></view>
				</view>
				<view class="flex-center-center row" @click="selectPay(1)">
					<image class="image" src="../../static/images/login/zfb.png" mode="aspectFill"></image>
					<text class="text flex-1">支付宝支付</text>
					<view class="radio" :class="{ on: payIndex === 1 }"></view>
				</view>
				<!-- <view class="flex-center-center row" @click="selectPay(2)">
					<image class="image" src="../../static/images/login/package.png" mode="aspectFill"></image>
					<view class="flex-1 flex-column-between">
						<text class="text">账户余额支付</text>
						<text class="desc">可用余额:¥1000.00</text>
					</view>
					<view class="radio" :class="{ on: payIndex === 2 }"></view>
				</view> -->
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'common-payment-popup',
	emits: ['cancelPay'],
	props: {
		data: { 
			type: Object,
			default: {
				orderNum: undefined, //订单编号
				orderPayAmount: 0 ,//订单需支付金额
				payOrderNum: undefined //支付单号
			}
		}
	},
	data() {
		return {
			payIndex: undefined, //支付类型  1支付宝  2微信
			submitOrderVO: this.data //提交订单接口返回的对象
		};
	},
	watch: {
		data: {
			handler(newV, oldV){
				this.submitOrderVO = newV;
			},
			deep: true
		}
	},
	methods: {
		// 打开弹窗
		open() {
			this.$refs.popup.open();
		},
		// 关闭弹窗
		close() {
			this.$refs.popup.close();
		},
		// 选择支付方式
		selectPay(value) {
			if (this.payIndex === value) return;
			this.payIndex = value;
			this.close();
			this.$tool.orderPay(this.submitOrderVO.payOrderNum, value).then(res => {
				this.$store.commit('setOrderChange');
			}).catch(err => {
				this.$store.commit('setOrderChange');
			})
		},
		// 关闭支付弹窗
		closePay(){
			uni.showModal({
			    title: '提示',
			    content: '是否取消支付',
			    success: (res) => {
			        if (res.confirm) {
			            
						// 这里判断如果父组件监听了取消支付的事件，则不再走后续流程，适合订单列表、订单详情页来监听
						if(this.$listeners['cancelPay']){
							this.$emit('cancelPay')
							return
						}
						
						this.close();
						this.$store.commit('setOrderChange');
						// 跳转到订单列表页
						uni.redirectTo({
							url: `/pages-user/mine/order/order`
						});
			        } 
			    }
			});
		}
	}
};
</script>

<style src="./style.less" lang="less"></style>

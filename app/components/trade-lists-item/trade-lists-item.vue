<template>
	<!-- 列表item -->
	<view class="trade-item" v-on:click.stop="goOrderDetail">
		<!-- 用户/地址 -->
		<view class="flex-center-between item-top">
			<!-- 商家 -->
			<view class="flex-center" v-if="role === 0" v-on:click.stop="goUserInfo">
				<image class="avatar-image" src="../../static/images/other/girl.png"></image>
				<text class="text-bold">{{getData('name')}}</text>
				<text class="color-9">{{getData('address')}}</text>
			</view>
			<!-- 用户消息 -->
			<view class="text-bold merchant-name" v-else-if="role === 1">商家名称</view>
			<!-- 退款-红色-red，未发货-黄色-yellow -->
			<view v-if="state !== -1" class="state" :class="[state === 0 ? 'red' : 'yellow']">{{ state === 0 ? '退款待处理' : '未发货' }}</view>
		</view>
		<!-- 主体 -->
		<view class="item-content flex">
			<image class="goods-image" mode="aspectFill" :src="getData('thumbnail') "></image>
			<view class="flex-1 flex-column-between">
				<view class="text-bold">{{getData('goodsName') }}</view>
				<view class="flex-center-between">
					<view class="tag">{{getData('attributesName') }}</view>
					<view class="color-9 number">×{{ getData('goodsNum')  }}</view>
				</view>
			</view>
		</view>
		<!-- 底部 -->
		<view class="item-bottom flex-center">
			<!-- 时间 - 商家状态显示 -->
			<view class="color-9" v-if="role === 0">{{getData('createTime') }}</view>
			<!-- 金钱 -->
			<view class="flex-center pay-block">
				<text>{{ role === 0 ? '已支付：' : '实付款:' }}</text>
				<view class="text-bold flex-center price">
					<view class="unit">¥</view>
					<view>{{getData('payAmount') }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'trade-lists-item',
	props: {
		dataItem: {
			type: Object,
			required: true,
			default:()=>{}
		},
		state: {
			type: Number,
			default: -1 // 0-退款 1-未发货
		},
		role: {
			type: Number,
			default: 0 //0-商家 1-用户
		}
	},
	data() {
		return {
		};
	},
	created(){

	},
	methods:{
		goUserInfo(){
			console.log('订单信息',this.dataItem);
			const  orderDetailVO = this.dataItem.orderDetailVO || this.dataItem;
			const storeId = orderDetailVO.storeId;
			const userId = orderDetailVO.userId;
			
			this.$http.post('/message/update',{messageId:this.dataItem.messageId},true).then(res=>{
				uni.navigateTo({
					url: `/pages-business/message/user/user?userId=${userId}&storeId=${storeId}`
				});
			})
		},
		getData(key){
			if(this.dataItem[key]){
				return this.dataItem[key]
			}else if(this.dataItem.orderDetailVO && this.dataItem.orderDetailVO[key]){
				return this.dataItem.orderDetailVO[key]
			}
		},
		goOrderDetail(){
			console.log(this.dataItem)
			uni.navigateTo({
				url: '/pages-business/index/order-details/order-details?orderId='+this.dataItem.orderNum
			});
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

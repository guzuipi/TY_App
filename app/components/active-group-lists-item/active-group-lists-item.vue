<!-- 活动拼团 -->
<template>
	<view class="activity-lists-item">
		<view class="flex item-top" @click="jumpGoodsDetail">
			<image :src="data.thumbnail" class="avatar-image" mode="aspectFill"></image>
			<view class="right">
				<view class="name text-bold">{{data.groupBuyName}}</view>
				<view class="time">开团时间:{{data.startTime}}</view>
				<view class="text-bold price">最低折扣价¥{{data.minPrice}}</view>
			</view>
		</view>
		<!-- 底部 -->
		<view class="flex-center-end item-bottom">
			<!-- 参与拼团 -->
			<button class="btn-block"  v-if="data.joinFlag === 3" @click="submit">参与拼团</button>
			<button class="btn-block disable" v-else>已参与，等待拼团完成</button>
		</view>
	</view>
</template>

<script>
	export default {
		name:"active-group-lists-item",
		emits: ['submit'],
		props: {
			data: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				
			};
		},
		methods: {
			// 参与拼团按钮点击
			submit(){
				this.$emit('submit',this.data.groupBuyId);
			},
			// 跳转到组团优惠商品下订单页面
			jumpGroupBuyConfirm(){
				this.$store.commit('setGroupBuyGoodsVO', this.groupBuyVO);
				uni.navigateTo({
					url: `/pages-user/index/confirm/confirm-groupbuy`
				});
			},
			
			// 跳转到商品详情页
			jumpGoodsDetail(){
				uni.navigateTo({
					url: `/pages-user/index/goods-details/goods-details?goodsId=${this.data.goodsId}`
				});
			}
		}
	}
</script>

<style lang="less" src="./style.less">

</style>

<!-- 优惠券 -->
<template>
	<view class="ticket">
		<custom-horizontal-tabs @change="getTabsIndex" :data="tabsData" :currentIndex="tabsIndex"></custom-horizontal-tabs>
		<swiper :current="tabsIndex" @change="swiperChange" class="flex-1">
			<swiper-item v-for="(item,index) in dataList" :key="`swiper-item-${index}`"> 
				<!-- 未使用 -->
				<scroll-view scroll-y="true" class="ticket-lists">
					<!-- 平台优惠券 -->
					<view class="title">平台优惠券</view>
					<block v-for="(value, vi) in item.userPlatformCouponList || []" :key="`coupon-${vi}`">
						<ticket-lists-item :data="value"></ticket-lists-item>
					</block>
					<my-empty style="height: 40%;" :show="(item.userPlatformCouponList || []).length === 0"></my-empty>
					<!-- 商家优惠券 -->
					<view class="title">商家优惠券</view>
					<block v-for="(value, vi) in item.userStoreCouponList || []" :key="`store-${vi}`">
						<view class="flex-center goods-item">
							<image class="avatar-image" src="../../../static/images/other/girl.png" mode="aspectFill"></image>
							<text>{{value.storeName}}</text>
						</view>
						<block v-for="(coupon, ci) in value.userCouponDetailList || []" :key="`store-coupon-${ci}`">
							<ticket-lists-item :data="coupon"></ticket-lists-item>
						</block>
					</block>
					<my-empty style="height: 40%;" :show="(item.userStoreCouponList || []).length === 0"></my-empty>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tabsIndex: 0,
			tabsData: [],
			dataList:[]
		};
	},
	onLoad() {
		this.getMyCoupon();
	},
	methods: {
		// 获得当前tab index
		getTabsIndex(value) {
			this.tabsIndex = value;
		},
		
		/**
		 * swiper滚动回调
		 * @param {Object} e
		 */
		swiperChange(e){
			this.tabsIndex = e.detail.current;
		},
		
		/**
		 * 查询用户名下的优惠券信息
		 */
		getMyCoupon(){
			this.$http
				.get('/userCoupon/queryByUserId', {}, true)
				.then(res => {
					this.dataList = res || [];
					this.tabsData = res && res.map(function(value){
						return value.statusName
					})
				});
		}
		
	}
};
</script>

<style src="./style.less" lang="less"></style>

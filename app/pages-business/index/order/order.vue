<!-- 订单 -->
<template>
	<view class="order">
		<!-- 导航 -->
		<business-common-navigation @search="onSearch"></business-common-navigation>
		<!-- 菜单 -->
		<custom-horizontal-tabs @change="getTabsIndex" :data="tabsData" :currentIndex="tabsIndex"></custom-horizontal-tabs>
		<!-- 待付款 -->
		<my-scroll-view ref="myScrollView" class="order-content" @loadData="onLoadData">
			<template v-slot:list="slotProps">
				<order-delivery-lists-item  v-for="(item, index) in slotProps.list"  :orderItemData="item" :key="index"></order-delivery-lists-item>
			</template>
		</my-scroll-view>
<!--		<tabs-payment v-if="tabsIndex === 0"></tabs-payment>-->
		<!-- 待发货 -->
<!--		<tabs-delivery v-else-if="tabsIndex === 1"></tabs-delivery>-->
	</view>
</template>

<script>
import TabsPayment from './tabs-payment.vue';
import TabsDelivery from './tabs-delivery.vue';
export default {
	components:{
		TabsPayment,
		TabsDelivery
	},
	data() {
		return {
			tabsData: ['待付款', '待发货', '待收货','待售后','已完成'],
			tabsIndex:0,
			// orderList: [],
			searchText: ''
		};
	},
	onLoad(options){
		let tabsIndex = Number(options.tabsIndex || '0');
		this.getTabsIndex(tabsIndex)
	},
	methods: {
		//获取当前 tabs Index
		getTabsIndex(value) {
			this.tabsIndex = value;
			this.$refs.myScrollView.onRefresh();
		},
		onLoadData(pageNum = 1, pageSize, callback){
			this.$http.get('/order/queryPage',{
				page: pageNum,
				orderState: this.tabsIndex == 3 ? 5 : this.tabsIndex,
				size: pageSize,
				searchText: this.searchText},true).
			then(res=>{
				callback(res);
			}).catch( err => {
				callback(null);
			})
		},
		seeOrderInfo(id){
			console.log(id);
		},
		onSearch(value){
			console.log(value);
			this.searchText = value;
			this.$refs.myScrollView.onRefresh();
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

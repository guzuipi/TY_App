<!-- 订单确认 -  普通商品 -->
<template>
	<view class="order-confirm">
		<scroll-view class="order-confirm-content" scroll-y="true">
			<!-- 收获地址 -->
			<view v-if="orderVO.needAddress" class="flex-center address" @click="jumpChooseAddress">
				<image src="../../../static/images/icons/icon-location.svg" class="icons" mode="aspectFill"></image>
				<!-- 显示当前收货地址 -->
				<view class="flex-column flex-1" v-if="defaultAddress && defaultAddress.id">
					<view class="name">{{ defaultAddress.name }} {{ defaultAddress.phone }}</view>
					<view class="desc">
						{{ defaultAddress.provinceName }} {{ defaultAddress.cityName }} {{ defaultAddress.areaName }} {{ defaultAddress.streetName }} {{ defaultAddress.address }}
					</view>
				</view>
				<!-- 没有收货地址 -->
				<view class="flex-1 text-bold label" v-else>添加收货地址</view>
				<image class="icons" src="../../../static/images/icons/icon-light-arrow.png" mode="aspectFill"></image>
			</view>

			<!-- 购买列表 -->
			<view class="box" v-for="(item, index) in orderVO.storeOrderList" :key="`store-goods-${index}`">
				<!-- 商家 -->
				<merchanism-order-lists-item :storeGoodsVO="item"></merchanism-order-lists-item>
				<view class="row flex-center-between">
					<text class="label">商品原价</text>
					<text>¥{{ item.orderAmount }}</text>
				</view>
				<view v-if="orderVO.needAddress" class="row flex-center-between">
					<text class="label">运费</text>
					<text>¥{{ item.freightAmount }}</text>
				</view>
				<view class="row flex-center-between" @click="chooseStoreCoupon(item.storeCouponId, item.storeCouponList, index)">
					<text class="label">商家优惠</text>
					<text v-if="item.storeCouponId" class="flex-1 color-red">-¥{{ item.storeCouponAmount }}</text>
					<text v-else class="flex-1 color-9">{{ item.storeCouponList && item.storeCouponList.length > 0 ? '请选择优惠券' : '无可用优惠券' }}</text>
					<image
						v-if="item.storeCouponList && item.storeCouponList.length > 0"
						class="icon-arrow"
						mode="aspectFill"
						src="../../../static/images/icons/icon-arrow-right.svg"
					></image>
				</view>
				<view v-if="item.storeDiscountAmount > 0" class="row flex-center-between">
					<text class="label">商家折扣</text>
					<text class="flex-1 color-red">-¥{{ item.storeDiscountAmount }}</text>
				</view>
				<view class="row flex-center-between">
					<text class="flex-1 color-red">小计: ¥{{ item.payAmount }}</text>
				</view>
			</view>
			<!-- 平台优惠券 -->
			<view class="box platform">
				<view class="row flex-center-between" @click="choosePlatformCoupon()">
					<text class="label">平台优惠</text>
					<text v-if="orderVO.platformCouponId" class="flex-1 color-red">-¥{{ orderVO.platformDiscountAmount }}</text>
					<text v-else class="flex-1 color-9">{{ orderVO.platFormCouponList && orderVO.platFormCouponList.length > 0 ? '请选择优惠券' : '无可用优惠券' }}</text>
					<image
						v-if="orderVO.platFormCouponList && orderVO.platFormCouponList.length > 0"
						class="icon-arrow"
						mode="aspectFill"
						src="../../../static/images/icons/icon-arrow-right.svg"
					></image>
				</view>
				<view v-if="orderVO.platformDiscountAmount > 0" class="row flex-center-between">
					<text class="label">平台折扣</text>
					<text class="flex-1 color-red">-¥{{ orderVO.platformDiscountAmount }}</text>
				</view>
				<view v-if="orderVO.maxGoldCoinAmount && orderVO.maxGoldCoinAmount > 0" class="row flex-center-between" @click="openPopup('dicountPopup')">
					<text class="label">金币抵扣</text>
					<text v-if="orderVO.goldDeductionAmount && orderVO.goldDeductionAmount > 0" class="flex-1 color-red">-¥{{ orderVO.goldDeductionAmount }}</text>
					<text v-else class="flex-1 color-9">{{orderVO.useGoldCoin === 0 ? '不使用金币抵扣' : '请选择'}}</text>
					<image class="icon-arrow" mode="aspectFill" src="../../../static/images/icons/icon-arrow-right.svg"></image>
				</view>
			</view>
			<!-- 同意协议 -->
			<view class="flex-center agree-row">
				<!-- 选中 类名 on -->
				<view class="radio" :class="{ on: isAgree }" @click="setAgree()"></view>
				<view class="flex-center text">
					同意
					<!-- TODO: 这里的协议地址需要配置 -->
					<view class="service" @click="goH5">《腾云课堂服务协议》</view>
				</view>
			</view>
		</scroll-view>
		<!-- 底部合计 -->
		<view class="order-confirm-bottom flex-center-between">
			<view class="flex left">
				<text>合计:</text>
				<text class="price">¥{{ orderVO.payAmount }}</text>
			</view>
			<button class="btn" @click="submitOrder">提交订单</button>
		</view>
		<!-- 支付方式 弹窗 -->
		<common-payment-popup ref="paymentPopup" 
		:data="submitOrderVO"></common-payment-popup>
		<!-- 金币抵扣弹窗 -->
		<confirm-dicount-popup
			v-if="orderVO.maxGoldCoinAmount && orderVO.maxGoldCoinAmount > 0"
			ref="dicountPopup"
			:useGoldCoin="orderVO.useGoldCoin"
			:maxGoldCoin="orderVO.maxGoldCoin"
			:maxGoldCoinAmount="orderVO.maxGoldCoinAmount"
			@submit="goldCoinSubmit"
		></confirm-dicount-popup>
		<!-- 商家优惠券 -->
		<confirm-ticket-popup
			ref="storeCouponPopup"
			title="商家优惠券"
			:couponList="storeCouponList || []"
			:selectCouponId="selectStoreCouponId"
			@submit="storeCouponSubmit"
		></confirm-ticket-popup>
		<!-- 平台优惠券 -->
		<confirm-ticket-popup
			ref="platformCouponPopup"
			title="平台优惠券"
			:couponList="platFormCouponList"
			:selectCouponId="refreshOrderDetailParams.platFormCouponId"
			@submit="platformCouponSubmit"
		></confirm-ticket-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex'; //引入mapState
export default {
	data() {
		return {
			isAgree: true, //是否同意协议
			orderVO: {
				freightAmount: 0, //运费
				goldCoin: 0, //能使用的金币数量
				goldDeductionAmount: 0, //金币抵扣金额
				maxGoldCoin: 0, //可使用金币数
				maxGoldCoinAmount: 0, //可用金币抵金额
				needAddress: false, //是否需要收货地址
				orderAmount: 0, //订单原始金额
				payAmount: 0, //支付金额
				platformCouponId: undefined, //平台优惠券ID
				platformDiscountAmount: 0, //平台优惠金额
				platFormCouponList: [], //平台可用优惠券
				storeDiscountAmount: 0, //商家优惠金额
				storeOrderList: [], //店铺订单明细
				useGoldCoin: 0 //是否使用金币 0:不使用 1:使用
			},
			storeCouponList: [], //商家可用优惠券
			selectStoreCouponId: undefined, //商家选中的优惠券
			currentStoreCouponIndex: 0, //当前点击的第几个商家下面的优惠券
			platFormCouponList: [], //平台可用优惠券
			refreshOrderDetailParams: {
				address: undefined,
				useGoldCoin: 0,
				mobile: undefined,
				shoppingCartBuy: 0,
				name: undefined,
				platFormCouponId: undefined,
				storeGoodsList: []
			},
			submitOrderVO: {} //提交订单后返回的对象
		};
	},
	computed: mapState({
		// 选中的收货地址
		defaultAddress: state => state.defaultAddress
	}),
	watch: {
		defaultAddress(newV, oldV) {
			let { provinceName, cityName, areaName, streetName, address, name, phone } = newV;
			this.refreshOrderDetailParams.address = `${provinceName}${cityName}${areaName}${streetName}${address}`;
			this.refreshOrderDetailParams.name = name;
			this.refreshOrderDetailParams.mobile = phone;
		}
	},
	onLoad(option) {
		let pageFrom = option.pageFrom;
		// 如果是购物车页面下的订单，shoppingCartBuy赋值为1
		if(pageFrom === 'car'){
			this.refreshOrderDetailParams.shoppingCartBuy = 1;
		}
		this.getOrderDetail();
	},
	methods: {
		// 打开 支付方式弹窗
		openPopup(value) {
			this.$refs[value].open();
		},

		// 是否同意点击
		setAgree() {
			this.isAgree = !this.isAgree;
		},

		// 下单之前获取订单信息
		getOrderDetail() {
			this.$http.post('/order/getDetail', { goodsList: this.$store.state.storeGoodsList }, true).then(res => {
				this.initOrderVO(res);
			});
		},

		// 刷新订单信息
		refreshOrderDetail() {
			this.$http.post('/order/refreshDetail', this.refreshOrderDetailParams, true).then(res => {
				this.initOrderVO(res);
			});
		},

		/**
		 * 提交订单
		 */
		submitOrder() {
			if (!this.isAgree) {
				this.$tool.showToast('请先勾选服务协议');
				return;
			}
			if (this.orderVO.needAddress && !this.defaultAddress.id) {
				this.$tool.showToast('请填写收货地址');
				return;
			}
			this.$http.post('/order/submit', this.refreshOrderDetailParams, true).then(res => {
				
				this.submitOrderVO = res;
				
				// 这里要把邀请人、邀请人分销商品全部清空掉
				this.$store.commit('setInviterId', undefined);
				this.$store.commit('setinviterGoodsId', undefined);
				
				if (res.orderPayAmount === 0) { //如果支付金额是0元，直接跳转到订单列表页
					uni.redirectTo({
						url: `/pages-user/mine/order/order`
					});
				} else { //弹出支付弹窗
					this.openPopup('paymentPopup');
				}
			});
		},

		/**
		 * 初始化订单详情对象
		 * @param {Object} data 接口返回的下订单对象
		 */
		initOrderVO(data) {
			this.orderVO = data;

			// 平台优惠券赋值，因为平台优惠券列表返回的优惠券ID叫做userCouponId，要改成couponId
			let platFormCouponList = [];
			platFormCouponList =
				data.platFormCouponList &&
				data.platFormCouponList.map(function(value) {
					let obj = { ...value };
					obj.couponId = value.userCouponId;
					return obj;
				});
			this.platFormCouponList = platFormCouponList;

			let storeGoodsList = [];
			storeGoodsList =
				data.storeOrderList &&
				data.storeOrderList.map(function(value) {
					let orderItemList = [];
					orderItemList =
						value.orderItemList &&
						value.orderItemList.map(function(v) {
							return {
								distributorId: v.distributorId,
								attributesId: v.attributesId,
								goodsId: v.goodsId,
								goodsNum: v.goodsNum
							};
						});
					return {
						storeId: value.storeId,
						storeCouponId: value.storeCouponId,
						orderItemList: orderItemList
					};
				});

			let { provinceName, cityName, areaName, streetName, address } = this.defaultAddress;

			this.refreshOrderDetailParams = {
				address: data.needAddress ? `${provinceName}${cityName}${areaName}${streetName}${address}` : undefined,
				useGoldCoin: data.useGoldCoin,
				mobile: this.defaultAddress.phone,
				name: this.defaultAddress.name,
				shoppingCartBuy: this.refreshOrderDetailParams.shoppingCartBuy,
				platFormCouponId: data.platformCouponId,
				storeGoodsList: storeGoodsList
			};

			this.selectPlatformCouponId = data.platformCouponId;
		},

		/**
		 * 商家优惠点击
		 * @param {Object} storeCouponId  选中的商家优惠券ID
		 * @param {Object} storeCouponList  可选择的商家优惠券列表
		 * @param {Object} index 当前商家的索引值
		 */
		chooseStoreCoupon(storeCouponId, storeCouponList, index) {
			if (!storeCouponList || storeCouponList.length === 0) {
				return;
			}
			this.selectStoreCouponId = storeCouponId;
			let finalStoreCouponList = [];
			finalStoreCouponList =
				storeCouponList &&
				storeCouponList.map(function(value) {
					let obj = { ...value };
					obj.couponId = value.userCouponId;
					return obj;
				});
			this.storeCouponList = finalStoreCouponList;
			this.currentStoreCouponIndex = index;
			this.openPopup('storeCouponPopup');
		},

		/**
		 * 商家优惠券确定点击回调
		 * @param Number storeCouponId  选中的商家优惠券ID
		 */
		storeCouponSubmit(storeCouponId) {
			this.selectStoreCouponId = storeCouponId;
			this.refreshOrderDetailParams.storeGoodsList[this.currentStoreCouponIndex].storeCouponId = storeCouponId;
			this.refreshOrderDetail();
		},

		/**
		 * 平台优惠点击
		 */
		choosePlatformCoupon() {
			if (!this.orderVO.platFormCouponList || this.orderVO.platFormCouponList.length === 0) {
				return;
			}
			this.openPopup('platformCouponPopup');
		},

		/**
		 * 平台优惠券确定点击回调
		 * @param Number platformCouponId  选中的平台优惠券ID
		 */
		platformCouponSubmit(platformCouponId) {
			this.refreshOrderDetailParams.platFormCouponId = platformCouponId;
			this.refreshOrderDetail();
		},

		/**
		 * 金币使用情况回调
		 * @param {Object} useGoldCoin 是否使用金币
		 */
		goldCoinSubmit(useGoldCoin) {
			this.refreshOrderDetailParams.useGoldCoin = useGoldCoin;
			this.refreshOrderDetail();
		},

		// 跳转到选择配送地址页面
		jumpChooseAddress() {
			uni.navigateTo({
				url: `/pages-user/index/address/address`
			});
		},
		
		// 跳转到服务协议页面
		goH5(){
			uni.navigateTo({
				url:'/pages/watch-h5/watch-h5?code=SERVICE_AGREEMENT'
			})
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

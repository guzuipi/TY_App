<!-- 商品详情 - 坚持不懈商品 -->
<template>
	<view class="goods">
		<scroll-view scroll-y="true" class="goods-content" @scroll="scrollHandle">
			<!-- banner -->
			<swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="3000" :circular="true">
				<swiper-item v-for="(item, index) in goodsInfo.img" :key="`banner-${index}`">
					<image class="banner-image" :src="item" mode="aspectFill" @click="previewBanner(index)"></image>
				</swiper-item>
			</swiper>
			<!-- 具体信息 -->
			<view class="box">
				<view class="flex-center-between">
					<view class="name text-bold">{{ goodsInfo.goodsName }}</view>
					<view class="text color-9">{{ goodsInfo.sales }}人学习</view>
				</view>
				<view class="flex-center-between m-top-20">
					<view class="flex-center">
						<view class="price" v-if="priceArry.length > 0">
							<text class="unit">¥</text>
							{{ priceArry[0] }}
						</view>
						<text v-if="priceArry.length > 1" class="line">-</text>
						<view v-if="priceArry.length > 1" class="price">
							<text class="unit">¥</text>
							{{ priceArry[1] }}
						</view>
					</view>
				</view>
			</view>
			<!-- 规格参数信息 -->
			<view class="box">
				<!-- 商品属性选择（只有实体商品才展示） -->
				<view v-if="entityGoodsCheck === 2" class="flex row">
					<text class="label color-9">选择</text>
					<view class="flex-1">
						<view class="flex-center-between">
							<text>属性分类</text>
							<image @click="openPopup('classifyPopup')" class="icon-more" src="../../../static/images/icons/icon-dots.svg" mode="aspectFill"></image>
						</view>
						<view class="checkbox-lists">
							<view v-for="(item, index) in goodsInfo.goodsAttributesVOList" :key="`goodsAttribute-${index}`" class="item">{{ item.attributesName }}</view>
							<view class="item">共{{ goodsInfo.goodsAttributesVOList.length }}种型号可选</view>
						</view>
					</view>
				</view>
				<!-- 发货（只有实体商品才显示） -->
				<view v-if="entityGoodsCheck === 2" class="flex row">
					<text class="label color-9">发货</text>
					<view class="flex-1">
						<view class="flex-center-between">
							<text>
								{{ goodsInfo.city }}{{ goodsInfo.area }}
								<!-- 只有实体商品才会有快递费 -->
								<block v-if="entityGoodsCheck === 2 && selectGoodsVO.attributesId">快递: {{ freightAmount > 0 ? `${freightAmount}元` : '免快递费' }}</block>
							</text>
							<!-- 只有实体商品才可以去选择配送地址 -->
							<image v-if="entityGoodsCheck === 2" @click="goAddress()" class="icon-more" src="../../../static/images/icons/icon-dots.svg" mode="aspectFill"></image>
						</view>
						<view v-if="defaultAddress && defaultAddress.id" class="color-9 m-top-20">
							配送至：{{ defaultAddress.provinceName }} {{ defaultAddress.cityName }} {{ defaultAddress.areaName }} {{ defaultAddress.streetName }}
							{{ defaultAddress.address }}
						</view>
					</view>
				</view>
				<!-- 保障 -->
				<view class="flex row">
					<text class="label color-9">保障</text>
					<view class="flex-1 flex-center-between">
						<view class="ensure-lists">
							<view v-if="goodsInfo.type === 2" class="item blue">企业认证</view>
							<view class="item yellow">平台认证</view>
							<view class="item red">保证金</view>
						</view>
						<image @click="openPopup('ensurePopup')" class="icon-more" src="../../../static/images/icons/icon-dots.svg" mode="aspectFill"></image>
					</view>
				</view>
				<!-- 参数 -->
				<view class="flex row" v-if="courseCheck === 2 || questionCheck === 2">
					<text class="label color-9">参数</text>
					<view class="params-lists flex-1">
						<view class="item" v-if="courseCheck === 2">课时</view>
						<view class="item" v-if="courseCheck === 2">课程方式</view>
						<view class="item" v-if="questionCheck === 2">题库数量</view>
					</view>
					<image @click="openPopup('parameterPopup')" class="icon-more" src="../../../static/images/icons/icon-dots.svg" mode="aspectFill"></image>
				</view>
			</view>
			<!-- 横向菜单 -->
			<custom-horizontal-tabs id="custom-tabs" @change="getTabsIndex" :currentIndex="tabsIndex" :data="tabsData" :class="{ fixed: tabsFixed }"></custom-horizontal-tabs>
			<!-- Tabs内容 可左右滚动 -->
			<swiper :current="tabsIndex" @change="menuSwiperChange" :style="{ height: swiperHeight + 'px' }">
				<swiper-item v-for="(item, index) in tabsData" :key="`swiper-item-${index}`">
					<!--  tab 介绍 -->
					<tabs-brief v-if="item == '介绍'" 
					:id="`content-wrap-${index}`" 
					:goodsInfo="goodsInfo"></tabs-brief>
					
					<!--  tab 商品 -->
					<tabs-goods v-if="item == '商品'"
					:id="`content-wrap-${index}`"
					:score="goodsInfo.goodsScore"
					:entityGoodsVO="goodsInfo.entityGoodsVO"
					:entityCommentVOList="entityCommentVOList"></tabs-goods>
					
					<!--  tab 课程 -->
					<tabs-catalogue v-if="item == '课程'" 
					:id="`content-wrap-${index}`" 
					:score="goodsInfo.courseScore"
					:courseVO="goodsInfo.courseVO" 
					:courseCommentVOList="courseCommentVOList"></tabs-catalogue>
					
					<!--  tab 题库 -->
					<tabs-bank v-if="item == '题库'"
					:id="`content-wrap-${index}`"
					:score="goodsInfo.questionScore"
					:questionBankVO="goodsInfo.questionBankVO"
					:questionCommentVOList="questionCommentVOList"></tabs-bank>
					
					<!--  tab 考试 -->
					<tabs-exam v-if="item == '考试'" 
					:id="`content-wrap-${index}`" 
					:score="goodsInfo.examScore"
					:examVO="goodsInfo.examVO" 
					:examCommentVOList="examCommentVOList"></tabs-exam>
					
					<!--  tab 推荐 -->
					<tabs-recommend v-if="item == '推荐'" 
					:id="`content-wrap-${index}`" 
					:goodsBottomHeight="goodsBottomHeight" 
					:tabsHeight="tabsHeight"></tabs-recommend>
				</swiper-item>
			</swiper>
		</scroll-view>
		<!-- 底部 -->
		<view class="goods-bottom flex-center-between" id="goods-bottom">
			<view class="flex-column" @click="gotoStoreDetail">
				<image class="icons" src="../../../static/images/icons/icon-room.svg" mode="aspectFill"></image>
				<text>店铺</text>
			</view>
			<view class="flex-column" @click="toCustomerService">
				<image class="icons" src="../../../static/images/icons/icon-kf.svg" mode="aspectFill"></image>
				<text>客服</text>
			</view>
			<view class="flex-column">
				<image
					class="icons"
					v-if="goodsInfo.userCollection === 2"
					src="../../../static/images/icons/icon-save-on.svg"
					mode="aspectFill"
					@click="collectClick(false)"
				></image>
				<image class="icons" v-else src="../../../static/images/icons/icon-save.svg" @click="collectClick(true)"></image>
				<text>收藏</text>
			</view>
			<button class="btn btn-block flex-1" @click="jumpConfirm">立即购买</button>
		</view>
		<!-- 弹窗 属性分类 -->
		<goods-classify-popup ref="classifyPopup"
		:type="2"
		:goodsInfo="goodsInfo"
		@submit="goodsAttributesSubmit"></goods-classify-popup>
		<!-- 弹窗 保障 -->
		<goods-ensure-popup ref="ensurePopup" :goodsInfo="goodsInfo"></goods-ensure-popup>
		<!-- 弹窗 参数 -->
		<goods-parameter-popup ref="parameterPopup" :goodsInfo="goodsInfo" :courseCheck="courseCheck" :questionCheck="questionCheck"></goods-parameter-popup>
	</view>
</template>

<script>
import TabsBrief from './tabs-brief.vue';
import TabsGoods from './tabs-goods.vue';
import TabsBank from './tabs-bank.vue';
import TabsExam from './tabs-exam.vue';
import TabsCatalogue from './tabs-catalogue.vue';
import TabsRecommend from './tabs-recommend.vue';
import { mapState } from 'vuex'; //引入mapState
import config from '../../../utils/config.js';
export default {
	components: {
		TabsBrief,
		TabsGoods,
		TabsBank,
		TabsExam,
		TabsRecommend,
		TabsCatalogue
	},
	data() {
		return {
			tabsData: ['介绍'], //tab数据
			tabsIndex: 0, //当前选中的tab下标
			goodsId: undefined, //商品ID
			unremittinglyId: undefined, //坚持不懈活动ID
			goodsInfo: {
				//商品详情
				img: [], //banner图
				goodsAttributesVOList: [], //商品属性
				entityGoodsVO: {}, //实体商品
				courseVO: {
					//课程
					courseClassVOList: []
				},
				questionBankVO: {}, //题库
				examVO: {}, //考试
				storeFreightConfigVO: {} //运费规则
			},
			entityGoodsCheck: 1, //是否包含实体商品资源 1 未包含 2 包含
			courseCheck: 1, //是否包含课程资源 1 未包含 2 包含
			examCheck: 1, // 是否包含考试资源 1 未包含 2 包含
			questionCheck: 1, //是否包含题库资源 1 未包含 2 包含
			swiperHeight: 0, //tab内容的高度
			goodsBottomHeight: 0, //购物车工具条高度
			tabsTop: 0, //TAB选项卡距离顶部的高度
			tabsHeight: 0, //TAB选项卡高度
			tabsFixed: false, //TAB选项卡是否固定在顶部
			priceArry: [], //显示价格区间
			entityCommentVOList: [], //商品评论
			examCommentVOList: [], //考试评论
			questionCommentVOList: [], //题库评论
			courseCommentVOList: [], //课程评论
			selectGoodsVO: {} //选中的商品对象
		};
	},
	computed: mapState({
		// 选中的收货地址
		defaultAddress: state => state.defaultAddress,
		// 快递费
		freightAmount: function() {
			var price = 0;
			var storeFreightConfigVO = this.goodsInfo.storeFreightConfigVO || {};
			if (storeFreightConfigVO.type == 2) {
				//阶梯运费
				// 最终价格 = 选中商品的单价*数量
				let finalPrice = this.selectGoodsVO.price * this.selectGoodsVO.goodsNum;
				if (finalPrice < storeFreightConfigVO.orderAmount) {
					price = storeFreightConfigVO.maxFreightAmount;
				} else {
					price = storeFreightConfigVO.minFreightAmount;
				}
			} else if (storeFreightConfigVO.type == 1) {
				//统一运费
				price = storeFreightConfigVO.freightAmount;
			}
			return price;
		},
		// 坚持不懈报名活动对象
		unremittinglyVO: state => state.unremittinglyVO
	}),
	watch: {
		'$store.state.goodsDetailsHeightChange': {
			handler: function(newVal, oldVal) {
				//动态设置swiper的高度
				this.setSwiperHeight();
			}
		},
		'$store.state.orderChange': function(){
			this.getGoodsInfo();
		}
	},
	onLoad(option) {
		this.goodsId = this.unremittinglyVO.goodsId;
		this.unremittinglyId = this.unremittinglyVO.unremittinglyId;
		this.getGoodsResource();
		this.getGoodsInfo();
		this.getComment();
	},
	methods: {
		// 获取当前 tab index
		getTabsIndex(index) {
			this.tabsIndex = index;
		},
		//打开弹窗；参数：弹窗的ref名
		openPopup(value) {
			this.$refs[value].open();
		},
		// 获取Tab选项卡距离顶部的高度及自身高度
		getTabsTopAndHeight() {
			setTimeout(()=>{
				this.$nextTick(() => {
					let query = uni.createSelectorQuery().in(this);
					query.select('#custom-tabs').boundingClientRect();
					query.exec(res => {
						if (res && res[0]) {
							this.tabsTop = res[0].top;
							this.tabsHeight = res[0].height;
						}
					});
				});
			}, 1000);
		},
		// 获取底部购物车工具类高度
		getGoodsBottomHeight() {
			this.$nextTick(() => {
				let query = uni.createSelectorQuery().in(this);
				query.select('#goods-bottom').boundingClientRect();
				query.exec(res => {
					if (res && res[0]) {
						this.goodsBottomHeight = res[0].height;
					}
				});
			});
		},
		/**
		 * 滚动回调
		 * @param {Object} e
		 */
		scrollHandle(e) {
			// TODO: 这里固定效果不太好，先去掉这种效果吧 这里要实现页面上滑到tab时，tab进行固定的效果
			// if (e.detail.scrollTop >= this.tabsTop && !this.tabsFixed) {
			// 	this.tabsFixed = true;
			// 	return;
			// }
			
			// if (e.detail.scrollTop < this.tabsTop && this.tabsFixed) {
			// 	this.tabsFixed = false;
			// 	return;
			// }
		},
		/**
		 * 轮播图预览
		 * @param {Object} index
		 */
		previewBanner(index){
			uni.previewImage({
			    urls: this.goodsInfo.img,
				current: index,
				indicator: 'default'
			});        
		},
		//立即购买
		jumpConfirm(){
			if(this.entityGoodsCheck === 2){ //只有实体商品才会弹出商品属性选择
				this.openPopup('classifyPopup');
			}else { //如果是虚拟商品，就不需要选择商品属性，直接进行下一步操作
				let goodsAttributes = {
					price: this.goodsInfo.price
				}
				this.goodsAttributesSubmit({goodsAttributes, count:1});
			}
		},

		
		// 跳转客服页面
		toCustomerService(){
			this.$http.get('/im/getIMGroupId',{storeId:this.goodsInfo.storeId},true).then(res=>{
				const groupId = res.groupId;
				const user = getApp().globalData.user;
				getApp().globalData.messageParam = {
					groupId:groupId,
					userIM:user.imNum,
					userName:user.userName,
					storeName:this.goodsInfo.storeName,
					storePortrait:this.goodsInfo.avatar 
				}
				
				uni.navigateTo({
					url:'/pages/im-message/im-message'
				})
			})
		},
		

		/**
		 * tab水平滚动回调
		 * @param {Object} e
		 */
		menuSwiperChange(e) {
			this.tabsIndex = e.detail.current;
			//动态设置swiper的高度
			this.setSwiperHeight();
		},

		//动态设置swiper的高度
		setSwiperHeight() {
			this.$nextTick(() => {
				let element = '#content-wrap-' + this.tabsIndex;
				let query = uni.createSelectorQuery().in(this);
				query.select(element).boundingClientRect();
				query.exec(res => {
					if (res && res[0]) {
						this.swiperHeight = res[0].height;
					}
				});
			});
		},

		/**
		 * 查询商品包含资源（实体商品，课程，题库，考试）情况
		 */
		getGoodsResource() {
			this.$http.get('/goods/checkResource', { goodsId: this.goodsId }, true).then(res => {
				this.tabsData = ['介绍'];
				this.entityGoodsCheck = res.entityGoodsCheck;
				this.courseCheck = res.courseCheck;
				this.questionCheck = res.questionCheck;
				this.examCheck = res.examCheck;
				if (res.entityGoodsCheck === 2) {
					this.tabsData.push('商品');
				}
				if (res.courseCheck === 2) {
					this.tabsData.push('课程');
				}
				if (res.questionCheck === 2) {
					this.tabsData.push('题库');
				}
				if (res.examCheck === 2) {
					this.tabsData.push('考试');
				}
				this.tabsData.push('推荐');
			});
		},

		/**
		 * 获取商品详情
		 */

		getGoodsInfo() {
			this.$http.get('/goods/queryInfoByLogin', { goodsId: this.goodsId, unremittinglyId:this.unremittinglyId }, true).then(res => {
				this.goodsInfo = res;

				if (res.minPrice && res.maxPrice && res.minPrice !== res.maxPrice) {
					//如果商品有价格区间
					this.priceArry = [res.minPrice, res.maxPrice];
				} else {
					//如果是单一商品
					this.priceArry = [res.price];
					this.selectGoodsVO = { ...res.goodsAttributesVOList[0], goodsNum: 1 };
				}
				//等接口查完之后，再去计算tabs和底部操作栏的高度
				this.getTabsTopAndHeight();
				this.getGoodsBottomHeight();
				//动态设置swiper的高度
				this.setSwiperHeight();
			});
		},

		/**
		 * 获取商品评论信息
		 */
		getComment() {
			this.$http.get('/goods/queryCommentPage', { goodsId: this.goodsId }, true).then(res => {
				this.entityCommentVOList = res.entityCommentVOList;
				this.courseCommentVOList = res.courseCommentVOList;
				this.examCommentVOList = res.examCommentVOList;
				this.questionCommentVOList = res.questionCommentVOList;
			});
		},

		/** 商品收藏
		 * @param {Object} isCollect  true 收藏/ false 取消收藏
		 */
		collectClick(isCollect) {
			if (isCollect) {
				this.$http.post('/goods/collect', { goodsId: this.goodsId }, true).then(res => {
					this.goodsInfo.userCollection = 2;
				});
			} else {
				this.$http.delete('/goods/collection/delete', { idList: [this.goodsId] }, true).then(res => {
					this.goodsInfo.userCollection = 1;
				});
			}
		},

		/**
		 * 商品属性提交回调
		 */
		goodsAttributesSubmit({goodsAttributes,count}){
			this.selectGoodsVO = {...goodsAttributes,goodsNum:count};	
			uni.navigateTo({
				url: `/pages-user/index/confirm/confirm-unremittingly?goodsNum=${count}&attributesId=${goodsAttributes.attributesId}`
			});

		},

		// 打开配送地址页面
		goAddress() {
			uni.navigateTo({
				url: `/pages-user/index/address/address`
			});
		},
		
		// 跳转店铺详情
		gotoStoreDetail(){
			const storeId = this.goodsInfo.storeId;
			uni.navigateTo({
				url:`/pages-user/index/store-details/store-details?storeId=${storeId}`
			})
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

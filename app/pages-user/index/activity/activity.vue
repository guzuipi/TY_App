<!-- 活动 -->
<template>
	<scroll-view scroll-y="true" class="main-content activity" :refresher-enabled="true"
		:refresher-triggered="triggered" :refresher-threshold="45" @refresherrefresh="onRefresh"
		@scrolltolower="onScrollTolower">
		<!-- 轮播图 -->
		<view class="swiper-content">
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" interval="4000" duration="500">
				<swiper-item v-for="item in bannerList" @click="bannerAction(item)">
					<image class="swiper-img" :src="item.image" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- banner -->
		<!-- <image class="banner-image" src="../../../static/images/other/banner.jpg" mode="widthFix"></image> -->
		<!-- tabs -->
		<view class="flex-center tabs-block">
			<view class="item" :class="{ first: tabsIndex === 0 }" @click="changeTabsIndex(0)">组团优惠</view>
			<view class="item" :class="{ second: tabsIndex === 1 }" @click="changeTabsIndex(1)">坚持不懈</view>
			<view class="item" :class="{ three: tabsIndex === 2 }" @click="changeTabsIndex(2)">分销大使</view>
		</view>

		<!-- 组团优惠 -->
		<view v-show="tabsIndex === 0">
			<block v-for="(item, index) in groupBuyList" :key="`group-goods-${index}`">
				<active-group-lists-item class="activity-lists-item" :data="item" @submit="sbumitGoodsGroup">
				</active-group-lists-item>
			</block>
			<!-- 列表为空 -->
			<my-empty :show="groupBuyList.length === 0"></my-empty>
			<!-- 加载更多 -->
			<uni-load-more v-show="groupBuyList.length > 0" :status="groupBuyParams.status" :icon-size="16"
				:content-text="contentText"></uni-load-more>
		</view>



		<!-- 坚持不懈 -->
		<view v-show="tabsIndex === 1" class="insist-lists-item" v-for="(item, index) in unremittinglyList"
			:key="`unremittingly-${index}`">
			<view class="flex-column">
				<text>{{item.unremittinglyName}}</text>
				<text class="price">奖品：{{item.goodsName}}</text>
			</view>
			<button class="btn" v-if="item.joinFlag === 1"
				@click="submitUnremittingly(item.unremittinglyId)">报名活动</button>
			<button class="btn disable" v-if="item.joinFlag === 2">已报名</button>
		</view>
		<!-- 列表为空 -->
		<my-empty style="height: auto;" :show="tabsIndex === 1 && unremittinglyList.length === 0"></my-empty>



		<!-- 分销大使 -->
		<tabs-sales v-show="tabsIndex === 2" :distributionGoodsList="distributionGoodsList"
			:distributionStoreList="distributionStoreList" :goodsLoadMoreState="distributionGoodsParams.status"
			:storeLoadMoreState="distributionStoreParams.status" @tabChange="salesTabsChange"></tabs-sales>


		<!-- 坚持不懈活动详情 弹窗 -->
		<sales-activity-popup ref="salesActivityPopup" :data="currentUnremittinglyVO" @submit="unremittinglySubmit">
		</sales-activity-popup>

		<!-- 弹窗 参与拼团 -->
		<goods-group-popup ref="groupPopup" :data="currentGroupBuyVO" @submit="goodsGroupSubmit"></goods-group-popup>

	</scroll-view>
</template>

<script>
	import TabsSales from './tabs-sales.vue';
	import config from '../../../utils/config.js';

	export default {
		name: 'TabActivity',
		components: {
			TabsSales
		},
		data() {
			return {
				tabsIndex: 0,
				_freshing: false,
				triggered: false, //刷新标志位
				// banner图
				bannerList: [],
				contentText: {
					contentdown: '上拉加载更多',
					contentrefresh: '加载中',
					contentnomore: '没有更多'
				},

				groupBuyParams: { //组团优惠参数
					page: 1,
					size: 20,
					status: 'more'
				},
				unremittinglyParams: { //坚持不懈参数
					page: 1,
					size: 20,
					status: 'more'
				},
				distributionGoodsParams: { //商品分销参数
					page: 1,
					size: 20,
					status: 'more'
				},
				distributionStoreParams: { //店铺分销参数
					page: 1,
					size: 20,
					status: 'more'
				},
				groupBuyList: [], //组团优惠商品
				unremittinglyList: [], //坚持不懈
				distributionGoodsList: [], //商品分销
				distributionStoreList: [], //店铺分销
				currentUnremittinglyVO: {}, //当前选中的坚持不懈报名产品
				currentGroupBuyVO: {}, //当前选中的参与拼团商品
				tabsSaleIndex: 0 //当前分销大使Tabs索引  0商品分销  1店铺分销

			};
		},
		watch: {
			'$store.state.orderChange': function() {
				this.groupBuyParams.page = 1;
				this.unremittinglyParams.page = 1;
				this.distributionGoodsParams.page = 1;
				this.distributionStoreParams.page = 1;
				this.queryGroupBuy();
				this.queryUnremittingly();
				this.queryDistributionGoods();
				this.queryDistributionStore();
			}
		},
		created() {
			this.queryGroupBuy();
			this.queryUnremittingly();
			this.queryDistributionGoods();
			this.queryDistributionStore();
			this.queryBannerList();
			uni.$on('activity-open', (index) => {
				this.changeTabsIndex(index || this.tabsIndex)
			})
		},
		methods: {
			// 查询轮播图
			queryBannerList() {
				this.$http.get('/navigate/queryBannerList', {
					platform: 1
				}).then(res => {
					this.bannerList = res;
				});
			},
			// banner 点击事件
			bannerAction(banner) {
				if (banner.type == 1) {
					config.H5Obj = {
						title: banner.title,
						link: banner.content
					}
					uni.navigateTo({
						url: '/pages/watch-h5/watch-h5?type=link'
					})
				} else if (banner.type == 2) {
					this.gotoGoodsDetail({
						goodsId: banner.content
					});
				} else if (banner.type == 3) {
					uni.navigateTo({
						url: `/pages-user/index/store-details/store-details?storeId=${banner.content}`
					})
				}
			},
			// 跳转商品详情
			gotoGoodsDetail(goodsData) {
				uni.navigateTo({
					url: `/pages-user/index/goods-details/goods-details?goodsId=${goodsData.goodsId}`
				});
			},
			// change tabs index
			changeTabsIndex(value) {
				if (value === this.tabsIndex) return;
				this.tabsIndex = value;
				// 每次TAB切换都要触发接口刷新
				this.groupBuyParams.page = 1;
				this.unremittinglyParams.page = 1;
				this.distributionGoodsParams.page = 1;
				this.distributionStoreParams.page = 1;
				this.queryGroupBuy();
				this.queryUnremittingly();
				this.queryDistributionGoods();
				this.queryDistributionStore();
			},
			//打开弹窗
			openPopup(refName) {
				this.$refs[refName].open();
			},

			/**
			 * 查询组团优惠商品
			 */
			queryGroupBuy() {
				this.$http
					.get('/groupBuy/queryPageByLogin', this.groupBuyParams, true)
					.then(res => {
						if (this.groupBuyParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
							this.groupBuyList = res.content;
						} else {
							this.groupBuyList = this.groupBuyList.concat(res.content);
						}
						if (res.totalSize <= this.groupBuyParams.page * this.groupBuyParams.size) {
							this.groupBuyParams.status = "noMore"
						} else {
							this.groupBuyParams.status = "more"
						}
					}).catch(err => {
						if (this.groupBuyParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
						} else {
							this.groupBuyParams.status = "more";
							this.groupBuyParams.page -= 1;
						}
					});
			},

			/**
			 * 查询坚持不懈
			 */
			queryUnremittingly() {
				this.$http
					.get('/unremittingly/queryPageByLogin', this.unremittinglyParams, true)
					.then(res => {
						if (this.unremittinglyParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
							this.unremittinglyList = res.content;
						} else {
							this.unremittinglyList = this.unremittinglyList.concat(res.content);
						}
						if (res.totalSize <= this.unremittinglyParams.page * this.unremittinglyParams.size) {
							this.unremittinglyParams.status = "noMore"
						} else {
							this.unremittinglyParams.status = "more"
						}
					}).catch(err => {
						if (this.unremittinglyParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
						} else {
							this.unremittinglyParams.status = "more";
							this.unremittinglyParams.page -= 1;
						}
					});
			},

			/**
			 * 查询商品分销
			 */
			queryDistributionGoods() {
				this.$http
					.get('/distribution/queryGoodsPage', this.distributionGoodsParams, true)
					.then(res => {
						if (this.distributionGoodsParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
							this.distributionGoodsList = res.content;
						} else {
							this.distributionGoodsList = this.distributionGoodsList.concat(res.content);
						}
						if (res.totalSize <= this.distributionGoodsParams.page * this.distributionGoodsParams.size) {
							this.distributionGoodsParams.status = "noMore"
						} else {
							this.distributionGoodsParams.status = "more"
						}
					}).catch(err => {
						if (this.distributionGoodsParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
						} else {
							this.distributionGoodsParams.status = "more";
							this.distributionGoodsParams.page -= 1;
						}
					});
			},

			/**
			 * 查询店铺分销
			 */
			queryDistributionStore() {
				this.$http
					.get('/distribution/queryStorePage', this.distributionStoreParams, true)
					.then(res => {
						if (this.distributionStoreParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
							this.distributionStoreList = res.content;
						} else {
							this.distributionStoreList = this.distributionStoreList.concat(res.content);
						}
						if (res.totalSize <= this.distributionStoreParams.page * this.distributionStoreParams.size) {
							this.distributionStoreParams.status = "noMore"
						} else {
							this.distributionStoreParams.status = "more"
						}
					}).catch(err => {
						if (this.distributionStoreParams.page == 1) {
							this.triggered = false;
							this._freshing = false;
						} else {
							this.distributionStoreParams.status = "more";
							this.distributionStoreParams.page -= 1;
						}
					});
			},

			/**
			 * 下拉刷新
			 */
			onRefresh() {
				if (this._freshing) return;
				this._freshing = true;
				if (!this.triggered) this.triggered = true;

				if (this.tabsIndex === 0) {
					this.groupBuyParams.page = 1;
					this.queryGroupBuy();
				} else if (this.tabsIndex === 1) {
					this.unremittinglyParams.page = 1;
					this.queryUnremittingly();
				} else if (this.tabsIndex === 2) {
					if (this.tabsSaleIndex === 0) {
						this.queryDistributionGoods();
					} else if (this.tabsSaleIndex === 1) {
						this.queryDistributionStore();
					}
				}

			},

			/**
			 * 上拉加载
			 */
			onScrollTolower() {
				if (this.tabsIndex === 0 && this.groupBuyParams.status !== 'noMore') {
					this.groupBuyParams.status = 'more';
					this.groupBuyParams.page += 1;
					this.queryGroupBuy();
				} else if (this.tabsIndex === 1 && this.unremittinglyParams.status !== 'noMore') {
					this.unremittinglyParams.status = 'more';
					this.unremittinglyParams.page += 1;
					this.queryUnremittingly();
				} else if (this.tabsIndex === 2) {
					if (this.tabsSaleIndex === 0 && this.distributionGoodsParams.status !== 'noMore') {
						this.distributionGoodsParams.status = 'more';
						this.distributionGoodsParams.page += 1;
						this.queryDistributionGoods();
					} else if (this.tabsSaleIndex === 1 && this.distributionStoreParams.status !== 'noMore') {
						this.distributionStoreParams.status = 'more';
						this.distributionStoreParams.page += 1;
						this.queryDistributionStore();
					}
				}
			},

			/**
			 * 坚持不懈报名活动按钮点击
			 * @param {Object} unremittinglyId 活动id
			 */
			submitUnremittingly(unremittinglyId) {

				// 先调接口判断用户能否报名参加活动（一个用户只能参加一个活动，如果已经参加过就不能再参加其他活动了）
				this.$http.get('/unremittingly/queryDetail', {}, true).then(res => {

					// 查询活动详情
					this.$http
						.get('/unremittingly/queryInfo', {
							unremittinglyId: unremittinglyId
						}, true)
						.then(res => {
							this.currentUnremittinglyVO = res;
							this.openPopup('salesActivityPopup');
						});
				});
			},

			/**
			 * 坚持不懈立即参加点击回调
			 * @param {Object} unremittinglyVO 活动报名对象
			 */
			unremittinglySubmit(unremittinglyVO) {
				this.$refs.salesActivityPopup.close();
				this.$store.commit('setUnremittinglyVO', unremittinglyVO);
				uni.navigateTo({
					url: `/pages-user/index/goods-details/goods-details-unremittingly`
				});
			},

			/**
			 * 参加拼团按钮点击
			 * @param {Object} groupBuyId  拼团活动ID
			 */
			sbumitGoodsGroup(groupBuyId) {
				this.$http.get('/groupBuy/queryInfoByLogin', {
					groupBuyId: groupBuyId
				}, true).then(res => {
					this.currentGroupBuyVO = res;
					this.openPopup('groupPopup');
				});
			},

			/**
			 * 立即参与拼团按钮点击回调
			 * @param {Object} groupBuyVO  组团优惠活动对象
			 */
			goodsGroupSubmit(groupBuyVO) {
				this.$refs.groupPopup.close();
				this.$store.commit('setGroupBuyGoodsVO', groupBuyVO);
				uni.navigateTo({
					url: `/pages-user/index/confirm/confirm-groupbuy`
				});
			},

			salesTabsChange(index) {
				this.tabsSaleIndex = index;
			}
		}
	};
</script>

<style lang="less" src="./style.less"></style>

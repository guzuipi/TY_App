<!-- 商品 拼团 -->
<template>
	<uni-popup class="custom-popup" ref="popup" :safeArea="false" type="bottom">
		<view class="popup-main">
			<view class="title text-bold">
				拼团详情
				<image @click="close()" class="icon-close" src="../../static/images/icons/icon-cha.svg" mode="aspectFill"></image>
			</view>
			<view class="row">
				<text class="label text-bold">团购开始时间：</text>
				<text class="color-6">{{detail.startTime}}</text>
			</view>
			<view class="row">
				<text class="label text-bold">团购结束时间：</text>
				<text class="color-6">{{detail.endTime}}</text>
			</view>
			<view class="row">
				<text class="label text-bold">拼团规则：</text>
				<text class="color-6">{{detail.content}}</text>
			</view>
			<view class="row">
				<text class="label text-bold">已参团人数：</text>
				<text class="color-6">{{detail.groupBuyNum}}</text>
			</view>
			<view class="row price">
				最低折扣：¥{{detail.minPrice}} - ¥{{detail.maxPrice}}
			</view>
			<view v-if="showBottom" class="flex-center-between popup-bottom">
				<view class="flex-column-center" @click="customerClick">
					<image class="icon" src="../../static/images/icons/icon-kf.svg" mode="aspectFill"></image>
					<text>客服</text>
				</view>
				<button class="btn flex-1" @click="submit">{{`¥${detail.joinAmount}  参与拼团`}}</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'goods-group-popup',
	emits: ['submit'],
	props: {
		data: {
			type: Object
		},
		showBottom: { //是否显示底部操作按钮
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			detail: this.data
		};
	},
	watch: {
		data(newV, oldV){
			this.detail = newV;
		}
	},
	methods:{
		// 打开弹窗
		open() {
			this.$refs.popup.open();
		},
		// 关闭弹窗
		close() {
			this.$refs.popup.close();
		},
		// 参与拼团按钮点击
		submit(){
			this.$emit('submit',this.detail);
		},
		// 客服按钮点击
		customerClick(){
			//TODO: 这里需要跳转到IM界面
			this.$http.get('/im/getIMGroupId',{storeId:this.detail.storeId},true).then(res=>{
				const groupId = res.groupId;
				const user = getApp().globalData.user;
				getApp().globalData.messageParam = {
					groupId:groupId,
					userIM:user.imNum,
					userName:user.userName,
					storeName:this.detail.storeName,
					storePortrait:this.detail.avatar 
				}
				
				uni.navigateTo({
					url:'/pages/im-message/im-message'
				})
			})
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

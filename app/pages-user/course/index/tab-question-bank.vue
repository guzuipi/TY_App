<!-- tab 我的题库 -->
<template>
	<view class="bank-content">
		<!-- 列表 -->
		<my-scroll-view v-if="!questionBankInfo" class="course-lists" @loadData="onLoadData">
			<template v-slot:list="slotProps">
				<course-video-item :state="1" v-for="(item, index) in slotProps.list" :key="index" :data="item" @clickItem="bindQuestionInfo" />
			</template>
		</my-scroll-view>
		<!-- 我的题库 -->
		<scroll-view v-else scroll-y="true" class="course-exam-content">
			<!-- 我的题库 -->
			<view class="flex-center-between my-bank" @click="bindQuestionInfo()">
				<view class="flex-center">
					<image class="arrow-right"  src="../../../static/images/icons/icon-back.svg" mode="aspectFill" />
					<view class="title text-bold">我的题库</view>
				</view>
				<view class="flex-1" v-if="questionBankInfo && questionBankInfo.title">{{ questionBankInfo.title }}</view>
			</view>
			<!-- 列表 -->
			<view class="flex bank-lists">
				<view class="bank-item flex-column-center" @click="route('exam0')">
					<image class="image" src="../../../static/images/course-sjlx.png" mode="aspectFill" />
					<text>随机练习</text>
				</view>
				<view class="bank-item-middle red flex-column-center text-bold" @click="route('exam1')">
					<text>顺序练习</text>
					<text class="font-24">{{ detail.doneQuestionCount }}/{{ detail.questionCount }}</text>
				</view>
				<view class="bank-item flex-column-center" @click="route('exam4')">
					<image class="image" src="../../../static/images/course-error.png" mode="aspectFill" />
					<text>我的错题</text>
				</view>
				<view class="bank-item flex-column-center" @click="route('history')">
					<image class="image" src="../../../static/images/course-history.png" mode="aspectFill" />
					<text>做题历史</text>
				</view>
				<view class="bank-item-middle blue flex-column-center text-bold" @click="route('exam2')">
					<text>模拟考试</text>
					<text class="font-24">100%仿真</text>
				</view>
				<view class="bank-item flex-column-center" @click="route('exam3')">
					<image class="image" src="../../../static/images/course-collect.png" mode="aspectFill" />
					<text>我的收藏</text>
				</view>
			</view>
			
			<!-- 广告位 -->
			<image class="advertise-image" src="../../../static/images/login/advert.png" mode="widthFix" />
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'tab-question-bank',
	data() {
		return {
			questionBankInfo: undefined,
			detail: {} //题库详情
		};
	},
	mounted() { 
    // 返回刷新页面
     uni.$on("examback", (questionBankId) => {
       if(questionBankId){
         this.queryDetail(questionBankId);
       }
      // 清除监听
      // uni.$off('examback');
    }) 
  },
	methods: {
		onLoadData(page, size, callback) {
			this.$http
				.get('/questionBank/queryPageByUser', { page, size }, true)
				.then(res => {
					callback(res);
				})
				.catch(err => {
					callback(null);
				});
		},

    // 做题行点击 && 返回
		bindQuestionInfo(data) {
			this.questionBankInfo = data || undefined;
			if (data) {
				this.queryDetail(data.questionBankId);
			}
		},

		async queryDetail(questionBankId) {
			const data = await this.$http.get('/questionBank/queryInfo', { questionBankId }, true);
			this.detail = data;
		},

		route(name) {
			let url = '';
			const { questionBankId, examTime } = this.detail || {};
			switch (name) {
				case 'history':
					url = `/pages-user/course/history/history?questionBankId=${questionBankId}`;
					break;
				// 随机练习
				case 'exam0':
					url = `/pages-user/course/exam/exam?questionBankId=${questionBankId}&type=0`;
					break;
				// 顺序练习
				case 'exam1':
					url = `/pages-user/course/exam/exam?questionBankId=${questionBankId}&type=1`;
					break;
				// 模拟考试
				case 'exam2':
					url = `/pages-user/course/exam/exam?questionBankId=${questionBankId}&type=2&examTime=${examTime}`;
					break;
				// 我的收藏
				case 'exam3':
					url = `/pages-user/course/exam/exam?questionBankId=${questionBankId}&type=3`;
					break;
				// 我的错题
				case 'exam4':
					url = `/pages-user/course/exam/exam?questionBankId=${questionBankId}&type=4`;
					break;
			}
			uni.navigateTo({
				url
			});
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

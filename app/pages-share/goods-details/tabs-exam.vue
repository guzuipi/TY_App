<!-- 开始-->
<template>
	<view class="tabs-goods">
		<!-- 标题 -->
		<view class="flex-center-between comment-title">
			<view class="title">全部评论（{{commentList.length}}）</view>
			<view class="flex-center flex-1 color-yellow">
				<text class="color-yellow">考试评分</text>
				<rate class="rate" :number="examScore"></rate>
			</view>
			<view class="flex-center">
				更多
				<image class="icon-arrow" mode="aspectFill" src="../../static/images/icons/icon-arrow-right.svg"></image>
			</view>
		</view>
		<!-- 评论列表 -->
		<block v-for="(item,index) in commentList.length > 2 ? commentList.slice(0,2) : commentList" 
		:key="`comment-entity-${index}`">
			<comment-lists-item :data="item"></comment-lists-item>
		</block>
		<rich-text :nodes="content"></rich-text>
	</view>
</template>

<script>
export default {
	name: 'tabsExam',
	props:{
		score: { //考试评分
			type: Number,
			default: 0
		},
		examVO:{ //考试信息
			type:Object,
			required:true
		},
		examCommentVOList:{ //考题评论
			type:Array,
			required:true
		}
	},
	data() {
		return {
			commentList:this.examCommentVOList, //考题评论
			examScore:this.score || 5, //考题评分
			content:this.examVO.conent //考题内容
		};
	},
	watch:{
		score(newV, oldV){
			this.examScore = newV || 5;
		},
		examVO(newV, oldV){
			this.content = newV.content;
		},
		examCommentVOList(newV, oldV){
			this.commentList = newV;
		}
	}
};
</script>

<style lang="less" src="./style.less" scoped></style>

<!-- 发布直播 -->
<template>
	<view class="live publish">
		<view class="form-row">
			<text class="label">选择课程</text>
			<picker class="input" @change="bindPickerChange" :value="selectedIndexArr" @columnchange="columnchange" range-key="courseClassName"  mode="multiSelector"  :range="curriculumList">
				<view class="uni-input">{{ selectedNames.join('/') }}</view>
			</picker>
		</view>
		<view class="form-row">
			<text class="label">直播名称</text>
			<input placeholder-class="input-placeholder" class="input" type="text" v-model="liveName" placeholder="请输入" />
		</view>
		<view class="form-row">
			<text class="label">直播简介</text>
			<textarea placeholder-class="input-placeholder" class="textarea"  v-model="liveIntro" placeholder="请输入"></textarea>
		</view>
		<view class="form-row"><button class="btn" @click="getLivePushUrl">下一步</button></view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			courseId: null,
			courseClassId: null,
			liveName:'',
			liveIntro:'',
			curriculumList: [],
			selectedIndexArr: [],
			selectedNames:[]
			
		};
	},
	onLoad(){
		this.queryCurriculumList();
	},
	methods:{
		getLivePushUrl(){
			if(!this.courseId || !this.courseClassId){
				this.$tool.showToast('请选择课程')
				return
			}
			if(!this.liveName){
				this.$tool.showToast('请输入直播名称')
				return
			}
			if(!this.liveIntro){
				this.$tool.showToast('请输入直播简介')
				return
			}
			const param = {
				courseId:this.courseId,
				liveName:this.liveName,
				liveIntro:this.liveIntro,
				courseClassId:this.courseClassId
			}
			
			this.$http.get('/live/getPushUrl',param,true).then(res=>{
				// 这个地方 要弹窗询问是手机直播还是电脑直播
				uni.showModal({
					title: '直播已创建',
					content: '请选择直播方式',
					cancelText: '手机直播',
					confirmText: 'OBS直播',
					success: (data) => {
						const pushUrl = res.pushUrl;
						if (data.confirm) {
							let str = 'live/';
							let arr = pushUrl.split(str);
							console.log('用户点击确定');
							uni.setClipboardData({
								data: `OBS推流地址：${arr[0]} \n OBS推流名称：${arr[1]}`,
								showToast: false,
								success: () => {
									// this.$tool.showSuccess('已复制到剪贴板')
								}
							});
						} else if (data.cancel) {

							const navUrl = `/pages-business/index/live/live-broadcast?pushUrl=${pushUrl}&courseId=${this.courseId}&liveName=${this.liveName}&liveIntro=${this.liveIntro}&courseClassId=${this.courseClassId}`
							console.log('导航去直播页面',navUrl);
							uni.navigateTo({
								url:navUrl
							})
						}
					}
				});
			})
		},

		queryCurriculumList(){
			this.$http.get('/course/queryListByStore',{},true).then(res=>{
				console.log(res);
				let data = res.map(item => {
					return {
						...item,
						courseClassName: item.courseName,
					}
				})
				let arr = data.length > 0 ? data[0].courseClassVOList : [];
				let arr2 = arr.length > 0 ? arr[0].liveCourseClassList : [];
				this.curriculumList = [data,arr,arr2];
			})
		},
		columnchange(event){

			let columnIndex = event.detail.column;
			let valueIndex  = event.detail.value;
			let data = this.curriculumList;

			let arr,arr2;

			if(columnIndex === 0){
				arr = data[columnIndex][valueIndex].courseClassVOList || [];
				arr2 = arr.length > 0 ? arr[0].liveCourseClassList : [];
				this.curriculumList = [this.curriculumList[0],arr,arr2];
			}else if(columnIndex === 1){
				arr2 = data[columnIndex][valueIndex].liveCourseClassList.length > 0 ? data[[columnIndex]][valueIndex].liveCourseClassList : [];
				this.curriculumList = [this.curriculumList[0],this.curriculumList[1],arr2];
			}
		},
		bindPickerChange(event){
			const indexList = event.detail.value;
			const classArr = [];
			indexList.forEach((item,i)=>{
				const selectClass = this.curriculumList[i][item];
				if(selectClass) classArr.push(selectClass);
			})
			console.log();
			this.selectedNames = classArr.map(c=>c.courseClassName);
			this.selectedIndexArr = indexList;
			const lastClass = classArr[classArr.length - 1];
			this.courseClassId = lastClass.courseClassId
			this.courseId = lastClass.courseId
		}
	}
};
</script>

<style lang="less" src="./style.less"></style>

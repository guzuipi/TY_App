<!-- 登录页面 -->
<template>
	<view class="login-page">
    <view class="top">
      <view class="logo flex-center-center">
		  <image class="logo-image" src="../../static/images/logo.png" mode="aspectFill"></image>
	  </view>
    </view>
    <view class="form-wrapper">
      <!-- 手机号/验证码登录 -->
      <view v-if="loginMethod === 0">
        <input class="input" placeholder-class="input-placeholder" type="number" v-model="phone" placeholder="请输入手机号"/>
        <view class="helper">未注册手机号验证后自动注册</view>
        <view class="login-btn" @click="onGetCode">获取验证码</view>
        <!-- <view class="huo">或</view>
        <view class="password-login" @click="loginMethod = 1">密码登录</view> -->
      </view>
      <!-- 密码登录 -->
      <view v-else>
        <input class="input" placeholder-class="input-placeholder" type="number" v-model="phone" placeholder="请输入手机号或用户名"/>
        <view class="flex-center-between input-with-icon">
          <input class="input" placeholder-class="input-placeholder" :type="eye == 1 ? 'password' : 'text'" v-model="pwd" placeholder="请输入密码"/>
          <image class="icon" v-if="eye == 1" @click="toggleEye" src="../../static/images/login/eye-close.png"
                 mode="aspectFill"></image>
          <image class="icon" v-if="eye == 2" @click="toggleEye" src="../../static/images/login/eye.png"
                 mode="aspectFill"></image>
        </view>
        <!-- <button class="helper forget" @click="onForgetPwd">忘记密码？</button> -->
        <view class="login-btn" @click="pwdLogin">登录</view>
        <view class="huo">或</view>
        <view class="password-login" @click="loginMethod = 0">快速登录</view>
      </view>
    </view>
    <!-- 底部 -->
    <view class="bottom">
      <view class="rules">
        注册即同意
        <text>《腾云课堂服务协议》</text>
      </view>
      <!-- <view class="through flex-center-center">
        <text>其他登录方式</text>
      </view>

      <view class="methods flex-center-center">
        <image class="methods-image" src="../../static/images/login/qq.png" mode="aspectFill" @click="qqLogin"></image>
        <image class="methods-image" src="../../static/images/login/wx.png" mode="aspectFill" @click="wechatLogin"></image>
      </view> -->
      <image class="advert-image" src="../../static/images/other/advertise.png" mode="aspectFill"></image>
    </view>
  </view>
</template>

<script>
	import md5 from 'js-md5'
	
export default {
	data() {
		return {
			roleStatus: 'user', //user-用户版 business-商家版
			loginMethod: 0, //0-手机号/验证码，1-密码登录
			eye: 1, // 密码登录， 密码输入框的那个小眼睛 标记
			phone:'',// 手机号
			pwd:'',// 密码
			userId: undefined
		};
	},
	onLoad(option) {
		this.userId = option.userId;
	},
	methods: {
		
		toggleEye() {
			this.eye = this.eye == 1 ? 2 : 1;
		},
		// 验证码 按钮
		onGetCode() {
			if(!this.phone){ 
				this.$tool.showToast('请输入手机号')
				return
			} 
			// 发送验证码
			this.$http.get('/user/getSmsCode',{phone:this.phone,smsType:1},true).then(res=>{
				uni.navigateTo({
					url: `/pages-share/validate-code/validate-code?phone=${this.phone}&roleStatus=${this.roleStatus}&userId=${this.userId}`
				});
			})
		},
	}
};
</script>

<style lang="less" src="./style.less"></style>

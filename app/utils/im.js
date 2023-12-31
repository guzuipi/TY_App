const txIm = uni.requireNativePlugin('TX-TencentIM-Plus');
import dayjs from 'dayjs';

if (txIm) {
	let isSuccess = txIm.initSDK({
		sdkAppID: 1400574852,
		logLevel: 4
	}, result => {
		console.log('初始化sdk', result);
	})

	// 设置基本消息（文本消息和自定义消息）的事件监听器
	txIm.removeSimpleMsgListener();
	txIm.addSimpleMsgListener(result => {
		console.log('基本消息监听', result);
		uni.$emit('SimpleMsgListen', result)
	})

	// 设置高级消息接口监听
	txIm.removeAdvancedMsgListener()
	txIm.addAdvancedMsgListener(result => {
		console.log('高级消息接口监听', result);
		uni.$emit('AdvancedMsgListen', result)
	})

	// 设置会话监听器
	txIm.removeConversationListener()
	txIm.setConversationListener(result => {
		console.log('会话监听器', result);
		uni.$emit('ConversationListen', result)
	})

}

// im登录
const login = (userId, userSig) => {
	return new Promise((resolve, reject) => {
		console.log();
		txIm.login({
			sdkAppID:'1400574852',
			// sdkAppKey:'a317808214f70624395d853e24464a266ca241a01d007c52f57283ad8557c49d',
			userId,
			userSig
		}, result => {
			console.log('IM  登录',{userId,userSig}, result);
			if (result.code == 0) {
				resolve();
			} else {
				reject(result.errMsg);
			}
		})
	})
}



const loadingStart = (loading = true) => {
	if (loading) {
		uni.showLoading({
			title: '处理中...'
		})
	}
}

const loadingEnd = (loading, result) => {
	console.log('IM 消息操作回调', result);
	if (loading) {
		uni.hideLoading();
		if (result.code != 0) {
			uni.showToast({
				title: '发生错误!',
				icon: 'none'
			})
		}
	}
}

// 发送群文本消息
const sendGroupTextMessage = (textMsg, groupId, loading = true) => {
	return new Promise((resolve, reject) => {
		loadingStart(loading)
		txIm.sendGroupTextMessage({
			textMsg,
			groupId,
			priority: 0
		}, result => {
			loadingEnd(loading, result);
			if (result.code == 0) {
				resolve(result.msg)
			} else {
				reject(result.errMsg);
			}
		})
	})
}

// 获取群组历史消息
const getGroupHistoryMessageList = (groupId, msgId = '', loading = true) => {
	return new Promise((resolve, reject) => {
		txIm.getGroupHistoryMessageList({
			groupId,
			count: 1000,
			msgId
		}, result => {
			if (result.code == 0) {
				resolve(result.msgs)
			} else {
				reject(result.errMsg);
			}
		})
	})
}

// 发送语音消息
const sendSoundMessage = (path, duration, groupId, loading = true) => {
	return new Promise((resolve, reject) => {

		let message = txIm.createSoundMessage({
			path,
			duration: duration
		})

		if (message && message.createMessageId) {
			loadingStart(loading)
			txIm.sendMessage({
				createMessageId: message.createMessageId,
				groupId
			}, result => {
				if (result.type == 'sendMessage') {
					loadingEnd(loading, result);
					if (result.code == 0) {
						resolve(result.msg)
					} else {
						reject(result.errMsg);
					}
				}
			})
		} else {
			reject('创建语音消息失败');
		}
	})
}

// 发送图片消息
const sendImageMessage = (path, groupId, loading = true) => {
	return new Promise((resolve, reject) => {
		loadingStart(loading)
		let message = txIm.createImageMessage({
			path
		});

		if (message && message.createMessageId) {
			loadingStart(loading)
			txIm.sendMessage({
				createMessageId: message.createMessageId,
				groupId
			}, result => {
				if (result.type == 'sendMessage') {
					loadingEnd(loading, result);
					if (result.code == 0) {
						resolve(result.msg)
					} else {
						reject(result.errMsg);
					}
				}
			})
		} else {
			reject('创建语音消息失败');
		}
	})
}

// 下载图片
const downloadImage = (msgId) => {
	return new Promise((resolve, reject) => {
		txIm.downloadImage({
			"msgId": msgId
		}, progressResult => {
			console.log('下载图片 pro', progressResult);
		}, succResult => {
			resolve(succResult)
			console.log('下载图片 succ', succResult);
		}, failResult => {
			reject(failResult)
			console.log('下载图片 err', failResult);
		})
	})
}


// 下载语音
const downloadSound = (msgId) => {
	return new Promise((resolve, reject) => {
		txIm.downloadSound({
			"msgId": msgId
		}, progressResult => {
			console.log('下载语音 pro', progressResult);
		}, succResult => {
			resolve(succResult)
			console.log('下载语音 succ', succResult);
		}, failResult => {
			reject(failResult)
			console.log('下载语音 err', failResult);
		})
	})
}

// 加入群聊
const joinGroup = (groupId) => {
	return new Promise((resolve, reject) => {
		txIm.joinGroup({
			groupId,
			msg:"申请加群",
		}, result => {
			console.log('加入群聊 群id',groupId);
			console.log('加入群聊 返回结果', result);
			if (result.code == 0 || result.code == 10013) {
				resolve(result)
			} else {
				reject(result.errMsg);
			}
		})
	})
}

// 获取会话列表
const getGroupConversationMap = () => {
	return new Promise((resolve, reject) => {
		txIm.getConversationList({
			nextSeq: 0,
			count: 1000
		}, result => {
			if (result.code == 0) {
				const map = {}
				result.conversationList.forEach(c => {
					if (c.type == 2) {
						map[c.groupId] = c;
					}
				})
				resolve(map)
			} else {
				reject('获取会话失败')
			}
		})
	})
}

// 获取会话信息
const getInfoFromConversation = (cov) => {
	const info = {}
	info.unreadCount = cov.unreadCount || 0;
	const lastMessage = cov.lastMessage
	if (lastMessage) {
		if (lastMessage.elemType == 1) { // 文字消息
			info.message = lastMessage.textElem.msg;
		} else if (lastMessage.elemType == 3) {
			info.message = '[图片]'
		} else if (lastMessage.elemType == 4) {
			info.message = '[语音]'
		}

		info.time = dayjs(lastMessage.time * 1000).format('YYYY-MM-DD HH:mm')
	}
	return info
}

// 获取指定群在线人数
const getGroupOnlineMemberCount = (groupId) => {
	return new Promise((resolve, reject) => {
		txIm.getGroupOnlineMemberCount({
			groupId
		}, result => {
			console.log('获取指定群在线人数',result);
			if (result.code == 0) {
				resolve(result)
			} else {
				reject()
			}
		})
	})
}

// 设置群组消息已读
const markGroupMessageAsRead = (groupId)=>{
	return new Promise((resolve, reject) => {
		txIm.markGroupMessageAsRead({
			groupId
		}, result => {
			console.log('设置群组消息已读',result);
			if (result.code == 0) {
				resolve(result)
			} else {
				reject()
			}
		})
	})
}

// 获取所有会话的未读消息总数
const getTotalUnreadMessageCount = ()=>{
	return new Promise((resolve, reject) => {
		txIm.getTotalUnreadMessageCount(result => {
			console.log('获取所有会话的未读消息总数',result);
			if (result.code == 0) {
				resolve(result.totalCount)
			} else {
				reject()
			}
		})
	})
}

// 删除会话 传参  conversationId：会话id
const deleteConversation = (conversationId)=>{
	return new Promise((resolve, reject) => {
		txIm.deleteConversation({conversationId},result => {
			console.log('删除会话',result);
			if (result.code == 0) {
				resolve(result)
			} else {
				reject()
			}
		})
	})
}

// 获取群属性
const getGroupAttributes = (groupId)=>{
	    txIm.getGroupAttributes({groupId},result=>{
	                    console.log('获取群属性',result);
	                })
}

// 拉取群资料
const getGroupsInfo = (groupId)=>{
	return new Promise((resolve, reject) => {
		txIm.getGroupsInfo({groupIdList:[groupId]},result=>{
			const groupInfoResult = result.groupInfoList[0]
			console.log('拉取群资料 2',groupInfoResult);
			if(groupInfoResult.code == 0){
				resolve(groupInfoResult.info)
			}else{
				reject(groupInfoResult.msg)
			}
		})
	})
}



export default {
	login,
	sendGroupTextMessage,
	getGroupHistoryMessageList,
	sendSoundMessage,
	sendImageMessage,
	downloadImage,
	downloadSound,
	joinGroup,
	getGroupConversationMap,
	getInfoFromConversation,
	getGroupOnlineMemberCount,
	markGroupMessageAsRead,
	getTotalUnreadMessageCount,
	deleteConversation,
	getGroupAttributes,
	getGroupsInfo,
}

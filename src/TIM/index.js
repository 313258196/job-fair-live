import TIM from 'tim-js-sdk';
// 发送图片、文件等消息需要腾讯云即时通信 IM 上传插件
import TIMUploadPlugin from 'tim-upload-plugin';
import genTestUserSig, { SDKAPPID } from "../debug/GenerateTestUserSig"
import { userID, groupName, groupID } from "./configs"

let options = {
	SDKAppID: SDKAPPID // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
};
// 创建 SDK 实例，TIM.create() 方法对于同一个 SDKAppID 只会返回同一份实例
let tim = TIM.create(options); // SDK 实例通常用 tim 表示

// 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
// tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用

// 注册腾讯云即时通信 IM 上传插件
tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });

export const sdkReady = (fn) => {
	// 监听事件，例如：
	// 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
	tim.on(TIM.EVENT.SDK_READY, fn);
}
export const onMessage = (fn) => {
	// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
	// event.name - TIM.EVENT.MESSAGE_RECEIVED
	// event.data - 存储 Message 对象的数组 - [Message]
	tim.on(TIM.EVENT.MESSAGE_RECEIVED, fn);
}

tim.on(TIM.EVENT.MESSAGE_REVOKED, function (event) {
	// 收到消息被撤回的通知
	// event.name - TIM.EVENT.MESSAGE_REVOKED
	// event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
});

tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, function (event) {
	// SDK 收到对端已读消息的通知，即已读回执。使用前需要将 SDK 版本升级至 v2.7.0 或以上。仅支持单聊会话。
	// event.name - TIM.EVENT.MESSAGE_READ_BY_PEER
	// event.data - event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
});

tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
	// 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
	// event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
	// event.data - 存储 Conversation 对象的数组 - [Conversation]
});

tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function (event) {
	// 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
	// event.name - TIM.EVENT.GROUP_LIST_UPDATED
	// event.data - 存储 Group 对象的数组 - [Group]
});

tim.on(TIM.EVENT.PROFILE_UPDATED, function (event) {
	// 收到自己或好友的资料变更通知
	// event.name - TIM.EVENT.PROFILE_UPDATED
	// event.data - 存储 Profile 对象的数组 - [Profile]
});

tim.on(TIM.EVENT.BLACKLIST_UPDATED, function (event) {
	// 收到黑名单列表更新通知
	// event.name - TIM.EVENT.BLACKLIST_UPDATED
	// event.data - 存储 userID 的数组 - [userID]
});

tim.on(TIM.EVENT.ERROR, function (event) {
	// 收到 SDK 发生错误通知，可以获取错误码和错误信息
	// event.name - TIM.EVENT.ERROR
	// event.data.code - 错误码
	// event.data.message - 错误信息
});

tim.on(TIM.EVENT.SDK_NOT_READY, function (event) {
	// 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
	// event.name - TIM.EVENT.SDK_NOT_READY
});

tim.on(TIM.EVENT.KICKED_OUT, function (event) {
	// 收到被踢下线通知
	// event.name - TIM.EVENT.KICKED_OUT
	// event.data.type - 被踢下线的原因，例如:
	//    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
	//    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
	//    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。 
});

tim.on(TIM.EVENT.NET_STATE_CHANGE, function (event) {
	//  网络状态发生改变（v2.5.0 起支持）。 
	// event.name - TIM.EVENT.NET_STATE_CHANGE 
	// event.data.state 当前网络状态，枚举值及说明如下： 
	//     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络 
	//     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中” 
	//    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息  
});


// apis 根据群 ID 搜索群组
export const searchGroupByIDFn = (groupID) => {
	return tim.searchGroupByID(groupID)
}
// apis 创建群组
export const createGroupFn = (options) => {
	return tim.createGroup({
		name: groupName,
		type: TIM.TYPES.GRP_PUBLIC,
		groupID,
		joinOption: TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS,
		...options
	})
}
// apis 发送消息
export const sendMessageFn = (options) => {
	let { text, toID, conversationType } = options
	// 发送文本消息，Web 端与小程序端相同
	// 1. 创建消息实例，接口返回的实例可以上屏
	let message = tim.createTextMessage({
		to: toID || groupID,
		conversationType: conversationType || TIM.TYPES.CONV_GROUP,
		// 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
		// 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
		// priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
		payload: {
			text
		}
	});
	// 2. 发送消息
	return tim.sendMessage(message);
}
// apis 申请加群
export const JoinStatus = {
	Wait: 1,
	Success: 2,
	On: 3,
}
export const joinGroupFn = (options) => {
	let promise = tim.joinGroup({ groupID, type: TIM.TYPES.GRP_PUBLIC });

	return new Promise((resolve, reject) => {
		promise.then(function (imResponse) {
			switch (imResponse.data.status) {
				case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
					resolve({
						state: JoinStatus.Wait
					})
					break;
				case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
					console.log(imResponse.data.group); // 加入的群组资料
					resolve({
						state: JoinStatus.Success,
						data: imResponse.data
					})
					break;
				case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
					resolve({
						state: JoinStatus.On
					})
					break;
				default:
					break;
			}
		}).catch(function (imError) {
			console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
			reject(imError)
		});
	})
}
// apis 获取我的个人资料
export const getMyProfileFn = (profile) => {
	tim.getMyProfile().then(res => {
		console.log("getMyProfile...", res)
		if (!res.data.nick) {
			tim.updateMyProfile(profile);
		}
	}).catch(err => {
		console.log("getMyProfile err...", err)
	})
}
// apis 获取某会话的消息列表
export const getMessageListFn = (options) => {
	return tim.getMessageList({
		conversationID: `GROUP${groupID}`,
		count: 15,
		...options,
	})
}


export const _TIM = TIM
export default tim
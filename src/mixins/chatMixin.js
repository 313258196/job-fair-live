import { ref, getCurrentInstance, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import tim, {
	_TIM,
	sdkReady,
	searchGroupByIDFn,
	createGroupFn,
	sendMessageFn,
	joinGroupFn,
	JoinStatus,
	getMyProfileFn,
	onMessage,
	getMessageListFn,
} from "../TIM";
import { groupID, messageFrom, myProfile, myProfile2 } from "../TIM/configs";
import { msgBundle } from "../TIM/chatMsgBundle";

import genTestUserSig, { SDKAPPID } from "../debug/GenerateTestUserSig";
import { loadJSForTcPlayer } from "../debug/initPlayer";

export const chatMixin = ({ conversationID, toID, conversationType } = {}) => {

	const instance = getCurrentInstance();
	const Route = useRoute();

	let { userId } = Route.query;
	userId = userId ? userId : "123";

	let userInfo = {
		userID: userId,
		myProfile: {
			nick: `游客${userId}_20220609` + parseInt(Math.random() * 1000),
			avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
		},
	};

	let chatRoomRef = ref(null);
	let isBottom = ref(false);
	let isCompleted = ref(false);
	let nextReqMessageID = ref("");
	let groupChatExit = ref(false);
	let prePageLoading = ref(false);
	let chatArr = ref([]);

	onMessage((res) => {
		console.log("onMessage...", res);
		(res.data || []).forEach((item) => {
			if (item.from !== messageFrom.System) {
				chatArr.value.push({
					...item,
					text: item.payload.text,
					self: item.from == userInfo.userID,
				});
				chatRoomRef.value.scrollBottom();
			}
		});
	});

	function prePageFn() {
		if (!isCompleted.value && !prePageLoading.value) {
			prePageLoading.value = true;
			setTimeout(() => {
				getMessageListFnLocal({ nextReqMsgID: nextReqMessageID.value });
			}, 1000);
		}
	}

	function getMessageListFnLocal({ nextReqMsgID } = {}) {
		let opts = {};
		nextReqMsgID && (opts.nextReqMessageID = nextReqMsgID)
		conversationID?.value && (opts.conversationID = conversationID?.value)

		console.log(999,conversationID?.value)

		console.log("getMessageListFn opts...", opts);
		getMessageListFn(opts)
			.then((res) => {
				console.log("getMessageListFn...", res);
				let messageList = res.data.messageList || [];
				messageList = messageList.filter(
					(item) => item.from !== messageFrom.System
				);
				let arr = messageList.map((item) =>
					msgBundle({
						message: item,
						userID: userInfo.userID,
					})
				);
				chatArr.value = [...arr, ...chatArr.value];
				isCompleted.value = res.data.isCompleted;
				if (!res.data.isCompleted) {
					nextReqMessageID.value = res.data.nextReqMessageID;
				}

				if (nextReqMsgID) {
					prePageLoading.value = false;
					chatRoomRef.value.saveScrollTop();
				}
			})
			.catch((err) => {
				console.log("getMessageListFn err...", err);
			});
	}

	function sendMsgFn({ text }) {
		return new Promise((resovle, reject) => {
			sendMessageFn({ text, toID:toID?.value, conversationType: conversationType }).then((res) => {
				let message = res.data.message;
				chatArr.value.push({
					...message,
					text: message.payload.text,
					self: message.from == userInfo.userID,
				});
				chatRoomRef.value.scrollBottom();

				resovle();
			}).catch(err => {
				// 消息发送方或接收方 UserID 无效或不存在，请检查 UserID 是否已导入即时通信 IM。
				reject(err)
			});
		});
	}

	return {
		chatRoomRef,
		isBottom,
		isCompleted,
		nextReqMessageID,
		groupChatExit,
		prePageLoading,
		chatArr,
		userInfo,
		prePageFn,
		onMessage,
		getMessageListFnLocal,
		sendMsgFn
	}
}
<template>
    <div class="container">
        <div class="video-block" id="video-block">
            <!-- <video
                id="myVideo"
                class="myVideo"
                src="webrtc://live.huicai.wang/live/hr060901"
                @error="videoErrorCallback"
                controls
            ></video> -->
        </div>
        <div class="tabs-block">
            <div class="div_H scroll-view_H">
                <div v-for="(item, index) in tabList" :key="item.$index" class="div-item_H"
                    @click="itemClicked(item, index)" :class="{ active: item.active }">
                    {{ item.label }}
                </div>
            </div>
            <div class="swiper-block">
                <el-carousel ref="carouselRef" class="swiper" height="100%" :initial-index="0" :autoplay="false"
                    arrow="never" indicator-position="none">
                    <el-carousel-item>
                        <div class="el-carousel-item uni-bg-red">
                            <ChatRoom ref="chatRoomRef" :groupChatExit="groupChatExit" :chatArr="chatArr"
                                :send="sendMsgFn" :prePageLoading="prePageLoading" :prePageFn="prePageFn"
                                :isBottomFn="isBottom" />
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="el-carousel-item works">
                            <div v-for="(item, index) in companyInfoList" :key="index" class="company-item">
                                <div class="company-title">
                                    {{ item.title }}
                                </div>
                                <div v-for="(ite, idx) in item.workList" :key="idx" class="work-item">
                                    <div class="work-top">
                                        <div class="work-tit">
                                            {{ ite.title }}
                                        </div>
                                        <div class="work-num">
                                            招聘：{{ ite.num }}人
                                        </div>
                                        <div class="work-money">
                                            薪资：{{ ite.money }}
                                        </div>
                                    </div>
                                    <div class="work-bottom">
                                        岗位要求：{{ ite.demand }}
                                    </div>
                                </div>
                                <span class="welfare-block">
                                    福利待遇：{{ item.welfare }}
                                </span>
                                <div class="link-block">
                                    联系人：{{ item.link }}
                                </div>
                                <div class="addr-block">
                                    地址：{{ item.address }}
                                </div>
                            </div>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="el-carousel-item uni-bg-blue">
                            <!-- <web-div :webdiv-styles="webdivStyles" src="http://www.huicai.wang/m/index"></web-div> -->
                            <iframe class="iframe" src="http://www.huicai.wang/m/index" frameborder="0"></iframe>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div :scroll-top="0" scroll-y="true" class="el-carousel-item direction-chat">
                            <div class="comp-item" v-for="(item, index) in companyInfoList" :key="index">
                                <div class="company">
                                    {{ item.title }}
                                </div>
                                <span class="btn" @click="showFn(item)">
                                    沟通
                                </span>
                            </div>
                            <!-- <uni-transition :mode-class="['fade', 'slide-left']" :styles="chatStyle"
                                class="transi-block" :show="show"> -->
                            <div class="chat-title">
                                <div class="company-txt">
                                    {{ chatCompany.title }}
                                </div>
                                <div class="exit-btn-block" @click="show = false">
                                    <!-- <button class="mini-btn" type="primary" size="mini">退出聊天</button> -->
                                    <!-- <uni-icons type="forward" size="22"></uni-icons> -->
                                </div>
                            </div>
                            <div class="chat-box-container">
                                <div class="chat-item" v-for="(item, index) in chatList" :key="index"
                                    :id="`item${index}`" :class="{ user: item.type === 'receive' }">
                                    <image class="avatar" mode="scaleToFill" :src="
                                        item.type === 'to'
                                            ? companyAvatar
                                            : userAvatar
                                    ">
                                    </image>
                                    <div class="content-block">
                                        <span class="content">
                                            <template v-if="item.msgType === 'resume'">
                                                <!-- <uni-icons class="icon-resume-diy" type="wallet" size="30">
                                                </uni-icons> -->
                                                <div class="txt">查看简历</div>
                                            </template>
                                            <template v-else>{{
                                                    item.cont
                                            }}</template>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <form @submit="formSubmit">
                                <div class="chat-input-box">
                                    <input class="uni-input" :class="{ emptyMsg }" placeholder=""
                                        v-model="chatForm.message" />
                                    <!-- @keyup.enter.native="formSubmit" -->
                                    <div class="uni-btn-v">
                                        <!-- <uni-transition :mode-class="['fade', 'slide-left']"
                                            :styles="{ width: '120rpx', height: '90rpx' }" class="" :show="!emptyMsg">
                                            <button form-type="submit" type="primary" size="mini"
                                                style="margin-top: 20rpx;">发送</button>
                                        </uni-transition>
                                        <uni-transition :mode-class="['fade', 'slide-left']"
                                            :styles="{ width: '80rpx', height: '90rpx' }" class="" :show="emptyMsg">
                                            <uni-icons type="folder-add" size="40" class="icon-folder" color="#333"
                                                @click="toggle"></uni-icons>
                                        </uni-transition> -->
                                    </div>
                                </div>
                            </form>
                            <!-- </uni-transition> -->
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>

        <!-- <uni-popup ref="popup" background-color="#fff">
			<div class="popup-content">
				<div class="content-i" @click="chatSend">
					<uni-icons type="wallet" size="30"></uni-icons>
					<div class="txt">
						发简历
					</div>
				</div>
			</div>
		</uni-popup> -->
    </div>
</template>

<script>
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
} from "../../TIM";
import ChatRoom from "../chatRoom/ChatRoom.vue";
import { tabList as tl, companyInfoList as cil, chatList as cl } from "./data";
import { groupID, messageFrom, myProfile, myProfile2 } from "../../TIM/configs";
import { msgBundle } from "../../TIM/chatMsgBundle";

import genTestUserSig, { SDKAPPID } from "../../debug/GenerateTestUserSig";
import { loadJSForTcPlayer } from "../../debug/initPlayer";

import caimg from "@/assets/image/company_logo.png";
import uaimg from "@/assets/image/empty_photo.png";
export default {
    name: "Player",
    components: { ChatRoom },
    setup() {
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
        let tabList = ref(tl);
        let companyInfoList = ref(cil);
        let chatList = ref(cl);
        let chatCompany = ref({});
        let chatForm = ref({
            message: "",
        });
        let currentTab = ref(0);
        let carouselRef = ref(null);
        let groupChatExit = ref(false);
        let prePageLoading = ref(false);
        let chatArr = ref([]);

        let companyAvatar = ref(caimg);
        let userAvatar = ref(uaimg);

        // 开始登录
        const res = genTestUserSig(userInfo.userID);
        const { userSig } = res;
        tim.login({ userID: userInfo.userID, userSig });

        function initVideo() {
            const playerParm = {
                // fileID: '3701925921297118545',
                // appID: '1251109575',
                m3u8: "http://live.huicai.wang/live/hr060901.flv", //请替换成实际可用的播放地址
                autoplay: true, //iOS 下 safari 浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                poster: "http://www.test.com/myimage.jpg",
                // width: "480", //视频的显示宽度，请尽量使用视频分辨率宽度
                // height: "320", //视频的显示高度，请尽量使用视频分辨率高度
            };
            setTimeout(() => {
                new TcPlayer("video-block", playerParm);
            });
        }

        function prePageFn() {
            if (!isCompleted.value && !prePageLoading.value) {
                console.log(3333333);
                prePageLoading.value = true;
                setTimeout(() => {
                    getMessageListFnLocal(nextReqMessageID.value);
                }, 1000);
            }
        }

        onMounted(() => {
            loadJSForTcPlayer(initVideo);
        });

        sdkReady(() => {
            getMyProfileFn(userInfo.myProfile);
            searchGroupByIDFn(groupID)
                .then((res) => {
                    joinGroupFnLocal();
                })
                .catch((err) => {
                    createGroupFn({
                        // memberList: [
                        //     { userID: userInfo.userID, role: "Admin" },
                        // ],
                    })
                        .then((response) => {
                            joinGroupFnLocal();
                        })
                        .catch((error) => { });
                });
        });

        onMessage((res) => {
            console.log("onMessage...", res);
            (res.data || []).forEach((item) => {
                if (item.from !== messageFrom.System) {
                    chatArr.value.push({
                        ...item,
                        text: item.payload.text,
                        self: item.from == userInfo.userID,
                    });
                    chatRoomRef.value.scrollBottom()
                }
            });
        });

        function getMessageListFnLocal(msgID) {
            let opts = {};
            if (msgID) {
                opts.nextReqMessageID = msgID;
            }
            getMessageListFn(opts)
                .then((res) => {
                    console.log("getMessageListFn...", res);
                    let arr = (res.data.messageList || []).map((item) =>
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

                    if (msgID) {
                        prePageLoading.value = false;
                    }
                })
                .catch((err) => {
                    console.log("getMessageListFn err...", err);
                });
        }

        function joinGroupFnLocal() {
            getMessageListFnLocal();
            joinGroupFn().then((res) => {
                console.log("joinGroupFn...", res);
                if (res.state == JoinStatus.Success) {
                    groupChatExit.value = true;
                    console.log("joinGroupFn success...");
                }
                if (res.state == JoinStatus.On) {
                    groupChatExit.value = true;
                    console.log("joinGroupFn success...");
                }
            });
        }

        const emptyMsg = computed(() => {
            return chatForm.value.message === "";
        });

        function sendMsgFn({ text }) {
            sendMessageFn({ text }).then((res) => {
                let message = res.data.message;
                chatArr.value.push({
                    ...message,
                    text: message.payload.text,
                    self: message.from == userInfo.userID,
                });
                chatRoomRef.value.scrollBottom()
            });
        }
        function setTabActive(index) {
            tabList.value.forEach((item) => (item.active = false));
            tabList.value[index].active = true;
        }
        const itemClicked = (item, index) => {
            currentTab.value = index;
            carouselRef.value.setActiveItem(index);
            setTabActive(index);

            instance.ctx.$forceUpdate();
        };

        return {
            chatRoomRef,
            isBottom,
            instance,
            tabList,
            companyInfoList,
            chatCompany,
            chatForm,
            currentTab,
            chatList,
            companyAvatar,
            userAvatar,
            carouselRef,
            groupChatExit,
            chatArr,
            prePageLoading,
            isCompleted,
            emptyMsg,
            sendMsgFn,
            itemClicked,
            prePageFn
        };
    },
};

// // 发送文本消息，Web 端与小程序端相同
// // 1. 创建消息实例，接口返回的实例可以上屏
// let message = tim.createTextMessage({
//     to: "user1",
//     conversationType: _TIM.TYPES.CONV_C2C,
//     // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
//     // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
//     // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
//     payload: {
//         span: "Hello world!",
//     },
// });
// // 2. 发送消息
// let promise = tim.sendMessage(message);
// promise
//     .then(function (imResponse) {
//         // 发送成功
//         console.log(imResponse);
//     })
//     .catch(function (imError) {
//         // 发送失败
//         console.warn("sendMessage error:", imError);
//     });
</script>
<style lang="scss" scoped>
@import "./player.scss";
</style>

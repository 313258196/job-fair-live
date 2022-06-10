<template>
    <div class="container">
        <div class="video-block" id="video-block"></div>
        <div class="tabs-block">
            <div class="div_H scroll-view_H">
                <div
                    v-for="(item, index) in tabList"
                    :key="item.$index"
                    class="div-item_H"
                    @click="itemClicked(item, index)"
                    :class="{ active: item.active }"
                >
                    {{ item.label }}
                </div>
            </div>
            <div class="swiper-block">
                <el-carousel
                    ref="carouselRef"
                    class="swiper"
                    height="100%"
                    :initial-index="0"
                    :autoplay="false"
                    arrow="never"
                    indicator-position="none"
                >
                    <el-carousel-item>
                        <div class="el-carousel-item uni-bg-red">
                            <ChatRoom
                                ref="chatRoomRef"
                                :groupChatExit="groupChatExit"
                                :chatArr="chatArr"
                                :send="sendMsgFn"
                                :prePageLoading="prePageLoading"
                                :prePageFn="prePageFn"
                                :isBottomFn="isBottom"
                            />
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="el-carousel-item works">
                            <div
                                v-for="(item, index) in companyInfoList"
                                :key="index"
                                class="company-item"
                            >
                                <div class="company-title">
                                    {{ item.title }}
                                </div>
                                <div
                                    v-for="(ite, idx) in item.workList"
                                    :key="idx"
                                    class="work-item"
                                >
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
                            <iframe
                                class="iframe"
                                src="http://www.huicai.wang/m/index"
                                frameborder="0"
                            ></iframe>
                        </div>
                    </el-carousel-item>
                    <el-carousel-item>
                        <div class="el-carousel-item direction-chat">
                            <div
                                class="comp-item"
                                v-for="(item, index) in companyInfoList"
                                :key="index"
                            >
                                <div class="company">
                                    {{ item.title }}
                                </div>
                                <span class="btn" @click="showFn(item)">
                                    沟通
                                </span>
                            </div>
                            <ChatToCompany
                                :visiable="visiable"
                                :memberId="memberId"
                            />
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
        </div>
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
import ChatToCompany from "../chatToCompany/ChatToCompany.vue";
import { tabList as tl, companyInfoList as cil, chatList as cl } from "./data";
import { groupID, messageFrom, myProfile, myProfile2 } from "../../TIM/configs";
import { msgBundle } from "../../TIM/chatMsgBundle";

import genTestUserSig, { SDKAPPID } from "../../debug/GenerateTestUserSig";
import { loadJSForTcPlayer } from "../../debug/initPlayer";
import { chatMixin } from "@/mixins/chatMixin";

import caimg from "@/assets/image/company_logo.png";
import uaimg from "@/assets/image/empty_photo.png";
export default {
    name: "Player",
    components: { ChatRoom, ChatToCompany },
    setup() {
        const instance = getCurrentInstance();
        const Route = useRoute();

        let {
            chatRoomRef,
            isBottom,
            isCompleted,
            nextReqMessageID,
            groupChatExit,
            prePageLoading,
            chatArr,
            prePageFn,
            onMessage,
            getMessageListFnLocal,
            sendMsgFn,
            userInfo
        } = chatMixin();

        let memberId = ref("");
        let visiable = ref(false);
        let tabList = ref(tl);
        let companyInfoList = ref(cil);
        let chatList = ref(cl);
        let chatCompany = ref({});
        let chatForm = ref({
            message: "",
        });
        let currentTab = ref(0);
        let carouselRef = ref(null);

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

        onMounted(() => {
            loadJSForTcPlayer(initVideo);
        });

        sdkReady(() => {
            getMyProfileFn(userInfo.myProfile);
            console.log("searchGroupByIDFn...", groupID);
            searchGroupByIDFn(groupID)
                .then((res) => {
                    console.log("searchGroupByIDFn success...", res);
                    joinGroupFnLocal();
                })
                .catch((err) => {
                    console.log("searchGroupByIDFn err...", err);
                    createGroupFn({
                        // memberList: [
                        //     { userID: userInfo.userID, role: "Admin" },
                        // ],
                    })
                        .then((response) => {
                            joinGroupFnLocal();
                        })
                        .catch((error) => {});
                });
        });

        function showFn(item) {
            visiable.value = true;
            memberId.value = item.id;
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
            memberId,
            visiable,
            showFn,
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
            prePageFn,
        };
    },
};
</script>
<style lang="scss" scoped>
@import "./player.scss";
</style>

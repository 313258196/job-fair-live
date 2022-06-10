<template>
    <div class="chatroom-block">
        <!-- 聊天界面标题 -->
        <div class="chat-title-block" v-if="chatTitle">
            <div class="chat-title">中软国际哈哈</div>
            <el-icon class="chat-icon-right" @click="closeCur"
                ><ArrowRight
            /></el-icon>
        </div>
        <div
            class="chat-item-block"
            ref="chatItemBlock"
            @click="chatItemBlockClicked"
        >
            <!-- 错误提示 -->
            <div class="chat-error-block" :class="{ visiable: visiableError }">
                <el-tag class="tip-error" type="danger" size="small">{{
                    errorTip
                }}</el-tag>
            </div>
            <!-- 聊天列表盒子 -->
            <div class="chat-main-box" ref="chatMainBox">
                <div class="loading-block">
                    <el-icon v-if="prePageLoading" class="loading"
                        ><Loading
                    /></el-icon>
                </div>
                <template v-for="(item, index) in chatArr">
                    <div
                        v-if="item.payload.data == MPD.GroupCreate"
                        class="tip-msg"
                        :key="index"
                    >
                        <el-tag
                            v-if="item.payload.data == MPD.GroupCreate"
                            :key="index"
                            class="tip-msg"
                            type="success"
                            size="small"
                            >{{ item.payload.extension }}</el-tag
                        >
                    </div>
                    <div
                        v-else
                        class="chat-item"
                        :key="index + 1"
                        :class="item.self ? 'chat-right' : 'chat-left'"
                    >
                        <el-avatar
                            class="chat-avatar"
                            size="default"
                            :src="item.avatar"
                        />
                        <div class="chat-item-content">
                            <div class="chat-item-name-about">
                                {{ item.nick }}
                            </div>
                            <div class="chat-item-con">
                                <span
                                    class="chat-content"
                                    v-html="item.text"
                                ></span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <!-- 发送消息 -->
        <div class="chat-send-block">
            <div class="chat-send-inp-box">
                <div
                    class="chat-input"
                    ref="chatInputRef"
                    contenteditable="true"
                    @input="msgInput"
                ></div>
                <div class="utils-box">
                    <img
                        src="@/assets/image/smile.png"
                        alt=""
                        class="icon-smile"
                        @click="emoClicked"
                    />
                    <el-button
                        type="primary"
                        class="util-btn-send"
                        :disabled="!groupChatExit"
                        @click="sendFn"
                        >发送
                    </el-button>
                </div>
            </div>
            <div class="chat-emo-block" :class="{ emoBoxShow }">
                <emotion @emotion="handleEmotion" :height="200"></emotion>
            </div>
        </div>
    </div>
</template>
<script>
import {
    ref,
    getCurrentInstance,
    computed,
    defineProps,
    onMounted,
    watch,
    nextTick,
} from "vue";
import tim, { _TIM, sdkReady } from "../../TIM";
import { messagePayloadData } from "../../TIM/configs";
import Emotion from "@/components/Emotion/index";
import { emotion } from "@/components/Emotion/data.js";
export default {
    props: [
        "groupChatExit",
        "chatArr",
        "send",
        "prePageLoading",
        "prePageFn",
        "chatTitle",
    ],
    name: "ChatRoom",
    components: { Emotion },
    setup(props, { emit }) {
        const instance = getCurrentInstance();

        let msg = ref("");
        let MPD = ref(messagePayloadData);
        let chatItemBlock = ref(null);
        let chatMainBox = ref(null);
        let chatInputRef = ref(null);
        let isBottom = ref(false);
        let emoBoxShow = ref(false);
        let errorTip = ref("对方状态离线中...");
        // 拉取上一页前 聊天内容的高度
        let chatMainBoxHeight = ref(0);
        let visiableError = ref(false);

        onMounted(() => {
            chatItemBlock.value.addEventListener("scroll", () => {
                // 滚动条到顶部，加载上一页
                if (
                    chatItemBlock.value.scrollTop <= 0 &&
                    !props.prePageLoading
                ) {
                    props.prePageFn();
                }

                // 判断滚动条是否在最底部
                isBottom.value =
                    chatItemBlock.value.scrollHeight <=
                    Math.ceil(
                        chatItemBlock.value.scrollTop +
                            chatItemBlock.value.offsetHeight +
                            50
                    );
            });
        });

        watch(
            () => props.chatArr,
            (newV, oldV) => {
                // 首次加载数据滚动到底部
                if (newV && newV.length && (!oldV || !oldV.length)) {
                    setTimeout(() => {
                        toBottom();
                    }, 500);
                }
            },
            { deep: true, immediate: true }
        );

        // watch(
        //     () => msg.value,
        //     async (newV, oldV) => {
        //         if (newV && !oldV) { initMsg.value = newV }
        //         // await nextTick();
        //         // console.log(1111111111111)
        //         // setTimeout( () => {
        //         //     chatInputRef.value.focus();
        //         // }, 1000);
        //     },
        //     { deep: true, immediate: true }
        // );
        function closeCur() {
            emit("close");
        }

        function chatItemBlockClicked() {
            emoBoxShow.value && (emoBoxShow.value = false);
        }

        function msgInput() {
            msg.value = chatInputRef.value.innerHTML;
        }

        function chatFocus() {
            emoBoxShow.value = false;
        }

        // 保持滚动条位置
        async function saveScrollTop() {
            await nextTick();
            toBottom({
                topValue:
                    chatMainBox.value.offsetHeight - chatMainBoxHeight.value,
            });
        }

        function emoClicked() {
            emoBoxShow.value = !emoBoxShow.value;
            instance.ctx.$forceUpdate();
        }

        // 将聊天滚动到底部
        async function scrollBottom() {
            await nextTick();
            if (isBottom.value) {
                toBottom({ smooth: true });
            }
        }

        // 将滚动条拉到底部
        function toBottom({ topValue = null, smooth = false } = {}) {
            topValue = topValue || chatMainBox.value.offsetHeight;
            let agrs = {
                top: topValue,
            };
            smooth && (agrs.behavior = "smooth");
            chatItemBlock.value.scrollTo(agrs);
            chatMainBoxHeight.value = chatMainBox.value.offsetHeight;
        }

        function sendFn() {
            props
                .send({
                    text: msg.value,
                })
                .then(() => {
                    chatInputRef.value.innerHTML = "";
                    msg.value = "";
                })
                .catch((err) => {
                    if (!visiableError.value) {
                        visiableError.value = true;

                        // setTimeout(() => {
                        //     visiableError.value = false
                        // }, 5000);
                    }
                    errorTip.value = "对方状态离线中...";
                });
        }

        function handleEmotion(i) {
            let rs = i.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion);
            chatInputRef.value.innerHTML += rs;
            msg.value += rs;
        }

        return {
            errorTip,
            closeCur,
            chatItemBlockClicked,
            chatFocus,
            msgInput,
            chatInputRef,
            emoBoxShow,
            isBottom,
            msg,
            MPD,
            chatItemBlock,
            chatMainBox,
            instance,
            sendFn,
            handleEmotion,
            scrollBottom,
            chatMainBoxHeight,
            emoClicked,
            saveScrollTop,
            visiableError,
        };
    },
};
</script>
<style lang="scss" scoped>
@import "./chatRoom.scss";
</style>
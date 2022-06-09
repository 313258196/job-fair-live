<template>
    <div class="chatroom-block">
        <div class="chat-item-block" ref="chatItemBlock">
            <div class="chat-main-box" ref="chatMainBox">
                <template v-for="(item, index) in chatArr">
                    <div v-if="item.payload.data == MPD.GroupCreate" class="tip-msg" :key="index">
                        <el-tag v-if="item.payload.data == MPD.GroupCreate" :key="index" class="tip-msg" type="success"
                            size="small">{{ item.payload.extension }}</el-tag>
                    </div>
                    <div v-else class="chat-item" :key="index + 1" :class="item.self ? 'chat-right' : 'chat-left'">
                        <el-avatar class="chat-avatar" size="default" :src="item.avatar" />
                        <div class="chat-item-content">
                            <div class="chat-item-name-about">{{ item.nick }}</div>
                            <div class="chat-item-con">
                                <span class="chat-content">{{ item.text }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <div class="chat-send-block">
            <div class="chat-send-inp-box">
                <input type="text" class="chat-input" placeholder="我要发言~" v-model="msg" @keyup.enter.native="sendFn" />
                <div class="utils-box">
                    <el-icon class="el-icon-biaoq" :size="25" @click="emoClicked">
                        <HelpFilled />
                    </el-icon>
                    <el-button type="primary" class="util-btn-send" :disabled="!groupChatExit" @click="sendFn">发送
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
import { ref, getCurrentInstance, computed, defineProps, onMounted, watch, nextTick } from "vue";
import tim, { _TIM, sdkReady } from "../../TIM";
import { messagePayloadData } from "../../TIM/configs";
import Emotion from '@/components/Emotion/index'
import { emotion } from '@/components/Emotion/data.js'
export default {
    props: ["groupChatExit", "chatArr", "send", "prePageLoading", "prePageFn"],
    name: "ChatRoom",
    components: { Emotion },
    setup(props) {
        const instance = getCurrentInstance();

        let msg = ref("");
        let MPD = ref(messagePayloadData);
        let chatItemBlock = ref(null);
        let chatMainBox = ref(null);
        let isBottom = ref(false);
        let emoBoxShow = ref(false);

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
                isBottom.value = chatItemBlock.value.scrollHeight <= Math.ceil(chatItemBlock.value.scrollTop + chatItemBlock.value.offsetHeight)
            });
        });

        watch(() => props.chatArr, (newV, oldV) => {
            if (newV && newV.length && (!oldV || !oldV.length)) {
                setTimeout(() => {
                    toBottom()
                }, 500);
            }
        }, { deep: true, immediate: true })

        function emoClicked() {
            emoBoxShow.value = !emoBoxShow.value
            instance.ctx.$forceUpdate();
        }

        // 将聊天滚动到底部
        async function scrollBottom() {
            await nextTick()
            if (isBottom.value) {
                toBottom()
            }
        }

        // 将滚动条拉到底部
        function toBottom() {
            chatItemBlock.value.scrollTo({
                top: chatMainBox.value.offsetHeight,
                behavior: "smooth",
            });
        }

        function sendFn() {
            props.send({
                text: msg.value,
            });
            msg.value = "";
        }

        function handleEmotion(i) {
            msg.value += i
            // msg.value += (i.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion))
        }

        return {
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
            emoClicked
        };
    },
};
</script>
<style lang="scss" scoped>
@import "./chatRoom.scss";
</style>
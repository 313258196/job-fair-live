<template>
    <div class="chatroom-block">
        <div class="chat-item-block" ref="chatItemBlock">
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
                        <div class="chat-item-name-about">{{ item.nick }}</div>
                        <div class="chat-item-con">
                            <span class="chat-content">{{ item.text }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="chat-send-block">
            <input
                type="text"
                class="chat-input"
                placeholder="我要发言~"
                v-model="msg"
                @keyup.enter.native="sendFn"
            />
            <div class="utils-box">
                <el-button
                    type="primary"
                    class="util-btn-send"
                    :disabled="!groupChatExit"
                    >表情</el-button
                >
                <el-button
                    type="primary"
                    class="util-btn-send"
                    :disabled="!groupChatExit"
                    @click="sendFn"
                    >发送</el-button
                >
            </div>
        </div>
    </div>
</template>
<script>
import { ref, getCurrentInstance, computed, defineProps, onMounted } from "vue";
import tim, { _TIM, sdkReady } from "../../TIM";
import { messagePayloadData } from "../../TIM/configs";
export default {
    props: ["groupChatExit", "chatArr", "send", "prePageLoading", "prePageFn"],
    name: "ChatRoom",
    setup(props) {
        let msg = ref("");
        let MPD = ref(messagePayloadData);
        let chatItemBlock = ref(null);

        let pageLoading = computed(() => props.prePageLoading.value);

        // console.log(111111111,props.prePageLoading)
        // let pageLoading = ref(props.prePageLoading.value);

        onMounted(() => {
            chatItemBlock.value.addEventListener("scroll", function () {
                if (
                    chatItemBlock.value.scrollTop <= 0 &&
                    !props.prePageLoading
                ) {
                    props.prePageFn();
                }
            });

            setTimeout(() => {
                console.log(7777777,chatItemBlock.value.offsetHeight)
                chatItemBlock.value.scrollTop = chatItemBlock.value.offsetHeight
            }, 3000);
        });

        function sendFn() {
            props.send({
                text: msg.value,
            });
            msg.value = "";
        }
        sdkReady(() => {
            // alert(22);
        });

        return {
            msg,
            MPD,
            chatItemBlock,
            sendFn,
        };
    },
};
</script>
<style lang="scss" scoped>
@import "./chatRoom.scss";
</style>
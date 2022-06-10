<template>
    <div class="chat-fixed" :class="{ show }">
        <ChatRoom
            ref="chatRoomRef"
            :groupChatExit="true"
            :chatArr="chatArr"
            :send="sendMsgFn"
            :prePageLoading="prePageLoading"
            :prePageFn="prePageFn"
            :isBottomFn="isBottom"
            @close="closeFn"
            :chatTitle="true"
        />
    </div>
</template>
<script>
import { ref, getCurrentInstance, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { _TIM } from "../../TIM";
import ChatRoom from "../chatRoom/ChatRoom.vue";
import ChatToCompany from "../chatToCompany/ChatToCompany.vue";
import { groupID, messageFrom, myProfile, myProfile2 } from "../../TIM/configs";
import { msgBundle } from "../../TIM/chatMsgBundle";

import genTestUserSig, { SDKAPPID } from "../../debug/GenerateTestUserSig";
import { loadJSForTcPlayer } from "../../debug/initPlayer";

import caimg from "@/assets/image/company_logo.png";
import uaimg from "@/assets/image/empty_photo.png";
import { chatMixin } from "@/mixins/chatMixin";
export default {
    name: "ChatToCompany",
    props: ["visiable", "memberId"],
    components: { ChatRoom },
    setup(props) {
        const instance = getCurrentInstance();
        const Route = useRoute();

        let show = ref(false);
        let converID = ref("");
        let membID = ref("");
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
            userInfo,
        } = chatMixin({
            conversationID: converID,
            toID: String(membID),
            conversationType: _TIM.TYPES.CONV_C2C,
        });

        watch(
            [() => props.visiable, () => props.memberId],
            ([visiable, memberId], [preVisiable, preMemberId]) => {
                // show.value = visiable;
                show.value = !show.value;
                converID.value = `C2C${memberId}`;
                membID.value = memberId;

                console.log(memberId, preMemberId);
                if (memberId == preMemberId) {
                    return;
                }
                // 获取更新聊天记录
                // sdkReady(() => {
                if (show.value) {
                    getMessageListFnLocal();
                }
                // });
            },
            { deep: true }
            // , immediate: true
        );

        function closeFn() {
            show.value = false
        }

        return {
            closeFn,
            membID,
            converID,
            show,
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
            userInfo,
        };
    },
};
</script>
<style lang="scss" scoped>
@import "./chatToCompany.scss";
</style>
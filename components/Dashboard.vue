<template>
  <div class="container text-center">
    <LoginForm :form-message-title="formTitle" />
    <WidgetButtons />
    <div v-if="currentConversationId">
      <VAlert
        title="Current conversation id: "
        @dismiss="currentConversationId = null">
        <code>{{ currentConversationId }}</code>
      </VAlert>
    </div>
    <div v-if="postbackBtnClickedEventData">
      <VAlert
        title="Postback button clicked event data:"
        @dismiss="postbackBtnClickedEventData = null">
        <hr />
        <div class="text-start">
          {{ JSON.stringify(postbackBtnClickedEventData, null, 4) }}
        </div>
      </VAlert>
    </div>
    <div v-if="conversationAgentAssignedData">
      <VAlert
        title="Conversation agent assigned event data:"
        @dismiss="conversationAgentAssignedData = null">
        <hr />
        <div class="text-start">
          {{ JSON.stringify(conversationAgentAssignedData, null, 4) }}
        </div>
      </VAlert>
    </div>
    <div v-if="configData">
      <VAlert title="Config data:" @dismiss="configData = null">
        <hr />
        <div class="text-start">
          {{ JSON.stringify(configData, null, 4) }}
        </div>
      </VAlert>
    </div>
  </div>
</template>

<script setup>
  import LoginForm from '@/components/LoginForm.vue';
  import VAlert from '@/components/VAlert.vue';
  import { onMounted, onBeforeUnmount, computed, ref } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { storeToRefs } from 'pinia';
  import WidgetButtons from '@/components/WidgetButtons.vue';
  import { initializeWidgets } from '@/composables/useWidgetInitializer';
  import {
    getDisplayedConversationId,
    setupZendeskEventListeners,
    unsubscribeZendeskEventListeners,
    currentConversationId,
    postbackBtnClickedEventData,
    conversationAgentAssignedData,
    configData,
  } from '@/composables/useZendesk';

  const userStore = useUserStore();

  const { loginWidgets } = userStore;
  const { authenticated, connectedAs } = storeToRefs(userStore);

  const defaultFormTitle = 'Log back in to sync your past conversations';
  const formTitle = computed(() => {
    return authenticated.value ? connectedAs.value : defaultFormTitle;
  });

  let intervalId = null;

  onMounted(async () => {
    await initializeWidgets();
    loginWidgets();
    // wait for window.zE to be available before setting up event listeners
    intervalId = setInterval(() => {
      if (window.zE) {
        setupZendeskEventListeners();
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    // Clean up interval if component unmounts before window.zE is available
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    // unsubscribeZendeskEventListeners();
  });
</script>

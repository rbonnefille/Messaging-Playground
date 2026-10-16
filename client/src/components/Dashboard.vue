<template>
  <main class="dashboard-page">
    <div class="dashboard-layout">
      <section class="dashboard-workspace" aria-label="Messaging Dashboard workspace">
        <section v-if="!authenticated" class="workspace-panel session-panel">
          <LoginForm :form-message-title="formTitle" />
        </section>

        <section class="workspace-panel conversation-panel">
          <header class="conversation-panel-header">
            <div>
              <h2>Current conversation</h2>
              <p>Metadata and status for the current widget session.</p>
            </div>
            <div class="conversation-header-actions">
              <div class="conversation-status">
                <span class="status-dot" :class="{ 'is-active': currentConversationId }"></span>
                <span>{{ currentConversationId ? 'Active' : 'Waiting' }}</span>
                <code v-if="currentConversationId">{{
                  currentConversationId
                }}</code>
              </div>

              <div v-if="user">
                <RouterLink :to="`/sunco/users/${user.id}`" class="btn routes" v-bind="$attrs">
                  {{ `Open user profile for user ${user.externalId ?? user.id}` }}
                </RouterLink>
              </div>
            </div>
          </header>

          <div class="conversation-intro">
            <ChatBubbleLeftRightIcon aria-hidden="true" />
            <div>
              <strong>{{
                currentConversationId
                  ? 'Widget session connected'
                  : 'No conversation selected'
              }}</strong>
              <p>
                {{
                  currentConversationId
                    ? 'Use the controls in the right panel to interact with this conversation.'
                    : 'Open or create a conversation with the controls in the right panel.'
                }}
              </p>
              <template v-if="conversation">
                <p v-if="isLoading">Loading conversation…</p>
                <p v-else-if="error">{{ error.message }}</p>
                <p class="mt-4"><strong>Conversation details:</strong></p>
                <pre class="text-start m-0 p-0" v-text="JSON.stringify(conversation, null, 4)"></pre>
              </template>
              <template v-if="user">
                <p v-if="isLoadingUser">Loading user</p>
                <p v-else-if="userError">{{ userError.message }}</p>
                <p class="mt-4"><strong>ConversationUser:</strong></p>
                <pre class="text-start m-0 p-0" v-text="JSON.stringify(user, null, 4)"></pre>
              </template>
            </div>
          </div>

          <section class="metadata-section" aria-labelledby="metadata-title">
            <div class="metadata-section-heading">
              <h3 id="metadata-title">Metadata</h3>
              <p>Conversation fields and tags present in the conversation object.</p>
            </div>
            <VMetadataDisplay v-if="metadataSet && !metadataAlertDismissed" class="metadata-alert"
              :metadataCode="zendeskButtons.setMetadata.code" @dismiss="setMetadataAlertDismissed(true)" />
            <VMetadataDisplay v-else-if="conversationTags && !metadataAlertDismissed" class="metadata-alert"
              :metadataCode="zendeskButtons.setConversationTags.code" @dismiss="setMetadataAlertDismissed(true)" />
            <p v-show="(!metadataSet && !conversationTags) || metadataAlertDismissed
              " class="empty-state metadata-empty-state">
              Metadata set from the Conversation controls will appear here.
            </p>
          </section>
        </section>
      </section>

      <aside class="dashboard-aside" aria-label="Web Widget controls">
        <WidgetButtons />
      </aside>
    </div>
  </main>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue';
import VMetadataDisplay from '@/components/VMetadataDisplay.vue';
import { onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import WidgetButtons from '@/components/WidgetButtons.vue';
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';
import { initializeWidgets } from '@/composables/useWidgetInitializer';
import { useAsyncState } from '@vueuse/core';

import { fetchConversation, fetchUser } from '@/services/suncoService';
import {
  setupZendeskEventListeners,
  currentConversationId,
} from '@/composables/useZendesk';
import {
  conversationTags,
  metadataSet,
  zendeskButtons,
  updateWidgetContentScale,
} from '@/composables/useWidgetButtons';

const userStore = useUserStore();

const { loginWidgets, setMetadataAlertDismissed } = userStore;
const { authenticated, connectedAs, metadataAlertDismissed } =
  storeToRefs(userStore);
const defaultFormTitle = 'Log back in to sync your past conversations';
const formTitle = computed(() => {
  return authenticated.value ? connectedAs.value : defaultFormTitle;
});

const {
  state: conversation,
  isLoading,
  error,
  executeImmediate: loadConversation,
} = useAsyncState(
  async (conversationId) => {
    if (!conversationId) return null;
    return fetchConversation(conversationId);
  },
  null,
  { immediate: false }
);

const {
  state: user,
  isLoading: isLoadingUser,
  error: userError,
  executeImmediate: loadUser,
} = useAsyncState(
  async (userId) => {
    if (!userId) return null;
    const response = await fetchUser(userId);
    return response.user;
  },
  null,
  { immediate: false }
);

let intervalId = null;

onMounted(async () => {
  await initializeWidgets();
  loginWidgets();
  // wait for window.zE to be available before setting up event listeners
  intervalId = setInterval(() => {
    if (window.zE) {
      setupZendeskEventListeners();
      updateWidgetContentScale(90);
      clearInterval(intervalId);
      intervalId = null;
    }
  }, 100);
});

watch(
  currentConversationId,
  (conversationId) => {
    void loadConversation(conversationId);
  },
  { immediate: true }
);

watch(
  () => conversation.value?.metadata?.userId,
  (userId) => {
    if (typeof userId === 'string' && userId) {
      void loadUser(userId);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  // Clean up interval if component unmounts before window.zE is available
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  // unsubscribeZendeskEventListeners();
});
</script>
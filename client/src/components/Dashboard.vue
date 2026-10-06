<template>
  <main class="dashboard-page">
    <div class="dashboard-layout">
      <section
        class="dashboard-workspace"
        aria-label="Messaging Dashboard workspace">
        <section v-if="!authenticated" class="workspace-panel session-panel">
          <LoginForm :form-message-title="formTitle" />
        </section>

        <section class="workspace-panel conversation-panel">
          <header class="conversation-panel-header">
            <div>
              <h2>Current conversation</h2>
              <p>Metadata and status for the current widget session.</p>
            </div>
            <div class="conversation-status">
              <span
                class="status-dot"
                :class="{ 'is-active': currentConversationId }"></span>
              <span>{{ currentConversationId ? 'Active' : 'Waiting' }}</span>
              <code v-if="currentConversationId">{{
                currentConversationId
              }}</code>
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
            </div>
          </div>

          <section class="metadata-section" aria-labelledby="metadata-title">
            <div class="metadata-section-heading">
              <h3 id="metadata-title">Metadata</h3>
              <p>Conversation fields and tags applied through the widget.</p>
            </div>

            <VMetadataDisplay
              v-if="metadataSet && !metadataAlertDismissed"
              class="metadata-alert"
              :metadataCode="zendeskButtons.setMetadata.code"
              @dismiss="setMetadataAlertDismissed(true)" />
            <VMetadataDisplay
              v-else-if="conversationTags && !metadataAlertDismissed"
              class="metadata-alert"
              :metadataCode="zendeskButtons.setConversationTags.code"
              @dismiss="setMetadataAlertDismissed(true)" />
            <p
              v-show="
                (!metadataSet && !conversationTags) || metadataAlertDismissed
              "
              class="empty-state metadata-empty-state">
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
  import { onMounted, onBeforeUnmount, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import { storeToRefs } from 'pinia';
  import WidgetButtons from '@/components/WidgetButtons.vue';
  import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline';
  import { initializeWidgets } from '@/composables/useWidgetInitializer';
  import {
    setupZendeskEventListeners,
    unsubscribeZendeskEventListeners,
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

  onBeforeUnmount(() => {
    // Clean up interval if component unmounts before window.zE is available
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    // unsubscribeZendeskEventListeners();
  });
</script>

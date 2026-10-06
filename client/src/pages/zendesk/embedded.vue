<template>
  <div class="embedded-container mx-auto p-2 m-2 rounded-5">
    <div class="embedded-wrapper">
      <div class="embedded-column">
        <div id="widget_conversations"></div>
      </div>
      <div class="embedded-column">
        <div id="widget_messages"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useHead } from '@unhead/vue';
  import { useInitZDWidget } from '@/composables/useZendesk';
  import { checkZendeskLoaded } from '@/composables/helpers';

  useHead({
    script: [{ innerHTML: 'window.zEMessenger = {autorender: false}' }],
  });

  onMounted(async () => {
    useInitZDWidget('ze-snippet', import.meta.env.VITE_MESSAGING_KEY);
    try {
      await checkZendeskLoaded();

      // Wait for the widget API to finish initializing before using it.
      await new Promise(resolve => {
        window.zE(() => {
          resolve();
          window.zE('messenger', 'hide');
          window.zE('messenger:set', 'customization', {
            common: {
              contentScale: 90,
            },
            conversationList: {
              hideHeader: true, // Retain the header in the conversation list
              hideNewConversationButton: false,
            },
            messageLog: {
              hideHeader: true, // Hides the header in conversations to maximize available space
            },
          });
          window.zE('messenger', 'render', {
            mode: 'embedded',
            conversationList: {
              targetElement: '#widget_conversations',
            },
            messageLog: {
              targetElement: '#widget_messages',
            },
          });
        });
      });
    } catch (error) {
      console.error('Zendesk embedded widget failed to load:', error);
    }
  });
</script>

<route lang="json">
{
  "name": "Widget Embedded mode",
  "meta": {
    "title": "Widget Embedded mode"
  }
}
</route>

<style scoped>
  .embedded-container {
    width: 100%;
    height: calc(100dvh - 140px);
    overflow: hidden;
  }

  .embedded-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .embedded-column {
    height: 100%;
  }

  .embedded-column:first-child {
    width: 30%;
    border-top: solid 1px #ccc;
    border-right: solid 1px #ccc;
  }

  .embedded-column:last-child {
    width: 70%;
    border-top: solid 1px #ccc;
    border-right: solid 1px #ccc;
  }

  #widget_conversations,
  #widget_messages {
    width: 100%;
    height: 100%;
  }
</style>

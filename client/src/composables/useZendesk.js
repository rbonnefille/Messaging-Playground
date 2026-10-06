import {
  useGetToken,
  useGetSessionAuth,
  useSetSessionAuth,
  useIsTokenExpired,
  checkZendeskLoaded,
} from '@/composables/helpers';
import { useShowWarningToast } from '@/composables/helpers';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';

let unsubscribeOpen = () => {};
let unsubscribeClose = () => {};
let unsubscribeBeforeMessageDisplay = () => {};
let unsubscribePostbackButtonClicked = () => {};
let unsubscribeNewConversationButtonClicked = () => {};
let unsubscribeConversationWithAgentRequested = () => {};
let unsubscribeMessagesShown = () => {};
let unsubscribeConversationExtensionOpened = () => {};
let unsubscribeConversationExtensionDisplayed = () => {};
let unsubscribeArticleClicked = () => {};
let unsubscribeArticleBrowserClicked = () => {};
let unsubscribeMessageReceived = () => {};
let unsubscribeConversationOpened = () => {};
let unsubscribeConversationAgentAssigned = () => {};
let unsubscribeProactiveMessageDisplayed = () => {};
let unsubscribeProactiveMessageClicked = () => {};
let unsubscribeConversationStarted = () => {};
let unsubscribeBeforeMessageSent = () => {};

export const currentConversationId = ref(null),
  postbackBtnClickedEventData = ref(null),
  conversationAgentAssignedData = ref(null),
  configData = ref(null);

export const getConfigData = () => {
  zE('messenger:get', 'config', function (config) {
    configData.value = config;
  });
};

export const useInitZDWidget = (snippetId, key) => {
  const zeScript = document.createElement('script');
  zeScript.id = snippetId;
  zeScript.src = `https://static.zdassets.com/ekr/snippet.js?key=${key}`;
  document.body.appendChild(zeScript);
};

export const useLoginUserZDWidget = async userAuthJWT => {
  try {
    await checkZendeskLoaded();
  } catch (error) {
    console.error('Zendesk widget failed to load:', error);
    useShowWarningToast(
      'Zendesk widget failed to load. Please refresh the page.',
      5000,
    );
    throw new Error('Zendesk widget failed to load');
  }

  return new Promise((resolve, reject) => {
    window.zE(
      'messenger',
      'loginUser',
      async callback => {
        try {
          const { token: sessionToken, external_id: sessionExternalId } =
            useGetSessionAuth();
          if (sessionExternalId === 'm-scott') {
            userAuthJWT = {
              external_id: 'm-scott',
              email: 'michael-scott@example.com',
              name: 'Michael Scott',
              emailVerified: true,
            };
          }
          if (
            sessionToken &&
            sessionExternalId &&
            !useIsTokenExpired(sessionToken)
          ) {
            callback(sessionToken);
            window.zE('messenger', 'open');
            return;
          }
          const { token } = await useGetToken(userAuthJWT);
          callback(token); // Call the callback with the new JWT token
          window.zE('messenger', 'open');
        } catch (error) {
          console.error('Failed to fetch new JWT:', error);
          const { type, reason, message } = error || {};
          useShowWarningToast(`Error: ${type} - ${reason} - ${message}`, 5000);
          reject(error);
        }
      },
      function loginCallback(error) {
        if (error) {
          const { type, reason, message } = error;
          console.log(`Error: ${type} - ${reason} - ${message}`);
          useShowWarningToast(`Error: ${type} - ${reason} - ${message}`, 5000);
          reject(error);
          return;
        }
        console.log('Login successful');
        useSetSessionAuth(userAuthJWT.external_id, userAuthJWT.token);
        resolve(true);
      },
    );
  });
};

export const getDisplayedConversationId = () => {
  const userStore = useUserStore();
  const { changeHasConversationsStatus } = userStore;

  let conversationId = null;
  zE('messenger', 'fetchConversations', 0, (error, response) => {
    if (error) {
      console.error('Failed to fetch conversations:', error.reason);
      return;
    }
    console.log('Fetched conversations:', response.data[0]?.id);
    console.log('Has more pages:', response.hasMore);

    // // Fetch next page if available
    // if (response.hasMore) {
    //   zE('messenger', 'fetchConversations', 10, (error, nextResponse) => {
    //     // Handle next page...
    //   });
    // }
    conversationId = response.data[0]?.id;
    changeHasConversationsStatus(response.data && response.data.length > 0);
  });
  return conversationId;
};

export const setupZendeskEventListeners = () => {
  const userStore = useUserStore();
  const { changeWidgetOpenedStatus, changeHasConversationsStatus } = userStore;
  unsubscribeOpen = window.zE('messenger:on', 'open', event => {
    changeWidgetOpenedStatus(true);
    changeHasConversationsStatus(true);
  });
  unsubscribeClose = window.zE('messenger:on', 'close', () => {
    changeWidgetOpenedStatus(false);
  });

  unsubscribeProactiveMessageDisplayed = window.zE(
    'messenger:on',
    'proactiveMessageDisplayed',
    function (event) {
      console.log(`Proactive message displayed`, event);
    },
  );

  unsubscribeProactiveMessageClicked = window.zE(
    'messenger:on',
    'proactiveMessageClicked',
    function (event) {
      console.log(`Proactive message clicked`, event);
    },
  );

  unsubscribeConversationStarted = window.zE(
    'messenger:on',
    'conversationStarted',
    function (event) {
      console.log(`Conversation started`, event);
    },
  );

  unsubscribeConversationOpened = window.zE(
    'messenger:on',
    'conversationOpened',
    function (event) {
      const { id: converstionIdOpened } = event.payload.conversation;
      currentConversationId.value = converstionIdOpened;
    },
  );

  unsubscribeNewConversationButtonClicked = window.zE(
    'messenger:on',
    'newConversationButtonClicked',
    function (event) {
      console.log(`New conversation button clicked`, event);
    },
  );

  unsubscribeConversationWithAgentRequested = window.zE(
    'messenger:on',
    'conversationWithAgentRequested',
    function (event) {
      console.log(`Conversation with agent requested`, event);
    },
  );

  unsubscribeConversationAgentAssigned = window.zE(
    'messenger:on',
    'conversationAgentAssigned',
    function (event) {
      conversationAgentAssignedData.value = event;
    },
  );

  unsubscribeMessagesShown = window.zE(
    'messenger:on',
    'messagesShown',
    function (event) {
      console.log(`Messages shown`, event);
    },
  );

  unsubscribePostbackButtonClicked = window.zE(
    'messenger:on',
    'postbackButtonClicked',
    function (event) {
      console.log(`Postback button clicked`, event);
    },
  );

  unsubscribeConversationExtensionOpened = window.zE(
    'messenger:on',
    'conversationExtensionOpened',
    function (event) {
      console.log(`Conversation extension opened`, event);
    },
  );
  unsubscribeConversationExtensionDisplayed = window.zE(
    'messenger:on',
    'conversationExtensionDisplayed',
    function (event) {
      console.log(`Conversation extension displayed`, event);
    },
  );

  unsubscribeArticleClicked = window.zE(
    'messenger:on',
    'articleClicked',
    function (event) {
      console.log(`Article clicked`, event);
    },
  );

  unsubscribeArticleBrowserClicked = window.zE(
    'messenger:on',
    'articleBrowserClicked',
    function (event) {
      console.log(`Article opened in browser`, event);
    },
  );

  unsubscribeMessageReceived = window.zE(
    'messenger:on',
    'messageReceived',
    function (event) {
      console.log(
        `Message received in conversation ${event.payload.conversation.id}`,
        event,
      );
    },
  );

  unsubscribePostbackButtonClicked = window.zE(
    'messenger:on',
    'postbackButtonClicked',
    function (event) {
      console.log(`Postback button clicked`, event);
      postbackButtonClickedEventData.value = event;
    },
  );

  unsubscribeBeforeMessageDisplay = window.zE(
    'messenger:set',
    'beforeMessageDisplay',
    function (message, data) {
      // Customize agent display names
      if (message.metadata.internal_only === true) {
        console.log(
          `Delegate message.metadata: ${JSON.stringify(message.metadata)}`,
        );
        return null;
      }
      // Keep original message
      return message;
    },
  );

  unsubscribeBeforeMessageSent = window.zE(
    'messenger:set',
    'beforeMessageSent',
    function (message, data) {
      // Add custom metadata to every message
      return null;
    },
  );
};

// Define a function to unsubscribe from all Zendesk event listeners
// To be reviewed later on as Zendesk product found some events don't have an unsubscribe function
export const unsubscribeZendeskEventListeners = () => {
  // unsubscribeBeforeMessageDisplay();
  // unsubscribeBeforeMessageSent();
  // unsubscribeOpen();
  // unsubscribeClose();
  // unsubscribePostbackButtonClicked();
  // unsubscribeConversationOpened();
  // unsubscribeConversationAgentAssigned();
  // unsubscribeProactiveMessageDisplayed();
  // unsubscribeProactiveMessageClicked();
  // unsubscribeConversationStarted();
  // unsubscribeNewConversationButtonClicked();
  // unsubscribeConversationWithAgentRequested();
  // unsubscribeMessagesShown();
  // unsubscribeConversationExtensionOpened();
  // unsubscribeConversationExtensionDisplayed();
  // unsubscribeArticleClicked();
  // unsubscribeArticleBrowserClicked();
  // unsubscribeMessageReceived();
};

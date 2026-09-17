import {
  useClearBrowserStorage,
  useGetRandomImageUrl,
} from '@/composables/helpers';
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { storeToRefs } from 'pinia';
import { useGetSessionAuth, useShowWarningToast } from '@/composables/helpers';
import { useDark, useToggle } from '@vueuse/core';
import {
  getDisplayedConversationId,
  getConfigData,
} from '@/composables/useZendesk';
import { setSuncoWidgetVisibility } from '@/composables/useSunco';

const userStore = useUserStore();

const {
  changeAuthenticationStatus,
  loginWidgets,
  changeHasConversationsStatus,
} = userStore;
const { userHasConversations } = storeToRefs(userStore);
const metadataSet = ref(false);
const conversationTags = ref(false);
const htmlTag = document.querySelector('html');
const sidebarLeft = ref(null);
const sidebarRight = ref(null);
const isWidgetEmbedded = ref(false);
const isSuncoWidgetVisible = ref(false);

const [presetValue, togglePreset] = useToggle('on', {
  truthyValue: 'minimalistic',
  falsyValue: 'default',
});

const [offsetValue, toggleOffset] = useToggle('on', {
  truthyValue: '30',
  falsyValue: '16',
});

const openSidebar = location => {
  location.value?.openSidebar();
};

const createConversation = (displayName, iconUrl, metadata) => {
  window.zE('messenger:ui', 'newConversation', {
    displayName: displayName,
    iconUrl:
      iconUrl ||
      'https://upload.wikimedia.org/wikipedia/fr/6/6d/Looney_Tunes_Logo.png',
    metadata: metadata,
  });
};

const updateWidgetLocale = locale => {
  window.zE('messenger:set', 'locale', `${locale}`);
};

const updateCookieConsent = range => {
  zE('messenger:set', 'cookies', `${range}`);
};

const isDark = useDark({
  onChanged(dark) {
    if (dark) {
      htmlTag.setAttribute('data-bs-theme', 'dark');
    } else {
      htmlTag.setAttribute('data-bs-theme', 'light');
    }
  },
});

const toggleDark = useToggle(isDark);

const darkTheme = {
  primary: '#d1f470',
  onPrimary: '#000000',
  message: '#355e34',
  onMessage: '#FFFFFF',
  action: '#d1f470',
  onAction: '#000000',
  businessMessage: '#16140c',
  onBusinessMessage: '#FFFFFF',
  background: '#2b2b2bff',
  onBackground: '#FFFFFF',
  error: '#CF6679',
  onError: '#000000',
  notify: '#d1f470',
  onNotify: '#000000',
  onSecondaryAction: '#FFFFFF',
};

const lightTheme = {
  primary: '#000000',
  onPrimary: '#FFFFFF',
  message: 'rgb(0, 0, 0)',
  onMessage: '#FFFFFF',
  action: '#000000',
  onAction: '#FFFFFF',
  businessMessage: 'rgb(244, 246, 248)',
  onBusinessMessage: '#000000',
  background: '#FFFFFF',
  onBackground: '#000000',
  error: '#CF6679',
  onError: '#000000',
  notify: 'rgb(204, 51, 64)',
  onNotify: '#FFFFFF',
  onSecondaryAction: '#000000',
};

const applyPreset = () => {
  zE('messenger:set', 'customization', {
    common: {
      stylingPreset: 'minimalistic',
    },
    conversationList: {
      hideNewConversationButton: false,
      hideHeader: false,
      avatar: {
        hidden: false,
        size: 24,
      },
      hideTimestamp: true,
      hideMessagePreview: false,
      hideDivider: false,
      groupByTimestamp: true,
    },
    messageLog: {
      hideHeader: false,
      avatar: {
        position: 'top',
        size: 24,
      },
      businessMessage: {
        bubbleMaxWidth: 90,
        hideBubble: false,
      },
      userMessage: {
        bubbleMaxWidth: 60,
        hideBubble: false,
      },
    },
  });
};

const sendMessage = () => {
  const conversationId = getDisplayedConversationId();
  zE(
    'messenger',
    'sendMessage',
    {
      content: {
        type: 'text',
        text: 'Hello, I still need help',
      },
      metadata: { internal_only: true },
    },
    conversationId,
    (error, message) => {
      if (error) {
        console.error('sendMessage failed', error);
        return;
      }
      // zE('messenger:ui', 'navigation', {
      //   screen: 'Conversation',
      //   options: {
      //     conversationId: conversationId,
      //   },
      // });
      // zE('messenger', 'open');
      console.log('sent message id', message);
    },
  );
};

const changeColors = () => {
  toggleDark();
  if (isDark.value) {
    window.zE('messenger:set', 'customization', {
      theme: darkTheme,
    });
  } else {
    window.zE('messenger:set', 'customization', {
      theme: lightTheme,
    });
  }
};

const { token: sessionToken, external_id: sessionExternalId } =
  useGetSessionAuth();

const toggleSuncoWidget = () => {
  isSuncoWidgetVisible.value = !isSuncoWidgetVisible.value;
  setSuncoWidgetVisibility(isSuncoWidgetVisible.value);
};

const toolsButtons = {
  clearStorage: {
    text: 'Clear Storage',
    type: 'button',
    click() {
      useClearBrowserStorage();
    },
  },
};
const suncoButtons = {
  toggleWidget: {
    text: 'Show Widget',
    type: 'button',
    className: 'btn-outline-secondary btn-sm mx-2 px-2 pt-1 pb-1',
    click() {
      toggleSuncoWidget();
    },
  },
  openSunCo: {
    text: 'Open',
    type: 'button',
    click() {
      window.Smooch.open();
    },
  },
  closeSunCo: {
    text: 'Close',
    type: 'button',
    click() {
      window.Smooch.close();
    },
  },
  loginSunco: {
    text: 'Login',
    type: 'button',
    click() {
      if (sessionToken && sessionExternalId) {
        loginWidgets('sunco');
      } else {
        useShowWarningToast(
          `No JWT in sessionStorage. Please login via the form`,
          1500,
        );
      }
    },
  },
  logoutSunco: {
    text: 'Logout',
    type: 'button',
    click() {
      window.Smooch.logout();
      window.Smooch.close();
      userStore.$reset();
      changeAuthenticationStatus(false);
    },
  },
  sendImage: {
    text: 'Send Image',
    type: 'button',
    click() {
      window.Smooch.sendMessage(
        {
          type: 'image',
          mediaUrl: useGetRandomImageUrl(),
        },
        Smooch.getDisplayedConversation().id,
      );
    },
  },
  docs: {
    text: 'Dev Docs',
    type: 'button',
    click() {
      window.open(
        'https://github.com/zendesk/sunshine-conversations-web',
        '_blank',
      );
    },
  },
};

const zendeskButtons = {
  openMessaging: {
    text: 'Open',
    type: 'button',
    click() {
      window.zE('messenger', 'open');
    },
  },
  closeMessaging: {
    text: 'Close',
    type: 'button',
    click() {
      window.zE('messenger', 'close');
    },
  },
  leftSide: {
    text: 'Left Side',
    type: 'button',
    click() {
      zE('messenger:set', 'customization', {
        common: {
          position: {
            side: 'left',
          },
        },
      });
    },
  },
  rightSide: {
    text: 'Right Side',
    type: 'button',
    click() {
      zE('messenger:set', 'customization', {
        common: {
          position: {
            side: 'right',
          },
        },
      });
    },
  },
  showMessaging: {
    text: 'Show',
    type: 'button',
    click() {
      window.zE('messenger', 'show');
    },
  },
  hideMessaging: {
    text: 'Hide',
    type: 'button',
    click() {
      window.zE('messenger', 'hide');
    },
  },
  loginMessaging: {
    text: 'Login',
    type: 'button',
    click() {
      if (sessionToken && sessionExternalId) {
        loginWidgets('zendesk');
      } else {
        useShowWarningToast(
          `No JWT in sessionStorage. Please login via the form`,
          1500,
        );
      }
    },
  },
  logoutMessaging: {
    text: 'Logout',
    type: 'button',
    click() {
      window.zE('messenger', 'logoutUser');
      userStore.$reset();
      metadataSet.value = false;
      changeAuthenticationStatus(false);
      window.zE('messenger', 'close');
    },
  },
  hideHeader: {
    text: 'Hide header',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      zE('messenger:set', 'customization', {
        common: {
          hideHeader: true,
        },
      });
    },
  },
  showHeader: {
    text: 'Show header',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      zE('messenger:set', 'customization', {
        common: {
          hideHeader: false,
        },
      });
    },
  },
  embeddedMode: {
    text: 'Embedded Mode Sidebar',
    type: 'button',
    click() {
      openSidebar(sidebarRight);
      if (!isWidgetEmbedded.value) {
        isWidgetEmbedded.value = true;
        window.zE('messenger', 'render', {
          mode: 'embedded',
          widget: { targetElement: '#messenger-widget' },
        });
      }
    },
  },
  openSidebar: {
    text: 'Open sidebar',
    type: 'button',
    click() {
      openSidebar(sidebarRight);
    },
  },
  createConversation: {
    text: 'Create Conversation',
    type: 'button',
    click() {
      window.zE('messenger', 'open');
      createConversation(
        'Support Request',
        'https://upload.wikimedia.org/wikipedia/fr/6/6d/Looney_Tunes_Logo.png',
        {
          priority: 'high',
          'zen:ticket:tags': 'newConversation, important, supportRequest',
          'zen:ticket_field:17826865089553': 'test',
        },
      );
    },
  },

  setMetadata: {
    text: 'Set Metadata',
    type: 'button',
    code: `window.zE('messenger:set', 'conversationFields', [{ id: 17826865089553, value: 'test'}, { id: 44803962172689, value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcF82MDY0MzU2ODA4OWRlYzAwZDJjMzZhNDMifQ.eyJzY29wZSI6InVzZXIiLCJleHRlcm5hbF9pZCI6InRlc3QiLCJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTc3MzY0OTA3OCwiZXhwIjoxNzc0MjUzODc4fQ.sav-L5-PrrddBaq24yArzFoep9Ca5Y5yXsOkltLV9vI'}])\n\nwindow.zE("messenger:set", "conversationTags", ["sales","computer_accessories",]);`,
    click() {
      window.zE('messenger:set', 'conversationFields', [
        { id: 17826865089553, value: 'test' },
        {
          id: 44803962172689,
          value:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFwcF82MDY0MzU2ODA4OWRlYzAwZDJjMzZhNDMifQ.eyJzY29wZSI6InVzZXIiLCJleHRlcm5hbF9pZCI6InRlc3QiLCJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTc3MzY0OTA3OCwiZXhwIjoxNzc0MjUzODc4fQ.sav-L5-PrrddBaq24yArzFoep9Ca5Y5yXsOkltLV9vI',
        },
      ]);
      window.zE('messenger:set', 'conversationTags', [
        'sales',
        'computer_accessories',
      ]);
      metadataSet.value = true;
    },
  },
  setConversationTags: {
    text: 'Set Conversation Tags',
    type: 'button',
    code: `window.zE('messenger:set', 'conversationTags', ['sales','computer_accessories']);`,
    click() {
      window.zE('messenger:set', 'conversationTags', [
        'sales',
        'computer_accessories',
      ]);
      conversationTags.value = true;
    },
  },
  callUs: {
    text: 'Call us',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      window.zE(
        'messenger:open',
        'voice',
        useRuntimeConfig().public.zendeskVoiceLineId,
      );
    },
  },
  customization: {
    text: 'Customization - Dark Theme',
    type: 'button',
    click() {
      changeColors();
    },
  },
  navToConversationList: {
    text: 'Navigate to Convo List',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      zE('messenger:ui', 'navigation', {
        screen: 'ConversationList',
      });
      zE('messenger', 'open');
    },
  },
  navToMostRecentConversation: {
    text: 'Navigate to Most Recent Conversation',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      zE('messenger:ui', 'navigation', {
        screen: 'MostRecentActiveConversation',
      });
      zE('messenger', 'open');
    },
  },
  sendMessage: {
    text: 'Send Message',
    type: 'button',
    get isVisible() {
      return userHasConversations.value;
    },
    click() {
      sendMessage();
    },
  },

  minimalisticMode: {
    text: 'Toggle Minimalistic Mode',
    type: 'button',
    click() {
      togglePreset();
      zE('messenger:set', 'customization', {
        common: {
          stylingPreset: presetValue.value,
        },
      });
    },
  },
  applyPreset: {
    text: 'Apply Defined Preset',
    type: 'button',
    click() {
      applyPreset();
    },
  },
  changeOffsetWeb: {
    text: 'Toggle Offset',
    type: 'button',
    click() {
      toggleOffset();
      zE('messenger:set', 'customization', {
        position: {
          offset: {
            web: { horizontal: offsetValue.value, vertical: offsetValue.value },
          },
        },
      });
    },
  },
  resetWidget: {
    text: 'Reset Widget',
    type: 'button',
    className: 'btn-outline-danger btn-sm mx-2 px-2 pt-1 pb-1',
    click() {
      window.zE('messenger', 'resetWidget', function () {
        console.log(`You have reset the messaging Web Widget`);
      });
    },
  },
  getConfig: {
    text: 'Get Config',
    type: 'button',
    className: 'btn-outline-secondary btn-sm mx-2 px-2 pt-1 pb-1',
    click() {
      getConfigData();
    },
  },
  docs: {
    text: 'Dev Docs',
    type: 'button',
    className: 'btn-outline-secondary btn-sm mx-2 px-2 pt-1 pb-1',
    click() {
      window.open(
        'https://developer.zendesk.com/api-reference/widget-messaging/web/core/',
        '_blank',
      );
    },
  },
};

const updateCitationSourceFormat = value => {
  zE('messenger:set', 'customization', {
    messageLog: {
      citations: {
        sources: value,
      },
    },
  });
};

export {
  toolsButtons,
  suncoButtons,
  zendeskButtons,
  sidebarLeft,
  sidebarRight,
  openSidebar,
  isWidgetEmbedded,
  updateWidgetLocale,
  updateCookieConsent,
  metadataSet,
  conversationTags,
  isSuncoWidgetVisible,
  toggleSuncoWidget,
  updateCitationSourceFormat,
};

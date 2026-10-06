// Centralized user authentication and widget state.
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useLoginUserZDWidget } from '@/composables/useZendesk';
import { useLoginUserSunCoWidget } from '@/composables/useSunco';
import { useGetSessionAuth } from '@/composables/helpers';

export const useUserStore = defineStore('user', () => {
  const authenticated = ref(false);
  const external_id = ref(null);
  const title = ref(null);
  const sessionStorage = ref(null);
  const widgetOpened = ref(false);
  const hasConversations = ref(false);
  const metadataAlertDismissed = ref(false);

  const connectedAs = computed(
    () => `You are connected as: ${external_id.value}`,
  );
  const isWidgetOpened = computed(() => widgetOpened.value);

  const userHasConversations = computed(() => hasConversations.value);

  function $reset() {
    authenticated.value = false;
    external_id.value = null;
    title.value = null;
    sessionStorage.value = null;
    widgetOpened.value = false;
    hasConversations.value = false;
    metadataAlertDismissed.value = false;
  }
  function changeAuthenticationStatus(isAuthenticated, userExternal_id) {
    authenticated.value = isAuthenticated;
    external_id.value = userExternal_id;
    title.value = `User ${userExternal_id}` || null;
  }
  function changeWidgetOpenedStatus(status) {
    widgetOpened.value = status;
  }
  function changeHasConversationsStatus(status) {
    hasConversations.value = status;
  }
  function setMetadataAlertDismissed(dismissed) {
    metadataAlertDismissed.value = dismissed;
  }

  function loginWidgets(widget) {
    const { token, external_id: sessionExternalId } = useGetSessionAuth();
    if (sessionExternalId && token) {
      changeAuthenticationStatus(true, sessionExternalId);
      switch (widget) {
        case 'sunco':
          useLoginUserSunCoWidget(sessionExternalId, token);
          break;
        case 'zendesk':
          useLoginUserZDWidget(token);
          break;
        default:
          useLoginUserSunCoWidget(sessionExternalId, token);
          useLoginUserZDWidget(token);
          break;
      }
    }
  }

  return {
    authenticated,
    external_id,
    title,
    sessionStorage,
    widgetOpened,
    metadataAlertDismissed,
    connectedAs,
    isWidgetOpened,
    userHasConversations,
    changeAuthenticationStatus,
    loginWidgets,
    changeWidgetOpenedStatus,
    changeHasConversationsStatus,
    setMetadataAlertDismissed,
    $reset,
  };
});

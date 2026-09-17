import { useInitSunco } from '@/composables/useSunco';
import { useInitZDWidget } from '@/composables/useZendesk';

export const initializeWidgets = () => {
  const { messagingKey } = useRuntimeConfig().public;
  if (!document.getElementById('web-messenger-container')) {
    useInitSunco();
  }
  if (!document.getElementById('ze-snippet')) {
    useInitZDWidget('ze-snippet', messagingKey);
  }
};

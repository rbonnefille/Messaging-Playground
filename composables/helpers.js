import { useUserStore } from '@/stores/userStore';
import { useToast } from 'vue-toastification';
import { useStorage } from '@vueuse/core';
import { requestAuthToken } from '@/services/authService';
const toast = useToast();

/**
 * Checks if Zendesk Widget (zE) is loaded on the window object.
 * Polls every 100ms until the Zendesk Widget is available.
 * Includes timeout to prevent infinite polling.
 *
 * @param {number} [timeout=10000] - Maximum time to wait in milliseconds (default: 10 seconds)
 * @returns {Promise<void>} A promise that resolves when Zendesk Widget is loaded
 * @throws {Error} Throws an error if the widget fails to load within the timeout period
 */
export const checkZendeskLoaded = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window.zE === 'function') {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (typeof window.zE === 'function') {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(
          new Error('Zendesk Widget failed to load within timeout period'),
        );
      }
    }, 100);
  });
};

/**
 * Sends a POST request to the '/auth' endpoint with the provided user data to retrieve an authentication token.
 *
 * @async
 * @function useGetToken
 * @param {Object} userData - The user data to be sent in the request body.
 * @returns {Promise<Object>} The response data parsed as JSON.
 * @throws {Error} Throws an error if the HTTP response is not ok.
 */
export const useGetToken = async userData => {
  try {
    return await requestAuthToken(userData);
  } catch (error) {
    useShowWarningToast(`Error while requesting the token: ${error.message}`);
    throw error;
  }
};

/**
 * Stores authentication information in sessionStorage under the key 'widgetAuth'.
 *
 * @param {string} external_id - The external identifier for the session.
 * @param {string} token - The authentication token to be stored.
 */
export const useSetSessionAuth = (external_id, token) => {
  useStorage(
    'widgetAuth',
    { external_id: external_id, token: token },
    sessionStorage,
  );
};

/**
 * Retrieves and parses the 'widgetAuth' object from sessionStorage.
 *
 * @returns {Object} The parsed authentication object from sessionStorage, or an empty object if not found.
 */
export const useGetSessionAuth = () => {
  const raw = window.sessionStorage.getItem('widgetAuth');
  return raw ? JSON.parse(raw) : {};
};

/**
 * Decodes a JWT payload without verifying its signature.
 * Client-side decoding is only safe for reading non-sensitive claims such as `exp`;
 * never trust these values for security decisions, the server still validates the token.
 *
 * @param {string} token - The JWT whose payload should be decoded.
 * @returns {Object|null} The decoded payload, or null if the token is malformed.
 */
export const useDecodeJwt = token => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Determines whether a JWT is expired (or about to expire) from its `exp` claim.
 * A skew buffer prevents handing Zendesk a token that lapses in transit.
 *
 * @param {string} token - The JWT to inspect.
 * @param {number} [skewSeconds=30] - Seconds before `exp` at which to treat the token as expired.
 * @returns {boolean} True if the token is missing/malformed or past (exp - skew); false otherwise.
 */
export const useIsTokenExpired = (token, skewSeconds = 30) => {
  const payload = token ? useDecodeJwt(token) : null;
  if (!payload) {
    return true;
  }
  if (typeof payload.exp !== 'number') {
    return false;
  }
  return Date.now() >= (payload.exp - skewSeconds) * 1000;
};

/**
 * Clears all data from localStorage and sessionStorage, resets the user store,
 * updates the authentication status to false, and logs out from Smooch.
 *
 * @function
 * @returns {void}
 */
export const useClearBrowserStorage = () => {
  const userStore = useUserStore();
  const { changeAuthenticationStatus } = useUserStore();
  localStorage.clear();
  sessionStorage.clear();
  userStore.$reset();
  changeAuthenticationStatus(false);
  window.Smooch.logout();
};

const catImgUrls = {
  mediaUrls: [
    'https://cdn2.thecatapi.com/images/1be.jpg',
    'https://cdn2.thecatapi.com/images/7g4.jpg',
    'https://cdn2.thecatapi.com/images/9tc.jpg',
    'https://cdn2.thecatapi.com/images/a3u.jpg',
    'https://cdn2.thecatapi.com/images/alc.gif',
    'https://cdn2.thecatapi.com/images/bca.jpg',
    'https://cdn2.thecatapi.com/images/cgr.jpg',
    'https://cdn2.thecatapi.com/images/ddb.jpg',
    'https://cdn2.thecatapi.com/images/_np7TW9Iq.jpg',
    'https://cdn2.thecatapi.com/images/9K-Lvmafl.jpg',
  ],
};

/**
 * Returns a random image URL from the `catImgUrls.mediaUrls` array.
 *
 * @function
 * @returns {string} A randomly selected image URL.
 */
export const useGetRandomImageUrl = () => {
  const randomIndex = Math.floor(Math.random() * catImgUrls.mediaUrls.length);
  return catImgUrls.mediaUrls[randomIndex];
};

/**
 * Displays a warning toast notification with the specified error message and timeout.
 *
 * @param {string} error - The error message to display in the toast.
 * @param {number} [timeout=3500] - Optional. Duration in milliseconds before the toast disappears. Defaults to 3500ms.
 */
export const useShowWarningToast = (error, timeout) => {
  toast.warning(error, {
    position: 'bottom-center',
    timeout: timeout || 3500,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    hideProgressBar: true,
    closeButton: 'button',
    icon: true,
    rtl: false,
  });
};

/**
 * Displays a success toast notification with the given message and optional timeout.
 *
 * @param {string} message - The message to display in the toast notification.
 * @param {number} [timeout=2000] - The duration (in milliseconds) for which the toast is visible. Defaults to 2000ms if not provided.
 */
export const useShowSuccessToast = (message, timeout) => {
  toast.success(message, {
    position: 'bottom-center',
    toastClassName: 'toast-body',
    timeout: timeout || 2000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    hideProgressBar: true,
    closeButton: 'button',
    icon: true,
    rtl: false,
  });
};

/**
 * Generates a random alphanumeric string of a specified length.
 * @param {number} [length=25] - The desired length of the ID.
 * @returns {string} The generated random external ID.
 */
export const useGenerateExternalId = (length = 25) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

<template>
  <div class="ze-launcher" shape="circle">
    <button
      v-if="!loaded"
      type="button"
      class="ze-launcher__button"
      aria-label="Open messaging window"
      :aria-expanded="loaded ? 'true' : 'false'"
      @click="loadWidget">
      <span aria-hidden="true" class="ze-launcher__icon">
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <path
            d="M10,18 L6,22 L6,18 L10,18 Z M17,6 C19.7614237,6 22,8.23857625 22,11 C22,13.7614237 19.7614237,16 17,16 L17,16 L7,16 C4.23857625,16 2,13.7614237 2,11 C2,8.23857625 4.23857625,6 7,6 L7,6 Z"
            transform="translate(12.000000, 14.000000) scale(-1, 1) translate(-12.000000, -14.000000) " />
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useInitZDWidget } from '@/composables/useZendesk';
  import {
    useShowWarningToast,
    useShowSuccessToast,
  } from '@/composables/helpers';

  const loaded = ref(false);

  const loadWidget = () => {
    if (document.getElementById('ze-snippet')) {
      useShowWarningToast('Zendesk widget is already loaded', 1500);
      return;
    }
    useInitZDWidget('ze-snippet', useRuntimeConfig().public.messagingKey);
    // useShowSuccessToast('Loading Zendesk widget…', 1500);
    loaded.value = true;
    window.zE('messenger', 'open');
  };
</script>

<style scoped>
  .ze-launcher {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 999;
    display: inline-flex;
  }

  .ze-launcher__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: #355e34;
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    transition:
      transform 0.15s ease,
      background-color 0.15s ease;
  }

  .ze-launcher__button:hover,
  .ze-launcher__button:focus-visible {
    background-color: #16140c;
    transform: scale(1.05);
    outline: none;
  }

  .ze-launcher__button:active {
    transform: scale(0.95);
  }

  .ze-launcher__icon {
    display: inline-flex;
  }

  .ze-launcher__icon svg {
    fill: currentColor;
  }
</style>

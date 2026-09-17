<template>
  <div
    v-if="visible"
    :class="[
      'my-2 alert alert-dismissible fade show',
      isDark ? 'alert-light' : `alert-${variant}`,
    ]"
    role="alert">
    <strong v-if="title">{{ title }}</strong>
    <slot />
    <button
      type="button"
      class="btn-close"
      aria-label="Close"
      @click="dismiss"></button>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useDark } from '@vueuse/core';

  const isDark = useDark();

  defineProps({
    title: {
      type: String,
      default: '',
    },
    variant: {
      type: String,
      default: 'warning',
    },
  });

  const emit = defineEmits(['dismiss']);
  const visible = ref(true);

  const dismiss = () => {
    visible.value = false;
    emit('dismiss');
  };
</script>

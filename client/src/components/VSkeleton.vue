<template>
  <ul v-if="!$slots.default" v-bind="$attrs" class="list-group-item">
    <div v-if="loading" class="placeholder-glow">
      <span class="placeholder col-12 placeholder-sm rounded"></span>
    </div>
  </ul>
  <div v-else-if="loading" v-bind="$attrs" class="placeholder-glow">
    <slot />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

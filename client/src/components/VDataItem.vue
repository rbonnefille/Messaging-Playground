<template>
  <component
    :is="layout === 'detail' ? 'li' : 'ul'"
    class="list-group-item"
    :class="{ 'detail-data-item': layout === 'detail' }"
  >
    <div v-if="loading" class="placeholder-glow">
      <span class="placeholder col-12 placeholder-sm rounded"></span>
    </div>
    <template v-else-if="layout === 'detail'">
      <span class="detail-data-label">{{ label }}</span>
      <code :class="className">{{ value ?? "N/A" }}</code>
    </template>
    <template v-else>
      <template v-if="label"> {{ label }}: </template>
      <code :class="className">{{ value ?? "N/A" }}</code>
    </template>
  </component>
</template>

<script setup>
defineProps({
  label: {
    type: [String, Object, Number],
    default: "",
  },
  value: {
    type: [String, Object, Boolean, Number],
    default: "",
  },
  className: {
    type: [String, Object],
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  layout: {
    type: String,
    default: "inline",
  },
});
</script>

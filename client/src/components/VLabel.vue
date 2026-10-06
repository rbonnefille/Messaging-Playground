<template>
  <label :for="id" :class="className">{{ name }}</label>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: 'input',
  },
  className: {
    type: String,
    default: '',
  },
});
</script>

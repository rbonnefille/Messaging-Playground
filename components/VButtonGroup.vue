<template>
  <div class="col-auto" role="group" :aria-label="label">
    <template v-for="(button, key) in buttons" :key="key">
      <VButton
        v-if="button.isVisible ?? true"
        :class="button.className ?? className"
        :text="button.text"
        :type="button.type"
        @click="button.click" />
    </template>
  </div>
</template>

<script setup>
  import VButton from '@/components/VButton.vue';

  defineProps({
    label: { type: String, required: true },
    buttons: { type: Object, required: true },
    className: { type: String, default: '' },
  });
</script>

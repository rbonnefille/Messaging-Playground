<template>
  <div class="form-actions">
    <VButton
      text="Submit"
      type="submit"
      class="formBtn"
      :disabled="isFormInvalid" />
    <VButton
      v-if="!isFormInvalid"
      text="Reset"
      type="reset"
      class="formBtn formBtn--secondary" />
    <template v-if="!authenticated">
      <VButton
        v-if="isFormInvalid"
        text="Log Michael Scott"
        type="button"
        class="formBtn"
        @click="$emit('michael-scott')" />
      <VButton
        text="JWT to clipboard"
        type="button"
        class="formBtn"
        @click="$emit('request-jwt')" />
      <slot name="additional-actions"></slot>
    </template>
  </div>
</template>

<script setup>
  import VButton from '@/components/VButton.vue';

  defineProps({
    isFormInvalid: { type: Boolean, required: true },
    authenticated: { type: Boolean, required: true },
  });

  defineEmits(['michael-scott', 'request-jwt']);
</script>

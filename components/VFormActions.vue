<template>
  <VButton
    text="Submit"
    type="submit"
    class="formBtn"
    :disabled="isFormInvalid"
  />
  <VButton text="Reset" type="reset" class="formBtn" />
  <template v-if="!authenticated">
    <VButton
      text="Log Michael Scott"
      type="button"
      class="formBtn"
      @click="$emit('michael-scott')"
    />
    <VButton
      text="JWT to clipboard"
      type="button"
      class="formBtn"
      @click="$emit('request-jwt')"
    />
  </template>
</template>

<script setup>
import VButton from "@/components/VButton.vue";

defineProps({
  isFormInvalid: { type: Boolean, required: true },
  authenticated: { type: Boolean, required: true },
});

defineEmits(["michael-scott", "request-jwt"]);
</script>

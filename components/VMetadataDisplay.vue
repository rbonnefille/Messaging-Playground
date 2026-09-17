<template>
  <div>
    <VAlert title="Metadata were set">
      <hr>
      <code>{{ metadataCode }}</code>
    </VAlert>
  </div>
</template>

<script setup>
import VAlert from '@/components/VAlert.vue';
defineProps({
  metadataCode: { type: String, required: true },
});
</script>

<template>
  <div>
    <VAlert
      title="Metadata applied to the conversation"
      @dismiss="emit('dismiss')">
      <details
        class="metadata-code"
        :open="isMetadataCodeOpen"
        @toggle="isMetadataCodeOpen = $event.currentTarget.open">
        <summary>
          {{ isMetadataCodeOpen ? 'Hide applied code' : 'View applied code' }}
        </summary>
        <pre><code>{{ metadataCode }}</code></pre>
      </details>
    </VAlert>
  </div>
</template>

<script setup>
  import VAlert from '@/components/VAlert.vue';
  import { ref } from 'vue';

  const emit = defineEmits(['dismiss']);
  const isMetadataCodeOpen = ref(true);
  defineProps({
    metadataCode: { type: String, required: true },
  });
</script>

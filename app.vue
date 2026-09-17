<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Page <title> is driven by `definePageMeta({ title })` on each page,
// mirroring the SPA's old `router.beforeEach` meta.title logic.
const route = useRoute();
const title = computed(() => {
  const t = route.meta.title as string | undefined;
  return t ? `${t} · SunCo Dashboard` : 'SunCo Dashboard';
});
useHead({ title });
</script>

<template>
  <TheNavbar
    :title="
      route.params.id
        ? `${route.meta.title} ${route.params.id}`
        : route.meta.title
    " />
  <RouterView />
  <VSidebar :offcanvasPlacement="'start'" ref="sidebarLeft">
    <template #title>App Routes</template>
    <template #default>
      <SuncoRoutes @close="handleClose" />
    </template>
  </VSidebar>
  <TheFooter />
</template>

<script setup>
  import TheNavbar from '@/components/TheNavbar.vue';
  import SuncoRoutes from '@/components/SuncoRoutes.vue';
  import VSidebar from '@/components/VSidebar.vue';
  import TheFooter from '@/components/TheFooter.vue';
  import { useRoute } from 'vue-router';
  import { sidebarLeft } from '@/composables/useWidgetButtons';

  const route = useRoute();

  const handleClose = () => {
    sidebarLeft.value?.closeSidebar();
  };

  defineProps({
    title: {
      type: String,
      required: false,
      default: 'Messaging Dashboard',
    },
  });
</script>

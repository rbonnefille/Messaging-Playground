<template>
  <nav
    class="navbar app-navbar shadow-sm px-3 py-2 pb-3 pb-sm-2 text-white"
    data-bs-theme="dark"
    aria-label="Main navigation">
    <div class="container-fluid px-0 d-flex flex-wrap align-items-center">
      <div class="app-navbar-controls d-flex align-items-center gap-2">
        <button
          type="button"
          class="navbar-toggler app-navbar-menu border-0 px-2"
          aria-label="Open menu"
          @click="openLeftSidebar">
          <Bars3Icon class="app-navbar-icon" aria-hidden="true" />
        </button>
        <RouterLink
          class="btn btn-outline-light app-navbar-home border-0 m-0 d-flex align-items-center"
          to="/">
          Home
        </RouterLink>
      </div>
      <h2
        class="app-navbar-title flex-grow-1 text-start text-sm-center mb-0 mt-2 mt-sm-0">
        {{
          userStore.authenticated
            ? `Welcome back ${userStore.external_id}`
            : title
        }}
      </h2>
      <div class="app-navbar-spacer d-none d-sm-block" aria-hidden="true"></div>
    </div>
  </nav>
</template>

<script setup>
  import { useUserStore } from '@/stores/userStore';
  import { storeToRefs } from 'pinia';
  import { sidebarLeft } from '@/composables/useWidgetButtons';
  import { Bars3Icon } from '@heroicons/vue/24/outline';

  const userStore = useUserStore();
  const { changeWidgetOpenedStatus } = userStore;
  const { widgetOpened } = storeToRefs(userStore);

  const openLeftSidebar = () => {
    if (widgetOpened.value) {
      changeWidgetOpenedStatus(false);
      window.zE('messenger', 'close');
    }
    sidebarLeft.value?.openSidebar();
  };
  defineProps({
    title: {
      type: String,
      required: false,
      default: 'Messaging Dashboard',
    },
  });
</script>

<style scoped>
  .app-navbar {
    min-height: 64px;
    background: #11110d;
  }

  .app-navbar-controls,
  .app-navbar-spacer {
    width: 128px;
    flex-shrink: 0;
  }

  .app-navbar-menu,
  .app-navbar-home {
    min-width: 44px;
    min-height: 44px;
  }

  .app-navbar-icon {
    width: 24px;
    height: 24px;
  }

  .app-navbar-title {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 1.1rem;
    font-weight: 500;
    line-height: 1.4;
  }

  @media (max-width: 575.98px) {
    .app-navbar-title {
      flex-basis: 100%;
    }
  }
</style>

<template>
  <main class="user-detail-page container-fluid">
    <VError v-if="errorMessage" :error-message="errorMessage" />

    <VSkeleton
      v-else-if="pageLoading"
      :loading="pageLoading"
      class="user-loading"
      role="status"
    >
      <span class="visually-hidden">Loading user details…</span>
      <div aria-hidden="true">
        <div class="d-flex align-items-center gap-4 mb-5">
          <span class="placeholder rounded-circle user-loading-avatar"></span>
          <div class="flex-grow-1">
            <span class="placeholder col-4 placeholder-lg d-block mb-3"></span>
            <span class="placeholder col-5 d-block mb-2"></span>
            <span class="placeholder col-3 d-block"></span>
          </div>
        </div>
        <div class="row g-4">
          <div v-for="column in 2" :key="column" class="col-12 col-lg-6">
            <div v-for="card in 2" :key="card" class="card mb-4">
              <div class="card-header py-3">
                <span class="placeholder col-4"></span>
              </div>
              <div class="card-body">
                <span
                  v-for="line in 4"
                  :key="line"
                  class="placeholder d-block mb-3"
                  :class="line % 2 ? 'col-10' : 'col-8'"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VSkeleton>

    <template v-else-if="suncoUser">
      <header class="user-summary d-flex align-items-start mb-4">
        <div class="user-avatar flex-shrink-0" aria-hidden="true">
          {{ initials }}
        </div>
        <div class="user-summary-content">
          <h1 class="h2 fw-semibold mb-2">{{ displayName }}</h1>
          <div class="user-identifiers d-grid gap-1 text-secondary">
            <div>
              External ID: <code>{{ suncoUser.externalId ?? "N/A" }}</code>
            </div>
            <div>
              User ID: <code>{{ suncoUser.id ?? "N/A" }}</code>
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <span
              class="badge border"
              :class="
                suncoUser.authenticated
                  ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                  : 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle'
              "
            >
              {{
                suncoUser.authenticated ? "Authenticated" : "Not authenticated"
              }}
            </span>
            <span
              class="badge border"
              :class="
                suncoUser.toBeRetained
                  ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                  : 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle'
              "
            >
              {{ suncoUser.toBeRetained ? "Retained" : "Not retained" }}
            </span>
          </div>
        </div>
      </header>

      <div class="row g-4 align-items-start">
        <div class="col-12 col-lg-7 d-grid gap-4">
          <section class="card detail-card" aria-labelledby="profile-heading">
            <h2
              id="profile-heading"
              class="card-header h5 mb-0 d-flex align-items-center gap-2"
            >
              <UserIcon class="section-icon" aria-hidden="true" />
              Profile
            </h2>
            <ul class="list-group list-group-flush">
              <VDataItem
                v-for="row in profileRows"
                :key="row.key"
                layout="detail"
                :label="row.label"
                :value="row.value"
              />
            </ul>
            <div v-if="!profileRows.length" class="card-body text-secondary">
              No profile details are available.
            </div>
          </section>

          <section
            class="card detail-card"
            aria-labelledby="identities-heading"
          >
            <h2
              id="identities-heading"
              class="card-header h5 mb-0 d-flex align-items-center gap-2"
            >
              <KeyIcon class="section-icon" aria-hidden="true" />
              Identities
              <span
                v-if="identities.length > 1"
                class="badge text-bg-light border ms-auto"
                >{{ identities.length }}</span
              >
            </h2>
            <div v-if="identities.length" class="card-body p-0">
              <div
                v-for="(identity, index) in identities"
                :key="identity.id ?? index"
                :class="{ 'border-top': index > 0 }"
              >
                <div
                  v-if="identities.length > 1"
                  class="identity-label small fw-semibold text-secondary px-3 pt-3 pb-2"
                >
                  Identity {{ index + 1 }}
                </div>
                <ul class="list-group list-group-flush">
                  <VDataItem
                    v-for="row in toRows(identity)"
                    :key="row.key"
                    layout="detail"
                    :label="row.label"
                    :value="row.value"
                  />
                </ul>
              </div>
            </div>
            <div v-else class="card-body text-secondary">
              No identities are available.
            </div>
          </section>
        </div>

        <div class="col-12 col-lg-5 d-grid gap-4">
          <section class="card detail-card" aria-labelledby="clients-heading">
            <h2
              id="clients-heading"
              class="card-header h5 mb-0 d-flex align-items-center gap-2"
            >
              <CubeIcon class="section-icon" aria-hidden="true" />
              {{
                clients.length === 1
                  ? `${String(clients[0].type || "Messaging").toUpperCase()} client`
                  : "Clients"
              }}
              <span
                v-if="clients.length > 1"
                class="badge text-bg-light border ms-auto"
                >{{ clients.length }}</span
              >
            </h2>
            <div v-if="clients.length" class="card-body p-0">
              <div
                v-for="(client, index) in clients"
                :key="client.id ?? index"
                :class="{ 'border-top': index > 0 }"
              >
                <div
                  v-if="clients.length > 1"
                  class="client-label small fw-semibold text-secondary px-3 pt-3 pb-2"
                >
                  {{
                    client.type
                      ? `${String(client.type).toUpperCase()} client`
                      : `Client ${index + 1}`
                  }}
                </div>
                <ul class="list-group list-group-flush">
                  <VDataItem
                    v-for="row in toRows(client)"
                    :key="row.key"
                    layout="detail"
                    :label="row.label"
                    :value="row.value"
                  />
                </ul>
              </div>
            </div>
            <div v-else class="card-body text-secondary">
              No clients are available.
            </div>
          </section>

          <section class="card detail-card" aria-labelledby="metadata-heading">
            <h2
              id="metadata-heading"
              class="card-header h5 mb-0 d-flex align-items-center gap-2"
            >
              <CircleStackIcon class="section-icon" aria-hidden="true" />
              Metadata
            </h2>
            <ul v-if="metadataRows.length" class="list-group list-group-flush">
              <VDataItem
                v-for="row in metadataRows"
                :key="row.key"
                layout="detail"
                :label="row.label"
                :value="row.value"
              />
            </ul>
            <div v-else class="card-body text-secondary">
              No metadata is available.
            </div>
          </section>
        </div>
      </div>

      <div
        class="accordion user-collections mt-4"
        aria-label="Related user data"
      >
        <section class="accordion-item">
          <h2 id="devices-heading" class="accordion-header">
            <button
              class="accordion-button collection-toggle"
              :class="{ collapsed: !devicesOpen }"
              type="button"
              :aria-expanded="devicesOpen"
              aria-controls="devices-panel"
              @click="devicesOpen = !devicesOpen"
            >
              <DevicePhoneMobileIcon
                class="section-icon me-3"
                aria-hidden="true"
              />
              <span class="flex-grow-1">
                <span class="d-block fw-semibold"
                  >Devices ({{ devices.length }})</span
                >
                <span
                  class="collection-subtitle d-block text-secondary fw-normal"
                  >View all devices linked to this user</span
                >
              </span>
            </button>
          </h2>
          <div
            id="devices-panel"
            class="accordion-collapse collapse"
            :class="{ show: devicesOpen }"
            role="region"
            aria-labelledby="devices-heading"
          >
            <div class="accordion-body">
              <div v-if="devices.length" class="row g-3">
                <div
                  v-for="(device, index) in devices"
                  :key="device.id ?? index"
                  class="col-12 col-xl-6"
                >
                  <div class="card h-100 detail-card">
                    <h3 class="card-header h6 mb-0">Device {{ index + 1 }}</h3>
                    <ul class="list-group list-group-flush">
                      <VDataItem
                        v-for="row in toRows(device)"
                        :key="row.key"
                        layout="detail"
                        :label="row.label"
                        :value="row.value"
                      />
                    </ul>
                  </div>
                </div>
              </div>
              <p v-else class="text-secondary mb-0">
                No devices are linked to this user.
              </p>
            </div>
          </div>
        </section>

        <section class="accordion-item">
          <h2 id="conversations-heading" class="accordion-header">
            <button
              class="accordion-button collection-toggle"
              :class="{ collapsed: !conversationsOpen }"
              type="button"
              :aria-expanded="conversationsOpen"
              aria-controls="conversations-panel"
              @click="conversationsOpen = !conversationsOpen"
            >
              <ChatBubbleLeftRightIcon
                class="section-icon me-3"
                aria-hidden="true"
              />
              <span class="flex-grow-1">
                <span class="d-block fw-semibold"
                  >Conversations ({{ conversationsByTime.length }})</span
                >
                <span
                  class="collection-subtitle d-block text-secondary fw-normal"
                  >View all conversations for this user</span
                >
                <span
                  v-if="conversationsByTime.length > 1"
                  class="collection-subtitle d-block text-secondary fw-normal"
                  >Includes the action to delete conversations not associated
                  with a ticket.</span
                >
              </span>
            </button>
          </h2>
          <div
            id="conversations-panel"
            class="accordion-collapse collapse"
            :class="{ show: conversationsOpen }"
            role="region"
            aria-labelledby="conversations-heading"
          >
            <div class="accordion-body">
              <div v-if="conversationsByTime.length > 1" class="mb-3">
                <VButton
                  text="Delete all conversations not associated with a ticket"
                  class="btn-outline-danger"
                  :disabled="isLoading"
                  @click="useDeleteConversations(route.params.id)"
                />
              </div>
              <div v-if="conversationsByTime.length" class="row g-3">
                <div
                  v-for="(conversation, index) in conversationsByTime"
                  :key="conversation.id ?? index"
                  class="col-12 col-xl-6"
                >
                  <div class="card h-100 detail-card">
                    <h3 class="card-header h6 mb-0">
                      Conversation {{ index + 1 }}
                    </h3>
                    <ul class="list-group list-group-flush">
                      <VDataItem
                        v-for="row in toRows(conversation)"
                        :key="row.key"
                        layout="detail"
                        :label="row.label"
                        :value="row.value"
                      />
                    </ul>
                  </div>
                </div>
              </div>
              <p v-else class="text-secondary mb-0">
                No conversations are available.
              </p>
            </div>
          </div>
        </section>
      </div>
    </template>

    <div v-else class="alert alert-secondary" role="status">
      No user details are available.
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";
import VButton from "@/components/VButton.vue";
import VDataItem from "@/components/VDataItem.vue";
import VError from "@/components/VError.vue";
import VSkeleton from "@/components/VSkeleton.vue";
import {
  errorMessage,
  isLoading,
  suncoUser,
  suncoUserClients,
  suncoUserConversations,
  suncoUserDevices,
  useDeleteConversations,
  useFetchSunCoUser,
} from "@/composables/useSunco.js";

const route = useRoute();
const pageLoading = ref(true);
const devicesOpen = ref(false);
const conversationsOpen = ref(false);

const clients = computed(() =>
  Array.isArray(suncoUserClients.value) ? suncoUserClients.value : [],
);
const devices = computed(() =>
  Array.isArray(suncoUserDevices.value) ? suncoUserDevices.value : [],
);
const identities = computed(() =>
  Array.isArray(suncoUser.value?.identities) ? suncoUser.value.identities : [],
);
const conversationsByTime = computed(() => {
  const conversations = Array.isArray(suncoUserConversations.value)
    ? suncoUserConversations.value
    : [];
  return [...conversations].sort(
    (a, b) => new Date(b.lastUpdatedAt || 0) - new Date(a.lastUpdatedAt || 0),
  );
});

const displayName = computed(() => {
  const profile = suncoUser.value?.profile || {};
  return (
    [profile.givenName, profile.surname].filter(Boolean).join(" ") ||
    suncoUser.value?.externalId ||
    suncoUser.value?.id ||
    "SunCo user"
  );
});
const initials = computed(() => {
  const parts = displayName.value.trim().split(/\s+/);
  return (
    parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : parts[0].slice(0, 2)
  ).toUpperCase();
});

function formatLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b(id|sdk|guid|os)\b/gi, (match) => match.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function toRows(object, prefix = "") {
  if (!object || typeof object !== "object" || Array.isArray(object)) return [];
  return Object.entries(object).flatMap(([key, value]) => {
    const label = prefix ? `${prefix} · ${formatLabel(key)}` : formatLabel(key);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = toRows(value, label);
      return nested.length ? nested : [{ key: label, label, value: "{}" }];
    }
    return [{ key: label, label, value: formatValue(value) }];
  });
}

const profileRows = computed(() => {
  const user = suncoUser.value || {};
  const knownFields = {
    signedUpAt: user.signedUpAt,
    toBeRetained: user.toBeRetained,
    authenticated: user.authenticated,
    zendeskId: user.zendeskId,
  };
  const remainingFields = Object.fromEntries(
    Object.entries(user).filter(
      ([key]) =>
        ![
          "id",
          "externalId",
          "profile",
          "metadata",
          "identities",
          ...Object.keys(knownFields),
        ].includes(key),
    ),
  );
  return [
    ...toRows(user.profile),
    ...toRows(knownFields),
    ...toRows(remainingFields),
  ];
});
const metadataRows = computed(() => toRows(suncoUser.value?.metadata));

watch(
  () => route.params.id,
  async (id) => {
    pageLoading.value = true;
    devicesOpen.value = false;
    conversationsOpen.value = false;
    errorMessage.value = "";
    suncoUser.value = null;
    suncoUserClients.value = [];
    suncoUserConversations.value = [];
    suncoUserDevices.value = [];
    try {
      if (id) await useFetchSunCoUser(id);
    } finally {
      pageLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
:global(body:has(.user-detail-page) footer.fixed-bottom) {
  display: none;
}

.user-detail-page {
  max-width: 1600px;
  padding: 15px clamp(20px, 3.4vw, 50px) 64px;
}

.user-summary {
  flex-wrap: wrap;
  gap: 1.5rem;
  min-height: 100px;
  padding-inline: 20px;
}

.user-summary-content {
  min-width: 0;
}

.user-summary .badge {
  padding: 0.45em 0.75em;
  font-size: 0.875rem;
}

.user-avatar,
.user-loading-avatar {
  width: 84px;
  height: 84px;
}

.user-avatar {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--bs-secondary-bg);
  color: var(--bs-secondary-color);
  font-size: 1.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.user-identifiers code {
  overflow-wrap: anywhere;
}

.detail-card,
.user-collections .accordion-item {
  border-color: var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;
}

.detail-card {
  margin-top: 0;
}

.detail-card .card-header {
  background: var(--bs-secondary-bg);
  padding: 0.65rem 1rem;
}

.section-icon {
  width: 1.3rem;
  height: 1.3rem;
  flex: 0 0 auto;
}

.detail-card :deep(.detail-data-item) {
  display: grid;
  grid-template-columns: minmax(115px, 155px) minmax(0, 1fr);
  gap: 1rem;
  align-items: baseline;
  padding: 0.45rem 1rem;
}

.detail-card :deep(.detail-data-label) {
  color: var(--bs-secondary-color);
}

.detail-card :deep(code) {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.user-collections .accordion-item + .accordion-item {
  margin-top: 1rem;
  border-top: 1px solid var(--bs-border-color);
}

.collection-toggle {
  min-height: 92px;
}

.collection-subtitle {
  margin-top: 0.2rem;
  font-size: 0.875rem;
}

@media (min-width: 992px) {
  .user-detail-page > .row > .col-lg-7 {
    width: 55.5%;
  }

  .user-detail-page > .row > .col-lg-5 {
    width: 44.5%;
  }
}

@media (max-width: 575.98px) {
  .user-detail-page {
    padding-top: 24px;
  }

  .user-summary {
    flex-wrap: nowrap;
    gap: 1rem;
    padding-inline: 0;
  }

  .user-avatar {
    width: 68px;
    height: 68px;
    font-size: 1.4rem;
  }

  .detail-card :deep(.detail-data-item) {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.2rem;
  }
}
</style>

<route lang="json">
{
  "name": "SunCo User",
  "meta": {
    "title": "SunCo User"
  }
}
</route>

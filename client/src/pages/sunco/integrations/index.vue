<template>
  <main class="integrations-page">
    <div class="integrations-shell">
      <aside class="integration-directory" aria-label="Messaging integrations">
        <div class="directory-inner">
          <div class="directory-heading">
            <h1 class="mb-0">Integrations</h1>
          </div>

          <label class="integration-search">
            <MagnifyingGlassIcon aria-hidden="true" />
            <input v-model.trim="searchQuery" type="search" placeholder="Search integrations..."
              aria-label="Search integrations" />
          </label>

          <VSkeleton v-if="pageLoading" :loading="pageLoading" class="directory-list" aria-hidden="true">
            <div v-for="n in 6" :key="n" class="directory-item directory-skeleton">
              <span class="directory-icon placeholder rounded-circle"></span>
              <span class="directory-item-copy flex-grow-1">
                <span class="placeholder col-9 rounded"></span>
                <span class="placeholder placeholder-sm col-6 rounded"></span>
              </span>
            </div>
          </VSkeleton>
          <p v-else-if="pageError" class="directory-message">
            Integrations are unavailable.
          </p>
          <p v-else-if="!visibleIntegrations.length" class="directory-message">
            No integrations match your search.
          </p>
          <div v-else class="directory-list">
            <button v-for="integration in visibleIntegrations" :key="integration.id" type="button"
              class="directory-item" :class="{ 'is-selected': integration.id === selectedId }"
              :aria-current="integration.id === selectedId ? 'true' : undefined" @click="selectedId = integration.id">
              <img class="directory-icon" :src="iconFor(integration)" :alt="channelName(integration.type)"
                @error="useFallbackIcon" />
              <span class="directory-item-copy">
                <strong>{{ integrationName(integration) }}</strong>
                <span class="directory-status">
                  <span class="status-dot" :class="statusClass(integration.status)" aria-hidden="true"></span>
                  {{ statusLabel(integration.status) }}
                </span>
              </span>
              <ChevronRightIcon class="directory-chevron" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <section class="integration-workspace" aria-label="Integration details">
        <VSkeleton v-if="pageLoading" :loading="pageLoading" class="integration-skeleton" role="status">
          <span class="visually-hidden">Loading integration details…</span>
          <div aria-hidden="true">
            <header class="integration-intro">
              <div class="integration-title-row">
                <span class="integration-skeleton-icon placeholder rounded-circle"></span>
                <h2 class="mb-0">
                  <span class="integration-skeleton-title placeholder rounded"></span>
                </h2>
              </div>
              <span class="integration-skeleton-status placeholder rounded-pill"></span>
              <p>
                <span class="placeholder col-9 rounded"></span>
                <span class="placeholder col-6 rounded"></span>
              </p>
            </header>

            <div class="integration-controls">
              <div class="section-copy">
                <h3 class="mb-1">
                  <span class="integration-skeleton-section-title placeholder rounded"></span>
                </h3>
                <p>
                  <span class="integration-skeleton-section-copy placeholder rounded"></span>
                </p>
              </div>
              <div class="controls-list">
                <div v-for="n in 3" :key="n" class="control-row">
                  <span class="control-copy">
                    <strong>
                      <span class="integration-skeleton-label placeholder rounded"></span>
                    </strong>
                    <small>
                      <span class="integration-skeleton-help placeholder rounded"></span>
                    </small>
                  </span>
                  <span class="placeholder rounded" :class="n === 3
                    ? 'integration-skeleton-select'
                    : 'integration-skeleton-toggle'
                    "></span>
                </div>
              </div>
            </div>

            <div class="integration-technical">
              <span class="integration-skeleton-technical placeholder rounded"></span>
            </div>
          </div>
        </VSkeleton>
        <div v-else-if="pageError" class="workspace-state" role="alert">
          <h2 class="text-body">Could not load integrations</h2>
          <p>{{ pageError }}</p>
          <button type="button" class="retry-button" @click="loadIntegrations">
            Try again
          </button>
        </div>
        <div v-else-if="!selectedIntegration" class="workspace-state">
          <h2 class="text-body">No integration selected</h2>
          <p>Select an integration from the list to explore its settings.</p>
        </div>
        <template v-else>
          <header class="integration-intro">
            <div class="integration-title-row">
              <img :src="iconFor(selectedIntegration)" alt="" @error="useFallbackIcon" />
              <h2 class="mb-0">
                {{ integrationName(selectedIntegration) }}
              </h2>
            </div>
            <span class="integration-status-pill" :class="statusClass(selectedIntegration.status)">
              <span class="status-dot" aria-hidden="true"></span>
              {{ statusLabel(selectedIntegration.status) }}
            </span>
          </header>

          <section class="integration-controls" aria-labelledby="demo-controls-title">
            <div class="section-copy">
              <h3 id="demo-controls-title" class="mb-1">
                Integration Settings controls
              </h3>
              <p>Adjust these settings and see the behavior in the channel.</p>
            </div>

            <div v-if="hasDemoControls" class="controls-list">
              <div v-if="
                selectedIntegration.canUserCreateMoreConversations !==
                undefined
              " class="control-row">
                <label class="control-copy" for="multiple-conversations-switch">
                  <strong>Multiple conversations</strong>
                  <small id="multiple-conversations-help">Allow end users to create more than one
                    conversation.</small>
                </label>
                <div class="form-check form-switch mb-0">
                  <input id="multiple-conversations-switch" class="form-check-input" type="checkbox" role="switch"
                    aria-label="Multiple conversations" aria-describedby="multiple-conversations-help" :checked="selectedIntegration.canUserCreateMoreConversations
                      " :disabled="isSaving" @change="updateConversationSetting('create', $event)" />
                  <label class="form-check-label" for="multiple-conversations-switch">
                    {{
                      selectedIntegration.canUserCreateMoreConversations
                        ? 'On'
                        : 'Off'
                    }}
                  </label>
                </div>
              </div>

              <div v-if="
                selectedIntegration.canUserSeeConversationList !== undefined
              " class="control-row">
                <label class="control-copy" for="conversation-list-switch">
                  <strong>Conversation list</strong>
                  <small id="conversation-list-help">Let end users see their conversation list in the
                    widget.</small>
                </label>
                <div class="form-check form-switch mb-0">
                  <input id="conversation-list-switch" class="form-check-input" type="checkbox" role="switch"
                    aria-label="Conversation list" aria-describedby="conversation-list-help"
                    :checked="selectedIntegration.canUserSeeConversationList" :disabled="isSaving"
                    @change="updateConversationSetting('list', $event)" />
                  <label class="form-check-label" for="conversation-list-switch">
                    {{
                      selectedIntegration.canUserSeeConversationList
                        ? 'On'
                        : 'Off'
                    }}
                  </label>
                </div>
              </div>

              <div v-if="selectedIntegration.defaultResponder" class="control-row">
                <label class="control-copy" for="integration-responder">
                  <strong>Default responder</strong>
                  <small>Choose which responder will handle new
                    conversations.</small>
                </label>
                <div class="responder-control">
                  <select id="integration-responder" class="form-select"
                    :value="selectedIntegration.defaultResponder.id" :disabled="isSaving || !responders.length"
                    @change="updateResponder">
                    <option v-if="
                      !responders.some(
                        item =>
                          item.id === selectedIntegration.defaultResponder.id,
                      )
                    " :value="selectedIntegration.defaultResponder.id">
                      Current responder
                    </option>
                    <option v-for="responder in responders" :key="responder.id" :value="responder.id">
                      {{ responder.name }}
                    </option>
                  </select>
                  <button v-if="
                    selectedIntegration.defaultResponder.inherited === false
                  " type="button" class="inherit-button" :disabled="isSaving" @click="restoreInheritedResponder">
                    Use inherited responder
                  </button>
                  <small v-if="responderWarning" class="responder-warning">
                    {{ responderWarning }}
                  </small>
                </div>
              </div>
            </div>
            <p v-else class="no-controls">
              This integration has no editable demo controls on this page.
            </p>

            <div v-if="isSaving || actionError || actionMessage"
              class="save-feedback position-fixed bottom-0 end-0 m-3 alert d-flex align-items-center gap-2 shadow"
              :class="isSaving
                ? 'alert-primary'
                : actionError
                  ? 'alert-danger'
                  : 'alert-success'
                " :role="actionError && !isSaving ? 'alert' : 'status'">
              <span v-if="isSaving" class="spinner-border spinner-border-sm flex-shrink-0" aria-hidden="true"></span>
              <ExclamationCircleIcon v-else-if="actionError" class="save-feedback-icon flex-shrink-0"
                aria-hidden="true" />
              <CheckCircleIcon v-else class="save-feedback-icon flex-shrink-0" aria-hidden="true" />
              <span>
                <strong class="d-block">
                  {{
                    isSaving
                      ? 'Saving changes…'
                      : actionError
                        ? 'Save failed'
                        : actionMessage
                  }}
                </strong>
                <span v-if="actionError && !isSaving" class="d-block">
                  {{ actionError }}
                </span>
              </span>
              <button v-if="actionError && !isSaving" type="button" class="btn-close ms-auto"
                aria-label="Dismiss save error" @click="actionError = ''"></button>
            </div>
          </section>

          <details :key="selectedIntegration.id" class="integration-technical">
            <summary>
              <ChevronRightIcon aria-hidden="true" />
              <span>
                <strong>Technical details</strong>
                <small>Integration IDs, inheritance, and other configuration
                  information.</small>
              </span>
            </summary>
            <dl>
              <div v-for="field in technicalFields" :key="field.label">
                <dt>{{ field.label }}</dt>
                <dd>{{ formatValue(field.value) }}</dd>
              </div>
            </dl>
          </details>
        </template>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';
import { integrationIcons } from '@/utils/integrationIcons.js';
import {
  fetchIntegrations,
  fetchSwitchboardIntegrations,
  updateIntegration,
} from '@/services/suncoService.js';
import VSkeleton from '@/components/VSkeleton.vue';

const order = [
  'web',
  'ios',
  'android',
  'whatsapp',
  'instagram',
  'messenger',
  'line',
  'twilio',
  'telegram',
  'slackconnect',
  'custom',
];

const channelLabels = {
  web: 'Web messaging',
  ios: 'iOS',
  android: 'Android',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  messenger: 'Facebook Messenger',
  twilio: 'Twilio SMS',
  slackconnect: 'Slack Connect',
  custom: 'Custom webhook',
};

const integrations = ref([]);
const responders = ref([]);
const selectedId = ref(null);
const searchQuery = ref('');
const pageLoading = ref(true);
const pageError = ref('');
const responderWarning = ref('');
const isSaving = ref(false);
const actionMessage = ref('');
const actionError = ref('');

const featuredIntegrations = computed(() => {
  const all = integrations.value;
  return [
    all.find(
      item => item.type === 'web' && !/widget/i.test(item.displayName || ''),
    ),
    all.find(
      item => item.type === 'web' && /widget/i.test(item.displayName || ''),
    ),
    all.find(item => item.type === 'whatsapp'),
    all.find(item => item.type === 'instagram'),
    all.find(item => item.type === 'twilio'),
    all.find(item => item.type === 'ios'),
  ].filter(Boolean);
});

const sortedIntegrations = computed(() => {
  const featuredIds = featuredIntegrations.value.map(item => item.id);
  const remaining = integrations.value.filter(
    item => !featuredIds.includes(item.id),
  );
  remaining.sort((a, b) => {
    const aIndex = order.indexOf(a.type);
    const bIndex = order.indexOf(b.type);
    return (
      (aIndex < 0 ? order.length : aIndex) -
      (bIndex < 0 ? order.length : bIndex)
    );
  });
  return [...featuredIntegrations.value, ...remaining];
});

const visibleIntegrations = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return sortedIntegrations.value.filter(integration =>
    [
      integrationName(integration),
      channelName(integration.type),
      integration.status,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
});

const selectedIntegration = computed(
  () => integrations.value.find(item => item.id === selectedId.value) || null,
);

const hasDemoControls = computed(() => {
  const integration = selectedIntegration.value;
  return Boolean(
    integration &&
    (integration.canUserCreateMoreConversations !== undefined ||
      integration.canUserSeeConversationList !== undefined ||
      integration.defaultResponder),
  );
});

const technicalFields = computed(() => {
  const integration = selectedIntegration.value;
  if (!integration) return [];

  const fields = [
    { label: 'Integration ID', value: integration.id },
    { label: 'Type', value: integration.type },
    { label: 'Status', value: integration.status },
    { label: 'Brand ID', value: integration.brandId },
    { label: 'AI disclaimer', value: integration.showAIDisclaimer },
  ];

  if (integration.defaultResponder) {
    const responder = integration.defaultResponder;
    fields.push(
      { label: 'Responder ID', value: responder.id },
      { label: 'Responder integration ID', value: responder.integrationId },
      { label: 'Responder type', value: responder.integrationType },
      {
        label: 'Deliver standby events',
        value: responder.deliverStandbyEvents,
      },
      {
        label: 'Next switchboard integration ID',
        value: responder.nextSwitchboardIntegrationId,
      },
      {
        label: 'Message history count',
        value: responder.messageHistoryCount,
      },
      { label: 'Inherited responder', value: responder.inherited },
    );
  }

  if (integration.type === 'whatsapp') {
    fields.push(
      { label: 'Account ID', value: integration.accountId },
      { label: 'Business manager ID', value: integration.businessManagerId },
      { label: 'App ID', value: integration.appId },
      { label: 'Phone number', value: integration.phoneNumber },
      { label: 'Phone number ID', value: integration.phoneNumberId },
    );
  }

  if (integration.type === 'custom') {
    const webhook = integration.webhooks?.[0];
    fields.push(
      { label: 'Webhook target', value: webhook?.target },
      { label: 'Webhook triggers', value: webhook?.triggers },
      { label: 'Include full source', value: webhook?.includeFullSource },
      { label: 'Include full user', value: webhook?.includeFullUser },
    );
  }

  if (integration.type === 'twilio') {
    fields.push(
      { label: 'Name', value: integration.name },
      { label: 'Phone number', value: integration.phoneNumber },
      { label: 'Account SID', value: integration.accountSid },
      { label: 'Phone number SID', value: integration.phoneNumberSid },
    );
  }

  return fields.filter(
    field => field.value !== undefined && field.value !== null,
  );
});

function channelName(type) {
  return channelLabels[type] || type || 'Messaging';
}

function integrationName(integration) {
  const name =
    integration.displayName ||
    integration.name ||
    channelName(integration.type);
  return integration.type === 'web' && !/web|widget/i.test(name)
    ? name + ' Web'
    : name;
}

function iconFor(integration) {
  return integrationIcons[integration.type] || integrationIcons.default;
}

function useFallbackIcon(event) {
  if (event.target.src !== integrationIcons.default) {
    event.target.src = integrationIcons.default;
  }
}

function statusLabel(status) {
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : 'Unknown';
}

function statusClass(status) {
  return status === 'active'
    ? 'is-active'
    : status === 'inactive'
      ? 'is-inactive'
      : 'is-warning';
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

async function loadIntegrations() {
  pageLoading.value = true;
  pageError.value = '';
  responderWarning.value = '';
  const [integrationResult, responderResult] = await Promise.allSettled([
    fetchIntegrations(),
    fetchSwitchboardIntegrations(),
  ]);

  if (integrationResult.status === 'fulfilled') {
    integrations.value = integrationResult.value.integrations || [];
    if (!integrations.value.some(item => item.id === selectedId.value)) {
      selectedId.value =
        integrations.value.find(
          item => item.type === 'web' && item.displayName === 'Acme Corp',
        )?.id ||
        integrations.value.find(item => item.type === 'web')?.id ||
        integrations.value[0]?.id ||
        null;
    }
  } else {
    pageError.value =
      integrationResult.reason?.message || 'Please try again.';
  }

  if (responderResult.status === 'fulfilled') {
    responders.value = responderResult.value.switchboardIntegrations || [];
  } else {
    responders.value = [];
    responderWarning.value = 'Responder choices are temporarily unavailable.';
  }
  pageLoading.value = false;
}

async function saveIntegration(createMore, seeList, responderId) {
  if (!selectedIntegration.value || isSaving.value) return false;
  const id = selectedIntegration.value.id;
  isSaving.value = true;
  actionMessage.value = '';
  actionError.value = '';

  try {
    await updateIntegration(id, createMore, seeList, responderId);
    const data = await fetchIntegrations();
    integrations.value = data.integrations || [];
    actionMessage.value = 'Settings saved.';
    return true;
  } catch (error) {
    actionError.value = error.message || 'Could not save this setting.';
    return false;
  } finally {
    isSaving.value = false;
  }
}

async function updateConversationSetting(setting, event) {
  const integration = selectedIntegration.value;
  if (!integration) return;
  const isCreateSetting = setting === 'create';
  const previous = isCreateSetting
    ? integration.canUserCreateMoreConversations
    : integration.canUserSeeConversationList;
  const saved = await saveIntegration(
    isCreateSetting
      ? event.target.checked
      : integration.canUserCreateMoreConversations,
    isCreateSetting
      ? integration.canUserSeeConversationList
      : event.target.checked,
    undefined,
  );
  if (!saved) event.target.checked = Boolean(previous);
}

async function updateResponder(event) {
  const previous = selectedIntegration.value?.defaultResponder?.id;
  const saved = await saveIntegration(
    undefined,
    undefined,
    event.target.value,
  );
  if (!saved) event.target.value = previous || '';
}

async function restoreInheritedResponder() {
  await saveIntegration(undefined, undefined, null);
}

watch(selectedId, () => {
  actionMessage.value = '';
  actionError.value = '';
});

watch(actionMessage, (message, _previous, onCleanup) => {
  if (!message) return;
  const timeout = window.setTimeout(() => {
    actionMessage.value = '';
  }, 5000);
  onCleanup(() => window.clearTimeout(timeout));
});

onMounted(loadIntegrations);
</script>

<style scoped>
:global(body:has(.integrations-page) footer.fixed-bottom) {
  display: none;
}

.integrations-page {
  min-height: calc(100vh - 88px);
  background: #fffefa;
  color: #16140c;
}

.integrations-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: calc(100vh - 88px);
}

.integration-directory {
  border-right: 1px solid #e1e5df;
  min-width: 0;
}

.directory-inner {
  position: sticky;
  top: 0;
  padding: 34px 12px 30px 12px;
}

.directory-heading {
  margin: 0 14px 24px;
}

.integration-search {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 51px;
  margin: 0 14px 23px;
  padding: 0 15px;
  border: 1px solid #d2d8d2;
  border-radius: 9px;
  background: #fff;
}

.integration-search:focus-within {
  border-color: #81b65b;
  box-shadow: 0 0 0 3px rgb(106 180 73 / 15%);
}

.integration-search svg {
  width: 23px;
  height: 23px;
  flex: none;
}

.integration-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font-size: 16px;
}

.integration-search input::placeholder {
  color: #69736d;
}

.directory-list {
  max-height: calc(100vh - 270px);
  overflow-y: auto;
  padding-right: 2px;
}

.directory-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 17px 17px 17px 14px;
  border: 0;
  border-bottom: 1px solid #e2e5e0;
  background: transparent;
  color: inherit;
  text-align: left;
}

.directory-item:hover,
.directory-item:focus-visible {
  background: #f3f8e9;
}

.directory-item:focus-visible {
  outline: 2px solid #568c37;
  outline-offset: -2px;
}

.directory-item.is-selected {
  position: relative;
  background: #f2f8e8;
  border-bottom-color: transparent;
  border-radius: 4px;
}

.directory-item.is-selected::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 4px;
  background: #62c90b;
}

.directory-skeleton {
  pointer-events: none;
}

.directory-icon {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex: none;
}

.directory-item-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.directory-item-copy strong {
  font-size: 15px;
  font-weight: 650;
}

.directory-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #68716a;
  font-size: 15px;
}

.status-dot {
  width: 12px;
  height: 12px;
  display: inline-block;
  flex: none;
  border-radius: 50%;
  background: #e9a738;
}

.status-dot.is-active,
.integration-status-pill.is-active .status-dot {
  background: #55c500;
}

.status-dot.is-inactive,
.integration-status-pill.is-inactive .status-dot {
  background: #a7b0b8;
}

.directory-chevron {
  width: 20px;
  height: 20px;
  margin-left: auto;
  color: #69736d;
  flex: none;
}

.directory-message {
  padding: 16px;
  color: #657067;
}

.integration-workspace {
  min-width: 0;
  padding: 42px clamp(32px, 4vw, 60px) 72px 54px;
}

.integration-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.integration-title-row img {
  width: 43px;
  height: 43px;
  object-fit: contain;
  flex: none;
}

.integration-title-row h2 {
  min-width: 0;
}

.integration-skeleton-icon {
  width: 43px;
  height: 43px;
  flex: none;
}

.integration-skeleton-title {
  width: min(310px, 55vw);
}

.integration-skeleton-status {
  margin-top: 16px;
  width: 95px;
  height: 32px;
}

.integration-skeleton-section-title {
  width: min(220px, 65%);
}

.integration-skeleton-section-copy {
  width: min(530px, 85%);
}

.integration-skeleton-label {
  width: min(230px, 70%);
}

.integration-skeleton-help {
  width: min(385px, 90%);
}

.integration-skeleton-toggle {
  width: 70px;
  height: 24px;
}

.integration-skeleton-select {
  width: 100%;
  max-width: 350px;
  height: 38px;
}

.integration-skeleton-technical {
  width: min(240px, 70%);
}

.integration-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 7px 13px;
  border-radius: 10px;
  margin-top: 14px;
  margin-bottom: 1rem;
  background: #f0f7e7;
  color: #247126;
  font-size: 16px;
  line-height: 1.25;
}

.integration-status-pill.is-inactive {
  background: #eef0f1;
  color: #56616b;
}

.integration-status-pill.is-warning {
  background: #fff3df;
  color: #7a4f00;
}

.integration-intro>p {
  max-width: 920px;
  margin: 27px 0 24px;
  font-size: 17px;
  line-height: 1.5;
}

.integration-controls,
.integration-technical {
  border-top: 1px solid #e0e5e0;
}

.integration-controls {
  padding-top: 29px;
}

.section-copy p {
  margin: 0;
  color: #657067;
  font-size: 16px;
  line-height: 1.45;
}

.controls-list {
  margin-top: 22px;
}

.control-row {
  min-height: 78px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 350px);
  align-items: center;
  gap: 24px;
  margin: 0;
}

.control-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: inherit;
}

.control-copy strong {
  font-size: 17px;
  font-weight: 600;
}

.control-copy small,
.integration-technical summary small {
  color: #657067;
  font-size: 15px;
  line-height: 1.42;
}

.responder-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.inherit-button,
.retry-button {
  border: 0;
  background: transparent;
  color: #285337;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.inherit-button:disabled {
  opacity: 0.5;
}

.responder-warning,
.no-controls {
  color: #657067;
  font-size: 14px;
}

.no-controls {
  margin: 28px 0 0;
}

.save-feedback {
  z-index: 1050;
  width: min(360px, calc(100vw - 32px));
  overflow-wrap: anywhere;
}

.save-feedback-icon {
  width: 24px;
  height: 24px;
}

.integration-technical {
  margin-top: 24px;
  padding-top: 25px;
}

.integration-technical summary {
  display: flex;
  align-items: flex-start;
  gap: 28px;
  cursor: pointer;
  list-style: none;
}

.integration-technical summary::-webkit-details-marker {
  display: none;
}

.integration-technical summary>svg {
  width: 22px;
  height: 22px;
  margin-top: 2px;
  transition: transform 0.2s;
}

.integration-technical[open] summary>svg {
  transform: rotate(90deg);
}

.integration-technical summary span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.integration-technical summary strong {
  font-size: 18px;
  font-weight: 700;
}

.integration-technical dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 30px;
  margin: 25px 0 0 50px;
}

.integration-technical dl>div {
  min-width: 0;
  padding: 12px 0;
  border-bottom: 1px solid #e6eae5;
}

.integration-technical dt {
  color: #657067;
  font-size: 13px;
  font-weight: 500;
}

.integration-technical dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font-size: 14px;
}

.workspace-state {
  padding: 30px 0;
  color: #657067;
}

@media (max-width: 900px) {
  .integrations-shell {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .integration-workspace {
    padding-left: 32px;
  }

  .control-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 10px 0;
  }
}

@media (max-width: 700px) {
  .integrations-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .integration-directory {
    border-right: 0;
    border-bottom: 1px solid #e1e5df;
  }

  .directory-inner {
    position: static;
    padding: 24px 16px 12px;
  }

  .directory-heading,
  .integration-search {
    margin-left: 0;
    margin-right: 0;
  }

  .directory-list {
    display: flex;
    gap: 8px;
    max-height: none;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .directory-item {
    min-width: 210px;
    min-height: 76px;
    padding: 12px;
    border: 1px solid #e2e5e0;
    border-radius: 7px;
  }

  .directory-skeleton {
    flex: 0 0 210px;
  }

  .directory-icon {
    width: 32px;
    height: 32px;
  }

  .directory-item-copy strong {
    font-size: 14px;
  }

  .directory-status {
    font-size: 13px;
  }

  .directory-chevron {
    display: none;
  }

  .integration-workspace {
    padding: 28px 20px 56px;
  }

  .integration-technical dl {
    grid-template-columns: 1fr;
  }
}
</style>

<route lang="json">{
  "name": "Messaging Integrations",
  "meta": {
    "title": "Messaging Integrations"
  }
}</route>

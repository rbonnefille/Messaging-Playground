<template>
  <div id="zendesk-web" class="widget-control-panel">
    <header class="widget-panel-header">
      <div>
        <h2>Web Widget</h2>
        <p>Control and customize the widget experience.</p>
      </div>
    </header>

    <nav class="widget-control-tabs" aria-label="Widget control groups">
      <button
        v-for="group in controlGroups"
        :key="group.id"
        type="button"
        :class="{ active: activeControlGroup === group.id }"
        @click="activeControlGroup = group.id">
        {{ group.label }}
      </button>
    </nav>

    <section class="widget-action-section">
      <div class="widget-section-heading">
        <h3>{{ activeControlGroupData.label }}</h3>
        <p>{{ activeControlGroupData.description }}</p>
      </div>
      <div
        class="widget-action-grid"
        :class="{
          'widget-action-grid--launcher': activeControlGroup === 'launcher',
        }">
        <VButtonGroup
          :label="`${activeControlGroupData.label} actions`"
          :buttons="activeControlGroupData.buttons"
          className="widgetBtn" />
      </div>

      <div
        v-if="activeControlGroupData.id === 'tools'"
        class="widget-setting-field mt-3">
        <div
          class="d-flex align-items-center justify-content-between gap-2 mb-2">
          <label for="widget-content-scale" class="mb-0 small fw-semibold">
            Content scale
          </label>
          <output
            for="widget-content-scale"
            class="fw-semibold"
            aria-live="polite">
            {{ widgetContentScale }}%
          </output>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm px-3"
            aria-label="Decrease content scale by 10%"
            :disabled="widgetContentScale <= 50"
            @click="updateWidgetContentScale(widgetContentScale - 10)">
            −
          </button>
          <input
            id="widget-content-scale"
            type="range"
            class="form-range flex-grow-1 m-0"
            min="50"
            max="200"
            step="1"
            :value="widgetContentScale"
            :aria-valuetext="`${widgetContentScale}%`"
            aria-describedby="widget-content-scale-hint"
            @input="updateWidgetContentScale($event.target.value)" />
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm px-3"
            aria-label="Increase content scale by 10%"
            :disabled="widgetContentScale >= 200"
            @click="updateWidgetContentScale(widgetContentScale + 10)">
            +
          </button>
        </div>

        <div
          class="d-flex align-items-center justify-content-between gap-2 mt-2">
          <small id="widget-content-scale-hint" class="text-body-secondary">
            50%–200%
          </small>
          <button
            type="button"
            class="btn btn-outline-secondary btn-sm"
            :disabled="widgetContentScale === 100"
            @click="updateWidgetContentScale(100)">
            Reset to 100%
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="activeControlGroupData.id === 'tools' && configData"
      class="widget-config-result"
      aria-live="polite"
      aria-labelledby="widget-config-result-title">
      <div class="widget-section-heading">
        <h3 id="widget-config-result-title">Current Widget Configuration</h3>
        <p>Values returned by the widget after selecting Get Config.</p>
      </div>

      <dl class="widget-config-fields">
        <div v-for="item in configEntries" :key="item.key">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.displayValue }}</dd>
          <small>{{ item.description }}</small>
        </div>
      </dl>

      <details class="widget-config-raw">
        <summary>Raw Response</summary>
        <pre>{{ rawConfig }}</pre>
      </details>
    </section>

    <section
      v-if="activeControlGroupData.id === 'tools'"
      class="widget-settings"
      aria-labelledby="widget-settings-title">
      <div class="widget-section-heading">
        <p>Language, citations, and consent settings.</p>
      </div>

      <div class="widget-setting-field">
        <VLabel name="Widget Locale" />
        <VSelect
          optionHint="Select locale"
          v-model="locales.selected"
          :options="locales.options"
          @update:modelValue="updateWidgetLocale" />
      </div>

      <div class="widget-setting-field">
        <VLabel name="Citation source format" />
        <VSelect
          optionHint="Select citation source format"
          v-model="citationSourceFormat.selected"
          :options="citationSourceFormat.options"
          @update:modelValue="updateCitationSourceFormat" />
      </div>

      <div class="widget-setting-field">
        <VLabel name="Change Cookie Consent" />
        <VSelect
          optionHint="Change Cookie Consent"
          v-model="cookieConsent.selected"
          :options="cookieConsent.options"
          @update:modelValue="updateCookieConsent" />
      </div>
    </section>

    <section class="sunco-utility" aria-label="docs">
      <div class="mb-2">
        <strong>Docs</strong>
        <p>Documentations for the widget.</p>
      </div>
      <div>
        <VButtonGroup
          :class="'col mx-2 text-end'"
          label="Zendesk Docs"
          :buttons="zendeskDocs" />
      </div>
    </section>
    <section class="sunco-utility" aria-label="SunCo controls">
      <div>
        <strong>SunCo Widget</strong>
        <p>{{ isSuncoWidgetVisible ? 'Widget visible' : 'Widget hidden' }}</p>
      </div>
      <div class="sunco-action">
        <VButtonGroup label="SunCo Actions" :buttons="suncoButtonsFiltered" />
      </div>
    </section>

    <details class="advanced-tools">
      <summary>
        <span>
          <strong>Advanced tools</strong>
          <small>Danger zone and developer utilities.</small>
        </span>
        <ChevronDownIcon class="advanced-tools-icon" aria-hidden="true" />
      </summary>
      <div class="advanced-tools-content">
        <VButtonGroup
          label="Tools Actions"
          :buttons="toolsButtons"
          className="toolsBtn" />
      </div>
    </details>
  </div>

  <VSidebar :offcanvasPlacement="'end'" ref="sidebarRight">
    <template #title>Embedded mode</template>
    <template #default>
      <div id="messenger-widget" style="width: 100%; height: 100%"></div>
    </template>
  </VSidebar>
</template>

<script setup>
  import VSelect from '@/components/VSelect.vue';
  import VSidebar from '@/components/VSidebar.vue';
  import VLabel from '@/components/VLabel.vue';
  import VButtonGroup from '@/components/VButtonGroup.vue';
  import { ChevronDownIcon } from '@heroicons/vue/24/outline';
  import { reactive, computed, ref } from 'vue';
  import {
    toolsButtons,
    suncoButtons,
    zendeskButtons,
    zendeskDocs,
    updateWidgetLocale,
    widgetContentScale,
    updateWidgetContentScale,
    updateCitationSourceFormat,
    updateCookieConsent,
    sidebarRight,
    isSuncoWidgetVisible,
  } from '@/composables/useWidgetButtons';
  import { configData } from '@/composables/useZendesk';

  const suncoButtonsFiltered = computed(() => {
    if (!isSuncoWidgetVisible.value) {
      // Only show toggle button when widget is hidden
      return {
        toggleWidget: {
          ...suncoButtons.toggleWidget,
          text: 'Show SunCo Widget',
        },
      };
    }

    // Show all buttons when widget is visible
    return {
      ...suncoButtons,
      toggleWidget: {
        ...suncoButtons.toggleWidget,
        text: 'Hide Widget',
      },
    };
  });

  const activeControlGroup = ref('launcher');
  const controlGroups = computed(() => [
    {
      id: 'launcher',
      label: 'Launcher',
      description: 'Open, close, and control the widget launcher.',
      buttons: {
        openMessaging: zendeskButtons.openMessaging,
        closeMessaging: zendeskButtons.closeMessaging,
        leftSide: zendeskButtons.leftSide,
        rightSide: zendeskButtons.rightSide,
        showMessaging: zendeskButtons.showMessaging,
        hideMessaging: zendeskButtons.hideMessaging,
        loginMessaging: zendeskButtons.loginMessaging,
        logoutMessaging: zendeskButtons.logoutMessaging,
        hideHeader: zendeskButtons.hideHeader,
        showHeader: zendeskButtons.showHeader,
        embeddedMode: zendeskButtons.embeddedMode,
        openSidebar: zendeskButtons.openSidebar,
      },
    },
    {
      id: 'conversation',
      label: 'Conversation',
      description: 'Create, navigate, and interact with conversations.',
      buttons: {
        createConversationUI: zendeskButtons.createConversationUI,
        createConversationProgrammatic:
          zendeskButtons.createConversationProgrammatic,
        createConversationFromApi: zendeskButtons.createConversationFromApi,
        setMetadata: zendeskButtons.setMetadata,
        setConversationTags: zendeskButtons.setConversationTags,
        callUs: zendeskButtons.callUs,
        navToConversationList: zendeskButtons.navToConversationList,
        navToMostRecentConversation: zendeskButtons.navToMostRecentConversation,
        sendMessage: zendeskButtons.sendMessage,
      },
    },
    {
      id: 'tools',
      label: 'Tools',
      description: 'Apply visual presets and inspect the current setup.',
      buttons: {
        customization: zendeskButtons.customization,
        minimalisticMode: zendeskButtons.minimalisticMode,
        applyPreset: zendeskButtons.applyPreset,
        changeOffsetWeb: zendeskButtons.changeOffsetWeb,
        resetWidget: zendeskButtons.resetWidget,
        getConfig: zendeskButtons.getConfig,
      },
    },
  ]);

  const activeControlGroupData = computed(
    () =>
      controlGroups.value.find(
        group => group.id === activeControlGroup.value,
      ) || controlGroups.value[0],
  );

  const configDescriptions = {
    canUserCreateMoreConversations:
      'Whether the current user is permitted to create additional conversations',
    multiConvoEnabled:
      'Whether multi-conversation mode is enabled for the widget',
    launcherShape: 'The shape of the widget launcher button',
  };

  const configEntries = computed(() =>
    Object.entries(configData.value || {}).map(([key, value]) => ({
      key,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, character => character.toUpperCase()),
      displayValue:
        typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value),
      description:
        configDescriptions[key] || 'Configuration value returned by the widget',
    })),
  );

  const rawConfig = computed(() => JSON.stringify(configData.value, null, 2));

  const citationSourceFormat = reactive({
    //     >citations.sources	string	Specifies how cited sources are presented. Accepted values: button, bulletedList, numberedList. Default is button.

    // button displays the Sources button and sources sheet.
    // bulletedList and numberedList render the cited sources as an inline list at the end of the message and replace the Sources button and the sources sheet entirely.
    selected: 'button',
    options: [{ id: 'button' }, { id: 'bulletedList' }, { id: 'numberedList' }],
  });

  const locales = reactive({
    selected: 'en-us',
    options: [
      { id: 'af', name: 'Afrikaans' },
      {
        id: 'af-za',
        name: 'Afrikaans (South Africa) - Afrikaans (Suid-Afrika)',
      },
      { id: 'ajp-ps', name: 'ajp (Palestinian Territories)' },
      { id: 'am', name: 'Amharic - አማርኛ' },
      { id: 'apc-ps', name: 'apc (Palestinian Territories)' },
      { id: 'ar', name: 'Arabic - العربية' },
      { id: 'ar-001', name: 'Arabic (world) - العربية (العالم)' },
      {
        id: 'ar-ae',
        name: 'Arabic (United Arab Emirates) - العربية (الإمارات العربية المتحدة)',
      },
      { id: 'ar-bh', name: 'Arabic (Bahrain) - العربية (البحرين)' },
      { id: 'ar-eg', name: 'Arabic (Egypt) - العربية (مصر)' },
      { id: 'ar-il', name: 'Arabic (Israel) - العربية (إسرائيل)' },
      { id: 'ar-jo', name: 'Arabic (Jordan) - العربية (الأردن)' },
      { id: 'ar-kw', name: 'Arabic (Kuwait) - العربية (الكويت)' },
      { id: 'ar-lb', name: 'Arabic (Lebanon) - العربية (لبنان)' },
      { id: 'ar-ma', name: 'Arabic (Morocco) - العربية (المغرب)' },
      { id: 'ar-om', name: 'Arabic (Oman) - العربية (عُمان)' },
      {
        id: 'ar-ps',
        name: 'Arabic (Palestinian Territories) - العربية (الأراضي الفلسطينية)',
      },
      { id: 'ar-qa', name: 'Arabic (Qatar) - العربية (قطر)' },
      {
        id: 'ar-sa',
        name: 'Arabic (Saudi Arabia) - العربية (المملكة العربية السعودية)',
      },
      { id: 'as-in', name: 'Assamese (India) - অসমীয়া (ভাৰত)' },
      { id: 'ast', name: 'Asturian - asturianu' },
      { id: 'ay-bo', name: 'Aymara (Bolivia)' },
      { id: 'az', name: 'Azerbaijani - azərbaycan' },
      { id: 'be', name: 'Belarusian - беларуская' },
      { id: 'bg', name: 'Bulgarian - български' },
      { id: 'bg-bg', name: 'Bulgarian (Bulgaria) - български (България)' },
      { id: 'bn', name: 'Bangla - বাংলা' },
      { id: 'bn-in', name: 'Bangla (India) - বাংলা (ভারত)' },
      { id: 'bs', name: 'Bosnian - bosanski' },
      {
        id: 'bs-ba',
        name: 'Bosnian (Bosnia & Herzegovina) - bosanski (Bosna i Hercegovina)',
      },
      { id: 'ca', name: 'Catalan - català' },
      { id: 'ca-es', name: 'Catalan (Spain) - català (Espanya)' },
      { id: 'ceb', name: 'Cebuano' },
      { id: 'co', name: 'Corsican' },
      { id: 'cs', name: 'Czech - čeština' },
      { id: 'cs-cz', name: 'Czech (Czechia) - čeština (Česko)' },
      { id: 'cy', name: 'Welsh - Cymraeg' },
      { id: 'da', name: 'Danish - dansk' },
      { id: 'da-dk', name: 'Danish (Denmark) - dansk (Danmark)' },
      { id: 'de', name: 'German - Deutsch' },
      { id: 'de-at', name: 'German (Austria) - Deutsch (Österreich)' },
      { id: 'de-be', name: 'German (Belgium) - Deutsch (Belgien)' },
      { id: 'de-ch', name: 'German (Switzerland) - Deutsch (Schweiz)' },
      { id: 'de-de', name: 'German (Germany) - Deutsch (Deutschland)' },
      { id: 'de-dk', name: 'German (Denmark) - Deutsch (Dänemark)' },
      { id: 'de-ee', name: 'German (Estonia) - Deutsch (Estland)' },
      { id: 'de-it', name: 'German (Italy) - Deutsch (Italien)' },
      { id: 'de-li', name: 'German (Liechtenstein) - Deutsch (Liechtenstein)' },
      { id: 'de-lu', name: 'German (Luxembourg) - Deutsch (Luxemburg)' },
      { id: 'de-lv', name: 'German (Latvia) - Deutsch (Lettland)' },
      { id: 'de-ro', name: 'German (Romania) - Deutsch (Rumänien)' },
      { id: 'de-sk', name: 'German (Slovakia) - Deutsch (Slowakei)' },
      { id: 'el', name: 'Greek - Ελληνικά' },
      { id: 'el-cy', name: 'Greek (Cyprus) - Ελληνικά (Κύπρος)' },
      { id: 'el-gr', name: 'Greek (Greece) - Ελληνικά (Ελλάδα)' },
      { id: 'en-001', name: 'English (world)' },
      { id: 'en-142', name: 'English (Asia)' },
      { id: 'en-150', name: 'English (Europe)' },
      { id: 'en-419', name: 'English (Latin America)' },
      { id: 'en-ad', name: 'English (Andorra)' },
      { id: 'en-ae', name: 'English (United Arab Emirates)' },
      { id: 'en-al', name: 'English (Albania)' },
      { id: 'en-am', name: 'English (Armenia)' },
      { id: 'en-aq', name: 'English (Antarctica)' },
      { id: 'en-ar', name: 'English (Argentina)' },
      { id: 'en-at', name: 'English (Austria)' },
      { id: 'en-au', name: 'English (Australia)' },
      { id: 'en-az', name: 'English (Azerbaijan)' },
      { id: 'en-ba', name: 'English (Bosnia & Herzegovina)' },
      { id: 'en-bd', name: 'English (Bangladesh)' },
      { id: 'en-be', name: 'English (Belgium)' },
      { id: 'en-bg', name: 'English (Bulgaria)' },
      { id: 'en-bh', name: 'English (Bahrain)' },
      { id: 'en-bo', name: 'English (Bolivia)' },
      { id: 'en-br', name: 'English (Brazil)' },
      { id: 'en-bz', name: 'English (Belize)' },
      { id: 'en-ca', name: 'English (Canada)' },
      { id: 'en-ch', name: 'English (Switzerland)' },
      { id: 'en-cl', name: 'English (Chile)' },
      { id: 'en-cn', name: 'English (China)' },
      { id: 'en-co', name: 'English (Colombia)' },
      { id: 'en-cr', name: 'English (Costa Rica)' },
      { id: 'en-cy', name: 'English (Cyprus)' },
      { id: 'en-cz', name: 'English (Czechia)' },
      { id: 'en-de', name: 'English (Germany)' },
      { id: 'en-dk', name: 'English (Denmark)' },
      { id: 'en-do', name: 'English (Dominican Republic)' },
      { id: 'en-dz', name: 'English (Algeria)' },
      { id: 'en-ec', name: 'English (Ecuador)' },
      { id: 'en-ee', name: 'English (Estonia)' },
      { id: 'en-eg', name: 'English (Egypt)' },
      { id: 'en-es', name: 'English (Spain)' },
      { id: 'en-fi', name: 'English (Finland)' },
      { id: 'en-fr', name: 'English (France)' },
      { id: 'en-gb', name: 'English (United Kingdom)' },
      { id: 'en-ge', name: 'English (Georgia)' },
      { id: 'en-gf', name: 'English (French Guiana)' },
      { id: 'en-gh', name: 'English (Ghana)' },
      { id: 'en-gi', name: 'English (Gibraltar)' },
      { id: 'en-gp', name: 'English (Guadeloupe)' },
      { id: 'en-gr', name: 'English (Greece)' },
      { id: 'en-gu', name: 'English (Guam)' },
      { id: 'en-hk', name: 'English (Hong Kong)' },
      { id: 'en-hn', name: 'English (Honduras)' },
      { id: 'en-hr', name: 'English (Croatia)' },
      { id: 'en-hu', name: 'English (Hungary)' },
      { id: 'en-id', name: 'English (Indonesia)' },
      { id: 'en-ie', name: 'English (Ireland)' },
      { id: 'en-il', name: 'English (Israel)' },
      { id: 'en-in', name: 'English (India)' },
      { id: 'en-is', name: 'English (Iceland)' },
      { id: 'en-it', name: 'English (Italy)' },
      { id: 'en-jm', name: 'English (Jamaica)' },
      { id: 'en-jo', name: 'English (Jordan)' },
      { id: 'en-jp', name: 'English (Japan)' },
      { id: 'en-ke', name: 'English (Kenya)' },
      { id: 'en-kg', name: 'English (Kyrgyzstan)' },
      { id: 'en-kh', name: 'English (Cambodia)' },
      { id: 'en-kr', name: 'English (South Korea)' },
      { id: 'en-kw', name: 'English (Kuwait)' },
      { id: 'en-kz', name: 'English (Kazakhstan)' },
      { id: 'en-lb', name: 'English (Lebanon)' },
      { id: 'en-li', name: 'English (Liechtenstein)' },
      { id: 'en-lk', name: 'English (Sri Lanka)' },
      { id: 'en-lr', name: 'English (Liberia)' },
      { id: 'en-lt', name: 'English (Lithuania)' },
      { id: 'en-lu', name: 'English (Luxembourg)' },
      { id: 'en-lv', name: 'English (Latvia)' },
      { id: 'en-ma', name: 'English (Morocco)' },
      { id: 'en-md', name: 'English (Moldova)' },
      { id: 'en-me', name: 'English (Montenegro)' },
      { id: 'en-mf', name: 'English (St. Martin)' },
      { id: 'en-mk', name: 'English (North Macedonia)' },
      { id: 'en-mo', name: 'English (Macao)' },
      { id: 'en-mq', name: 'English (Martinique)' },
      { id: 'en-mt', name: 'English (Malta)' },
      { id: 'en-mu', name: 'English (Mauritius)' },
      { id: 'en-mx', name: 'English (Mexico)' },
      { id: 'en-my', name: 'English (Malaysia)' },
      { id: 'en-ng', name: 'English (Nigeria)' },
      { id: 'en-nl', name: 'English (Netherlands)' },
      { id: 'en-no', name: 'English (Norway)' },
      { id: 'en-np', name: 'English (Nepal)' },
      { id: 'en-nz', name: 'English (New Zealand)' },
      { id: 'en-om', name: 'English (Oman)' },
      { id: 'en-pe', name: 'English (Peru)' },
      { id: 'en-ph', name: 'English (Philippines)' },
      { id: 'en-pk', name: 'English (Pakistan)' },
      { id: 'en-pl', name: 'English (Poland)' },
      { id: 'en-pr', name: 'English (Puerto Rico)' },
      { id: 'en-ps', name: 'English (Palestinian Territories)' },
      { id: 'en-pt', name: 'English (Portugal)' },
      { id: 'en-qa', name: 'English (Qatar)' },
      { id: 'en-re', name: 'English (Réunion)' },
      { id: 'en-ro', name: 'English (Romania)' },
      { id: 'en-rs', name: 'English (Serbia)' },
      { id: 'en-ru', name: 'English (Russia)' },
      { id: 'en-rw', name: 'English (Rwanda)' },
      { id: 'en-sa', name: 'English (Saudi Arabia)' },
      { id: 'en-se', name: 'English (Sweden)' },
      { id: 'en-sg', name: 'English (Singapore)' },
      { id: 'en-si', name: 'English (Slovenia)' },
      { id: 'en-sk', name: 'English (Slovakia)' },
      { id: 'en-th', name: 'English (Thailand)' },
      { id: 'en-tn', name: 'English (Tunisia)' },
      { id: 'en-tr', name: 'English (Türkiye)' },
      { id: 'en-tw', name: 'English (Taiwan)' },
      { id: 'en-tz', name: 'English (Tanzania)' },
      { id: 'en-ua', name: 'English (Ukraine)' },
      { id: 'en-ug', name: 'English (Uganda)' },
      { id: 'en-us', name: 'English (United States)' },
      { id: 'en-uz', name: 'English (Uzbekistan)' },
      { id: 'en-vn', name: 'English (Vietnam)' },
      { id: 'en-yt', name: 'English (Mayotte)' },
      { id: 'en-za', name: 'English (South Africa)' },
      { id: 'es', name: 'Spanish - español' },
      { id: 'es-001', name: 'Spanish (world) - español (Mundo)' },
      {
        id: 'es-419',
        name: 'Spanish (Latin America) - español (Latinoamérica)',
      },
      { id: 'es-ad', name: 'Spanish (Andorra) - español (Andorra)' },
      { id: 'es-ar', name: 'Spanish (Argentina) - español (Argentina)' },
      { id: 'es-bo', name: 'Spanish (Bolivia) - español (Bolivia)' },
      { id: 'es-cl', name: 'Spanish (Chile) - español (Chile)' },
      { id: 'es-co', name: 'Spanish (Colombia) - español (Colombia)' },
      { id: 'es-cr', name: 'Spanish (Costa Rica) - español (Costa Rica)' },
      {
        id: 'es-do',
        name: 'Spanish (Dominican Republic) - español (República Dominicana)',
      },
      { id: 'es-ec', name: 'Spanish (Ecuador) - español (Ecuador)' },
      { id: 'es-es', name: 'Spanish (Spain) - español (España)' },
      { id: 'es-gt', name: 'Spanish (Guatemala) - español (Guatemala)' },
      { id: 'es-hn', name: 'Spanish (Honduras) - español (Honduras)' },
      { id: 'es-il', name: 'Spanish (Israel) - español (Israel)' },
      { id: 'es-mx', name: 'Spanish (Mexico) - español (México)' },
      { id: 'es-ni', name: 'Spanish (Nicaragua) - español (Nicaragua)' },
      { id: 'es-pa', name: 'Spanish (Panama) - español (Panamá)' },
      { id: 'es-pe', name: 'Spanish (Peru) - español (Perú)' },
      { id: 'es-pr', name: 'Spanish (Puerto Rico) - español (Puerto Rico)' },
      { id: 'es-py', name: 'Spanish (Paraguay) - español (Paraguay)' },
      { id: 'es-sa', name: 'Spanish (Saudi Arabia) - español (Arabia Saudí)' },
      { id: 'es-sv', name: 'Spanish (El Salvador) - español (El Salvador)' },
      {
        id: 'es-us',
        name: 'Spanish (United States) - español (Estados Unidos)',
      },
      { id: 'es-uy', name: 'Spanish (Uruguay) - español (Uruguay)' },
      { id: 'es-ve', name: 'Spanish (Venezuela) - español (Venezuela)' },
      { id: 'et', name: 'Estonian - eesti' },
      { id: 'et-ee', name: 'Estonian (Estonia) - eesti (Eesti)' },
      { id: 'eu', name: 'Basque - euskara' },
      { id: 'eu-es', name: 'Basque (Spain) - euskara (Espainia)' },
      { id: 'fa', name: 'Persian - فارسی' },
      { id: 'fa-af', name: 'Persian (Afghanistan) - فارسی (افغانستان)' },
      { id: 'fi', name: 'Finnish - suomi' },
      { id: 'fi-fi', name: 'Finnish (Finland) - suomi (Suomi)' },
      { id: 'fil', name: 'Filipino' },
      { id: 'fil-ph', name: 'Filipino (Philippines) - Filipino (Pilipinas)' },
      { id: 'fj', name: 'Fijian' },
      { id: 'fo', name: 'Faroese - føroyskt' },
      { id: 'fo-dk', name: 'Faroese (Denmark) - føroyskt (Danmark)' },
      { id: 'fr', name: 'French - français' },
      { id: 'fr-001', name: 'French (world) - français (Monde)' },
      { id: 'fr-002', name: 'French (Africa) - français (Afrique)' },
      { id: 'fr-at', name: 'French (Austria) - français (Autriche)' },
      { id: 'fr-be', name: 'French (Belgium) - français (Belgique)' },
      { id: 'fr-ca', name: 'French (Canada) - français (Canada)' },
      { id: 'fr-ch', name: 'French (Switzerland) - français (Suisse)' },
      {
        id: 'fr-ci',
        name: 'French (Côte d’Ivoire) - français (Côte d’Ivoire)',
      },
      { id: 'fr-de', name: 'French (Germany) - français (Allemagne)' },
      { id: 'fr-dz', name: 'French (Algeria) - français (Algérie)' },
      { id: 'fr-fr', name: 'French (France) - français (France)' },
      {
        id: 'fr-gf',
        name: 'French (French Guiana) - français (Guyane française)',
      },
      { id: 'fr-gi', name: 'French (Gibraltar) - français (Gibraltar)' },
      { id: 'fr-gp', name: 'French (Guadeloupe) - français (Guadeloupe)' },
      { id: 'fr-ht', name: 'French (Haiti) - français (Haïti)' },
      { id: 'fr-il', name: 'French (Israel) - français (Israël)' },
      { id: 'fr-it', name: 'French (Italy) - français (Italie)' },
      {
        id: 'fr-li',
        name: 'French (Liechtenstein) - français (Liechtenstein)',
      },
      { id: 'fr-lu', name: 'French (Luxembourg) - français (Luxembourg)' },
      { id: 'fr-ma', name: 'French (Morocco) - français (Maroc)' },
      { id: 'fr-mc', name: 'French (Monaco) - français (Monaco)' },
      { id: 'fr-mf', name: 'French (St. Martin) - français (Saint-Martin)' },
      { id: 'fr-mq', name: 'French (Martinique) - français (Martinique)' },
      { id: 'fr-mu', name: 'French (Mauritius) - français (Maurice)' },
      { id: 'fr-re', name: 'French (Réunion) - français (La Réunion)' },
      {
        id: 'fr-sa',
        name: 'French (Saudi Arabia) - français (Arabie saoudite)',
      },
      { id: 'fr-tn', name: 'French (Tunisia) - français (Tunisie)' },
      { id: 'fr-yt', name: 'French (Mayotte) - français (Mayotte)' },
      { id: 'ga', name: 'Irish - Gaeilge' },
      { id: 'ga-ie', name: 'Irish (Ireland) - Gaeilge (Éire)' },
      { id: 'gl', name: 'Galician - galego' },
      { id: 'gl-es', name: 'Galician (Spain) - galego (España)' },
      { id: 'gu', name: 'Gujarati - ગુજરાતી' },
      { id: 'gu-in', name: 'Gujarati (India) - ગુજરાતી (ભારત)' },
      { id: 'he', name: 'Hebrew - עברית' },
      { id: 'he-001', name: 'Hebrew (world) - עברית (העולם)' },
      { id: 'he-il', name: 'Hebrew (Israel) - עברית (ישראל)' },
      { id: 'he-sa', name: 'Hebrew (Saudi Arabia) - עברית (ערב הסעודית)' },
      { id: 'hi', name: 'Hindi - हिन्दी' },
      { id: 'hi-in', name: 'Hindi (India) - हिन्दी (भारत)' },
      { id: 'hr', name: 'Croatian - hrvatski' },
      { id: 'hr-hr', name: 'Croatian (Croatia) - hrvatski (Hrvatska)' },
      { id: 'ht', name: 'Haitian Creole - créole haïtien' },
      { id: 'hu', name: 'Hungarian - magyar' },
      { id: 'hu-hu', name: 'Hungarian (Hungary) - magyar (Magyarország)' },
      { id: 'hu-ro', name: 'Hungarian (Romania) - magyar (Románia)' },
      { id: 'hu-sk', name: 'Hungarian (Slovakia) - magyar (Szlovákia)' },
      { id: 'hu-ua', name: 'Hungarian (Ukraine) - magyar (Ukrajna)' },
      { id: 'hy', name: 'Armenian - հայերեն' },
      { id: 'id', name: 'Indonesian - Indonesia' },
      { id: 'id-id', name: 'Indonesian (Indonesia) - Indonesia (Indonesia)' },
      { id: 'ikt', name: 'Western Canadian Inuktitut' },
      { id: 'is', name: 'Icelandic - íslenska' },
      { id: 'is-is', name: 'Icelandic (Iceland) - íslenska (Ísland)' },
      { id: 'it', name: 'Italian - italiano' },
      { id: 'it-ch', name: 'Italian (Switzerland) - italiano (Svizzera)' },
      { id: 'it-it', name: 'Italian (Italy) - italiano (Italia)' },
      { id: 'it-sm', name: 'Italian (San Marino) - italiano (San Marino)' },
      { id: 'iu', name: 'Inuktitut' },
      { id: 'ja', name: 'Japanese - 日本語' },
      { id: 'ja-jp', name: 'Japanese (Japan) - 日本語 (日本)' },
      { id: 'jv-id', name: 'Javanese (Indonesia) - Jawa (Indonésia)' },
      { id: 'ka', name: 'Georgian - ქართული' },
      { id: 'kk', name: 'Kazakh - қазақ тілі' },
      { id: 'kk-kz', name: 'Kazakh (Kazakhstan) - қазақ тілі (Қазақстан)' },
      { id: 'kl-dk', name: 'Kalaallisut (Denmark) - kalaallisut (DK)' },
      { id: 'km', name: 'Khmer - ខ្មែរ' },
      { id: 'kn', name: 'Kannada - ಕನ್ನಡ' },
      { id: 'kn-in', name: 'Kannada (India) - ಕನ್ನಡ (ಭಾರತ)' },
      { id: 'ko', name: 'Korean - 한국어' },
      { id: 'ko-kr', name: 'Korean (South Korea) - 한국어(대한민국)' },
      { id: 'ks-in', name: 'Kashmiri (India) - کٲشُر (ہِندوستان)' },
      { id: 'ku', name: 'Kurdish - kurdî' },
      { id: 'ky', name: 'Kyrgyz - кыргызча' },
      { id: 'lb', name: 'Luxembourgish - Lëtzebuergesch' },
      { id: 'ln', name: 'Lingala - lingála' },
      { id: 'lo', name: 'Lao - ລາວ' },
      { id: 'lt', name: 'Lithuanian - lietuvių' },
      { id: 'lt-lt', name: 'Lithuanian (Lithuania) - lietuvių (Lietuva)' },
      { id: 'lt-lv', name: 'Lithuanian (Latvia) - lietuvių (Latvija)' },
      { id: 'lv', name: 'Latvian - latviešu' },
      { id: 'lv-lv', name: 'Latvian (Latvia) - latviešu (Latvija)' },
      { id: 'mg', name: 'Malagasy' },
      { id: 'mi-nz', name: 'Māori (New Zealand) - Māori (Aotearoa)' },
      { id: 'mk', name: 'Macedonian - македонски' },
      { id: 'ml', name: 'Malayalam - മലയാളം' },
      { id: 'ml-in', name: 'Malayalam (India) - മലയാളം (ഇന്ത്യ)' },
      { id: 'mn', name: 'Mongolian - монгол' },
      { id: 'mr', name: 'Marathi - मराठी' },
      { id: 'mr-in', name: 'Marathi (India) - मराठी (भारत)' },
      { id: 'ms', name: 'Malay - Melayu' },
      { id: 'ms-my', name: 'Malay (Malaysia) - Melayu (Malaysia)' },
      { id: 'mt', name: 'Maltese - Malti' },
      { id: 'my', name: 'Burmese - မြန်မာ' },
      { id: 'nb', name: 'Norwegian Bokmål - norsk bokmål' },
      { id: 'nb-no', name: 'Norwegian Bokmål (Norway) - norsk bokmål (Norge)' },
      { id: 'ne', name: 'Nepali - नेपाली' },
      { id: 'nl', name: 'Dutch - Nederlands' },
      { id: 'nl-be', name: 'Dutch (Belgium) - Nederlands (België)' },
      { id: 'nl-de', name: 'Dutch (Germany) - Nederlands (Duitsland)' },
      { id: 'nl-id', name: 'Dutch (Indonesia) - Nederlands (Indonesië)' },
      { id: 'nl-nl', name: 'Dutch (Netherlands) - Nederlands (Nederland)' },
      { id: 'nn', name: 'Norwegian Nynorsk - norsk nynorsk' },
      {
        id: 'nn-no',
        name: 'Norwegian Nynorsk (Norway) - norsk nynorsk (Noreg)',
      },
      { id: 'no', name: 'Norwegian - norsk' },
      { id: 'no-no', name: 'Norwegian (Norway) - norsk (Norge)' },
      { id: 'nso-za', name: 'Northern Sotho (South Africa)' },
      { id: 'or-in', name: 'Odia (India) - ଓଡ଼ିଆ (ଭାରତ)' },
      { id: 'pa', name: 'Punjabi - ਪੰਜਾਬੀ' },
      { id: 'pa-in', name: 'Punjabi (India) - ਪੰਜਾਬੀ (ਭਾਰਤ)' },
      { id: 'pl', name: 'Polish - polski' },
      { id: 'pl-cz', name: 'Polish (Czechia) - polski (Czechy)' },
      { id: 'pl-lt', name: 'Polish (Lithuania) - polski (Litwa)' },
      { id: 'pl-pl', name: 'Polish (Poland) - polski (Polska)' },
      { id: 'pl-ua', name: 'Polish (Ukraine) - polski (Ukraina)' },
      { id: 'ps', name: 'Pashto - پښتو' },
      { id: 'ps-af', name: 'Pashto (Afghanistan) - پښتو (افغانستان)' },
      { id: 'pt', name: 'Portuguese - português' },
      { id: 'pt-br', name: 'Portuguese (Brazil) - português (Brasil)' },
      { id: 'pt-mz', name: 'Portuguese (Mozambique) - português (Moçambique)' },
      { id: 'pt-pt', name: 'Portuguese (Portugal) - português (Portugal)' },
      { id: 'qu-bo', name: 'Quechua (Bolivia) - Runasimi (Bolivia)' },
      { id: 'qu-ec', name: 'Quechua (Ecuador) - Runasimi (Ecuador)' },
      { id: 'qu-pe', name: 'Quechua (Peru) - Runasimi (Perú)' },
      { id: 'rn-bi', name: 'Rundi (Burundi) - Ikirundi (Uburundi)' },
      { id: 'ro', name: 'Romanian - română' },
      { id: 'ro-bg', name: 'Romanian (Bulgaria) - română (Bulgaria)' },
      { id: 'ro-md', name: 'Romanian (Moldova) - română (Republica Moldova)' },
      { id: 'ro-ro', name: 'Romanian (Romania) - română (România)' },
      { id: 'ro-sk', name: 'Romanian (Slovakia) - română (Slovacia)' },
      { id: 'ro-ua', name: 'Romanian (Ukraine) - română (Ucraina)' },
      { id: 'ru', name: 'Russian - русский' },
      { id: 'ru-ee', name: 'Russian (Estonia) - русский (Эстония)' },
      { id: 'ru-kz', name: 'Russian (Kazakhstan) - русский (Казахстан)' },
      { id: 'ru-lt', name: 'Russian (Lithuania) - русский (Литва)' },
      { id: 'ru-lv', name: 'Russian (Latvia) - русский (Латвия)' },
      { id: 'ru-ua', name: 'Russian (Ukraine) - русский (Украина)' },
      {
        id: 'ru-us',
        name: 'Russian (United States) - русский (Соединенные Штаты)',
      },
      { id: 'rw', name: 'Kinyarwanda' },
      { id: 'sa-in', name: 'Sanskrit (India) - संस्कृत भाषा (भारतः)' },
      { id: 'sd-in', name: 'Sindhi (India) - सिन्धी (भारत)' },
      { id: 'si', name: 'Sinhala - සිංහල' },
      { id: 'sk', name: 'Slovak - slovenčina' },
      { id: 'sk-cz', name: 'Slovak (Czechia) - slovenčina (Česko)' },
      { id: 'sk-sk', name: 'Slovak (Slovakia) - slovenčina (Slovensko)' },
      { id: 'sl', name: 'Slovenian - slovenščina' },
      { id: 'sl-si', name: 'Slovenian (Slovenia) - slovenščina (Slovenija)' },
      { id: 'sm', name: 'Samoan' },
      { id: 'so', name: 'Somali - Soomaali' },
      { id: 'sq', name: 'Albanian - shqip' },
      { id: 'sq-al', name: 'Albanian (Albania) - shqip (Shqipëri)' },
      { id: 'sq-xk', name: 'Albanian (Kosovo) - shqip (Kosovë)' },
      { id: 'sr', name: 'Serbian - српски' },
      { id: 'sr-me', name: 'Serbian (Montenegro) - srpski (Crna Gora)' },
      { id: 'sr-rs', name: 'Serbian (Serbia) - српски (Србија)' },
      { id: 'sr-xk', name: 'Serbian (Kosovo) - српски (Косово)' },
      { id: 'st-za', name: 'Southern Sotho (South Africa)' },
      { id: 'sv', name: 'Swedish - svenska' },
      { id: 'sv-fi', name: 'Swedish (Finland) - svenska (Finland)' },
      { id: 'sv-se', name: 'Swedish (Sweden) - svenska (Sverige)' },
      { id: 'sw', name: 'Swahili - Kiswahili' },
      { id: 'sw-ke', name: 'Swahili (Kenya) - Kiswahili (Kenya)' },
      { id: 'sw-rw', name: 'Swahili (Rwanda) - Kiswahili (Rwanda)' },
      { id: 'sw-tz', name: 'Swahili (Tanzania) - Kiswahili (Tanzania)' },
      { id: 'sw-ug', name: 'Swahili (Uganda) - Kiswahili (Uganda)' },
      { id: 'ta', name: 'Tamil - தமிழ்' },
      { id: 'ta-in', name: 'Tamil (India) - தமிழ் (இந்தியா)' },
      { id: 'te', name: 'Telugu - తెలుగు' },
      { id: 'te-in', name: 'Telugu (India) - తెలుగు (భారతదేశం)' },
      { id: 'tg', name: 'Tajik - тоҷикӣ' },
      { id: 'th', name: 'Thai - ไทย' },
      { id: 'th-th', name: 'Thai (Thailand) - ไทย (ไทย)' },
      { id: 'ti', name: 'Tigrinya - ትግርኛ' },
      { id: 'tk', name: 'Turkmen - türkmen dili' },
      { id: 'tl', name: 'Tagalog' },
      { id: 'tl-ph', name: 'Tagalog (Philippines) - Tagalog (Pilipinas)' },
      { id: 'tn-za', name: 'Tswana (South Africa)' },
      { id: 'to', name: 'Tongan - lea fakatonga' },
      { id: 'tr', name: 'Turkish - Türkçe' },
      { id: 'tr-bg', name: 'Turkish (Bulgaria) - Türkçe (Bulgaristan)' },
      { id: 'tr-cy', name: 'Turkish (Cyprus) - Türkçe (Kıbrıs)' },
      { id: 'tr-tr', name: 'Turkish (Türkiye) - Türkçe (Türkiye)' },
      { id: 'ts-za', name: 'Tsonga (South Africa)' },
      { id: 'uk', name: 'Ukrainian - українська' },
      { id: 'uk-sk', name: 'Ukrainian (Slovakia) - українська (Словаччина)' },
      { id: 'uk-ua', name: 'Ukrainian (Ukraine) - українська (Україна)' },
      { id: 'ur', name: 'Urdu - اردو' },
      { id: 'ur-in', name: 'Urdu (India) - اردو (بھارت)' },
      { id: 'ur-pk', name: 'Urdu (Pakistan) - اردو (پاکستان)' },
      { id: 'uz', name: 'Uzbek - o‘zbek' },
      { id: 'vi', name: 'Vietnamese - Tiếng Việt' },
      { id: 'vi-vn', name: 'Vietnamese (Vietnam) - Tiếng Việt (Việt Nam)' },
      { id: 'xh', name: 'Xhosa - IsiXhosa' },
      {
        id: 'xh-za',
        name: 'Xhosa (South Africa) - IsiXhosa (EMzantsi Afrika)',
      },
      { id: 'zh-ar', name: 'Chinese (Argentina) - 中文（阿根廷）' },
      { id: 'zh-cn', name: 'Chinese (Simplified) - 中文（简体）' },
      { id: 'zh-ec', name: 'Chinese (Ecuador) - 中文（厄瓜多尔）' },
      {
        id: 'zh-hant-my',
        name: 'Chinese (Traditional, Malaysia) - 中文（繁體，馬來西亞）',
      },
      { id: 'zh-hk', name: 'Chinese (Hong Kong) - 中文（香港）' },
      { id: 'zh-mo', name: 'Chinese (Macao) - 中文（澳門）' },
      { id: 'zh-my', name: 'Chinese (Malaysia) - 中文（马来西亚）' },
      { id: 'zh-pa', name: 'Chinese (Panama) - 中文（巴拿馬）' },
      { id: 'zh-sg', name: 'Chinese (Singapore) - 中文（新加坡）' },
      { id: 'zh-tw', name: 'Chinese (Traditional) - 中文（繁體）' },
      {
        id: 'zu-za',
        name: 'Zulu (South Africa) - isiZulu (iNingizimu Afrika)',
      },
    ],
  });

  const cookieConsent = reactive({
    selected: 'all',
    options: ['all', 'none', 'functional'],
  });
</script>

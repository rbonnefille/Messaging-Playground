<template>
  <form
    v-if="!authenticated"
    id="suncoData"
    class="login-form"
    @submit.prevent="submitForm"
    @reset.prevent="resetForm">
    <div class="section-heading">
      <h2>Login Form</h2>
      <p>{{ formMessageTitle }}</p>
    </div>
    <div class="row g-3">
      <div
        v-for="field in formFields"
        :key="field.id"
        class="col-md-6 col-xl-3">
        <VLabel :id="field.id" :name="field.name" className="form-label" />
        <VInput
          :id="field.id"
          v-model="form[field.id]"
          :name="field.name"
          :type="field.type"
          :placeholder="field.placeholder" />
      </div>
      <div class="col-md-6 col-xl-3 d-flex align-items-end">
        <div class="form-check mb-2">
          <input
            :id="'emailVerified'"
            class="form-check-input"
            type="checkbox"
            v-model="form.emailVerified" />
          <label class="form-check-label" :for="'emailVerified'"
            >Email verified?</label
          >
        </div>
      </div>
    </div>
    <div class="form-action-row">
      <div>
        <VFormActions
          :isFormInvalid="isFormInvalid"
          :authenticated="authenticated"
          @michael-scott="michaelScottForm"
          @request-jwt="requestJwtToDisplay">
          <template #additional-actions>
            <VButton
              v-if="!authenticated && isFormInvalid"
              text="Generate external_id"
              type="button"
              class="formBtn"
              @click="generateExternalId" />
          </template>
        </VFormActions>
      </div>
    </div>
  </form>
</template>

<script setup>
  import VButton from '@/components/VButton.vue';
  import VInput from '@/components/VInput.vue';
  import VLabel from '@/components/VLabel.vue';
  import VFormActions from '@/components/VFormActions.vue';
  import { useUserStore } from '@/stores/userStore';
  import {
    useGetToken,
    useSetSessionAuth,
    useShowSuccessToast,
    useGenerateExternalId,
  } from '@/composables/helpers';
  import { ref, computed } from 'vue';
  import { useTitle, useClipboard } from '@vueuse/core';
  import { storeToRefs } from 'pinia';
  import { useLoginUserZDWidget } from '@/composables/useZendesk';
  import { useLoginUserSunCoWidget } from '@/composables/useSunco';

  const userStore = useUserStore();

  const { authenticated, connectedAs } = storeToRefs(userStore);
  const source = ref(null);
  const { copy, copied, isSupported } = useClipboard({ source });

  defineProps({
    formMessageTitle: {
      type: String,
      default: 'Log back in to sync your past conversations',
    },
  });

  const generateExternalId = () => {
    form.value.external_id = useGenerateExternalId();
  };

  const formFields = [
    {
      id: 'external_id',
      name: 'User external_id',
      type: 'text',
      placeholder: 'jane-doe',
    },
    { id: 'name', name: 'User name', type: 'text', placeholder: 'Jane Doe' },
    {
      id: 'email',
      name: 'Email address',
      type: 'email',
      placeholder: 'jane-doe@example.com',
    },
  ];

  const form = ref({
    external_id: null,
    name: null,
    email: null,
    emailVerified: false,
    shouldExpire: false,
  });

  const isFormInvalid = computed(
    () => !form.value.external_id || !form.value.email,
  );

  const resetForm = () => {
    form.value = {
      external_id: null,
      name: null,
      email: null,
      emailVerified: false,
    };
  };

  const michaelScottForm = () => {
    form.value.external_id = 'm-scott';
    form.value.email = 'michael-scott@example.com';
    form.value.name = 'Michael Scott';
    form.value.emailVerified = true;
    submitForm();
  };

  const submitForm = async () => {
    const { external_id } = form.value;
    if (isFormInvalid.value) {
      return;
    }
    const userData = Object.assign({}, form.value);
    const { token } = await useGetToken(userData);
    useSetSessionAuth(external_id, token);
    try {
      await useLoginUserZDWidget(userData);
      useShowSuccessToast('You are now logged in ✅', 1000);
      resetForm();
      userStore.changeAuthenticationStatus(true, external_id);
      useTitle(connectedAs.value);
    } catch (error) {
      console.error('Zendesk login failed:', error);
      resetForm();
    }
    useLoginUserSunCoWidget(external_id, token);
  };

  const requestJwtToDisplay = async () => {
    if (isFormInvalid.value) {
      return;
    }
    const userData = Object.assign({}, form.value);
    const { token } = await useGetToken(userData);
    if (isSupported) {
      copy(token);
      if (copied) {
        useShowSuccessToast('JWT copied to clipboard 📋', 5000);
      }
    }
  };
</script>

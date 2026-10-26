<template>
  <div class="container mt-5">
    <form id="suncoData" class="row">
      <div class="row justify-content-center">
        <div v-for="field in formFields" :key="field.id" class="col-auto">
          <VLabel :id="field.id" :name="field.name" className="form-label" />
          <VInput :id="field.id" v-model="form[field.id]" :name="field.name" :type="field.type"
            :placeholder="field.placeholder" />
        </div>
      </div>
      <div class="row justify-content-center mt-3">
        <div class="col-auto">
          <VButton text="Submit" type="submit" :disabled="isFormInvalid" @click.prevent="submitForm" />
          <VButton text="Log as John End User" type="submit" @click.prevent="endUserJohnJohn" />
          <VButton text="Cancel" type="cancel" @click="resetForm" />
        </div>
      </div>
    </form>
    <div class="row justify-content-center mt-5">
      <div class="col-4">
        <h4 class="h4">Other Zendesk links</h4>
        <div id="list-example" class="list-group">
          <a class="list-group-item list-group-item-action routes"
            href="https://z3nsuncoswitchboard.zendesk.com/agent">Agent login portal</a>
          <a class="list-group-item list-group-item-action routes"
            href="https://z3nsuncoswitchboard.zendesk.com/hc">End-user login portal</a>
        </div>
      </div>
    </div>
  </div>
  <div class="row justify-content-center mt-5">
    <div class="col-auto">
      <h4 class="h4">Search Help Center articles</h4>
      <div class="d-flex mb-4">
        <VInput id="searchKb" v-model="searchQuery" name="search" type="text" placeholder="Search"
          @keyup.enter="searchKB" />
        <VButton class="mx-2" type="submit" text="Search" @click="searchKB" />
      </div>
      <div class="text-center">
        <div class="spinner-border text-success text-bold" role="status" v-if="isLoadingKB">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <ul>

        <li class="mt-1" v-for="(result, index) in articles?.results || []" :key="result.id ?? index">
          <a v-if="result.title" :href="result.html_url" target="_blank" rel="noopener noreferrer">
            {{ result.title }}
          </a>
        </li>
        <p v-if="errorKB">{{ errorKB }}</p>
      </ul>
    </div>
  </div>
  <div class="row justify-content-center mt-5">
    <div class="col-auto">
      <h4 class="h4">Search Zendesk User</h4>
      <div class="d-flex mb-4">
        <VInput id="searchUser" v-model="searchUserQuery" name="search" type="text" placeholder="Search"
          @keyup.enter="searchUser" />
        <VButton class="mx-2" type="submit" text="Search" @click="searchUser" />
      </div>
      <div class="text-center">
        <div class="spinner-border text-success text-bold" role="status" v-if="isLoadingUser">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <ul>
        <div class="mt-1" v-for="(result, index) in userSearch?.users || []" :key="index">
          <code>
          <pre>{{ result }}</pre>
        </code>
        </div>
        <p v-if="errorUser">{{ errorUser }}</p>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VLabel from '@/components/VLabel.vue';
import VButton from '@/components/VButton.vue';
import VInput from '@/components/VInput.vue';
import {
  requestZendeskLogin,
  searchHelpCenterArticles,
  searchZendeskUser,
} from '@/services/zendeskService';
import { useAsyncState } from '@vueuse/core';

const searchQuery = ref('');
const searchUserQuery = ref('');
const searchResults = ref([]);


const {
  state: articles,
  isLoading: isLoadingKB,
  error: errorKB,
  executeImmediate: searchKB,
} = useAsyncState(
  async () => {
    if (!searchQuery.value) return null;
    clearPreviousResults();
    return searchHelpCenterArticles(searchQuery.value);
  },
  null,
  { immediate: false }
);

const {
  state: userSearch,
  isLoading: isLoadingUser,
  error: errorUser,
  executeImmediate: searchUser,
} = useAsyncState(
  async () => {
    if (!searchUserQuery.value) return null;
    return searchZendeskUser(searchUserQuery.value);
  },
  null,
  { immediate: false }
);


const clearPreviousResults = () => {
  searchResults.value = [];
  errorKB.value = '';
  articles.value = null;
};

const form = ref({
  external_id: 'john-john',
  name: 'john-john',
  email: 'john-john@test.com',
  role: 'agent',
});

const endUserJohnJohn = () => {
  form.value.external_id = 'john-user';
  form.value.name = 'John User';
  form.value.email = 'john-user@example.com';
  form.value.role = 'end_user';
  submitForm();
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
  { id: 'role', name: 'User role', type: 'text', placeholder: 'admin' },
];

const isFormInvalid = computed(
  () =>
    !form.value.external_id ||
    !form.value.name ||
    !form.value.email ||
    !form.value.role,
);

const submitForm = async () => {
  const { external_id, name, email, role } = form.value;
  if (external_id && name && email && role) {
    try {
      const data = await requestZendeskLogin({
        name,
        email,
        external_id,
        role,
      });
      resetForm();
      window.location.href = `https://z3nsuncoswitchboard.zendesk.com/access/jwt?jwt=${data.token}`;
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

const resetForm = () => {
  form.value = {
    external_id: null,
    name: null,
    email: null,
    role: null,
  };
};
</script>

<route lang="json">{
  "name": "Zendesk Tools",
  "meta": {
    "title": "Zendesk Tools"
  }
}</route>

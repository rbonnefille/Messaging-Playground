<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-lg-7 col-md-9">
        <h3 class="mb-4">JWT Generator</h3>
        <form @submit.prevent="generateJwt">
          <div class="row g-3">
            <div class="col-12">
              <VLabel
                id="keyUsername"
                name="Key Username (kid)"
                className="form-label" />
              <VInput
                id="keyUsername"
                v-model="form.keyUsername"
                name="keyUsername"
                type="text"
                placeholder="e.g. app_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                required />
            </div>
            <div class="col-12">
              <VLabel
                id="keyPassword"
                name="Key Password (secret)"
                className="form-label" />
              <VInput
                id="keyPassword"
                v-model="form.keyPassword"
                name="keyPassword"
                type="password"
                placeholder="Your secret key"
                required />
            </div>
            <div class="col-12">
              <VLabel
                id="external_id"
                name="External ID"
                className="form-label" />
              <VInput
                id="external_id"
                v-model="form.external_id"
                name="external_id"
                type="text"
                placeholder="Unique user identifier"
                required>
                <template #end>
                  <VButton
                    text="Generate"
                    type="button"
                    class="customBtn ms-2"
                    @click="generateExternalId" />
                </template>
              </VInput>
            </div>
            <div class="col-md-6">
              <VLabel id="name" name="Name (optional)" className="form-label" />
              <VInput
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                placeholder="e.g. John Doe" />
            </div>
            <div class="col-md-6">
              <VLabel
                id="email"
                name="Email (optional)"
                className="form-label" />
              <VInput
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                placeholder="e.g. john@example.com" />
            </div>
            <div class="col-md-6">
              <VLabel
                id="email_verified"
                name="Email Verified (optional)"
                className="form-label" />
              <VSelect
                id="email_verified"
                v-model="form.email_verified"
                name="email_verified"
                optionHint="— not set —"
                :options="[
                  { id: 'true', name: 'true' },
                  { id: 'false', name: 'false' },
                ]" />
            </div>
            <div class="col-md-6">
              <VLabel
                id="expiry"
                name="Expiry (seconds)"
                className="form-label" />
              <VInput
                id="expiry"
                v-model="form.expiry"
                name="expiry"
                type="number"
                placeholder="604800" />
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <VButton text="Generate JWT" type="submit" />
            <VButton
              text="Reset"
              type="button"
              class="btn-outline-secondary"
              @click="resetForm" />
          </div>
        </form>

        <div v-if="generatedJwt" class="mt-4">
          <VLabel id="jwt-output" name="Generated JWT" className="form-label" />
          <div class="position-relative">
            <textarea
              id="jwt-output"
              class="form-control font-monospace"
              rows="5"
              readonly
              :value="generatedJwt" />
          </div>
          <VButton
            text="Copy to clipboard"
            type="button"
            class="customBtn mt-2"
            @click="copyToClipboard" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  
  definePageMeta({"title":"JWT Generator"})
import { ref, reactive } from 'vue';
  import { useToast } from 'vue-toastification';
  import { useGenerateExternalId } from '@/composables/helpers';

  const toast = useToast();

  const DEFAULT_EXPIRY = 604800;

  const form = reactive({
    keyUsername: '',
    keyPassword: '',
    external_id: '',
    name: '',
    email: '',
    email_verified: '',
    expiry: String(DEFAULT_EXPIRY),
  });

  const generatedJwt = ref('');

  function generateExternalId() {
    form.external_id = useGenerateExternalId();
  }

  function base64url(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  async function generateJwt() {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiry = parseInt(form.expiry, 10) || DEFAULT_EXPIRY;

    const header = {
      alg: 'HS256',
      typ: 'JWT',
      kid: form.keyUsername,
    };

    const payload = {
      scope: 'user',
      external_id: form.external_id,
      ...(form.name && { name: form.name }),
      ...(form.email && { email: form.email }),
      ...(form.email_verified && {
        email_verified: form.email_verified === 'true',
      }),
      iat: nowInSeconds,
      exp: nowInSeconds + expiry,
    };

    const headerEncoded = base64url(JSON.stringify(header));
    const payloadEncoded = base64url(JSON.stringify(payload));
    const signingInput = `${headerEncoded}.${payloadEncoded}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(form.keyPassword);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(signingInput),
    );
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer)),
    )
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    generatedJwt.value = `${signingInput}.${signatureBase64}`;
    toast.success('JWT generated successfully');
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(generatedJwt.value);
    toast.success('JWT copied to clipboard');
  }

  function resetForm() {
    Object.assign(form, {
      keyUsername: '',
      keyPassword: '',
      external_id: '',
      name: '',
      email: '',
      email_verified: '',
      expiry: String(DEFAULT_EXPIRY),
    });
    generatedJwt.value = '';
  }
</script>


<template>
  <div class="d-flex">
    <input
      ref="inputElement"
      :value="model"
      :id="id"
      :name="name"
      :type="type"
      :class="inputClass"
      :placeholder="placeholder"
      :required="required"
      :checked="checked"
      v-bind="$attrs"
      @input="model = $event.target.value" />
    <slot name="end"></slot>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue';

  const inputElement = ref(null);

  const model = defineModel({
    type: String,
    default: '',
  });

  const props = defineProps({
    id: {
      type: String,
      default: 'input',
    },
    name: {
      type: String,
      default: 'input',
    },
    type: {
      type: String,
      default: 'input',
    },
    className: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'input',
    },
    required: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  });

  // const labelClass = computed(() => {
  //   return props.type === "checkbox" ? "form-check-label" : "form-label";
  // });

  const inputClass = computed(() => {
    return props.type === 'checkbox'
      ? 'form-check-input'
      : `form-control ${props.className}`;
  });

  const focus = () => {
    inputElement.value?.focus();
  };

  defineExpose({ focus });
</script>

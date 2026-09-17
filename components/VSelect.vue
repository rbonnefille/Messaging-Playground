<template>
  <label class="form-label">{{ label }}</label>
  <select
    :value="model"
    class="form-select form-select-sm"
    @change="model = $event.target.value"
    v-bind="$attrs">
    <option disabled value="">{{ optionHint }}</option>
    <option v-for="option in options" :key="option.id" :value="option.id">
      {{ option.name ? option.id + ' - ' + option.name : option.id || option }}
    </option>
  </select>
</template>

<script setup>
  const model = defineModel({
    type: [String, Number, Boolean, Object, Array],
    required: true,
  });

  defineProps({
    label: {
      type: String,
    },
    optionHint: {
      type: String,
      default: 'Please select one',
    },
    options: {
      type: Array,
      required: true,
    },
  });
</script>

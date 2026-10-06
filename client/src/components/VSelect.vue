<template>
  <label v-if="label" class="form-label">{{ label }}</label>
  <select v-model="model" class="form-select form-select-sm" v-bind="$attrs">
    <option disabled value="">{{ optionHint }}</option>
    <option
      v-for="(option, index) in normalizedOptions"
      :key="getOptionKey(option, index)"
      :value="getOptionValue(option)"
    >
      {{ getOptionLabel(option) }}
    </option>
  </select>
</template>

<script setup>
import { computed } from "vue";

const model = defineModel({
  type: [String, Number, Boolean, Object, Array],
  required: true,
});

const props = defineProps({
  label: {
    type: String,
  },
  optionHint: {
    type: String,
    default: "Please select one",
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: [String, Function],
    default: undefined,
  },
  optionValue: {
    type: [String, Function],
    default: undefined,
  },
});

const normalizedOptions = computed(() => props.options ?? []);

const isObject = (option) => option !== null && typeof option === "object";

const resolveOption = (option, mapper) => {
  if (typeof mapper === "function") {
    return mapper(option);
  }

  if (typeof mapper === "string") {
    return mapper
      .split(".")
      .reduce((value, property) => value?.[property], option);
  }

  return undefined;
};

const getOptionValue = (option) => {
  if (props.optionValue !== undefined) {
    return resolveOption(option, props.optionValue);
  }

  return isObject(option) && "id" in option ? option.id : option;
};

const getOptionLabel = (option) => {
  if (props.optionLabel !== undefined) {
    return resolveOption(option, props.optionLabel);
  }

  if (!isObject(option)) {
    return option;
  }

  const value = getOptionValue(option);
  const name = option.name;

  return name !== undefined && name !== null && name !== ""
    ? value !== undefined && value !== null && !isObject(value)
      ? `${value} - ${name}`
      : name
    : value;
};

const getOptionKey = (option, index) => getOptionValue(option) ?? index;
</script>

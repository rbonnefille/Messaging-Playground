const template = `
<div>
<h1>Change Province</h1>
</br>
<template v-for="province in provinces" :key="province">
    <button style="margin-bottom: 1rem;" class="c-btn c-btn--primary c-btn--sm" @click="updateProvince(province.tag)">Province {{province.value}}</button>
    </br>
</template>
</div>`;

import ZDClient from "../services/ZDClient.js";

const { ref, onMounted } = Vue;
const App = {
  template,

  setup() {
    // only required outside the template
    const ticket = ref(null);
    const provinces = ref([
      { value: "Alberta", tag: "alberta" },
      { value: "British Columbia", tag: "british_columbia" },
      { value: "Manitoba", tag: "manitoba" },
      { value: "New Brunswick", tag: "new_brunswick" },
      { value: "Newfoundland and Labrador", tag: "newfoundland_and_labrador" },
      { value: "Northwest Territories", tag: "northwest_territories" },
      { value: "Nova Scotia", tag: "nova_scotia" },
      { value: "Nunavut", tag: "nunavut" },
      { value: "Ontario", tag: "ontario" },
      { value: "Prince Edward Island", tag: "prince_edward_island" },
      { value: "Quebec", tag: "quebec" },
      { value: "Saskatchewan", tag: "saskatchewan" },
      { value: "Yukon", tag: "yukon" },
    ]);

    const updateProvince = async (province) => {
      const provinceField = await ZDClient.get(
        `ticket.customField:custom_field_${ZDClient.app.settings.PROVINCE_FIELD_ID}`,
        true
      );
      if (provinceField) ZDClient.notifyUser("Province already set", "error");

      if (!provinceField) {
        ZDClient.updateTicket(ticket.value.id, province);
      }
    };

    onMounted(async () => {
      ZDClient.resizeFrame(500);
      ZDClient.get("ticket").then(async (data) => {
        ticket.value = data.ticket;
        console.log(data.ticket);
      });
    });

    // returning here functions and variables used by your template
    return { provinces, updateProvince };
  },
};

export default App;

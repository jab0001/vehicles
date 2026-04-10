<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useMounted } from "@vueuse/core";

import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

import CompaniesCard from "@/components/companies/CompaniesCard.vue";

const isMounted = useMounted();

const { companiesManagementList } = storeToRefs(useCompaniesManagementStore());

const companies = ref([
  {
    title: "ООО «Эксперт»",
    inn: "3123394978",
    ogrn: "1163123080405",
    kpp: "312301001",
    places: [
      {
        name: "Москва Автодор",
        vehicles: [
          { name: "Deawoo Matiz", number: "М694ТВ198" },
          { name: "Deawoo Matiz", number: "М694ТВ198" },
        ],
      },
      {
        name: "Санкт-Петербург",
        vehicles: [
          { name: "Deawoo Matiz", number: "М694ТВ198" },
          { name: "Deawoo Matiz", number: "М694ТВ198" },
        ],
      },
    ],
  },
  {
    title: "ООО «Тест»",
    inn: "3123394978",
    ogrn: "1163123080405",
    kpp: "312301001",
    places: [
      {
        name: "Липецк Южный",
        vehicles: [
          { name: "Deawoo Matiz", number: "М694ТВ198" },
          { name: "Deawoo Matiz", number: "М694ТВ198" },
        ],
      },
    ],
  },
  {
    title: "ООО «Авант»",
    inn: "3123394978",
    ogrn: "1163123080405",
    kpp: "312301001",
    places: [
      {
        name: "Москва Северное",
        vehicles: [
          { name: "Deawoo Matiz", number: "М694ТВ198" },
          { name: "Deawoo Matiz", number: "М694ТВ198" },
        ],
      },
    ],
  },
]);
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[482px] mx-auto flex justify-between">
      <div class="text-md text-nowrap text-lg">
        {{ "Организации" }}
      </div>

      <!-- <el-button @click="() => {}">{{ $t("views.drivers.btnAdd") }}</el-button> -->
    </div>
  </Teleport>
  <div class="w-full max-w-[482px] mx-auto flex flex-col gap-2.5">
    <CompaniesCard v-for="company in companiesManagementList" :companyData="company" />
  </div>
</template>

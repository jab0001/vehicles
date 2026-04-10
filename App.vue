<script setup lang="ts">
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { storeToRefs } from "pinia";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserAbility, useUserProfile } from "./composables/useUser";
import { provideAbility, useAbility } from "@casl/vue";
import { useUserStore } from "./stores/userStore";
import LogRocket from "logrocket";

LogRocket.init("zhelezyaki2/zhelezyaki2");
const store = useUserStore();
const { ability } = store;
const { getCompanyName } = useCompaniesManagementStore();
const { currentCompanyId } = storeToRefs(useCompaniesManagementStore());
provideAbility(ability);

watch(currentCompanyId, (v) => {
  if (v)
    LogRocket.identify(`${v}`, {
      name: getCompanyName(v),
    });
});
</script>
<script setup lang="ts"></script>

<template>
  <router-view />
</template>

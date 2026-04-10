<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useMounted } from "@vueuse/core";
import TableIntegrations from "@/components/tables/TableIntegrations.vue";
import { useAppStore } from "@/stores/appStore";
import type { IIntegration } from "@/types/integrations";
import { useIntegrationsStore } from "@/stores/integrationsStore";
import { storeToRefs } from "pinia";
import ModalIntegrationSmsCode from "@/components/modals/ModalIntegrationSmsCode.vue";

const isMounted = useMounted();

const {
  setIntegrationsCreateHash,
  setIntegrationsDetailsHash,
} = useAppStore();

const {
  fetchIntegrations,
  clearIntegrationForm,
  manageIntegration,
} = useIntegrationsStore();

const {
  fetchIntegrationsLoading,
  integrationsResponse,
  modalSmsCodeVisible,
  integrationsFilters
} = storeToRefs(useIntegrationsStore());

const selectedId = ref();
const isSwitchOn = ref<boolean>(false);

const integrationsList = computed(() => {
  return integrationsResponse.value?.items ?? [];
});

const totalItems = computed(() => {
  return integrationsResponse.value?.total_items ?? 0;
});

const loadIntegrations = async () => {
  fetchIntegrations();
};

const handleEdit = (integration: IIntegration) => {
  setIntegrationsDetailsHash(integration.id);
};

const handleCreate = () => {
  clearIntegrationForm();
  setIntegrationsCreateHash();
};

watch(integrationsFilters, () => {
  loadIntegrations();
})

const handleToggleActive = async (integration: IIntegration) => {
  selectedId.value = integration.id;
  isSwitchOn.value = integration.enabled;
  await manageIntegration(integration.id, {
    enabled: !integration.enabled,
    sms_code: null,
  });
  loadIntegrations();
};

onMounted(() => {
  loadIntegrations();
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[720px] flex justify-between items-center mx-auto">
      <div class="text-md text-nowrap text-xl">Интеграция</div>
      <el-button type="primary" @click="handleCreate">Добавить</el-button>
    </div>
  </Teleport>

  <div class="h-full flex flex-col">
    <TableIntegrations
      v-model:pagination="integrationsFilters"
      v-loading="fetchIntegrationsLoading"
      class="max-w-[720px] h-[calc(100vh-60px)] flex flex-col pb-5 mx-auto"
      :items="integrationsList"
      :total-items="totalItems"
      :empty-text="'Интеграции не найдены'"
      border
      with-pagination
      @row-click="handleEdit"
      @toggle-active="handleToggleActive"
    />
  </div>

  <ModalIntegrationSmsCode
    v-if="modalSmsCodeVisible"
    :modal-visible="modalSmsCodeVisible"
    :item-id="selectedId"
    @close-modal="modalSmsCodeVisible = false"
    :is-switch-on="isSwitchOn"
  />
</template>

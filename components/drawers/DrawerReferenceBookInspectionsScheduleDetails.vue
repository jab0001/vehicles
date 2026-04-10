<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/appStore";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookInspectionsSchedule from "@/components/forms/FormReferenceBookInspectionsSchedule.vue";
import { computed } from "vue";
import { useInspectionsScheduleStore } from "@/stores/inspectionsScheduleStore";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";

const route = useRoute();
const { hideDrawer } = useAppStore();
const { fetchInspectionsScheduleDetails, editInspectionsSchedule } = useInspectionsScheduleStore();
const { currentCompanyId } = storeToRefs(
  useCompaniesManagementStore()
);
const { inspectionsScheduleDetailsLoading, editInspectionsScheduleLoading } = storeToRefs(
    useInspectionsScheduleStore()
);

const isDefault = computed(() => route.query.isDefault === "default");
const isEdit = true;

fetchInspectionsScheduleDetails({
  schedule_id: Number(route.hash?.split("/")[2]),
  company_id: currentCompanyId.value,
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-5">{{ isDefault ? `Стандартный план`: `Редактирование шаблона прохождения ТО` }}</h1>
    <FormReferenceBookInspectionsSchedule
      v-loading="inspectionsScheduleDetailsLoading || editInspectionsScheduleLoading"
      :isDefault
      :isEdit
    >
      <template #footer>
        <div class="w-full flex items-center justify-end">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="editInspectionsSchedule"
            >Сохранить</el-button
          >
        </div>
      </template>
    </FormReferenceBookInspectionsSchedule>
  </UiDrawerWrapper>
</template>

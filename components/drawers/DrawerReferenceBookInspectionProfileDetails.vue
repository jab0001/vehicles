<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/appStore";
import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import FormReferenceBookInspectionsSchedule from "@/components/forms/FormReferenceBookInspectionsSchedule.vue";
import { useInspectionsScheduleStore } from "@/stores/inspectionsScheduleStore";
import FormReferenceBookRole from "../forms/FormReferenceBookRole.vue";
import InspectionProfileForm from "../forms/InspectionProfileForm.vue";
import { useInspectionProfiles } from "@/composables/useInspectionProfiles";
import { useRoute } from "vue-router";
import { ref } from "vue";
import { useInspectionProfilesStore } from "@/stores/inspectionProfilesStore";

const { hideDrawer } = useAppStore();
const route = useRoute();
const { fetchInspectionProfiles } = useInspectionProfilesStore();
const { inspectionProfileDetailsLoading } = storeToRefs(
  useInspectionProfilesStore()
);
const { fetchInspectionProfileDetails, inspectionProfileDetailsResult } =
  useInspectionProfiles();
const formRef = ref();

const submit = async () => {
  try {
    await formRef.value?.handleSubmit();
    fetchInspectionProfiles();
    hideDrawer();
  } catch (err) {
    console.error(err);
  }
};

fetchInspectionProfileDetails({
  profile_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <h1 class="text-lg font-medium mb-5">
      Редактировать профиль проведения осмотра
    </h1>
    <InspectionProfileForm
      ref="formRef"
      v-if="inspectionProfileDetailsResult"
      :profile="inspectionProfileDetailsResult"
      v-loading="inspectionProfileDetailsLoading"
    >
      <template #footer>
        <div class="w-full flex items-center justify-end mt-8">
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="submit"> Сохранить </el-button>
        </div>
      </template>
    </InspectionProfileForm>
  </UiDrawerWrapper>
</template>

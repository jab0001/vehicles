<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/UseAuth";

const router = useRouter();
const { appDriverCompanyGroups, fetchCompanyGroups, chooseCompanyGroup } =
  useAuth();

const setCompany = async (id: string) => {
  await chooseCompanyGroup({ company_group_id: Number(id) });
  router.push({ name: "AppDriverDashboard" });
};

fetchCompanyGroups();
</script>

<template>
  <div class="w-full">
    <h6 class="mb-4 text-[var(--text-color-secondary)] text-center font-medium">
      Вы подключены к нескольким компаниям
    </h6>

    <h5 class="mb-8 text-black text-lg text-center font-medium">
      Выберите ту компанию, по которой сейчас хотите совершать действия
    </h5>

    <div class="flex flex-col gap-1.5">
      <div
        class="flex items-center py-3 px-5 gap-4 bg-white rounded-xl text-[#409EFF]"
        v-for="(company, id) in appDriverCompanyGroups?.company_groups"
        @click="setCompany(id)"
      >
        <p class="text-base truncate">{{ company }}</p>
        <el-icon size="20" color="#409EFF"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

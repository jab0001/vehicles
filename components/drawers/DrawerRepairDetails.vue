<script setup lang="ts">
import { ElNotification } from "element-plus";

import { useAppStore } from "@/stores/appStore";

import UiDrawerWrapper from "@/components/ui/UiDrawerWrapper.vue";
import RepairInfo from "@/components/repair/RepairInfo.vue";
import { useRepairsStore } from "@/stores/repairsStore";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { onUnmounted, watch } from "vue";

const { hideDrawer } = useAppStore();
const { createRepair, fetchList, detailRequest, updateRepair } =
  useRepairsStore();
const { form, detailResult } = storeToRefs(useRepairsStore());
const route = useRoute();
// const showInDevMsg = () => {
//   ElNotification({
//     message: "Раздел в разработке...",
//     type: "info",
//   });
// };
const onSave = async () => {
  updateRepair(form.value)
    .then(() => {
      fetchList();
      ElNotification({
        message: "Успешный запрос",
        type: "success",
      });
      hideDrawer();
    })
    .catch((err) => {
      ElNotification({
        title: "Error",
        message: err.data?.user_message || "Ошибка обновления ремонта",
        type: "error",
      });
      console.error(err);
    });
  // createRepair()
  //   .then(() => {
  //     fetchList();
  //     ElNotification({
  //       message: "Успешный запрос",
  //       type: "success",
  //     });
  //     hideDrawer();
  //   })
  //   .catch((err) => {
  //     ElNotification({
  //       title: "Error",
  //       message: err.data?.user_message || "Ошибка удаления выходного дня",
  //       type: "error",
  //     });
  //     console.error(err);
  //   });
};

detailRequest({
  repair_id: Number(route.hash?.split("/")[2]),
});
</script>

<template>
  <UiDrawerWrapper>
    <RepairInfo>
      <template #footer>
        <div>
          <el-button @click="hideDrawer">Отменить</el-button>
          <el-button type="primary" @click="onSave">Сохранить</el-button>
        </div>
      </template>
    </RepairInfo>
  </UiDrawerWrapper>
</template>

<style scoped>
:deep(.el-main) {
  padding: 0 !important;
}
</style>

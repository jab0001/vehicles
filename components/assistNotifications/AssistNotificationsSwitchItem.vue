<script lang="ts" setup>
import {
  ASSIST_NOTIFICATIONS_KM_TYPES,
  useAssistNotifications,
  type IAssistNotification,
} from "@/composables/useAssistNotifications";
import { computed, ref, watch } from "vue";
import AssistNotificationsUpdateForm from "./AssistNotificationsUpdateForm.vue";
import UiDrawerEl from "../ui/UiDrawerEl.vue";
import dayjs from "dayjs";
import { declOfNum } from "@/helpers/format.helpers";

const emit = defineEmits(["change"]);

const {
  item,
  annotation = false,
  notificationRegion,
} = defineProps<{
  item: IAssistNotification;
  annotation?: boolean;
  notificationRegion: "user" | "drivers";
}>();
const activeItem = ref<IAssistNotification>();
const kmMode = ref(
  ASSIST_NOTIFICATIONS_KM_TYPES.includes(item.notification_type)
);

const {
  getAssistNotificationTypeName,
  updateAssistNotification,
  updateAssistNotificationResponse,
  updateAssistNotificationError,
  updateAssistNotificationLoading,
} = useAssistNotifications();
watch(
  [updateAssistNotificationResponse, updateAssistNotificationError],
  ([res, err]) => {
    if (res && !err) {
      emit("change");
    }
  }
);
</script>

<template>
  <div class="flex items-center py-3">
    <div class="flex-1">
      <div class="flex gap-2">
        <div
          class="text-blue-400 font-medium text-sm cursor-pointer"
          @click="activeItem = item"
        >
          {{ getAssistNotificationTypeName(item.notification_type) }}
        </div>
        <div v-if="!annotation">
          {{ dayjs(item.notify_at_localtime, "HH:mm:ss").format("HH:mm") }}
        </div>
      </div>
      <div v-if="annotation" class="flex gap-2">
        <div>
          {{ dayjs(item.notify_at_localtime, "HH:mm:ss").format("HH:mm") }}
        </div>
        <div class="text-slate-500 text-sm">
          {{
            item.items
              .map((v) => {
                let res = ``;
                let metrica = kmMode
                  ? "км"
                  : declOfNum(Math.abs(v.condition), ["день", "дня", "дней"]);
                if (v.condition > 0)
                  res += `За ${Math.abs(v.condition)} ${metrica}`;
                if (v.condition == 0) {
                  if (kmMode) {
                    res += `В момент наступления`;
                  } else {
                    res += `В день истечения`;
                  }
                }
                if (v.condition < 0)
                  res += `${Math.abs(v.condition)} ${metrica} после`;
                return res;
              })
              .join(" · ")
          }}
          <template v-if="item.notify_at_days">
            {{
              item.notify_at_days.length == 7
                ? "Каждый день"
                : item.notify_at_days
                    .map((v) => {
                      if (v == 1) return "Пн";
                      if (v == 2) return "Вт";
                      if (v == 3) return "Ср";
                      if (v == 4) return "Чт";
                      if (v == 5) return "Пт";
                      if (v == 6) return "Сб";
                      if (v == 7) return "Вс";
                    })
                    .join(" · ")
            }}
          </template>
        </div>
      </div>
    </div>
    <div>
      <el-switch
        :model-value="item.enabled"
        :loading="updateAssistNotificationLoading"
        @change="
          (v) =>
            updateAssistNotification({
              ...item,
              notification_region: notificationRegion,
              enabled: Boolean(v),
            }).then((res) => {
              item.enabled = res.enabled;
            })
        "
      ></el-switch>
    </div>
  </div>
  <UiDrawerEl
    :model-value="!!activeItem"
    size="500px"
    @close="activeItem = undefined"
  >
    <div class="p-4">
      <h1 class="text-lg font-medium">
        {{ getAssistNotificationTypeName(activeItem?.notification_type) }}
      </h1>
      <AssistNotificationsUpdateForm
        v-if="activeItem"
        v-model="activeItem"
      ></AssistNotificationsUpdateForm>
    </div>

    <div ref="footerRef" class="footer flex justify-end p-4">
      <el-button @click="activeItem = undefined"> Отмена </el-button>
      <el-button
        type="primary"
        :loading="updateAssistNotificationLoading"
        @click="
          updateAssistNotification({
            ...activeItem,
            notification_region: notificationRegion,
          })
        "
      >
        Сохранить
      </el-button>
    </div>
  </UiDrawerEl>
</template>

<style scoped>
:deep(.el-drawer__header) {
  margin-bottom: 0 !important;
}
</style>

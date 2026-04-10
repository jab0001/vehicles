<script setup lang="ts">
import AssistNotificationsSwitchItem from "@/components/assistNotifications/AssistNotificationsSwitchItem.vue";
import { useAssistNotifications } from "@/composables/useAssistNotifications";

const NOTIFICATION_REGION = "drivers";

const {
  fetchAssistNotifications,
  availableFinesAssistNotifications,
  availableDocumentsAssistNotifications,
  availableDocumentsDriverAssistNotifications,
  availableReportsAssistNotifications,
  availableTollroadAssistNotifications,
  availableInspectionAssistNotifications,
} = useAssistNotifications();
function refresh() {
  fetchAssistNotifications({
    notification_region: NOTIFICATION_REGION,
  });
}
refresh();
</script>

<template>
  <div class="w-full">
    <div class="max-w-[656px] mx-auto flex flex-col gap-4 pb-2 mb-[62px]">
      <div class="container">
        <div class="divide-y">
          <div class="font-medium text-sm mb-3">Сроки действия документов</div>
          <AssistNotificationsSwitchItem
            v-for="item in availableDocumentsDriverAssistNotifications"
            :item="item"
            :notification-region="NOTIFICATION_REGION"
            @change="refresh"
            annotation
          >
          </AssistNotificationsSwitchItem>
        </div>
      </div>
      <div class="container">
        <div class="divide-y">
          <div class="font-medium text-sm mb-3">Штрафы</div>
          <AssistNotificationsSwitchItem
            v-for="item in availableFinesAssistNotifications"
            :item="item"
            :notification-region="NOTIFICATION_REGION"
            @change="refresh"
          >
          </AssistNotificationsSwitchItem>
        </div>
      </div>
      <div class="container">
        <div class="divide-y">
          <AssistNotificationsSwitchItem
            v-for="item in availableInspectionAssistNotifications"
            :item="item"
            :notification-region="NOTIFICATION_REGION"
            @change="refresh"
            annotation
          >
          </AssistNotificationsSwitchItem>
        </div>
      </div>
      <div class="container">
        <div class="divide-y">
          <div class="font-medium text-sm mb-3">Платные дороги</div>
          <AssistNotificationsSwitchItem
            v-for="item in availableTollroadAssistNotifications"
            :item="item"
            :notification-region="NOTIFICATION_REGION"
            @change="refresh"
          >
          </AssistNotificationsSwitchItem>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  background: var(--fill-color);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}
</style>

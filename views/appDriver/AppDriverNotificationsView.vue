<script setup lang="ts">
import { useNotifications } from "@/composables/useNotifications";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import UiEmptyItems from "@/components/ui/UiEmptyItems.vue";
import NotificationsItem from "@/components/notifications/NotificationsItem.vue";
import InfinityLoad from "@/components/InfinityLoad.vue";

const {
  fetchNotificationList,
  loadMoreNotifications,
  readNotification,
  notificationsList,
  notificationsListLoading,
  totalPages,
  params,
} = useNotifications();

fetchNotificationList(params);
</script>
<template>
  <div class="flex-1 flex flex-col gap-4 p-4">
    <AppDriverMainHeader title="Уведомления" />
    <InfinityLoad
      class="w-full bg-white shadow-app-driver rounded-xl flex flex-col overflow-y-auto divide-y"
      @load-more="loadMoreNotifications"
    >
      <NotificationsItem
        v-for="item in notificationsList"
        :key="item.id"
        :type="item.event_type"
        :title="item.title"
        :message="item.message"
        :seen="Boolean(item.read_at)"
        description="19.09.2024 в 06:51"
        class="px-5"
        @click="readNotification(item)"
      />

      <template #target>
        <el-skeleton v-if="totalPages > params.page" animated :count="2">
          <template #template>
            <div class="py-3 flex gap-3">
              <el-skeleton-item variant="p" class="mt-1" style="width: 10%" />
              <div class="flex-1">
                <el-skeleton-item variant="p" style="width: 60%" />
                <el-skeleton-item variant="text" />
                <el-skeleton-item variant="text" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </template>
    </InfinityLoad>

    <UiEmptyItems
      v-if="!notificationsList.length && !notificationsListLoading"
      :text="'Уведомлений нет, пока что...'"
      primaryColor
    />
  </div>
</template>

<style scoped></style>

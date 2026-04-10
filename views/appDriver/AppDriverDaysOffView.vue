<script setup lang="ts">
import { dayjs, ElNotification } from "element-plus";
import { ref, onMounted, watch } from "vue";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import type { CalendarDateType, CalendarInstance } from "element-plus";
import { useAppDriverDaysOff } from "@/composables/useAppDriver";

import AppDriverMainHeader from "@/components/appDriver/AppDriverMainHeader.vue";
import DayOffIcon from "@/components/icons/DayOff.vue";

const {
  driverDaysOffDetailsLoading,
  driverDaysOffDetails,
  fetchDriverDaysOffDetails,

  daysOffLoading,
  fetchDaysOffList,

  creareDayOffLoading,
  creareDayOffDataError,
  creareDayOffRequest,

  deleteDayOffLoading,
  deleteDayOffDataError,
  deleteDayOff,
} = useAppDriverDaysOff();
const calendar = ref<CalendarInstance>();
const checkedDates = ref<string[]>([]);
const monthStats = ref();

const selectDate = (val: CalendarDateType) => {
  if (!calendar.value) return;
  calendar.value.selectDate(val);
  // @ts-ignore
  fetchDaysOff(calendar.value?.selectedDay?.$d);
  // console.log('selectDate',calendar.value?.selectedDay?.$d);
};
const isDateChecked = (date: Date) => {
  const dateString = dayjs(date).format("YYYY-MM-DD");
  return checkedDates.value.includes(dateString);
};

const toggleDate = (date: Date) => {
  if (
    dayjs(date).isBefore(dayjs(), "day") ||
    creareDayOffLoading.value ||
    deleteDayOffLoading.value
  ) {
    return;
  }

  const dateString = dayjs(date).format("YYYY-MM-DD");
  const index = checkedDates.value.indexOf(dateString);

  if (index === -1) {
    creareDayOffRequest({
      day_off_date: dateString,
    })
      .then(() => {
        checkedDates.value = [...checkedDates.value, dateString];
      })
      .catch((error) => {
        ElNotification({
          title: "Error",
          message:
            creareDayOffDataError.value?.message ||
            "Ошибка создания выходного дня",
          type: "error",
        });
        return;
      });
  } else {
    deleteDayOff({
      day_off_date: dateString,
    })
      .then(() => {
        checkedDates.value = checkedDates.value.filter((d) => d !== dateString);
      })
      .catch((error) => {
        ElNotification({
          title: "Error",
          message:
            deleteDayOffDataError.value?.message ||
            "Ошибка удаления выходного дня",
          type: "error",
        });
        return;
      });
  }
};

const fetchDaysOff = (day?: string) => {
  const currentDate = dayjs(day);
  fetchDaysOffList({
    date_gte: currentDate.subtract(1, "month").date(15).format("YYYY-MM-DD"),
    date_lt: currentDate.add(1, "month").date(15).format("YYYY-MM-DD"),
  }).then((result) => {
    if (result.days_off?.length) {
      checkedDates.value = [...result.days_off.map((d) => d.day_off_date)];
    }
    if (result.month_stats?.length) {
      const currentMonth = dayjs(day).format("MM");
      monthStats.value = result.month_stats.find(
        (item) => dayjs(item.month).format("MM") === currentMonth
      );
    }
  });
  fetchDriverDaysOffDetails();
};

onMounted(() => fetchDaysOff());
</script>

<template>
  <div class="flex flex-col gap-4 p-4 flex-grow">
    <AppDriverMainHeader title="График работы" />

    <div>
      <el-calendar v-loading="daysOffLoading" ref="calendar">
        <template #header="{ date }">
          <div class="w-full">
            <div class="flex items-center justify-center gap-3">
              <el-icon @click="selectDate('prev-month')" color="#409EFF"
                ><ArrowLeft
              /></el-icon>
              <span class="text-base">{{ date }}</span>
              <el-icon @click="selectDate('next-month')" color="#409EFF"
                ><ArrowRight
              /></el-icon>
            </div>
            <p class="text-center text-[var(--text-color-secondary)] text-xs">
              Выберите выходные дни
            </p>
          </div>
        </template>

        <template #date-cell="{ data }">
          <div
            class="flex flex-col gap-2 py-2 items-center justify-between h-full"
            :class="{
              'bg-[#F0F9EB]':
                isDateChecked(data.date) &&
                !dayjs(data.date).isBefore(dayjs(), 'day'),
              'bg-[#F0F2F5]': dayjs(data.date).isBefore(dayjs(), 'day'),
              'bg-white':
                !dayjs(data.date).isBefore(dayjs(), 'day') &&
                !isDateChecked(data.date),
            }"
            @click="toggleDate(data.date)"
          >
            <div
              :class="{
                'text-[#67C23A]':
                  isDateChecked(data.date) &&
                  !dayjs(data.date).isBefore(dayjs(), 'day'),
                'text-[#C0C4CC]': dayjs(data.date).isBefore(dayjs(), 'day'),
              }"
            >
              {{ dayjs(data.day).format("DD") }}
            </div>

            <DayOffIcon
              v-if="isDateChecked(data.date)"
              :active="
                isDateChecked(data.date) &&
                !dayjs(data.date).isBefore(dayjs(), 'day')
              "
            />

            <!-- <el-checkbox
              :class="{
                'checkbox-active': !dayjs(data.date).isBefore(dayjs(), 'day'),
              }"
              :disabled="dayjs(data.date).isBefore(dayjs(), 'day')"
              :model-value="isDateChecked(data.date)"
            ></el-checkbox> -->
          </div>
        </template>
      </el-calendar>
    </div>

    <div v-if="driverDaysOffDetails" v-loading="daysOffLoading" class="divide-y rounded-xl bg-white">
      <div class="flex items-center justify-between px-4 py-2.5">
        <p>Всего выходных дней в месяц</p>
        <p>{{ driverDaysOffDetails?.max_days_off_in_month }}</p>
      </div>
      <div class="flex items-center justify-between px-4 py-2.5">
        <p>Выходных дней в неделю</p>
        <p>максимум {{ driverDaysOffDetails?.max_days_off_in_week }}</p>
      </div>
      <div class="flex items-center justify-between px-4 py-2.5">
        <p>Рабочих дней подряд</p>
        <p>минимум {{ driverDaysOffDetails?.min_work_days_streak }}</p>
      </div>
      <div
        v-if="monthStats"
        class="flex items-center justify-between px-4 py-2.5"
      >
        <p>Вы использовали</p>
        <p>{{ monthStats?.closed_day_off_in_month || 0 }}</p>
      </div>
    </div>

    <!-- <el-button class="h-14 rounded-xl text-base" size="large" type="primary"
      >Сохранить</el-button
    > -->
  </div>
</template>

<style scoped>
:deep(.el-calendar) {
  background-color: transparent;
}
:deep(.el-calendar__header) {
  padding: 0;
  border-bottom: none;
}
:deep(.el-calendar__body) {
  padding: 0;
}
:deep(.el-calendar-day) {
  height: 69px;
  padding: 0;
}
:deep(.checkbox-active .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #67c23a;
  border-color: #67c23a;
}
:deep(.prev) {
  @apply pointer-events-none;
}
:deep(.next) {
  @apply pointer-events-none;
}

:deep(.el-loading-mask) {
  background-color: rgb(0 0 0 / 0%);
  backdrop-filter: blur(1px);
}
</style>

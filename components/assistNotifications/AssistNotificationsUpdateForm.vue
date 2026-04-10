<script lang="ts" setup>
import {
  ASSIST_NOTIFICATIONS_DAYS_TYPES,
  ASSIST_NOTIFICATIONS_KM_TYPES,
  type IAssistNotification,
  type IAssistNotificationItem,
} from "@/composables/useAssistNotifications";
import { useHelpers } from "@/composables/useHelpers";
import {
  declOfNum,
  formatCurrency,
  formatDecimal,
  formatWithoutCurrency,
} from "@/helpers/format.helpers";
import { Delete, Plus, Clock } from "@element-plus/icons-vue";
import { dayjs, ElNotification } from "element-plus";
import { computed, reactive, ref, watch } from "vue";

const item = defineModel<IAssistNotification>({ required: true });
const { numberIntKeydownMask } = useHelpers();
const daysMode = ref(
  ASSIST_NOTIFICATIONS_DAYS_TYPES.includes(item.value.notification_type)
);
const kmMode = ref(
  ASSIST_NOTIFICATIONS_KM_TYPES.includes(item.value.notification_type)
);

const time = ref(
  dayjs(item.value.notify_at_localtime, "HH:mm:ss").format("HH:mm")
);
watch(time, (v) => {
  console.log({ v });
  item.value.notify_at_localtime = dayjs(v, "HH:mm").format("HH:mm:ss");
});

const channels = reactive({
  telegram: item.value.channels.includes("telegram"),
  email: item.value.channels.includes("email"),
});
watch(channels, (v) => {
  console.log({ v });
  item.value.channels = [];
  if (v.telegram) item.value.channels.push("telegram");
  if (v.email) item.value.channels.push("email");
});

const conditions = ref<Pick<IAssistNotificationItem, "condition">[]>(
  item.value.items
);
watch(conditions, (v) => {
  console.log({ v });
  item.value.items = conditions.value;
});

const notifyAtDays = ref<number[]>(item.value.notify_at_days);
watch(notifyAtDays, (v) => {
  console.log({ v });
  item.value.notify_at_days = v;
});

const addModalVisible = ref(false);
const newNotificationDays = ref<number>();

const getConditionText = (condition: number): string => {
  let res = ``;
  let metrica = kmMode.value
    ? "км"
    : declOfNum(Math.abs(condition), ["день", "дня", "дней"]);
  if (condition > 0)
    res += `За ${formatWithoutCurrency(Math.abs(condition))} ${metrica} до `;
  if (condition === 0) {
    if (kmMode.value) {
      res += `В момент `;
    } else {
      res += `В день `;
    }
  }
  if (condition < 0)
    res += `${formatWithoutCurrency(Math.abs(condition))} ${metrica} после `;

  if (
    item.value.notification_type == "FINE_NOT_PAID_IN_GIBDD_DISCOUNT_EXPIRATION"
  )
    res += `истечения скидки в ГИБДД`;
  else if (
    item.value.notification_type == "FINE_NOT_PAID_IN_GIBDD_TRANSFER_TO_FBS"
  )
    res += `передачи в ФССП`;
  else if (kmMode.value) res += `наступления`;
  else res += `истечения`;

  return res;
};

const handleDelete = (condition: number) => {
  conditions.value = conditions.value.filter((v) => v.condition !== condition);
};

const handleAdd = () => {
  addModalVisible.value = true;
};

const handleCancel = () => {
  addModalVisible.value = false;
};

const handleConfirmAdd = () => {
  let value = newNotificationDays.value;
  if (dayValue.value == "custom" && !value) {
    ElNotification.error("Значение должно быть заполнено");
    return;
  }
  if (typeof value !== "undefined") {
    if (conditionTypeValue.value == "after") {
      value = -value;
    }
    if (!conditions.value.some((v) => v.condition == value)) {
      conditions.value = [...conditions.value, { condition: value }];
      newNotificationDays.value = undefined;
      addModalVisible.value = false;
    } else {
      ElNotification.error({
        message: "Такое уведомление уже существует",
      });
    }
  }
};

const handleUpdateNotifyAtDays = (v: number) => {
  if (notifyAtDays.value.includes(v)) {
    notifyAtDays.value = notifyAtDays.value.filter((item) => item !== v);
  } else {
    notifyAtDays.value = [...notifyAtDays.value, v];
  }
};

// Options for the days dropdown
const dayValue = ref<string>();
const daysOptions = kmMode.value
  ? [
      { value: "1000", label: "1 000 км" },
      { value: "500", label: "500 км" },
      { value: "250", label: "250 км" },
      { value: "100", label: "100 км" },
      { value: "custom", label: "Ввести вручную" },
    ]
  : [
      { value: "30", label: "30 дней" },
      { value: "14", label: "14 дней" },
      { value: "7", label: "7 дней" },
      { value: "3", label: "3 дня" },
      { value: "1", label: "1 день" },
      { value: "custom", label: "Ввести вручную" },
    ];
watch(dayValue, (v) => {
  if (v)
    if (v == "custom") {
      newNotificationDays.value = undefined;
    } else {
      newNotificationDays.value = parseInt(v);
    }
});

const conditionTypeValue = ref<string>();
const conditionTypeOptions = kmMode.value
  ? [
      { value: "before", label: "До наступления" },
      { value: "current", label: "В момент наступления" },
      { value: "after", label: "После наступления" },
    ]
  : [
      { value: "before", label: "До истечения" },
      { value: "current", label: "В день истечения" },
      { value: "after", label: "После истечения" },
    ];
watch(conditionTypeValue, (v) => {
  if (v)
    if (v == "current") {
      newNotificationDays.value = 0;
    } else {
      dayValue.value = undefined;
      newNotificationDays.value = undefined;
    }
});
</script>

<template>
  <div class="assist-notifications-form">
    <div class="flex gap-6 mb-4">
      <div>
        <div class="text-sm text-[#606266] mb-2">Время отправления</div>

        <el-time-picker
          v-model="time"
          placeholder="00:00"
          format="HH:mm"
          value-format="HH:mm"
        />
        <!-- <el-input v-model="time" placeholder="Время" class="w-36">
          <template #prefix>
            <el-icon><Clock /></el-icon>
          </template>
        </el-input> -->
      </div>
      <div>
        <div class="text-sm text-[#606266] mb-2">Каналы уведомлений</div>
        <div class="flex">
          <el-checkbox v-model="channels.telegram" label="Telegram" />
          <el-checkbox v-model="channels.email" label="Email" />
        </div>
      </div>
    </div>

    <div class="notifications-list">
      <div
        v-for="notification in conditions"
        class="notification-item p-4 border border-[#EBEEF5] rounded-md mb-4"
      >
        <div class="flex justify-between items-center">
          <div class="font-medium">
            {{ getConditionText(notification.condition) }}
          </div>
          <el-button
            type="primary"
            text
            @click="handleDelete(notification.condition)"
            class="text-[#409EFF]"
          >
            <el-icon class="mr-1"><Delete /></el-icon>
            Удалить
          </el-button>
        </div>
      </div>

      <div v-if="daysMode">
        <div class="text-sm text-[#606266] mb-2">День отправления</div>
        <div class="flex flex-col">
          <el-checkbox
            :model-value="notifyAtDays.includes(1)"
            @click="handleUpdateNotifyAtDays(1)"
            >Понедельник</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(2)"
            @click="handleUpdateNotifyAtDays(2)"
            >Вторник</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(3)"
            @click="handleUpdateNotifyAtDays(3)"
            >Среда</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(4)"
            @click="handleUpdateNotifyAtDays(4)"
            >Четверг</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(5)"
            @click="handleUpdateNotifyAtDays(5)"
            >Пятница</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(6)"
            @click="handleUpdateNotifyAtDays(6)"
            >Суббота</el-checkbox
          >
          <el-checkbox
            :model-value="notifyAtDays.includes(7)"
            @click="handleUpdateNotifyAtDays(7)"
            >Воскресенье</el-checkbox
          >
        </div>
      </div>

      <el-button
        v-if="!daysMode"
        type="primary"
        text
        @click="handleAdd"
        class="text-[#409EFF] flex items-center"
      >
        <el-icon class="mr-1"><Plus /></el-icon>
        Добавить
      </el-button>
    </div>

    <!-- Add Notification Modal -->
    <el-dialog
      v-model="addModalVisible"
      title="Добавление уведомления"
      width="430px"
      align-center
      :show-close="true"
    >
      <div class="py-4">
        <div class="mb-4">
          <div class="text-sm text-[#606266] mb-2">Вид срока уведомления</div>
          <el-select
            v-model="conditionTypeValue"
            placeholder="Не заполнено"
            class="w-full"
          >
            <el-option
              v-for="option in conditionTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div
          v-if="conditionTypeValue && conditionTypeValue != 'current'"
          class="mb-4"
        >
          <div class="text-sm text-[#606266] mb-2">
            Количество {{ kmMode ? "километров" : "дней" }}
          </div>
          <el-select
            v-model="dayValue"
            placeholder="Не заполнено"
            class="w-full"
          >
            <el-option
              v-for="option in daysOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div
          v-if="dayValue == 'custom' && conditionTypeValue != 'current'"
          class="mb-4"
        >
          <div class="text-sm text-[#606266] mb-2">Значение</div>
          <el-input
            v-model="newNotificationDays"
            :placeholder="
              kmMode ? 'Введите расстояние' : 'Введите количество дней'
            "
            @keydown="numberIntKeydownMask"
          >
          </el-input>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="handleCancel">Отменить</el-button>
          <el-button type="primary" @click="handleConfirmAdd"
            >Добавить</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.assist-notifications-form {
  padding: 1rem 0;
}

.notification-item {
  background-color: white;
}
</style>

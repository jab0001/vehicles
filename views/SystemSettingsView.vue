<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMounted } from "@vueuse/core";
import { onBeforeRouteLeave } from "vue-router";
import { VueDraggableNext } from "vue-draggable-next";
import _ from "lodash";
import { formatDecimal, formatWithoutCurrency } from "@/helpers/format.helpers";
import { useBalanceOperations } from "@/composables/useBalanceOperations";
import { useUser } from "@/composables/useUser";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
import SettingsAutoForm from "@/components/settings/SettingsAutoForm.vue";
import SettingsAccrualDamageForm from "@/components/settings/SettingsAccrualDamageForm.vue";
import { useSettings } from "@/composables/useSettings";
import { ElNotification } from "element-plus";
import { Warning } from "@element-plus/icons-vue";

const isMounted = useMounted();
const { fetchSettings, settings, updateSettings } = useSettings();
fetchSettings();

const damageFormRef = ref<InstanceType<
  typeof SettingsAccrualDamageForm
> | null>(null);

const { userProfileLocalCurrencySymbol } = storeToRefs(useUserStore());
const { optionsOperationCategories } = useBalanceOperations();

const filteredArticles = computed(() =>
  optionsOperationCategories.filter((item) => item.key !== "transfer")
);

const filteredArticlesSalaryStatements = computed(() => {
  const articles = [
    ...optionsOperationCategories,
    {
      label: "Не сдано наличных",
      key: "not_deposited_cash",
    },
  ];
  return articles.filter((item) => item.key !== "transfer");
});

const trustedMiliageOptions = [
  {
    key: 50,
    label: "Осмотр из приложения водителя",
  },
  {
    key: 101,
    label: "Старлайн OBD",
  },
  {
    key: 201,
    label: "ГЛОНАСС.SOFT",
  }
];

const initialSettingsForm = {
  value1: "",
  amount: "",
  percent: "",
  operations: [...filteredArticles.value],
  acquiringOperations: [],
};
const form = ref({
  ...initialSettingsForm,
});
const dialogVisible = ref(false);
const SettingsAutoFineFormRef = ref();
const SettingsAutoTollRoadFormRef = ref();
const discount_days_switcher = ref(false);
const userTouchedSwitcher = ref(false);

watch(discount_days_switcher, (isOn) => {
  if (!settings.value) return;
  if (!userTouchedSwitcher.value) return;

  if (isOn) {
    settings.value.fine_discount_offset_days = 5;
  } else {
    settings.value.fine_discount_offset_days = 10000;
  }

  userTouchedSwitcher.value = false;
});

watch(
  () => settings.value?.fine_discount_offset_days,
  (v) => {
    if (v == null) return;
    if (v < 10000 && settings.value) {
      discount_days_switcher.value = true;
    }

    if (v === 10000 && settings.value) {
      discount_days_switcher.value = false;
      settings.value.fine_discount_offset_days = 10000;
    }
  },
  { immediate: true }
);

const accrualTime = computed(() => {
  const val = settings.value?.accrual_processing_time_local;
  return val ? val.match(/\d{2}:\d{2}/)?.[0] ?? "" : "";
});

const onSave = async () => {
  try {
    await updateSettings(settings.value);
    ElNotification.success("Настройки сохранены");
  } catch (error: any) {
    ElNotification({
      message:
        error.data?.user_message ??
        "Ошибка при сохранении настроек. Обратитесь к администратору.",
      type: "error",
    });
  }
  SettingsAutoFineFormRef.value.saveSettings();
  SettingsAutoTollRoadFormRef.value.saveSettings();
};

let resolveLeave: ((leave: boolean) => void) | null = null;
const onStay = () => {
  if (resolveLeave) resolveLeave(false);
};
const onLeave = () => {
  if (resolveLeave) resolveLeave(true);
};

onBeforeRouteLeave((to, from, next) => {
  if (!_.isEqual(initialSettingsForm, form.value)) {
    dialogVisible.value = true;
    resolveLeave = (leave) => {
      dialogVisible.value = false;
      next(leave);
    };
  } else {
    next();
  }
});

const advancePercentage = computed<string>({
  get() {
    return settings.value?.salary_statements_advance_percentage ?? "0";
  },
  set(value) {
    if (!settings.value) return;

    if (value === "" || value == null) {
      settings.value.salary_statements_advance_percentage = "0";
      return;
    }

    const numeric = Number(value.replace(/\D/g, ""));

    const clamped = Math.min(Math.max(numeric, 0), 100);

    settings.value.salary_statements_advance_percentage = String(clamped);
  },
});
</script>

<template>
  <Teleport v-if="isMounted" to="#header">
    <div class="w-full max-w-[656px] mx-auto flex justify-between">
      <div class="text-md text-nowrap text-lg">
        {{ "Общие настройки" }}
      </div>
    </div>
  </Teleport>

  <div class="w-full">
    <div class="max-w-[656px] mx-auto flex flex-col gap-4 pb-2 mb-[62px]">
      <!-- <div class="container">
        <p class="text-sm font-medium mb-3">Время списания аренды</p>
        <el-time-picker
          v-model="form.value1"
          format="HH:mm"
          style="width: 100%"
          placeholder="09:00"
        />
      </div> -->

      <div class="container">
        <p class="text-sm font-medium mb-3">Приоритет погашения статей</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Расположите статьи для погашения в порядке приоритета от важного к
            менее значимому:
          </p>
        </div>
        <VueDraggableNext v-model="form.operations">
          <div
            v-for="(element, idx) in form.operations"
            :key="element.key"
            class="w-full flex items-center gap-1 mb-1 last:mb-0 hover:cursor-move"
          >
            <p class="w-4">{{ idx + 1 }}</p>
            <p class="flex-1 px-3 py-1.5 bg-white rounded">
              {{ element.label }}
            </p>
          </div>
        </VueDraggableNext>
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">Время начисления списания</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <!-- <p>
            Выберите статьи, которые водитель сможет оплатить через приложение
          </p> -->
        </div>
        <el-time-select
          v-model="accrualTime"
          start="00:00"
          step="00:15"
          end="23:45"
          format="HH:mm"
          placeholder="Выберите"
          class="w-[130px]"
          disabled
        />
      </div>

      <div class="container" v-if="settings">
        <div class="flex items-center py-3">
          <div class="flex-1">
            <div class="font-medium text-sm flex items-center gap-2">
              Смещать интервал ТО по факту выполнения
            </div>
          </div>
          <div>
            <el-switch
              v-model="settings.absolute_technical_inspection_mileage"
              :active-value="false"
              :inactive-value="true"
            ></el-switch>
          </div>
        </div>
        <div
          v-if="!settings.absolute_technical_inspection_mileage"
          class="bg-[#fff] text-[#303133] p-4 rounded-lg mb-5"
        >
          <p class="text-sm leading-relaxed flex items-center gap-2">
            <el-icon class="text-[20px]"><Warning /></el-icon>
            Учитывать текущий пробег — каждое следующее ТО считается от того
            пробега, на котором вы реально сделали ТО.
          </p>
        </div>
      </div>

      <div class="container">
        <p class="text-sm font-medium mb-3">
          Настройка доверенных источников пробега
        </p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Выберите источники, которые автоматически обновляют текущий пробег
            транспортного средства
          </p>
        </div>
        <el-select
          v-if="settings"
          v-model="settings.trusted_mileage_sources"
          placeholder="Не выбран"
          multiple
          allow-create
        >
          <el-option
            v-for="item in trustedMiliageOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>

      <div class="container">
        <p class="text-sm font-medium mb-3">Статьи по оплате за эквайринг</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Выберите статьи, которые водитель сможет оплатить через приложение
          </p>
        </div>
        <el-select
          v-if="settings"
          placeholder="Не выбран"
          v-model="settings.allowed_payment_categories"
          multiple
          allow-create
        >
          <el-option
            v-for="item in filteredArticles"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>

      <div class="container">
        <p class="text-sm font-medium mb-3">
          Зарплатные ведомости штатных сотрудников
        </p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Укажите процент выплаты для авансовой ведомости. Оставшийся процент
            выплат будет в итоговой ведомости.
          </p>
        </div>
        <el-form-item v-if="settings" label="Авансовая" label-position="left">
          <el-input
            v-model="advancePercentage"
            class="w-[100px]"
            placeholder="50"
            :formatter="(value: string) => formatWithoutCurrency(value)"
          >
            <template #prefix>
              <span>%</span>
            </template>
          </el-input>
        </el-form-item>
        <p class="text-sm font-medium mb-3">Статьи для авансовой ведомости</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Укажите, долг по каким статьям закрывается при формировании и
            выплате аванса.
          </p>
        </div>
        <el-select
          v-if="settings"
          placeholder="Не выбран"
          multiple
          allow-create
          v-model="settings.salary_statements_advance_categories"
        >
          <el-option
            v-for="item in filteredArticlesSalaryStatements"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
        <p class="text-sm font-medium mb-3">Статьи для итоговой ведомости</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>
            Укажите, долг по каким статьям закрывается при формировании и
            выплате.
          </p>
        </div>
        <el-select
          v-if="settings"
          placeholder="Не выбран"
          multiple
          allow-create
          v-model="settings.salary_statements_final_categories"
        >
          <el-option
            v-for="item in filteredArticlesSalaryStatements"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </div>

      <div class="container" v-if="settings">
        <div class="flex items-center py-3">
          <div class="flex-1">
            <div class="font-medium text-sm flex items-center gap-2">
              Начисление водителю штрафа со скидкой
              <el-dropdown
                placement="top"
                v-if="!discount_days_switcher"
                class="align-middle"
              >
                <el-link
                  :icon="Warning"
                  :underline="false"
                  class="h-[12px] text-gray-500 hover:text-gray-200 focus:outline-none transition-opacity"
                />
                <template #dropdown>
                  <el-dropdown-menu class="max-w-[324px] pr-3 pl-3 pt-1 pb-1">
                    Водителям начисляется штраф сразу в полной сумме без скидки
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div>
            <el-switch
              v-model="discount_days_switcher"
              @change="() => (userTouchedSwitcher = true)"
            ></el-switch>
          </div>
        </div>

        <div
          v-if="discount_days_switcher"
          class="bg-[#fff] text-[#303133] p-4 rounded-lg mb-5"
        >
          <p class="text-sm leading-relaxed flex items-center gap-2">
            <el-icon class="text-[20px]"><Warning /></el-icon>
            За указанное количество дней до официального окончания скидки
            водителю будет начислен штраф уже в полной сумме
          </p>
        </div>

        <el-form-item
          label="Количество дней до окончания скидки"
          label-position="top"
          v-if="discount_days_switcher"
        >
          <el-input
            v-model="settings.fine_discount_offset_days"
            class="w-[100px]"
            placeholder="365"
            @input="
              (v) => {
                if (settings)
                  settings.fine_discount_offset_days = Math.min(Number(v), 365);
              }
            "
          >
          </el-input>
        </el-form-item>
        <div
          v-if="discount_days_switcher"
          class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5"
        >
          <p>
            Если стоит 0 дней - то скидка водителю будет действовать весь
            официальный срок (как в ГИБДД)
          </p>
        </div>
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">Начисление штрафов</p>
        <div>
          <el-checkbox v-model="settings.fines_enable_drivers_accruals">
            Автоматически начислять штрафы водителям
          </el-checkbox>
          <el-checkbox v-model="settings.toll_roads_enable_drivers_accruals">
            Автоматически начислять штрафы водителям за платные дороги
          </el-checkbox>
          <div
            class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5"
          >
            <p>
              Если автоматическое начисление включено, штрафы начисляются
              водителю, который в этот период времени был на линии.
            </p>
          </div>
        </div>
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">Комиссия за платные дороги</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>Введите сумму и процент для комиссии за платные дороги.</p>
          <p>Комиссия = Сумма+Процент</p>
        </div>
        <el-form
          ref="codeFormRef"
          :model="form"
          status-icon
          class="grid md:grid-cols-2 gap-6"
        >
          <el-form-item label="Сумма комиссии" prop="amount">
            <el-input
              v-model="settings.toll_roads_fee_rub"
              placeholder="100 000"
              :formatter="(value: string) => formatDecimal(value)"
            >
              <template #prefix>
                <span>{{ userProfileLocalCurrencySymbol }}</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="Процент комиссии" prop="percent">
            <el-input
              v-model="settings.toll_roads_fee_percent"
              placeholder="1"
              :formatter="(value: string) => value.replace(/\D/g, '')"
            >
              <template #prefix>
                <span>%</span>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">Комиссия за штрафы</p>
        <div class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5">
          <p>Введите сумму и процент для комиссии за штрафы.</p>
          <p>Комиссия = Сумма+Процент</p>
        </div>
        <el-form
          ref="codeFormRef"
          :model="form"
          status-icon
          class="grid md:grid-cols-2 gap-6"
        >
          <el-form-item label="Сумма комиссии" prop="amount">
            <el-input
              v-model="settings.fine_fee_rub"
              placeholder="100 000"
              :formatter="(value: string) => formatDecimal(value)"
            >
              <template #prefix>
                <span>{{ userProfileLocalCurrencySymbol }}</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="Процент комиссии" prop="percent">
            <el-input
              v-model="settings.fine_fee_percent"
              placeholder="1"
              :formatter="(value: string) => value.replace(/\D/g, '')"
            >
              <template #prefix>
                <span>%</span>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">
          Максимальная сумма депозита и франшизы
        </p>
        <div class="flex gap-4">
          <div class="flex-1">
            <p
              class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5"
            >
              Максимальная сумма депозита <span class="text-red-600">*</span>
            </p>
            <el-input
              v-model="settings.max_deposit"
              placeholder="0"
              :formatter="(value: string) => formatDecimal(value)"
            >
              <template #prefix>
                <span>{{ userProfileLocalCurrencySymbol }}</span>
              </template>
            </el-input>
          </div>
          <div class="flex-1">
            <p
              class="mb-1 text-[var(--text-color-secondary)] text-xs leading-5"
            >
              Максимальная сумма франшизы <span class="text-red-600">*</span>
            </p>
            <el-input
              v-model="settings.max_franchise"
              placeholder="0"
              :formatter="(value: string) => formatDecimal(value)"
            >
              <template #prefix>
                <span>{{ userProfileLocalCurrencySymbol }}</span>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <div class="container">
        <p class="text-sm font-medium mb-3">Списания по статье «Штрафы»</p>
        <SettingsAutoForm
          ref="SettingsAutoFineFormRef"
          :operation-category="'fine'"
        />
      </div>

      <div class="container">
        <p class="text-sm font-medium mb-3">
          Списания по статье «Платные дороги»
        </p>
        <SettingsAutoForm
          ref="SettingsAutoTollRoadFormRef"
          :operation-category="'toll_road'"
        />
      </div>

      <div class="container" v-if="settings">
        <p class="text-sm font-medium mb-3">Начисления по статье «Ущербы»</p>
        <SettingsAccrualDamageForm ref="damageFormRef" :settings="settings" />
      </div>
    </div>

    <div class="fixed bottom-0 left-24 w-full footer">
      <div class="max-w-[656px] mx-auto flex justify-end pr-4">
        <el-button>Отменить</el-button>
        <el-button type="primary" @click="onSave"> Сохранить </el-button>
      </div>
    </div>

    <Teleport to="html">
      <el-dialog
        v-model="dialogVisible"
        title="Не сохранять изменения?"
        width="431"
      >
        <p class="mb-5">
          На странице присутствуют несохраненные изменения. Вы уверены, что
          хотите закрыть настройки?
        </p>
        <div class="flex justify-end">
          <el-button @click="onStay">Вернуться </el-button>
          <el-button @click="onLeave" type="danger"
            >Не сохранять и закрыть</el-button
          >
        </div>
      </el-dialog>
    </Teleport>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  background: var(--fill-color);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}

.footer {
  height: 62px;
  padding-top: 10px;
  box-shadow: var(--light-box-shadow-dark);
  background: white;
}
</style>

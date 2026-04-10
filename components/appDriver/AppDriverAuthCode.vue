<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRoute } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { vMaska } from "maska/vue";

import { useAuth } from "@/composables/UseAuth";
import UiSheet from "@/components/ui/UiSheet.vue";

const emit = defineEmits<{
  (e: "setKey", v: string): void;
}>();
defineProps<{
  title: string;
}>();

const route = useRoute();
const {
  startPhoneVerificationResponse,
  completePhoneVerificationLoading,
  startPhoneVerification,
  completePhoneVerification,
} = useAuth();

const codeSheet = ref<{
  show: () => void;
  close: () => void;
} | null>(null);
const codeFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  code: [{ required: true, message: "", trigger: "blur" }],
});
const form = ref({
  code: "",
});

const hasError = computed(() => {
  return codeFormRef.value?.fields?.some((i) => i.validateState === "error");
});

const submitForm = async () => {
  await codeFormRef.value!.validate(async (valid, fields) => {
    if (valid) {
      completePhoneVerification({
        code: form.value.code,
        key: startPhoneVerificationResponse.value?.key!,
      }).then(() => emit("setKey", startPhoneVerificationResponse.value?.key!));
    } else {
      console.log("error submit!", fields);
    }
  });
};

const sendCode = () => {
  startPhoneVerification({ phone: route.query.phone as string });
  codeSheet.value?.show();
};
const goToTGBot = () => {
  codeSheet.value?.close();
  window.open("https://t.me/ta_hard_bot");
};
</script>

<template>
  <div class="relative w-full">
    <h6 class="mb-8 text-[var(--text-color-secondary)] text-center font-medium">
      {{ title }}
    </h6>

    <el-form
      ref="codeFormRef"
      :model="form"
      :rules="rules"
      status-icon
      class="relative w-full"
    >
      <el-button
        class="w-full rounded-xl text-[#409EFF] mb-[18px]"
        size="large"
        @click="sendCode"
      >
        Получить код подтверждения
      </el-button>

      <el-form-item prop="code">
        <el-input
          v-model="form.code"
          size="large"
          inputmode="numeric"
          v-maska="'######'"
          placeholder="Введите код подтверждения"
        />
      </el-form-item>

      <el-button
        class="w-full rounded-xl"
        type="primary"
        size="large"
        :loading="completePhoneVerificationLoading"
        @click="submitForm"
      >
        Продолжить
      </el-button>

      <p
        v-if="hasError"
        class="w-full absolute -bottom-10 text-center text-[var(--text-color-error)] transition-all"
      >
        {{
          !form.code.length
            ? "Необходимо заполнить все поля"
            : "Некорректный код"
        }}
      </p>
    </el-form>

    <UiSheet ref="codeSheet">
      <div class="flex flex-col gap-6 px-4">
        <h3 class="text-lg text-black font-medium">
          Как получить код подтверждения
        </h3>
        <div>
          <p class="text-[var(--text-color-regular)] text-xs leading-5">
            Шаг 1
          </p>
          <p class="text-sm leading-6">
            Перейдите в Telegram-бот и нажмите кнопку «Старт»
          </p>
        </div>
        <div>
          <p class="text-[var(--text-color-regular)] text-xs leading-5">
            Шаг 2
          </p>
          <p class="text-sm leading-6">
            Отправьте в бот ваш номер телефона, нажав на кнопку «Поделиться
            номером телефона»
          </p>
        </div>
        <div>
          <p class="text-[var(--text-color-regular)] text-xs leading-5">
            Шаг 3
          </p>
          <p class="text-sm leading-6">
            В ответ бот отправит вам код подтверждения. Возвращайтесь и введите
            данный код в форму.
          </p>
        </div>
        <el-button
          class="w-full rounded-xl"
          type="primary"
          size="large"
          @click="goToTGBot"
        >
          Перейти в Telegram-бот
        </el-button>
      </div>
    </UiSheet>
  </div>
</template>

<style scoped>
:deep(.el-input) {
  --el-input-border-radius: var(--border-radius-xl);
}
:deep(input) {
  text-align: center;
}
</style>

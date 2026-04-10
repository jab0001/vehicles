<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";

import { useAuth } from "@/composables/UseAuth";
import { useRoute, useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";

const { onRecoveryChange, onRecoveryChangeError, recoveryChangeLoading } = useAuth();
const router = useRouter();
const route = useRoute();
const recoverId = route.query.recover_id as string;

const ruleFormRecoveryRef = ref<FormInstance>();

const formRecovery = ref({
  new_password: "",
  compared_password: "",
});

const hasValidationError = ref(false);
const errorMessage = ref("Оба поля должны быть заполнены");
const serverErrorMessage = ref("");

const rules = reactive<FormRules<typeof formRecovery>>({
  new_password: [
    {
      min: 8,
      /* pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, */
      message: () => {
        errorMessage.value =  "Пароль должен содержать: не менее 8 символов, заглавные и строчные буквы, одну цифру и один специальный символ";
        return ''
      },
      /* trigger: "blur", */
      trigger: "manual",
    },
    {
      required: true,
      message: "",
      trigger: "manual",
      /* trigger: "blur", */
    },
  ],
  compared_password: [
    {
      required: true,
      message: "",
      trigger: "manual",
      /* trigger: "blur", */
    },
    {
      validator: (_, value, callback) => {
        if (value !== formRecovery.value.new_password) {
          callback(new Error(""));
          errorMessage.value =
            "Пароли не совпадают";
        } else {
          callback();
        }
      },
      trigger: "manual",
      /* trigger: "blur", */
    },
  ],
});

watch(
  formRecovery,
  (v) => {
    onRecoveryChangeError.value = undefined;
    hasValidationError.value = false;
    ruleFormRecoveryRef.value?.clearValidate();
    errorMessage.value = "Оба поля должны быть заполнены";
  },
  { deep: true }
);

const recovery = async () => {
  hasValidationError.value = false;

  const valid = await ruleFormRecoveryRef.value?.validate().catch(() => false);

  if (!valid) {
    hasValidationError.value = true;
    return;
  }

  try {
    const result = await onRecoveryChange(formRecovery.value.new_password, recoverId);
    
    if (result?.success) {
      goToLogin();
    } else {
      serverErrorMessage.value = result?.error.user_message;
    }
  } catch (err) {
    console.log(err);
  }
};

const goToLogin = () => {
  router.push({ name: "Login" });
};

onMounted(() => {
  if (!recoverId) {
    console.log("No recover ID provided");
    router.push({ name: "Login" });
  }
});
</script>

<template>
  <el-card class="w-[362px] rounded-[12px]">
    <template #header>
      <img src="@/assets/icons/auth-logo.svg" width="100%" />
    </template>
    <h1 class="mb-[4px] text-lg font-medium">Восстановление пароля</h1>
    <p class="mb-4 text-xs text-[#909399]">
      Придумайте новый пароль, отличный от тех, которые использовались раньше.
    </p>

    <el-form
      label-width="auto"
      label-position="top"
      ref="ruleFormRecoveryRef"
      :model="formRecovery"
      :rules="rules"
    >
      <el-form-item label="Пароль" prop="new_password">
        <el-input
          v-model="formRecovery.new_password"
          type="password"
          show-password
          class="h-[40px]"
          :placeholder="$t('views.login.placeholders.password')"
        />
      </el-form-item>
      <el-form-item label="Повторите Пароль" prop="compared_password">
        <el-input
          v-model="formRecovery.compared_password"
          type="password"
          show-password
          class="h-[40px]"
          :placeholder="$t('views.login.placeholders.password')"
        />
      </el-form-item>
    </el-form>

    <p
      v-if="serverErrorMessage && onRecoveryChangeError"
      class="text-[#FF4D4F] mb-2.5"
    >
      {{
        serverErrorMessage
      }}
    </p>

    <p v-if="hasValidationError" class="text-[#FF4D4F] mb-2.5">
      {{ errorMessage }}
    </p>

    <el-button
      class="change-button w-full mt-2"
      type="primary"
      size="large"
      @click="recovery"
      :loading="recoveryChangeLoading"
      >Готово</el-button
    >
  </el-card>
</template>
<style scoped>
:deep(.el-card__header) {
  padding: 0;
}
:deep(.el-form-item__label) {
  &:before {
    display: none;
  }
}

.change-button {
  background-color: #a562ff;
  color: white;
  border: none;
}

.change-button:hover {
  background-color: #8c49e6;
}

.change-button:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCompaniesManagementStore } from "@/stores/companiesManagementStore";
import { useAuth } from "@/composables/UseAuth";
import { EAuthPlatforms } from "@/types/auth";
import { useRouter } from "vue-router";
import { useUser } from "@/composables/useUser";
import { useAppBreakpoints } from "@/composables/useApp";
import type { FormInstance, FormRules } from "element-plus";

const { loginLoading, onLogin, onRecoveryStart, onLoginError, onRecoveryStartError, recoveryStartLoading } = useAuth();
const { companiesManagementLoading } = storeToRefs(
  useCompaniesManagementStore()
);
const { mdAndLarger } = useAppBreakpoints();
const router = useRouter();
const { fetchUserProfile, userProfile } = useUser();
fetchUserProfile();

// const form = reactive({
//   email: "test1@xdev.team",
//   password: "1111",
// });
const ruleFormRef = ref<FormInstance>();
const form = reactive({
  email: "",
  password: "",
});

const isRecovery = ref(false);
const recoverySend = ref(false);
const hasValidationError = ref(false);
const serverErrorMessage = ref("");

const rules = reactive<FormRules<typeof form>>({
  email: [
    {
      required: true,
      message: "",
      trigger: "blur",
    },
    {
      type: "email",
      message:  "Пожалуйста, введите корректный email",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: true,
      message: "",
      trigger: "blur",
    },
  ],
});

const clearForm = () => {
  ruleFormRef.value?.clearValidate();
  form.email = "";
  form.password = "";
  hasValidationError.value = false;
  onLoginError.value = undefined;
  onRecoveryStartError.value = undefined;
};

watch(form, (v) => {
  onLoginError.value = undefined;
  onRecoveryStartError.value = undefined;
  hasValidationError.value = false;
  ruleFormRef.value?.clearValidate();
}, {deep: true});

const login = async () => {
  hasValidationError.value = false;

  const valid = await ruleFormRef.value?.validate().catch(() => false);

  if (!valid) {
    hasValidationError.value = true;
    return;
  }
  try {
   const res = await onLogin({
      ...form,
      group_id: 1,
      platform: EAuthPlatforms.Web,
    });

    if (!res?.success) {
      serverErrorMessage.value = res?.error.user_message;
      return;
    }
    
  } catch (err) {
    console.log('TEST',err);
  }
};

const switchRecoveryLogin = () => {
  isRecovery.value = !isRecovery.value;
  clearForm();
};

const sendRecovery = async () => {
  hasValidationError.value = false;

  const valid = await ruleFormRef.value?.validate().catch(() => false);

  if (!valid) {
    hasValidationError.value = true;
    return;
  }

  try {
    const result = await onRecoveryStart(form.email);
    
    if (result?.success) {
      recoverySend.value = true;
    } else {
      serverErrorMessage.value = result?.error.user_message;
    }
  } catch (err) {
    console.log(err);
  }
};

const backToLogin = () => {
  recoverySend.value = false;
  isRecovery.value = false;
  clearForm();
};

watch(userProfile, () => {
  if (userProfile.value?.company_group_id) {
    if (mdAndLarger.value) {
      router.push({ name: "Dashboard" });
    } else {
      router.push({ name: "inspections" });
    }
  }
});
</script>

<template>
  <el-card class="w-[362px] rounded-[12px]">
    <template #header>
      <img src="@/assets/icons/auth-logo.svg" width="100%" />
    </template>
    <div v-if="!recoverySend">
      <h1 class="mb-[4px] text-lg font-medium">
        {{ !isRecovery ? "Вход" : "Восстановление пароля" }}
      </h1>
      <p class="mb-4 text-xs text-[#909399]">
        {{
          !isRecovery
            ? "Укажите email и пароль, чтобы войти"
            : "Укажите email, на который зарегистрирован ваш&nbsp;аккаунт."
        }}
      </p>

      <el-form
        ref="ruleFormRef"
        :model="form"
        :rules="rules"
        label-width="auto"
        label-position="top"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            class="h-[40px]"
            v-model="form.email"
            :placeholder="$t('views.login.placeholders.email')"
          />
        </el-form-item>
        <el-form-item label="Пароль" prop="password" v-if="!isRecovery">
          <el-input
            class="h-[40px]"
            v-model="form.password"
            type="password"
            show-password
            :placeholder="$t('views.login.placeholders.password')"
          />
        </el-form-item>
      </el-form>

      <p v-if="serverErrorMessage && (onLoginError || onRecoveryStartError)" class="text-[#FF4D4F] mb-2.5">
        {{ serverErrorMessage }}
      </p>
      <p v-if="hasValidationError" class="text-[#FF4D4F] mb-2.5">
        {{ !isRecovery ? "Оба поля должны быть заполнены" : "Укажите email" }}
      </p>

      <el-button
        v-if="!isRecovery"
        class="login-button w-full mt-2"
        type="primary"
        size="large"
        @click="login"
        :loading="loginLoading || companiesManagementLoading"
        >{{ $t("views.login.btnLogin") }}</el-button
      >
      <el-button
        v-else
        class="login-button w-full mt-2"
        type="primary"
        size="large"
        @click="sendRecovery"
        :loading="recoveryStartLoading"
        >Сбросить пароль</el-button
      >
      <el-button
        class="recovery-button w-full mt-2 !ml-0"
        type="primary"
        size="large"
        @click="switchRecoveryLogin"
        >{{
          !isRecovery ? "Восстановить пароль" : "На страницу авторизации"
        }}</el-button
      >
    </div>
    <div v-else>
      <h1 class="mb-[4px] text-lg font-medium">Проверьте почту</h1>
      <p class="mb-4 text-xs text-[#909399]">
        Мы отправили на указанную вами почту ссылку для сброса пароля. Перейдите
        по ней и укажите новый пароль.
      </p>
      <el-button
        class="recovery-button w-full mt-2 !ml-0"
        type="primary"
        size="large"
        @click="backToLogin"
        >На страницу авторизации</el-button
      >
    </div>
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
.login-button {
  background-color: #a562ff;
  color: white;
  border: none;
}

.login-button:hover {
  background-color: #8c49e6;
}

.login-button:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.recovery-button {
  background-color: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.recovery-button:hover {
  background-color: #a562ff;
  color: white;
}

.recovery-button:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>

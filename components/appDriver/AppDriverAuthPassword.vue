<script setup lang="ts">
import { reactive, ref, computed, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";

import { useAuth } from "@/composables/UseAuth";

const pwdError = ref<string>();

const validatePass = (rule: any, value: any, callback: any) => {
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-])[A-Za-z\d-]{8,32}$/;

  if (value === "") {
    pwdError.value = "Введите пароль";
    callback(new Error("Введите пароль"));
  } else if (!passwordPattern.test(value)) {
    pwdError.value =
      "Некорректный формат пароля";
    callback(
      new Error(
        "Пароль должен быть от 8 до 32 символов, из которых одна заглавная латинская буква, одна строчная, цифра и «-»"
      )
    );
  } else {
    if (model.value.confirm !== "") {
      if (!passwordFormRef.value) return;
      passwordFormRef.value.validateField("confirm");
    }
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    pwdError.value = "Подтвердите пароль";
    callback(new Error("Подтвердите пароль"));
  } else if (value !== model.value.password) {
    pwdError.value = "Пароли не совпадают";
    callback(new Error("Пароли не совпадают, а должны"));
  } else {
    callback();
  }
};

const model = defineModel<{ key: string; password: string; confirm: string }>({
  required: true,
});
const { appDriverRegisterLoading, onAppDriverSetPassword } = useAuth();
const passwordFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  password: [
    {
      required: true,
      message: "",
      trigger: "blur",
      validator: validatePass,
    },
  ],
  confirm: [
    {
      required: true,
      message: "",
      trigger: "blur",
      validator: validatePass2,
    },
  ],
});

const hasError = computed(() => {
  return passwordFormRef.value?.fields?.some(
    (i) => i.validateState === "error"
  );
});

const submitForm = async () => {
  await passwordFormRef.value!.validate(async (valid, fields) => {
    if (valid) {
      onAppDriverSetPassword({
        password: model.value.password,
        key: model.value.key,
      });
    } else {
      console.log("error submit!", fields);
    }
  });
};

watch(
  model,
  () => {
    pwdError.value = undefined;
  },
  {
    deep: true,
  }
);
</script>

<template>
  <div class="w-full">
    <h6 class="mb-8 text-[var(--text-color-secondary)] text-center font-medium">
      Придумайте новый пароль
    </h6>
    <el-form
      ref="passwordFormRef"
      class="relative w-full"
      :model="model"
      :rules="rules"
    >
      <el-form-item prop="password">
        <el-input
          v-model="model.password"
          placeholder="Введите пароль"
          size="large"
          show-password
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item prop="confirm">
        <el-input
          v-model="model.confirm"
          placeholder="Повторите пароль"
          size="large"
          show-password
          autocomplete="off"
        />
      </el-form-item>

      <el-button
        class="w-full rounded-xl"
        type="primary"
        size="large"
        :loading="appDriverRegisterLoading"
        @click="submitForm"
      >
        Готово
      </el-button>

      <p
        v-if="pwdError"
        class="w-full absolute -bottom-10 text-center text-[var(--text-color-error)] transition-all"
      >
        <!-- TODO validation -->
        <span>{{ pwdError }}</span>
      </p>
    </el-form>

    <p
      class="max-w-80 mt-14 text-[var(--text-color-secondary)] mx-auto text-center font-medium"
    >
      Пароль должен быть от 8 до 32 символов, из которых одна заглавная
      латинская буква, одна строчная, цифра и «-»
    </p>
  </div>
</template>

<style scoped>
:deep(.el-input) {
  --el-input-border-radius: var(--border-radius-xl);
}
</style>

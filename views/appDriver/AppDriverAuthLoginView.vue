<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/UseAuth";
import type { FormInstance, FormRules } from "element-plus";

const route = useRoute();
const router = useRouter();
const { appDriverLoginLoading, onAppDriverLogin } = useAuth();
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules>({
  password: [{ required: true, message: "", trigger: "blur" }],
});
const form = ref({
  password: "",
});

const hasError = computed(() => {
  return ruleFormRef.value?.fields?.some((i) => i.validateState === "error");
});

const submitForm = async () => {
  await ruleFormRef.value!.validate((valid, fields) => {
    if (valid) {
      onAppDriverLogin({
        ...form.value,
        phone: route.query.phone as string,
      });
    } else {
      console.log("error submit!", fields);
    }
  });
};
const goToChangePass = () => {
  router.push({
    name: "AppDriverAuthForgotPassword",
    query: {
      phone: route.query.phone,
    },
  });
};
</script>

<template>
  <div class="relative w-full">
    <h6
      class="max-w-60 mb-8 text-[var(--text-color-secondary)] mx-auto font-medium"
    >
      Введите здесь пароль, который вы указывали при регистрации
    </h6>

    <el-form
      ref="ruleFormRef"
      :model="form"
      :rules="rules"
      status-icon
      class="relative w-full"
    >
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          show-password
          type="password"
          size="large"
        />
      </el-form-item>

      <el-button
        class="w-full rounded-xl"
        type="primary"
        size="large"
        :loading="appDriverLoginLoading"
        @click="submitForm"
      >
        Войти
      </el-button>

      <p
        class="w-fit mx-auto mt-[18px] text-[#409EFF] text-base font-medium"
        @click="goToChangePass"
      >
        Не помню пароль
      </p>

      <p
        v-if="hasError"
        class="w-full absolute -bottom-10 text-center text-[var(--text-color-error)] transition-all"
      >
        Неправильный пароль. Попробуйте еще раз или восстановите пароль.
      </p>
    </el-form>
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

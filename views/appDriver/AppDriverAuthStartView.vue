<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { vMaska } from "maska/vue";
import { useAuth } from "@/composables/UseAuth";
import type { FormInstance, FormRules } from "element-plus";

const router = useRouter();
const { checkRegisterLoading, checkAppDriverRegister } = useAuth();

const ruleFormRef = ref<FormInstance>();

const validatePhone = (rule: any, value: any, callback: any) => {
  if (value === "" || value.replace(/[^0-9]/g, "").length !== 11) {
    return callback(new Error(""));
  }
  return callback();
};

const rules = reactive<FormRules>({
  phone: [
    { required: true, message: "", trigger: "blur", validator: validatePhone },
  ],
});
const form = ref({
  phone: "",
});

const hasError = computed(() => {
  return ruleFormRef.value?.fields?.some((i) => i.validateState === "error");
});

const submitForm = async () => {
  await ruleFormRef.value!.validate(async (valid, fields) => {
    if (valid) {
      checkAppDriverRegister({
        phone: form.value.phone.replace(/[^0-9]/g, ""),
      }).then((result) => {
        if (result === true) {
          router.push({
            name: "AppDriverAuthLogin",
            query: {
              phone: form.value.phone.replace(/[^0-9]/g, ""),
            },
          });
        } else {
          router.push({
            name: "AppDriverAuthRegister",
            query: {
              phone: form.value.phone.replace(/[^0-9]/g, ""),
            },
          });
        }
      });
    } else {
      console.log("error submit!", fields);
    }
  });
};
</script>

<template>
  <div class="relative w-full">
    <h6 class="mb-8 text-[var(--text-color-secondary)] text-center font-medium">
      Чтобы войти, введите номер телефона
    </h6>

    <el-form
      ref="ruleFormRef"
      :model="form"
      :rules="rules"
      status-icon
      class="relative w-full"
    >
      <el-form-item prop="phone">
        <input
          v-model="form.phone"
          size="large"
          placeholder="+7 999 99 99 99"
          v-maska="'+7 ### ### ## ##'"
        />
      </el-form-item>

      <el-button
        class="w-full rounded-xl mt-3"
        type="primary"
        size="large"
        :loading="checkRegisterLoading"
        @click="submitForm"
      >
        Продолжить
      </el-button>

      <p
        v-if="hasError"
        class="w-full absolute -bottom-10 text-center text-[var(--text-color-error)] transition-all"
      >
        {{
          !form.phone.length
            ? "Необходимо заполнить все поля"
            : "Некорректный номер телефона"
        }}
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

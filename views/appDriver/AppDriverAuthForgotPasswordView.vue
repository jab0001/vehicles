<script setup lang="ts">
import { ref } from "vue";
import AppDriverAuthCode from "@/components/appDriver/AppDriverAuthCode.vue";
import AppDriverAuthPassword from "@/components/appDriver/AppDriverAuthPassword.vue";

const passwordForm = ref({
  key: "",
  password: "",
  confirm: "",
});

const setKey = (key: string) => {
  passwordForm.value.key = key;
};
</script>

<template>
  <div class="w-full">
    <AppDriverAuthCode
      v-if="!passwordForm.key"
      title="Чтобы восстановить пароль, получите и введите код подтверждения"
      @setKey="setKey"
    />
    <AppDriverAuthPassword v-else v-model="passwordForm" />
  </div>
</template>

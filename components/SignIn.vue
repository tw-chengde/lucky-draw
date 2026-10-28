<template>
  <BForm @submit="onSubmit" @reset="onReset" v-if="show">
    <BAlert :model-value="true" variant="info">
      加入會員享有更多功能，詳情請查閱
      <BLink href="https://tw-chengde.com/" target="_blank" rel="noopener">
        官網
      </BLink>
    </BAlert>
    <BFormGroup
      class="my-2 font-monospace"
      label="Email"
      label-for="email"
      floating
      label-size="sm"
    >
      <BFormInput
        id="email"
        v-model="form.email"
        type="email"
        placeholder="Enter email"
        required
      />
    </BFormGroup>

    <BFormGroup
      class="my-3 font-monospace"
      label="Password"
      label-for="password"
      floating
      label-size="sm"
    >
      <BFormInput
        id="password"
        v-model="form.password"
        placeholder="Enter password"
        required
      />
    </BFormGroup>
    <div class="d-flex justify-content-end">
      <BButton type="reset" variant="danger" class="me-2">重置</BButton>
      <BButton type="submit" variant="primary">提交</BButton>
    </div>
  </BForm>
</template>

<script lang="ts" setup>
import {
  BAlert,
  BButton,
  BForm,
  BFormGroup,
  BFormInput,
  BLink,
} from "bootstrap-vue-next";

const form = reactive({
  email: "",
  password: "",
});
const show = ref(true);

const onSubmit = (event: any) => {
  event.preventDefault();
  alert("密碼錯誤");
};

const onReset = () => {
  form.email = "";
  form.password = "";
};

defineExpose({ onReset });
</script>

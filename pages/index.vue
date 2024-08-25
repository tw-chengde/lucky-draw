<template>
  <div class="d-flex flex-column min-vh-100">
    <BNavbar class="py-3">
      <BNavbarBrand
        href="https://tw-chengde.com/"
        target="_blank"
        rel="noopener"
      >
        <BImg src="/logo.webp" alt="NavIcon" class="icon" />
      </BNavbarBrand>
      <div>
        <!-- <BButton variant="outline-primary" @click="show"  class="me-1">
          <i class="bi bi-person-circle"></i>
          登入
        </BButton> -->
        <BButton variant="outline-danger" class="icon-hover">
          <i class="bi bi-floppy2"></i>
          歷史紀錄
        </BButton>
      </div>
    </BNavbar>
    <BContainer class="flex-grow-1">
      <BRow>
        <BCol md="6" sm="12" class="mb-3">
          <BCard title="抽獎名單">
            <BFormTextarea
              class="mb-2"
              id="textarea"
              v-model="drawList"
              placeholder="抽獎名單需換行"
              rows="25"
            />
          </BCard>
        </BCol>
        <BCol class="mb-3">
          <BCard title="獎品區" style="height: 692.8px; overflow-y: auto">
            <div
              v-for="(prize, index) in prizes"
              :key="index"
              class="mb-2 d-flex align-items-start"
            >
              <BFormInput
                v-model="prize.name"
                placeholder="抽獎獎品"
                class="mb-2 me-2"
                :state="prize.name !== ''"
              />
              <BFormInput
                v-model="prize.quantity"
                type="number"
                placeholder="數量"
                class="mb-2"
                min="1"
                step="1"
                :state="validateQuantity(prize.quantity)"
              />
              <BButton @click="removePrize(index)" class="ms-1" variant="danger"
                ><i class="bi bi-dash-lg"></i
              ></BButton>
              <BButton @click="addPrize" class="ms-1" variant="success"
                ><i class="bi bi-plus-lg"></i
              ></BButton>
            </div>
            <BButton
              variant="success"
              @click="draw"
              :disabled="!canDraw"
              class="icon-hover"
            >
              <i class="bi bi-dice-6-fill"></i>
              開始抽獎
            </BButton>
          </BCard>
        </BCol>
      </BRow>
      <BRow class="justify-content-center">
        <BCol class="d-flex justify-content-center">
          <BCard title="中獎區" v-if="winners.length > 0">
            <BListGroup>
              <div v-for="(winner, index) in winners" :key="index">
                <p>
                  <strong>{{ winner.prize }}</strong
                  >：
                  <span>{{ winner.winner }}</span>
                </p>
              </div>
            </BListGroup>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
    <BNavbar class="navbar navbar-inverse navbar-fixed-bottom">
      <BNavbarNav class="w-100 justify-content-center">
        <BNavText
          text="© 2023 誠得有限公司 CHENG DE CO., LTD. All Rights Reserved."
        />
      </BNavbarNav>
    </BNavbar>
    <BModal
      id="signInModal"
      title="登入"
      size="md"
      :hideFooter="true"
      @hidden="handleClose"
    >
      <SignIn ref="signInRef" />
    </BModal>
  </div>
</template>

<script lang="ts" setup>
import { BCol } from "bootstrap-vue-next";

const drawList = ref("");
const prizes = ref([{ name: "", quantity: 1 }]);
const winners = ref<{ prize: string; winner: string }[]>([]);

const canDraw = computed(() => {
  return (
    drawList.value.trim() !== "" &&
    prizes.value.every(
      (prize) =>
        prize.name.trim() !== "" &&
        prize.quantity > 0 &&
        Number.isInteger(prize.quantity)
    )
  );
});

const { show, hide } = useModal("signInModal");
const signInRef = ref();
const handleClose = () => {
  signInRef.value.onReset();
  hide();
};

const draw = () => {
  if (drawList.value) {
    const cleanedDrawList = drawList.value
      .split(/[\n,，]+/)
      .filter((item: string) => item.trim());

    let availableDrawList = [...cleanedDrawList]; // 可用名單副本
    winners.value = []; // 清空上次的中獎結果
    prizes.value.forEach((prize) => {
      for (let i = 0; i < prize.quantity; i++) {
        if (availableDrawList.length === 0) break; // 如果名單已經抽完，結束
        const randomIndex = Math.floor(
          Math.random() * availableDrawList.length
        );
        const winner = availableDrawList.splice(randomIndex, 1)[0]; // 隨機抽取一個獲獎者
        winners.value.push({ prize: prize.name, winner });
      }
    });
  }
};

const addPrize = () => {
  prizes.value.push({ name: "", quantity: 1 });
};

const removePrize = (index: number) => {
  if (prizes.value.length === 1) return;
  prizes.value.splice(index, 1);
};

const validateQuantity = (quantity: number) => {
  if (isNaN(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
    return false;
  }
  return true;
};
</script>

<style lang="sass" scoped>
.icon
  height: 83.5px
.icon-hover:hover i
  display: inline-block
  transform: scale(1.2)
  transition: transform 0.3s ease, color 0.3s ease
</style>

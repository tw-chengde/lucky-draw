<template>
  <div class="draw-page">
    <header class="site-header page-width">
      <a href="https://tw-chengde.com/" target="_blank" rel="noopener" class="brand-link">
        <img src="/logo.webp" alt="誠得有限公司" class="brand-logo" />
      </a>
      <span class="header-caption">讓每一次相聚，都有驚喜。</span>
      <span class="header-label"><span class="status-dot"></span> LUCKY DRAW</span>
    </header>

    <main class="page-width">
      <section class="intro" aria-labelledby="page-title">
        <div>
          <p class="eyebrow">A LITTLE LUCK. A LOT OF JOY.</p>
          <h1 id="page-title">把期待，交給<span>好運。</span></h1>
          <p class="intro-description">加入參加者、設定獎項，讓下一位幸運兒登場。</p>
        </div>
        <div class="intro-note"><i class="bi bi-stars" aria-hidden="true"></i><span>每一個名字<br />都有被選中的機會</span></div>
      </section>

      <div class="settings-grid">
        <section class="setup-card" aria-labelledby="participants-title">
          <div class="section-heading">
            <div class="heading-with-number"><span class="section-number">01</span><h2 id="participants-title">參加名單</h2></div>
            <span class="count-badge">{{ participants.length }} 人</span>
          </div>
          <p class="section-description">一個名字，一份期待。輸入後按新增或 Enter。</p>
          <form class="participant-form" @submit.prevent="addParticipant">
            <label for="participant-name" class="field-label">參加者姓名</label>
            <div class="name-input-row">
              <input
                id="participant-name"
                ref="nameInput"
                v-model="participantName"
                class="form-control"
                type="text"
                placeholder="輸入一位參加者的姓名"
                autocomplete="off"
                :disabled="isDrawing"
                :aria-invalid="Boolean(participantError)"
                aria-describedby="participant-feedback"
                @input="participantError = ''"
                @keydown.enter="guardComposition"
              />
              <BButton type="submit" class="add-name-button" :disabled="isDrawing"><i class="bi bi-plus-lg" aria-hidden="true"></i> 新增</BButton>
            </div>
            <p id="participant-feedback" class="input-feedback" role="status">{{ participantError }}</p>
          </form>
          <div v-if="participants.length === 0" class="participants-empty">
            <span class="empty-icon"><i class="bi bi-people" aria-hidden="true"></i></span>
            <p>第一位幸運兒，從這裡加入</p>
            <span>新增的姓名會顯示在這裡</span>
          </div>
          <ul v-else class="participant-tags" aria-label="已加入的參加者">
            <li v-for="participant in participants" :key="participant.id" class="participant-tag">
              <span>{{ participant.name }}</span>
              <button type="button" :aria-label="'移除 ' + participant.name" :disabled="isDrawing" @click="removeParticipant(participant.id)"><i class="bi bi-x" aria-hidden="true"></i></button>
            </li>
          </ul>
          <p class="card-footnote"><i class="bi bi-check2-circle" aria-hidden="true"></i> 姓名不重複，每輪每人最多中獎一次</p>
        </section>

        <section class="setup-card" aria-labelledby="prizes-title">
          <div class="section-heading">
            <div class="heading-with-number"><span class="section-number">02</span><h2 id="prizes-title">獎項設定</h2></div>
            <span class="count-badge">共 {{ validQuantities ? totalPrizes : '—' }} 份</span>
          </div>
          <p class="section-description">準備好驚喜，獎項將依照排列順序抽出。</p>
          <div class="prize-list">
            <div v-for="(prize, index) in prizes" :key="prize.id" class="prize-row">
              <span class="prize-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="prize-name-field">
                <label :for="'prize-name-' + prize.id" class="field-label">獎項名稱</label>
                <BFormInput :id="'prize-name-' + prize.id" v-model="prize.name" placeholder="例如：頭獎禮券" :disabled="isDrawing" />
              </div>
              <div class="prize-quantity-field">
                <label :for="'prize-quantity-' + prize.id" class="field-label">名額</label>
                <BFormInput :id="'prize-quantity-' + prize.id" v-model="prize.quantity" type="number" min="1" step="1" :disabled="isDrawing" :aria-invalid="!validateQuantity(prize.quantity)" />
              </div>
              <button class="remove-prize-button" type="button" :aria-label="'移除獎項 ' + (index + 1)" :disabled="isDrawing || prizes.length === 1" @click="removePrize(prize.id)"><i class="bi bi-trash3" aria-hidden="true"></i></button>
            </div>
          </div>
          <BButton class="add-prize-button" :disabled="isDrawing" @click="addPrize"><i class="bi bi-plus-lg" aria-hidden="true"></i> 新增獎項</BButton>
          <p class="card-footnote"><i class="bi bi-gift" aria-hidden="true"></i> 獎品總數需小於或等於參加人數</p>
        </section>
      </div>

      <section class="draw-stage" :class="{ 'is-rolling': phase === 'rolling' }" aria-labelledby="stage-title" :aria-busy="isDrawing">
        <div v-if="showConfetti && !reducedMotion" class="confetti" aria-hidden="true">
          <span v-for="piece in confettiPieces" :key="piece.id" :style="piece.style"></span>
        </div>
        <div class="stage-topline">
          <div class="heading-with-number"><span class="section-number">03</span><h2 id="stage-title">抽獎舞台</h2></div>
          <span class="stage-status"><span class="status-dot"></span>{{ isDrawing ? (phase === 'complete' ? '好運已送達' : '好運挑選中') : phase === 'complete' ? '本輪已完成' : '等待好運登場' }}</span>
        </div>
        <div class="stage-content">
          <p class="stage-eyebrow">{{ currentPrize || 'THE NEXT LUCKY ONE' }}</p>
          <div class="name-display" :class="{ 'winner-revealed': phase === 'revealed' || phase === 'complete' }" aria-hidden="true">
            <template v-if="displayName">{{ displayName }}</template>
            <template v-else>下一位<span>幸運兒</span></template>
          </div>
          <p class="stage-description">{{ stageDescription }}</p>
          <BButton class="draw-button" :disabled="!canDraw" @click="draw">
            <span v-if="isDrawing" class="button-spinner" aria-hidden="true"></span>
            <i v-else class="bi bi-stars" aria-hidden="true"></i>
            {{ isDrawing ? '抽獎進行中…' : winners.length ? '再抽一次' : '開始抽獎' }}
            <i v-if="!isDrawing" class="bi bi-arrow-right" aria-hidden="true"></i>
          </BButton>
          <p class="draw-feedback" :class="{ 'ready-message': !setupIssue }">{{ isDrawing ? '本輪已揭曉 ' + winners.length + ' / ' + roundTotal + ' 位得獎者' : setupIssue || '準備就緒，將從 ' + participants.length + ' 人中抽出 ' + totalPrizes + ' 位得獎者' }}</p>
        </div>
        <div class="stage-bottomline"><span>一份期待 · 一刻驚喜</span><span>GOOD LUCK TO EVERYONE</span></div>
      </section>
      <p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>

      <section v-if="winners.length" class="results-section" aria-labelledby="results-title">
        <div class="section-heading">
          <div class="heading-with-number"><span class="results-icon"><i class="bi bi-trophy" aria-hidden="true"></i></span><h2 id="results-title">本輪幸運名單</h2></div>
          <span class="results-count">已揭曉 {{ winners.length }} 位</span>
        </div>
        <TransitionGroup name="winner" tag="ol" class="results-grid">
          <li v-for="(winner, index) in winners" :key="winner.participantId" class="result-card">
            <span class="result-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div><p class="result-prize">{{ winner.prize }}</p><p class="result-name">{{ winner.winner }}</p></div>
            <i class="bi bi-stars" aria-hidden="true"></i>
          </li>
        </TransitionGroup>
        <p class="results-note">再次抽獎將使用完整參加名單，並更新本輪結果。</p>
      </section>
    </main>
    <footer class="site-footer page-width"><span>誠得有限公司</span><span>© {{ new Date().getFullYear() }} CHENG DE CO., LTD.</span></footer>
  </div>
</template>

<script lang="ts" setup>
import { BButton, BFormInput } from 'bootstrap-vue-next';

interface Participant { id: number; name: string }
interface Prize { id: number; name: string; quantity: string | number }
interface Winner { participantId: number; prize: string; winner: string }

let nextParticipantId = 1;
let nextPrizeId = 2;
const participants = ref<Participant[]>([]);
const participantName = ref('');
const participantError = ref('');
const nameInput = ref<HTMLInputElement>();
const prizes = ref<Prize[]>([{ id: 1, name: '', quantity: 1 }]);
const winners = ref<Winner[]>([]);
const isDrawing = ref(false);
const phase = ref<'idle' | 'rolling' | 'revealed' | 'complete'>('idle');
const displayName = ref('');
const currentPrize = ref('');
const roundTotal = ref(0);
const showConfetti = ref(false);
const reducedMotion = ref(false);
const announcement = ref('');

const validateQuantity = (quantity: string | number) => Number.isSafeInteger(Number(quantity)) && Number(quantity) > 0;
const validQuantities = computed(() => prizes.value.every(prize => validateQuantity(prize.quantity)));
const totalPrizes = computed(() => prizes.value.reduce((total, prize) => total + Number(prize.quantity), 0));
const setupIssue = computed(() => {
  if (!participants.value.length) return '請先新增參加者，讓好運有機會登場';
  if (prizes.value.some(prize => !prize.name.trim())) return '請填寫每個獎項的名稱';
  if (!validQuantities.value) return '每個獎項的名額需為大於 0 的整數';
  if (totalPrizes.value > participants.value.length) return '獎品共 ' + totalPrizes.value + ' 份，還需新增 ' + (totalPrizes.value - participants.value.length) + ' 位參加者';
  return '';
});
const canDraw = computed(() => !isDrawing.value && !setupIssue.value);
const stageDescription = computed(() => {
  if (phase.value === 'rolling') return '好運正在靠近，即將揭曉…';
  if (phase.value === 'revealed') return '恭喜！這份幸運屬於你。';
  if (phase.value === 'complete') return '本輪抽獎完成，恭喜所有幸運兒！';
  return '名單與獎項準備好，就讓驚喜開始。';
});

function guardComposition(event: KeyboardEvent) {
  if (event.isComposing || event.keyCode === 229) event.preventDefault();
}

function addParticipant() {
  if (isDrawing.value) return;
  const name = participantName.value.trim();
  if (!name) participantError.value = '請輸入參加者姓名';
  else if (participants.value.some(participant => participant.name === name)) participantError.value = '這個姓名已在名單中，請使用不同的姓名';
  else {
    participants.value.push({ id: nextParticipantId++, name });
    participantName.value = '';
    participantError.value = '';
  }
  nameInput.value?.focus();
}

function removeParticipant(id: number) {
  if (isDrawing.value) return;
  participants.value = participants.value.filter(participant => participant.id !== id);
  participantError.value = '';
}

function addPrize() {
  if (!isDrawing.value) prizes.value.push({ id: nextPrizeId++, name: '', quantity: 1 });
}

function removePrize(id: number) {
  if (!isDrawing.value && prizes.value.length > 1) prizes.value = prizes.value.filter(prize => prize.id !== id);
}

// A single awaited delay and rolling interval are active at a time.
let delayTimer: ReturnType<typeof setTimeout> | undefined;
let rollingTimer: ReturnType<typeof setInterval> | undefined;
let resolveDelay: (() => void) | undefined;
let disposed = false;
let motionQuery: MediaQueryList | undefined;
const pause = (milliseconds: number) => new Promise<void>(resolve => {
  resolveDelay = resolve;
  delayTimer = setTimeout(() => {
    delayTimer = undefined;
    resolveDelay = undefined;
    resolve();
  }, milliseconds);
});

function stopRolling() {
  clearInterval(rollingTimer);
  rollingTimer = undefined;
}

function syncMotionPreference() {
  reducedMotion.value = motionQuery?.matches ?? false;
  if (reducedMotion.value) {
    showConfetti.value = false;
    stopRolling();
    if (phase.value === 'rolling') displayName.value = '即將揭曉';
  }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  syncMotionPreference();
  motionQuery.addEventListener('change', syncMotionPreference);
});

onBeforeUnmount(() => {
  disposed = true;
  stopRolling();
  clearTimeout(delayTimer);
  resolveDelay?.();
  motionQuery?.removeEventListener('change', syncMotionPreference);
});

async function draw() {
  if (!canDraw.value) return;
  isDrawing.value = true;
  winners.value = [];
  roundTotal.value = totalPrizes.value;
  const available = [...participants.value];
  const roundPrizes = prizes.value.map(prize => ({ name: prize.name.trim(), quantity: Number(prize.quantity) }));
  announcement.value = '開始抽獎，共 ' + roundTotal.value + ' 位得獎者';

  for (const prize of roundPrizes) {
    for (let slot = 0; slot < prize.quantity; slot++) {
      currentPrize.value = prize.name;
      phase.value = 'rolling';
      const selectedIndex = Math.floor(Math.random() * available.length);
      const selected = available[selectedIndex]!;
      if (!reducedMotion.value) {
        let previewIndex = Math.floor(Math.random() * available.length);
        displayName.value = available[previewIndex]!.name;
        rollingTimer = setInterval(() => {
          previewIndex = (previewIndex + 1) % available.length;
          displayName.value = available[previewIndex]!.name;
        }, 85);
        await pause(1500);
        stopRolling();
        if (disposed) return;
      }
      available.splice(selectedIndex, 1);
      displayName.value = selected.name;
      phase.value = 'revealed';
      winners.value.push({ participantId: selected.id, prize: prize.name, winner: selected.name });
      announcement.value = prize.name + '，恭喜 ' + selected.name + '！已揭曉 ' + winners.value.length + ' / ' + roundTotal.value + ' 位';
      await pause(800);
      if (disposed) return;
    }
  }

  phase.value = 'complete';
  announcement.value = '本輪抽獎完成，共 ' + winners.value.length + ' 位得獎者。恭喜所有幸運兒！';
  if (!reducedMotion.value) {
    showConfetti.value = true;
    await pause(2000);
    if (disposed) return;
    showConfetti.value = false;
  }
  isDrawing.value = false;
}

// Deterministic positions keep server and client markup consistent.
const confettiPieces = Array.from({ length: 48 }, (_, id) => ({
  id,
  style: {
    left: ((id * 37) % 100) + '%',
    backgroundColor: ['#f6bd60', '#f8eddd', '#ed704c', '#91b9a4'][id % 4],
    animationDelay: ((id % 8) * 0.06) + 's',
    animationDuration: (1.2 + (id % 5) * 0.12) + 's',
    '--drift': (((id * 19) % 160) - 80) + 'px',
    '--turn': (id % 2 ? 540 : -540) + 'deg',
  },
}));
</script>

<style scoped>
.draw-page { min-height: 100vh; color: #302e2a; background: #f7f5f0; }
.page-width { width: min(1120px, calc(100% - 64px)); margin-inline: auto; }
.site-header { min-height: 104px; display: flex; align-items: center; gap: 30px; border-bottom: 1px solid #e4e0d7; }
.brand-link { display: inline-flex; flex-shrink: 0; }
.brand-logo { width: 116px; height: 64px; object-fit: contain; }
.header-caption { font-size: 13px; color: #827c72; border-left: 1px solid #ded9cf; padding-left: 24px; }
.header-label { margin-left: auto; font-size: 11px; font-weight: 700; letter-spacing: 2px; display: flex; align-items: center; gap: 9px; }
.status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #bf774f; flex-shrink: 0; }
.intro { display: flex; justify-content: space-between; align-items: center; padding: 56px 0 36px; gap: 20px; }
.eyebrow { color: #9d6045; font-size: 10px; letter-spacing: 2.4px; font-weight: 700; margin-bottom: 16px; }
h1 { font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.35; margin: 0 0 14px; }
h1 span { color: #cf603d; }
.intro-description, .section-description { color: #847d72; font-size: 14px; line-height: 1.7; margin: 0; }
.intro-note { display: flex; align-items: center; gap: 15px; color: #8b7d69; font-size: 12px; line-height: 1.8; transform: rotate(-4deg); padding-right: 15px; }
.intro-note i { color: #bd8a4c; font-size: 34px; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-bottom: 26px; }
.setup-card { display: flex; flex-direction: column; min-width: 0; padding: 28px; background: #fffefa; border: 1px solid #e7e2d8; border-radius: 18px; box-shadow: 0 3px 10px #483b2505; }
.section-heading, .heading-with-number { display: flex; align-items: center; gap: 12px; }
.section-heading { justify-content: space-between; margin-bottom: 12px; }
.section-number { display: inline-grid; place-items: center; width: 29px; height: 29px; border: 1px solid #e2d9cb; border-radius: 50%; color: #9f8364; font-size: 11px; font-weight: 600; flex-shrink: 0; }
h2 { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: .5px; }
.count-badge { background: #f2eee5; color: #7c6d57; padding: 5px 11px; font-size: 11px; font-weight: 600; border-radius: 20px; white-space: nowrap; }
.section-description { font-size: 12px; margin-bottom: 24px; }
.field-label { display: block; font-size: 11px; font-weight: 600; color: #776f64; margin-bottom: 8px; }
.name-input-row { display: flex; gap: 8px; }
.form-control { min-width: 0; height: 44px; background: #fffefa; border: 1px solid #dfdbd1; border-radius: 8px; color: #302e2a; font-size: 13px; padding: 10px 12px; }
.form-control::placeholder { color: #aaa397; }
.form-control:focus { border-color: #bb7650; box-shadow: 0 0 0 3px #bf774f1c; background: #fff; }
.form-control:disabled { background: #f2efe9; color: #847d72; }
.form-control[aria-invalid="true"] { border-color: #bf4b38; }
.add-name-button { flex-shrink: 0; background: #353d32; border: 1px solid #353d32; border-radius: 8px; font-size: 12px; font-weight: 600; padding-inline: 16px; }
.add-name-button:hover, .add-name-button:focus-visible { background: #4b5746; border-color: #4b5746; }
.input-feedback { min-height: 18px; margin: 6px 0 8px; color: #b34e35; font-size: 11px; }
.participants-empty { flex-grow: 1; text-align: center; border: 1px dashed #e5dfd3; border-radius: 10px; padding: 21px 12px; background: #faf8f3; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; background: #eee9de; color: #9c8c73; border-radius: 50%; width: 42px; height: 42px; font-size: 21px; margin-bottom: 10px; }
.participants-empty p { font-size: 12px; color: #847967; margin-bottom: 4px; }
.participants-empty > span:last-child { font-size: 10px; color: #a39a8c; }
.participant-tags { display: flex; align-content: start; flex-wrap: wrap; gap: 8px; list-style: none; padding: 4px 2px 14px; margin: 0; max-height: 260px; overflow-y: auto; flex-grow: 1; }
.participant-tag { display: inline-flex; align-items: center; gap: 8px; max-width: 100%; padding: 6px 7px 6px 12px; border: 1px solid #e0e4d7; border-radius: 7px; background: #f0f3e9; color: #536047; font-size: 13px; }
.participant-tag > span { overflow-wrap: anywhere; }
.participant-tag button { border: 0; background: transparent; color: #748466; border-radius: 4px; display: inline-grid; place-items: center; width: 27px; height: 27px; flex-shrink: 0; font-size: 19px; }
.participant-tag button:hover:enabled { background: #dfe6d4; color: #36432c; }
.card-footnote { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #938b7f; margin: 20px 0 0; padding-top: 15px; border-top: 1px solid #eee9e0; }
.prize-list { display: grid; align-content: start; gap: 16px; max-height: 340px; overflow-y: auto; padding: 0 3px 3px; }
.prize-row { display: flex; gap: 10px; align-items: flex-end; }
.prize-index { align-self: flex-end; font-size: 11px; color: #b6aa97; padding-bottom: 14px; width: 18px; flex-shrink: 0; }
.prize-name-field { flex: 1; min-width: 0; }
.prize-quantity-field { width: 70px; flex-shrink: 0; }
.remove-prize-button { border: 1px solid #e6ded1; border-radius: 8px; background: transparent; color: #9b8b78; height: 44px; width: 36px; flex-shrink: 0; }
.remove-prize-button:hover:enabled { background: #fbebe6; color: #b74c32; border-color: #e8c6ba; }
button:disabled { cursor: not-allowed; opacity: .45; }
.add-prize-button { background: transparent; border: 1px dashed #d8d0c1; color: #83725a; width: 100%; border-radius: 8px; font-size: 12px; min-height: 41px; margin: 18px 0 auto; }
.add-prize-button:hover, .add-prize-button:focus-visible { background: #f3efe6; color: #64543e; border-color: #ac9b80; }
.draw-stage { position: relative; overflow: hidden; isolation: isolate; color: #fff6e6; background: #2c352b; background-image: radial-gradient(ellipse at 50% 30%, #68704c42, transparent 65%); border: 1px solid #38432f; border-radius: 20px; padding: 26px 28px 18px; }
.draw-stage::before, .draw-stage::after { content: ''; position: absolute; z-index: -1; width: 420px; height: 420px; border: 1px solid #ece2c10b; border-radius: 50%; top: 20px; pointer-events: none; }
.draw-stage::before { left: -220px; }
.draw-stage::after { right: -220px; }
.stage-topline { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.draw-stage .section-number { border-color: #e4ddc12b; color: #c7b799; }
.draw-stage h2 { font-size: 15px; color: #eee7d8; }
.stage-status { display: flex; align-items: center; gap: 7px; font-size: 10px; color: #ccc4ae; border: 1px solid #d2c5a22b; border-radius: 20px; padding: 6px 10px; }
.stage-status .status-dot { background: #dabb81; }
.stage-content { text-align: center; padding: 30px 0 24px; }
.stage-eyebrow { color: #d6b880; font-size: 11px; letter-spacing: 2.5px; margin: 0 0 16px; overflow-wrap: anywhere; }
.name-display { font-size: clamp(32px, 5vw, 58px); font-weight: 700; line-height: 1.35; letter-spacing: 2px; min-height: 1.35em; overflow-wrap: anywhere; }
.name-display span { color: #edc48c; }
.is-rolling .name-display { animation: rolling-glow .35s ease-in-out infinite alternate; }
.winner-revealed { color: #f5d6a0; }
.stage-description { font-size: 12px; color: #b4b7a6; margin: 14px 0 26px; }
.draw-button { display: inline-flex; align-items: center; justify-content: center; gap: 16px; border: 1px solid #f2cd9d; color: #493d2c; background: #f2cd9d; padding: 14px 30px; min-width: 220px; min-height: 52px; border-radius: 10px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 18px #0002; }
.draw-button:hover:enabled, .draw-button:focus-visible { background: #ffdeb5; color: #372c1e; border-color: #ffdeb5; transform: translateY(-1px); }
.draw-button:disabled { color: #d4d1c5; background: #707463; border-color: #929682; opacity: .55; }
.draw-feedback { font-size: 11px; color: #d3b998; margin: 14px 0 0; min-height: 18px; }
.ready-message { color: #bfc7ae; }
.stage-bottomline { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #dfd8ba1a; padding-top: 15px; color: #929b86; font-size: 9px; letter-spacing: 1.5px; }
.button-spinner { width: 15px; height: 15px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .75s linear infinite; }
.confetti { pointer-events: none; position: absolute; z-index: 2; inset: 0; overflow: hidden; }
.confetti span { position: absolute; top: -20px; width: 8px; height: 14px; opacity: 0; animation: confetti-fall 1.5s ease-in forwards; }
.results-section { padding-top: 34px; }
.results-icon { display: inline-grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #efe6d5; color: #ab8346; font-size: 15px; }
.results-count { font-size: 11px; color: #928570; }
.results-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; list-style: none; padding: 0; margin: 18px 0 0; }
.result-card { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid #e3dccd; background: #fffefa; border-radius: 12px; min-width: 0; }
.result-number { color: #bba98d; font-size: 11px; align-self: flex-start; padding-top: 3px; }
.result-card > div { min-width: 0; }
.result-card > i { margin-left: auto; color: #c6a16b; }
.result-prize { font-size: 10px; color: #a07949; margin-bottom: 5px; overflow-wrap: anywhere; }
.result-name { font-size: 20px; color: #394232; font-weight: 700; margin: 0; overflow-wrap: anywhere; }
.results-note { font-size: 10px; color: #9a9181; margin-top: 14px; }
.winner-enter-active { transition: opacity .35s, transform .35s; }
.winner-enter-from { opacity: 0; transform: translateY(12px); }
.site-footer { display: flex; justify-content: space-between; gap: 15px; padding: 35px 0 28px; margin-top: 18px; color: #a0988c; font-size: 9px; letter-spacing: 1px; }
button, a, input { -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible { outline: 3px solid #c48a57; outline-offset: 4px; }
@keyframes rolling-glow { from { opacity: .65; } to { opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes confetti-fall { 0% { opacity: 1; transform: translate(0, -20px) rotate(0); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--drift), 500px) rotate(var(--turn)); } }
@media (max-width: 767px) {
  .page-width { width: calc(100% - 32px); }
  .site-header { min-height: 80px; gap: 12px; }
  .brand-logo { width: 94px; height: 52px; }
  .header-caption { display: none; }
  .header-label { font-size: 9px; letter-spacing: 1.5px; }
  .intro { padding: 36px 0 26px; }
  .intro-note { display: none; }
  .eyebrow { font-size: 9px; letter-spacing: 2px; }
  .intro-description { font-size: 12px; }
  .settings-grid { grid-template-columns: 1fr; gap: 16px; margin-bottom: 18px; }
  .setup-card { padding: 22px 18px; border-radius: 14px; }
  .prize-row { gap: 8px; }
  .prize-index { display: none; }
  .prize-quantity-field { width: 64px; }
  .draw-stage { padding: 20px 18px 16px; border-radius: 16px; }
  .stage-topline { gap: 10px; }
  .stage-topline .heading-with-number { gap: 8px; }
  .stage-status { font-size: 9px; padding-inline: 8px; }
  .stage-content { padding: 36px 0 24px; }
  .stage-bottomline { font-size: 8px; letter-spacing: .5px; }
  .results-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .result-card { gap: 10px; padding: 16px 12px; }
  .result-card > i { display: none; }
  .result-name { font-size: 18px; }
  .site-footer { font-size: 8px; letter-spacing: .5px; }
}
@media (max-width: 359px) {
  .results-grid { grid-template-columns: 1fr; }
  .name-input-row { gap: 6px; }
  .add-name-button { padding-inline: 10px; }
  .prize-quantity-field { width: 55px; }
  .stage-bottomline > span:last-child { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  .confetti { display: none; }
  .draw-button:hover:enabled { transform: none; }
}
</style>

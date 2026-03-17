<!-- ============================================
     过路费面板 v1.1
     FE-104: 划线原价 + 技能减免标注
     ============================================ -->
<template>
  <div class="toll-panel" v-if="visible">
    <div class="toll-header">
      <h3>💰 过路费结算</h3>
      <span class="city-name">{{ cell?.name }}</span>
    </div>
    
    <div class="toll-body">
      <!-- 原价 -->
      <div class="toll-row" :class="{ 'has-discount': hasDiscount }">
        <span class="label">基础过路费</span>
        <span class="value" :class="{ 'strikethrough': hasDiscount }">
          {{ baseToll }} 金
        </span>
      </div>
      
      <!-- 等级倍率 -->
      <div class="toll-row" v-if="levelMultiplier > 1">
        <span class="label">等级倍率 ({{ level }}级)</span>
        <span class="value">×{{ levelMultiplier }}</span>
      </div>
      
      <!-- 区域加成（荆州） -->
      <div class="toll-row bonus" v-if="regionBonus > 1">
        <span class="label">🗺️ 荆州区域加成</span>
        <span class="value">×1.2</span>
      </div>
      
      <!-- 城主技能加成（张飞） -->
      <div class="toll-row bonus" v-if="ownerBonus > 1">
        <span class="label">⚔️ 张飞「据水断桥」</span>
        <span class="value">×1.5</span>
      </div>
      
      <!-- 访客减免（刘备/夏侯惇） -->
      <div class="toll-row discount" v-if="visitorReduction < 1">
        <span class="label">
          <template v-if="visitorHeroId === 'liubei'">
            🛡️ 刘备「携民渡江」
          </template>
          <template v-else-if="visitorHeroId === 'xiaohoudun'">
            🛡️ 夏侯惇「拔矢啖睛」
          </template>
        </span>
        <span class="value">×{{ visitorReduction }}</span>
      </div>
      
      <!-- 甘宁劫营 -->
      <div class="toll-row special" v-if="isGanning">
        <span class="label">🏴‍☠️ 甘宁「百骑劫营」</span>
        <span class="value">各收50%</span>
      </div>
      
      <!-- 结盟免过路费 -->
      <div class="toll-row alliance" v-if="isAlliance">
        <span class="label">🤝 结盟免过路费</span>
        <span class="value">免费</span>
      </div>
      
      <!-- 分割线 -->
      <div class="toll-divider"></div>
      
      <!-- 最终金额 -->
      <div class="toll-row final">
        <span class="label">应付金额</span>
        <span class="value final-value">
          {{ finalToll }} 金
        </span>
      </div>
      
      <!-- 甘宁特殊显示 -->
      <div class="toll-split" v-if="isGanning && !isAlliance">
        <div class="split-item">
          <span class="label">您支付</span>
          <span class="value">{{ ganningVisitorPays }} 金</span>
        </div>
        <div class="split-item">
          <span class="label">城主实收</span>
          <span class="value">{{ ganningOwnerReceives }} 金</span>
        </div>
      </div>
    </div>
    
    <!-- B类卡选择 -->
    <div class="card-response" v-if="availableCards.length > 0 && !isAlliance">
      <p class="response-hint">是否使用锦囊卡？</p>
      <div class="card-options">
        <button
          v-for="card in availableCards"
          :key="card.id"
          class="card-btn"
          @click="$emit('useCard', card.id)"
        >
          <span class="card-icon">🎴</span>
          <span class="card-name">{{ card.name }}</span>
          <span class="card-effect">{{ getCardEffect(card.id) }}</span>
        </button>
      </div>
      <button class="skip-btn" @click="$emit('skip')">
        直接支付 ({{ countdown }}s)
      </button>
    </div>
    
    <!-- 确认支付 -->
    <div class="toll-actions" v-else>
      <button 
        class="pay-btn" 
        :disabled="!canPay"
        @click="$emit('pay')"
      >
        {{ canPay ? `支付 ${finalToll} 金` : '资金不足' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { MapCell, Player, Card } from '../types'
import { calculateToll, calculateGanningToll } from '../utils/tollCalculator'
import { getCardById } from '../data/cards'

const props = defineProps<{
  visible: boolean
  cell: MapCell | null
  visitor: Player | null
  owner: Player | null
  isAlliance: boolean
}>()

const emit = defineEmits<{
  (e: 'pay'): void
  (e: 'useCard', cardId: string): void
  (e: 'skip'): void
}>()

// 倒计时
const countdown = ref(10)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 计算过路费
const tollCalc = computed(() => {
  if (!props.cell || !props.visitor || !props.owner) {
    return null
  }
  return calculateToll(props.cell, props.visitor, props.owner, props.isAlliance)
})

// 基础值
const baseToll = computed(() => tollCalc.value?.baseToll || 0)
const level = computed(() => tollCalc.value?.level || 1)
const levelMultiplier = computed(() => tollCalc.value?.levelMultiplier || 1)
const regionBonus = computed(() => tollCalc.value?.regionBonus || 1)
const ownerBonus = computed(() => tollCalc.value?.ownerBonus || 1)
const visitorReduction = computed(() => tollCalc.value?.visitorReduction || 1)
const finalToll = computed(() => tollCalc.value?.finalToll || 0)

// 武将ID
const visitorHeroId = computed(() => props.visitor?.hero?.id)

// 是否有减免
const hasDiscount = computed(() => visitorReduction.value < 1)

// 是否是甘宁
const isGanning = computed(() => visitorHeroId.value === 'ganning')

// 甘宁劫营金额
const ganningToll = computed(() => {
  if (!props.cell || !props.visitor || !props.owner || !isGanning.value) {
    return { visitorPays: 0, ownerReceives: 0 }
  }
  return calculateGanningToll(props.cell, props.visitor, props.owner)
})

const ganningVisitorPays = computed(() => ganningToll.value.visitorPays)
const ganningOwnerReceives = computed(() => ganningToll.value.ownerReceives)

// 是否能支付
const canPay = computed(() => {
  if (!props.visitor) return false
  const amountToPay = isGanning.value ? ganningVisitorPays.value : finalToll.value
  return props.visitor.money >= amountToPay
})

// 可用的B类卡
const availableCards = computed((): Card[] => {
  if (!props.visitor) return []
  
  const cards: Card[] = []
  
  // 空城计
  const kongcheng = props.visitor.cards.find(c => 
    c.id.startsWith('kongchengji')
  )
  if (kongcheng) {
    cards.push(kongcheng)
  }
  
  // 借刀杀人（需要有其他玩家可选）
  const jiedao = props.visitor.cards.find(c => c.id === 'jiedaosharen')
  if (jiedao) {
    cards.push(jiedao)
  }
  
  return cards
})

// 获取卡牌效果描述
const getCardEffect = (cardId: string): string => {
  if (cardId.startsWith('kongchengji')) return '完全免疫'
  if (cardId === 'jiedaosharen') return '让他人代付'
  return ''
}

// 倒计时逻辑
watch(() => props.visible, (visible) => {
  if (visible && availableCards.value.length > 0) {
    countdown.value = 10
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        emit('skip')
      }
    }, 1000)
  } else {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.toll-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #e94560;
  border-radius: 16px;
  padding: 24px;
  min-width: 360px;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.toll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toll-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.city-name {
  color: #e94560;
  font-weight: bold;
}

.toll-body {
  margin-bottom: 16px;
}

.toll-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.toll-row.bonus .value {
  color: #ff6b6b;
}

.toll-row.discount .value {
  color: #4ecdc4;
}

.toll-row.special .value {
  color: #ffd93d;
}

.toll-row.alliance .value {
  color: #6bcb77;
}

.toll-row.final {
  margin-top: 8px;
  padding-top: 12px;
  font-size: 18px;
  font-weight: bold;
}

.final-value {
  color: #e94560;
  font-size: 24px;
}

.strikethrough {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}

.toll-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: 8px 0;
}

.toll-split {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 217, 61, 0.1);
  border-radius: 8px;
}

.split-item {
  flex: 1;
  text-align: center;
}

.split-item .label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.split-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #ffd93d;
}

.card-response {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.response-hint {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.card-options {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.card-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #2d3a4f 0%, #1a2332 100%);
  border: 1px solid #4ecdc4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.card-btn:hover {
  background: linear-gradient(135deg, #3d4a5f 0%, #2a3342 100%);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.card-name {
  color: #4ecdc4;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2px;
}

.card-effect {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.skip-btn, .pay-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.pay-btn {
  background: linear-gradient(135deg, #e94560 0%, #c73e54 100%);
  color: white;
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
}

.pay-btn:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}
</style>

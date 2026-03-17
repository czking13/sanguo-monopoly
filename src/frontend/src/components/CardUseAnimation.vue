<!-- ============================================
     卡牌使用动画 v1.1
     FE-118: 使用锦囊卡时的动画效果
     ============================================ -->
<template>
  <Transition name="card-use">
    <div class="card-use-animation" v-if="visible">
      <div class="card-stage">
        <!-- 卡牌展示 -->
        <div class="used-card" :class="cardRarity">
          <div class="card-glow"></div>
          <div class="card-inner">
            <div class="card-type-badge">
              {{ card?.type === '锦囊' ? '🎴 锦囊' : '📜 天命' }}
            </div>
            <h2 class="card-name">{{ card?.name }}</h2>
            <p class="card-desc">{{ card?.description }}</p>
          </div>
        </div>
        
        <!-- 效果展示 -->
        <div class="effect-display" v-if="effect">
          <div class="effect-icon" :class="effectType">
            {{ effectIcon }}
          </div>
          <div class="effect-info">
            <span class="effect-target">{{ effect.target }}</span>
            <span class="effect-value" :class="effectValueClass">
              {{ effectValueText }}
            </span>
          </div>
        </div>
        
        <!-- 台词 -->
        <div class="card-quote" v-if="quote">
          <span class="quote-text">"{{ quote }}"</span>
        </div>
        
        <!-- 确认按钮 -->
        <button class="btn-confirm" @click="handleConfirm">
          确认
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Player } from '../types'

interface CardEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'move' | 'special'
  target: string
  value?: number
  description?: string
}

const props = defineProps<{
  visible: boolean
  card: Card | null
  user: Player | null
  target?: Player | null
  effect?: CardEffect
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

// 卡牌稀有度
const cardRarity = computed(() => props.card?.rarity || 'common')

// 效果类型
const effectType = computed(() => props.effect?.type || 'special')

// 效果图标
const effectIcon = computed(() => {
  switch (effectType.value) {
    case 'damage': return '⚔️'
    case 'heal': return '💚'
    case 'buff': return '⬆️'
    case 'debuff': return '⬇️'
    case 'move': return '🏃'
    default: return '✨'
  }
})

// 效果值文本
const effectValueText = computed(() => {
  if (!props.effect) return ''
  
  const { type, value } = props.effect
  
  switch (type) {
    case 'damage':
      return `-${value} 金`
    case 'heal':
      return `+${value} 金`
    case 'buff':
    case 'debuff':
      return value ? `${value}` : ''
    default:
      return ''
  }
})

// 效果值样式类
const effectValueClass = computed(() => {
  if (!props.effect) return ''
  
  return props.effect.type === 'damage' ? 'negative' : 
         props.effect.type === 'heal' ? 'positive' : ''
})

// 卡牌台词
const quote = computed(() => {
  const quotes: Record<string, string> = {
    'huogong_1': '大火烧尽敌营！',
    'huogong_2': '大火烧尽敌营！',
    'kongchengji_1': '城中无人，敌必不敢进！',
    'kongchengji_2': '城中无人，敌必不敢进！',
    'meirenji': '英雄难过美人关！',
    'lianhuanji': '庞统连环，火烧连营！',
    'fanjianji': '蒋干盗书，中我反间之计！',
    'mantianguohai': '明修栈道，暗度陈仓！',
    'shengdongjixi_1': '声东而击西，敌人不知所守！',
    'shengdongjixi_2': '声东而击西，敌人不知所守！',
    'weiweijiuzhao': '攻其必救，解我之围！',
    'zouweishangji_1': '三十六计，走为上计！',
    'zouweishangji_2': '三十六计，走为上计！',
    'yiyidailao': '以逸待劳，后发制人！',
    'caochuanjiejian': '大雾垂江，草船借箭！',
    'kurouji': '黄盖诈降，以苦肉计骗取信任！',
    'jiedaosharen': '借他人之手，除我之患！',
    'baiqijieying': '百骑劫营，取敌首级如探囊取物！'
  }
  
  return quotes[props.card?.id || ''] || ''
})

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.card-use-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.card-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.used-card {
  position: relative;
  width: 280px;
  padding: 32px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 2px solid;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  animation: cardAppear 0.5s ease-out;
}

.used-card.common { border-color: #6b7280; }
.used-card.rare { border-color: #a855f7; }
.used-card.legendary { 
  border-color: #fbbf24;
  box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
}

@keyframes cardAppear {
  0% { opacity: 0; transform: scale(0.5) rotateY(180deg); }
  100% { opacity: 1; transform: scale(1) rotateY(0deg); }
}

.card-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  border-radius: 24px;
  background: currentColor;
  opacity: 0.1;
  filter: blur(20px);
  animation: glowPulse 1.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

.card-inner {
  position: relative;
  text-align: center;
}

.card-type-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.card-name {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: bold;
  color: white;
}

.card-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.effect-display {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  animation: effectSlide 0.3s ease-out 0.5s backwards;
}

@keyframes effectSlide {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.effect-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.effect-icon.damage { background: rgba(239, 68, 68, 0.2); }
.effect-icon.heal { background: rgba(34, 197, 94, 0.2); }
.effect-icon.buff { background: rgba(59, 130, 246, 0.2); }
.effect-icon.debuff { background: rgba(168, 85, 247, 0.2); }

.effect-info {
  display: flex;
  flex-direction: column;
}

.effect-target {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.effect-value {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.effect-value.positive { color: #4ecdc4; }
.effect-value.negative { color: #ef4444; }

.card-quote {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  animation: quoteFade 0.3s ease-out 0.8s backwards;
}

@keyframes quoteFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.quote-text {
  font-style: italic;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-confirm {
  padding: 12px 48px;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  animation: buttonAppear 0.3s ease-out 1s backwards;
}

@keyframes buttonAppear {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-confirm:hover {
  transform: scale(1.05);
}

/* 过渡动画 */
.card-use-enter-active {
  animation: cardUseIn 0.3s ease-out;
}

.card-use-leave-active {
  animation: cardUseOut 0.2s ease-in;
}

@keyframes cardUseIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes cardUseOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>

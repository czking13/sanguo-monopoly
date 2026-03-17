<!-- ============================================
     天命卡展示弹窗 v1.1
     FE-117: 抽到天命卡时的全屏展示
     ============================================ -->
<template>
  <Transition name="fade-scale">
    <div class="fate-card-modal" v-if="visible" @click.self="handleClose">
      <div class="fate-card-container">
        <div class="card-glow" :class="cardRarity"></div>
        
        <div class="fate-card" :class="cardRarity">
          <div class="card-header">
            <span class="card-type">📜 天命</span>
            <span class="card-rarity" :class="cardRarity">{{ rarityLabel }}</span>
          </div>
          
          <div class="card-body">
            <h2 class="card-name">{{ card?.name }}</h2>
            <div class="card-divider"></div>
            <p class="card-description">{{ card?.description }}</p>
          </div>
          
          <div class="card-footer">
            <span class="card-quote">"{{ getCardQuote() }}"</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="btn-confirm" @click="handleConfirm">
            确认
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '../types'

const props = defineProps<{
  visible: boolean
  card: Card | null
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()

// 卡牌稀有度
const cardRarity = computed(() => props.card?.rarity || 'common')

const rarityLabel = computed(() => {
  const labels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    legendary: '传说'
  }
  return labels[cardRarity.value] || '普通'
})

// 获取卡牌台词（根据卡牌ID）
const getCardQuote = (): string => {
  const quotes: Record<string, string> = {
    'sangumaolu': '刘备三顾茅庐，得卧龙出山！',
    'qiqinmenghuo': '七擒七纵，南蛮归心！',
    'caochuanjiejian_tm': '大雾垂江，曹军乱箭齐发！',
    'kongchengtuidi': '司马懿疑有伏兵，仓皇退去！',
    'taoyuanjieyi': '桃园三结义，生死与共！',
    'dandaohui': '关云长单刀赴会，英雄盖世！',
    'wangmeizhike': '前方有梅林，将士们加油！',
    'bingqiangmazhuang': '兵精粮足，士气高昂！',
    'chibizhizhan': '赤壁一把火，烧尽曹军百万！',
    'huoshaolianying': '陆逊火烧连营七百里！',
    'guaguliaodu': '华佗刮骨疗毒，关公神威盖世！',
    'weizhenhuaxia': '关云长威震华夏，谁敢争锋！',
    'jugongjinchui': '鞠躬尽瘁，死而后已...',
    'wangfengertao': '敌军势大，且退且走！',
    'tianzairenhuo': '天降灾祸，在所难免...',
    'dayishijingzhou': '关羽大意失荆州，悔之晚矣！',
    'lebusisu': '此间乐，不思蜀！',
    'baizouhuarong': '曹孟德败走华容道！'
  }
  
  return quotes[props.card?.id || ''] || '天命难违...'
}

const handleConfirm = () => {
  emit('confirm')
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.fate-card-modal {
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

.fate-card-container {
  position: relative;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 400px;
  border-radius: 20px;
  filter: blur(40px);
  opacity: 0.6;
  animation: pulse 2s ease-in-out infinite;
}

.card-glow.common { background: #6b7280; }
.card-glow.rare { background: #a855f7; }
.card-glow.legendary { background: #fbbf24; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.05); }
}

.fate-card {
  position: relative;
  width: 280px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 2px solid;
}

.fate-card.common { border-color: #6b7280; }
.fate-card.rare { border-color: #a855f7; }
.fate-card.legendary { 
  border-color: #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-rarity {
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-rarity.common {
  background: #6b7280;
  color: white;
}

.card-rarity.rare {
  background: #a855f7;
  color: white;
}

.card-rarity.legendary {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a2e;
}

.card-body {
  text-align: center;
  margin-bottom: 16px;
}

.card-name {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.card-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 0 auto 16px;
}

.card-description {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.card-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-quote {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.5);
}

.card-actions {
  margin-top: 24px;
  text-align: center;
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
}

.btn-confirm:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
}

/* 动画 */
.fade-scale-enter-active {
  animation: fadeScaleIn 0.3s ease-out;
}

.fade-scale-leave-active {
  animation: fadeScaleOut 0.2s ease-in;
}

@keyframes fadeScaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeScaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>

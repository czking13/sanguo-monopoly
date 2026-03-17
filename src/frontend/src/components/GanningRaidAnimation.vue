<!-- ============================================
     甘宁劫营动画 v1.1
     FE-105: 甘宁百骑劫营的过路费抢夺动画
     ============================================ -->
<template>
  <Transition name="raid-fade">
    <div class="ganning-raid-overlay" v-if="visible">
      <div class="raid-container">
        <!-- 标题 -->
        <div class="raid-header">
          <span class="raid-icon">⚔️</span>
          <h2 class="raid-title">百骑劫营</h2>
          <span class="raid-subtitle">甘宁专属技能</span>
        </div>
        
        <!-- 动画区域 -->
        <div class="raid-animation">
          <!-- 金币从城主飞向甘宁 -->
          <div class="coin-stream">
            <div class="coin-group to-ganning">
              <span 
                v-for="i in 5" 
                :key="'ganning-' + i"
                class="coin"
                :style="{ animationDelay: (i * 0.1) + 's' }"
              >💰</span>
            </div>
            <div class="coin-group to-owner">
              <span 
                v-for="i in 5" 
                :key="'owner-' + i"
                class="coin"
                :style="{ animationDelay: (i * 0.1 + 0.5) + 's' }"
              >💰</span>
            </div>
          </div>
          
          <!-- 玩家头像 -->
          <div class="players-display">
            <div class="player-card ganning">
              <div class="avatar">
                <img :src="`/heroes/ganning.jpg`" alt="甘宁" />
              </div>
              <span class="name">{{ ganningPlayer?.name }}</span>
              <span class="gain">+{{ ganningGain }} 金</span>
            </div>
            
            <div class="vs-badge">
              <span class="vs-icon">⚔️</span>
            </div>
            
            <div class="player-card owner">
              <div class="avatar" :style="{ borderColor: owner?.color }">
                <span>{{ owner?.name?.charAt(0) }}</span>
              </div>
              <span class="name">{{ owner?.name }}</span>
              <span class="loss">-{{ ownerLoss }} 金</span>
            </div>
          </div>
        </div>
        
        <!-- 结果 -->
        <div class="raid-result">
          <p class="result-text">
            甘宁发动「百骑劫营」，抢夺 {{ totalToll }} 金过路费的 50%！
          </p>
          <div class="result-breakdown">
            <span class="item">{{ owner?.name }} 获得 {{ ownerGain }} 金</span>
            <span class="item">{{ ganningPlayer?.name }} 抢夺 {{ ganningGain }} 金</span>
          </div>
        </div>
        
        <button class="btn-confirm" @click="handleConfirm">
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player, MapCell } from '../types'

const props = defineProps<{
  visible: boolean
  ganningPlayer: Player | null
  owner: Player | null
  cell: MapCell | null
  totalToll: number
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

// 甘宁获得
const ganningGain = computed(() => Math.floor(props.totalToll * 0.5))

// 城主获得
const ownerGain = computed(() => props.totalToll - ganningGain.value)

// 城主损失
const ownerLoss = computed(() => ganningGain.value)

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.ganning-raid-overlay {
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

.raid-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  border: 2px solid #ef4444;
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
}

.raid-header {
  margin-bottom: 24px;
}

.raid-icon {
  font-size: 48px;
  animation: swordSwing 0.5s ease-in-out;
}

@keyframes swordSwing {
  0% { transform: rotate(-30deg); }
  50% { transform: rotate(30deg); }
  100% { transform: rotate(0deg); }
}

.raid-title {
  margin: 12px 0 4px;
  font-size: 28px;
  color: #ef4444;
}

.raid-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.raid-animation {
  position: relative;
  padding: 40px 0;
}

.coin-stream {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
}

.coin-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coin {
  font-size: 20px;
  animation: coinFloat 1s ease-out forwards;
  opacity: 0;
}

.to-ganning .coin {
  animation-name: coinFloatRight;
}

.to-owner .coin {
  animation-name: coinFloatLeft;
}

@keyframes coinFloatRight {
  0% { opacity: 0; transform: translateX(-50px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateX(50px); }
}

@keyframes coinFloatLeft {
  0% { opacity: 0; transform: translateX(50px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50px); }
}

.players-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-card .avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid;
  overflow: hidden;
  background: #2d3a4f;
}

.player-card.ganning .avatar {
  border-color: #ef4444;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
}

.player-card .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-card .avatar span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.player-card .name {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.player-card .gain {
  font-size: 16px;
  font-weight: bold;
  color: #4ecdc4;
}

.player-card .loss {
  font-size: 16px;
  font-weight: bold;
  color: #ef4444;
}

.vs-badge {
  width: 48px;
  height: 48px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: vsPulse 0.5s ease-in-out infinite;
}

@keyframes vsPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.vs-icon {
  font-size: 24px;
}

.raid-result {
  margin: 24px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.result-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: white;
}

.result-breakdown {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.result-breakdown .item {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
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
}

/* 过渡动画 */
.raid-fade-enter-active {
  animation: raidFadeIn 0.3s ease-out;
}

.raid-fade-leave-active {
  animation: raidFadeOut 0.2s ease-in;
}

@keyframes raidFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes raidFadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}
</style>

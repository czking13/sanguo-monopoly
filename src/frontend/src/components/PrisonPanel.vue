<!-- ============================================
     监狱状态面板 v1.1
     FE-112: 监狱状态显示
     显示入狱状态、等待回合、出狱选项
     ============================================ -->
<template>
  <div class="prison-panel" v-if="visible && player">
    <div class="prison-header">
      <span class="prison-icon">⛓️</span>
      <h3>监狱</h3>
    </div>
    
    <div class="prison-body">
      <!-- 入狱状态显示 -->
      <div class="status-display">
        <div class="status-icon">
          <span class="chains">🔗</span>
        </div>
        <div class="status-info">
          <p class="status-text">{{ player.name }} 被关押在监狱中</p>
          <p class="wait-info">
            <span class="wait-label">等待回合：</span>
            <span class="wait-value">{{ waitDescription }}</span>
          </p>
        </div>
      </div>
      
      <!-- 出狱选项 -->
      <div class="escape-options" v-if="isCurrentPlayer">
        <h4>选择出狱方式：</h4>
        
        <!-- 关羽/司马懿技能 -->
        <button 
          v-if="canUseHeroSkill"
          class="option-btn skill"
          @click="handleHeroEscape"
        >
          <span class="option-icon">⚔️</span>
          <div class="option-content">
            <span class="option-title">使用武将技能</span>
            <span class="option-desc">{{ heroSkillName }}</span>
          </div>
          <span class="option-badge free">免费</span>
        </button>
        
        <!-- 缴纳保释金 -->
        <button
          v-if="canPayBail"
          class="option-btn bail"
          @click="handlePayBail"
        >
          <span class="option-icon">💰</span>
          <div class="option-content">
            <span class="option-title">缴纳保释金</span>
            <span class="option-desc">支付 500 金</span>
          </div>
          <span class="option-badge cost">500金</span>
        </button>
        
        <!-- 掷骰出狱（仅双骰规则） -->
        <button
          v-if="canRollForRelease"
          class="option-btn roll"
          @click="handleRollForRelease"
        >
          <span class="option-icon">🎲</span
          <div class="option-content">
            <span class="option-title">尝试掷骰出狱</span>
            <span class="option-desc">掷出相同点数即可出狱</span>
          </div>
        </button>
        
        <!-- 等待 -->
        <button
          class="option-btn wait"
          @click="handleWait"
        >
          <span class="option-icon">⏳</span>
          <div class "option-content">
            <span class="option-title">继续蹲狱</span>
            <span class="option-desc">等待下一回合</span>
          </div>
        </button>
      </div>
      
      <!-- 非当前玩家提示 -->
      <div class="not-your-turn" v-else>
        <p>等待 {{ player.name }} 做出选择...</p>
      </div>
      
      <!-- 倒计时 -->
      <div class="timeout-bar" v-if="isCurrentPlayer && remainingTime > 0">
        <div class="timeout-progress" :style="{ width: progressWidth + '%' }"></div>
        <span class="timeout-text">剩余 {{ Math.ceil(remainingTime / 1000) }} 秒</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Player, PlayerStatus } from '../types'
import { GAME_CONSTANTS } from '../types'
import { getHeroById } from '../data/heroes'

const props = defineProps<{
  visible: boolean
  player: Player | null
  isCurrentPlayer: boolean
  playerCount: number
  timeout?: number // 毫秒
}>()

const emit = defineEmits<{
  (e: 'useHeroSkill): void
  (e: 'payBail'): void
  (e: 'rollForRelease'): void
  (e: 'wait'): void
}>()

const remainingTime = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 等待描述
const waitDescription = computed(() => {
  if (!props.player) return ''
  
  const status = props.player.status
  switch (status) {
    case 'IN_JAIL':
      return '刚入狱（本回合不计入）'
    case 'JAILED_WAIT_1':
      return '第 1 回合'
    case 'JAILED_WAIT_2':
      return '第 2 回合'
    case 'JAILED_WAIT_3':
      return '第 702 回合（强制缴费）'
    default:
      return '未知'
  }
})

// 是否可以使用武将技能
const canUseHeroSkill = computed(() => {
  if (!props.player?.hero) return false
  
  const heroId = props.player.hero.id
  if (heroId !== 'guanyu' && heroId !== 'simayi') return false
  
  const abilityKey = heroId === 'guanyu' ? 'guanyu_escape' : 'simayi_yinren'
  return !props.player.heroAbilityUsed[abilityKey]
})

// 武将技能名称
const heroSkillName = computed(() => {
  const heroId = props.player?.hero?.id
  if (heroId === 'guanyu') return '关羽「过五关斩六将」'
  if (heroId === 'simayi') return '司马懿「隐忍」'
  return ''
})

// 是否可以缴纳保释金
const canPayBail = computed(() => {
  if (!props.player) return false
  return props.player.money >= GAME_CONSTANTS.BAIL_AMOUNT
})

// 是否可以掷骰出狱（仅双骰规则）
const canRollForRelease = computed(() => {
  return props.playerCount <= 4 // 2-4 人局使用双骰
})

// 进度条宽度
const progressWidth = computed(() => {
  if (remainingTime.value <= 0 || !props.timeout) return 0
  return Math.max(0, (remainingTime.value / props.timeout) * 100)
})

// 处理操作
const handleHeroEscape = () => emit('useHeroSkill')
const handlePayBail = () => emit('payBail')
const handleRollForRelease = () => emit('rollForRelease')
const handleWait = () => emit('wait')

// 倒计时
watch(() => props.visible, (visible) => {
  if (visible && props.isCurrentPlayer && props.timeout) {
    remainingTime.value = props.timeout
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      remainingTime.value = Math.max(0, remainingTime.value - 100)
      if (remainingTime.value <= 0) {
        handleWait() // 超时自动等待
      }
    }, 100)
  } else {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.prison-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1f3d 100%);
  border-radius: 16px;
  padding: 20px;
  min-width: 300px;
  max-width: 400px;
}

.prison-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.prison-icon {
  font-size: 28px;
}

.prison-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.status-display {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255,0.05);
  border-radius: 12px;
}

.status-icon .chains {
  font-size: 40px;
  animation: chainSwing 2s ease-in-out infinite;
}

@keyframes chainSwing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.status-info {
  flex: 1;
}

.status-text {
  margin: 0 0 8px;
  font-size: 14px;
  color: white;
  font-weight: bold;
}

.wait-info {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.wait-label {
  color: rgba(255, 255,255, 0.5);
}

.wait-value {
  color: #f59e0b;
  font-weight: bold;
}

.escape-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.escape-options h4 {
  margin: 0 0 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.option-btn.skill {
  border-color: #4ecdc4;
}

.option-btn.bail {
  border-color: #f59e0b;
}

.option-btn.roll {
  border-color: #a855f7;
}

.option-btn.wait {
  border-color: rgba(255, 255, 255, 0.2);
}

.option-icon {
  font-size: 24px;
}

.option-content {
  flex: 1;
  text-align: left;
}

.option-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.option-desc {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.option-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.option-badge.free {
  background: #4ecdc4;
  color: #1a1a2e;
}

.option-badge.cost {
  background: #f59e0b;
  color: #1a1a2e;
}

.not-your-turn {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.timeout-bar {
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
}

.timeout-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4 0%, #45b7aa 100%);
  transition: width 0.1s linear;
}

.timeout-text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 11px;
  color: white;
}
</style>

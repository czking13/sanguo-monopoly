<!-- ============================================
     武将选择界面 v1.1
     FE-114~118: 游戏开始前的武将选择
     ============================================ -->
<template>
  <div class="hero-select-screen">
    <div class="select-header">
      <h2>选择你的武将</h2>
      <p class="subtitle">每位玩家选择一位三国名将作为你的化身</p>
    </div>
    
    <!-- 玩家选择状态 -->
    <div class="players-status">
      <div 
        v-for="player in players" 
        :key="player.id"
        class="player-status"
        :class="{ 
          ready: player.selectedHero,
          current: player.id === currentUserId
        }"
      >
        <span class="player-name">{{ player.name }}</span>
        <span class="player-hero" v-if="player.selectedHero">
          {{ getHeroName(player.selectedHero) }}
        </span>
        <span class="player-waiting" v-else>
          选择中...
        </span>
      </div>
    </div>
    
    <!-- 武将列表 -->
    <div class="heroes-grid">
      <div
        v-for="hero in availableHeroes"
        :key="hero.id"
        class="hero-card"
        :class="{
          selected: selectedHeroId === hero.id,
          taken: isHeroTaken(hero.id),
          faction: true
        }"
        :style="{ '--faction-color': getFactionColor(hero.faction) }"
        @click="handleSelectHero(hero)"
      >
        <div class="hero-avatar">
          <img :src="`/heroes/${hero.id}.jpg`" :alt="hero.name" />
          <div class="faction-badge" :class="getFactionClass(hero.faction)"></div>
        </div>
        
        <div class="hero-info">
          <h3 class="hero-name">{{ hero.name }}</h3>
          <span class="hero-faction">{{ hero.faction }}</span>
        </div>
        
        <div class="hero-skill">
          <span class="skill-type" :class="hero.skillType">
            {{ getSkillTypeLabel(hero.skillType) }}
          </span>
          <p class="skill-desc">{{ hero.skillDescription }}</p>
        </div>
        
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-label">攻击</span>
            <div class="stat-bar">
              <div class="stat-fill" :style="{ width: (hero.attack || 0) + '%' }"></div>
            </div>
          </div>
          <div class="stat">
            <span class="stat-label">防御</span>
            <div class="stat-bar">
              <div class="stat-fill" :style="{ width: (hero.defense || 0) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div class="hero-select-overlay" v-if="isHeroTaken(hero.id)">
          <span class="taken-label">已选择</span>
        </div>
      </div>
    </div>
    
    <!-- 确认按钮 -->
    <div class="action-bar">
      <button 
        class="btn-confirm"
        :disabled="!selectedHeroId"
        @click="handleConfirm"
      >
        确认选择
      </button>
      <button 
        class="btn-random"
        @click="handleRandomSelect"
      >
        🎲 随机选择
      </button>
    </div>
    
    <!-- 倒计时 -->
    <div class="countdown-bar" v-if="remainingTime > 0">
      <div class="countdown-progress" :style="{ width: progressWidth + '%' }"></div>
      <span class="countdown-text">剩余 {{ Math.ceil(remainingTime / 1000) }} 秒</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Hero, Player } from '../types'
import { heroes } from '../data/heroes'

const props = defineProps<{
  players: Player[]
  currentUserId: string
  timeout?: number
}>()

const emit = defineEmits<{
  (e: 'select', heroId: string): void
  (e: 'confirm', heroId: string): void
  (e: 'timeout'): void
}>()

const selectedHeroId = ref<string | null>(null)
const remainingTime = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// 可用武将列表
const availableHeroes = computed(() => {
  return heroes.filter(h => !isHeroTaken(h.id))
})

// 被选武将ID集合
const takenHeroIds = computed(() => {
  return new Set(
    props.players
      .filter(p => p.selectedHero)
      .map(p => p.selectedHero)
  )
})

// 检查武将是否被选
const isHeroTaken = (heroId: string): boolean => {
  return takenHeroIds.value.has(heroId)
}

// 获取武将名称
const getHeroName = (heroId: string): string => {
  const hero = heroes.find(h => h.id === heroId)
  return hero?.name || '未知'
}

// 获取势力颜色
const getFactionColor = (faction: string): string => {
  const colors: Record<string, string> = {
    '魏': '#3b82f6',
    '蜀': '#22c55e',
    '吴': '#ef4444',
    '中立': '#6b7280'
  }
  return colors[faction] || '#6b7280'
}

// 获取势力类名
const getFactionClass = (faction: string): string => {
  const classes: Record<string, string> = {
    '魏': 'faction-wei',
    '蜀': 'faction-shu',
    '吴': 'faction-wu',
    '中立': 'faction-neutral'
  }
  return classes[faction] || 'faction-neutral'
}

// 获取技能类型标签
const getSkillTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'ACTIVE': '主动',
    'PASSIVE': '被动',
    'TRIGGER': '触发'
  }
  return labels[type] || type
}

// 选择武将
const handleSelectHero = (hero: Hero) => {
  if (isHeroTaken(hero.id)) return
  selectedHeroId.value = hero.id
  emit('select', hero.id)
}

// 确认选择
const handleConfirm = () => {
  if (selectedHeroId.value) {
    emit('confirm', selectedHeroId.value)
  }
}

// 随机选择
const handleRandomSelect = () => {
  const available = availableHeroes.value
  if (available.length === 0) return
  
  const randomHero = available[Math.floor(Math.random() * available.length)]
  selectedHeroId.value = randomHero.id
  emit('select', randomHero.id)
}

// 进度条宽度
const progressWidth = computed(() => {
  if (remainingTime.value <= 0 || !props.timeout) return 0
  return Math.max(0, (remainingTime.value / props.timeout) * 100)
})

// 倒计时
onMounted(() => {
  if (props.timeout) {
    remainingTime.value = props.timeout
    timer = setInterval(() => {
      remainingTime.value = Math.max(0, remainingTime.value - 100)
      if (remainingTime.value <= 0) {
        // 超时自动随机选择
        handleRandomSelect()
        handleConfirm()
        emit('timeout')
      }
    }, 100)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.hero-select-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 40px 20px;
}

.select-header {
  text-align: center;
  margin-bottom: 30px;
}

.select-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  color: white;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.players-status {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.player-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-status.current {
  border-color: #4ecdc4;
}

.player-status.ready {
  background: rgba(78, 205, 196, 0.1);
}

.player-name {
  font-size: 14px;
  color: white;
  font-weight: bold;
}

.player-hero {
  font-size: 12px;
  color: #4ecdc4;
}

.player-waiting {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto 30px;
}

.hero-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  border-color: var(--faction-color, transparent);
}

.hero-card:hover:not(.taken) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.hero-card.selected {
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.hero-card.taken {
  opacity: 0.5;
  cursor: not-allowed;
}

.hero-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--faction-color, #333);
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.faction-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
}

.faction-wei { background: #3b82f6; }
.faction-shu { background: #22c55e; }
.faction-wu { background: #ef4444; }
.faction-neutral { background: #6b7280; }

.hero-info {
  text-align: center;
  margin-bottom: 12px;
}

.hero-name {
  margin: 0 0 4px;
  font-size: 16px;
  color: white;
}

.hero-faction {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.hero-skill {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
}

.skill-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 6px;
}

.skill-type.ACTIVE {
  background: #3b82f6;
  color: white;
}

.skill-type.PASSIVE {
  background: #22c55e;
  color: white;
}

.skill-type.TRIGGER {
  background: #f59e0b;
  color: #1a1a2e;
}

.skill-desc {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.hero-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  width: 32px;
}

.stat-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4 0%, #45b7aa 100%);
  transition: width 0.3s;
}

.hero-select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.taken-label {
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-confirm {
  padding: 14px 40px;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-random {
  padding: 14px 24px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-random:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.countdown-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
}

.countdown-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4 0%, #f59e0b 100%);
  transition: width 0.1s linear;
}

.countdown-text {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  color: white;
}
</style>

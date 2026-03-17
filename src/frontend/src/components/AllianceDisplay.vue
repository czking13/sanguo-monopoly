<!-- ============================================
     联盟状态显示 v1.1
     FE-116: 显示玩家之间的联盟关系
     ============================================ -->
<template>
  <div class="alliance-display" v-if="hasAlliances">
    <div class="alliance-header">
      <span class="alliance-icon">🤝</span>
      <span class="alliance-title">桃园结义</span>
    </div>
    
    <div class="alliance-list">
      <div 
        v-for="alliance in alliances" 
        :key="alliance.id"
        class="alliance-item"
      >
        <div class="alliance-players">
          <div class="player-avatar" :style="{ borderColor: alliance.player1.color }">
            {{ alliance.player1.name.charAt(0) }}
          </div>
          <span class="alliance-link">🤝</span>
          <div class="player-avatar" :style="{ borderColor: alliance.player2.color }">
            {{ alliance.player2.name.charAt(0) }}
          </div>
        </div>
        
        <div class="alliance-info">
          <span class="alliance-names">
            {{ alliance.player1.name }} & {{ alliance.player2.name }}
          </span>
          <span class="alliance-turns">
            剩余 {{ alliance.remainingTurns }} 回合
          </span>
        </div>
        
        <div class="alliance-benefits">
          <span class="benefit">✓ 互免过路费</span>
          <span class="benefit">✓ 不可互攻</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player, StatusEffect } from '../types'

const props = defineProps<{
  players: Player[]
}>()

interface AllianceInfo {
  id: string
  player1: Player
  player2: Player
  remainingTurns: number
}

// 解析联盟关系
const alliances = computed((): AllianceInfo[] => {
  const result: AllianceInfo[] = []
  const processedPairs = new Set<string>()
  
  for (const player of props.players) {
    for (const effect of player.statusEffects) {
      if (effect.type === 'ALLIANCE') {
        const partner = props.players.find(p => p.id === effect.source)
        if (!partner) continue
        
        // 避免重复显示同一对联盟
        const pairId = [player.id, effect.source].sort().join('-')
        if (processedPairs.has(pairId)) continue
        processedPairs.add(pairId)
        
        result.push({
          id: pairId,
          player1: player,
          player2: partner,
          remainingTurns: effect.remainingTurns
        })
      }
    }
  }
  
  return result
})

// 是否有联盟
const hasAlliances = computed(() => {
  return alliances.value.length > 0
})
</script>

<style scoped>
.alliance-display {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(69, 183, 170, 0.1) 100%);
  border: 1px solid rgba(78, 205, 196, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.alliance-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(78, 205, 196, 0.2);
}

.alliance-icon {
  font-size: 24px;
}

.alliance-title {
  font-size: 14px;
  font-weight: bold;
  color: #4ecdc4;
}

.alliance-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alliance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.alliance-players {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.3);
}

.alliance-link {
  font-size: 16px;
}

.alliance-info {
  flex: 1;
}

.alliance-names {
  display: block;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}

.alliance-turns {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.alliance-benefits {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.benefit {
  font-size: 10px;
  color: #4ecdc4;
}

/* 动画 */
.alliance-item {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

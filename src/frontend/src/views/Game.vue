<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'

const route = useRoute()
const gameStore = useGameStore()

// 暂时用占位内容
const roomId = computed(() => route.params.roomId as string)
const isMyTurn = ref(false)
const diceValue = ref([1, 1])
const isRolling = ref(false)

function rollDice() {
  if (!isMyTurn.value || isRolling.value) return
  
  isRolling.value = true
  // 模拟掷骰子动画
  setTimeout(() => {
    diceValue.value = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
    isRolling.value = false
  }, 500)
}

onMounted(() => {
  console.log('进入游戏:', roomId.value)
})

onUnmounted(() => {
  gameStore.clearGame()
})
</script>

<template>
  <div class="min-h-screen p-4">
    <div class="text-center text-white">
      <h1 class="text-3xl font-chinese text-gold mb-8">游戏进行中</h1>
      
      <p class="text-gray-400 mb-4">房间：{{ roomId }}</p>
      
      <p class="text-gray-500 mb-8">游戏页面开发中...</p>
      
      <!-- 测试骰子 -->
      <div class="inline-flex gap-4">
        <div
          :class="isRolling ? 'animate-dice-roll' : ''"
          class="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl text-slate-900 shadow-lg"
        >
          {{ diceValue[0] }}
        </div>
        <div
          :class="isRolling ? 'animate-dice-roll' : ''"
          class="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl text-slate-900 shadow-lg"
        >
          {{ diceValue[1] }}
        </div>
      </div>
      
      <div class="mt-8">
        <button
          @click="rollDice"
          :disabled="!isMyTurn || isRolling"
          class="px-8 py-3 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          掷骰子
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const playerName = ref('')
const isConnecting = ref(false)

function startGame() {
  if (!playerName.value.trim()) {
    alert('请输入昵称')
    return
  }
  
  // 保存玩家信息
  localStorage.setItem('playerName', playerName.value)
  localStorage.setItem('playerId', `player_${Date.now()}`)
  
  router.push('/lobby')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <!-- Logo -->
    <div class="text-center mb-12">
      <h1 class="text-6xl font-chinese text-gold mb-4 drop-shadow-lg">
        三国大富翁
      </h1>
      <p class="text-xl text-gray-400">群雄逐鹿，问鼎天下</p>
    </div>

    <!-- 输入昵称 -->
    <div class="w-full max-w-md">
      <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-8 shadow-xl border border-slate-700">
        <label class="block text-lg mb-2 text-gray-300">请输入你的昵称</label>
        <input
          v-model="playerName"
          type="text"
          maxlength="12"
          placeholder="例如：卧龙先生"
          class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
          @keyup.enter="startGame"
        />
        
        <button
          @click="startGame"
          :disabled="isConnecting"
          class="w-full mt-6 py-3 bg-gradient-to-r from-gold to-yellow-500 text-slate-900 font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isConnecting ? '连接中...' : '进入大厅' }}
        </button>
      </div>

      <!-- 装饰 -->
      <div class="flex justify-center gap-8 mt-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-wei rounded-full flex items-center justify-center mb-2">
            <span class="text-white text-xl">魏</span>
          </div>
          <span class="text-gray-500 text-sm">魏国</span>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-shu rounded-full flex items-center justify-center mb-2">
            <span class="text-white text-xl">蜀</span>
          </div>
          <span class="text-gray-500 text-sm">蜀国</span>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-wu rounded-full flex items-center justify-center mb-2">
            <span class="text-white text-xl">吴</span>
          </div>
          <span class="text-gray-500 text-sm">吴国</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

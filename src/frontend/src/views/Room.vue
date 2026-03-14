<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Hero } from '@/types'

const route = useRoute()
const router = useRouter()

const playerName = ref(localStorage.getItem('playerName') || '玩家')
const playerId = ref(localStorage.getItem('playerId') || `player_${Date.now()}`)

// 武将列表
const heroes = ref<Hero[]>([
  { id: 'caocao', name: '曹操', faction: 'wei', rarity: 'legendary', skill: { name: '挟天子', description: '经过起点额外获得15%资金', type: 'passive' }, unlocked: true },
  { id: 'liubei', name: '刘备', faction: 'shu', rarity: 'legendary', skill: { name: '仁德', description: '经过敌方城池过路费减半', type: 'passive' }, unlocked: true },
  { id: 'sunquan', name: '孙权', faction: 'wu', rarity: 'legendary', skill: { name: '制衡', description: '每回合可换1张锦囊卡', type: 'active' }, unlocked: true },
  { id: 'zhugeliang', name: '诸葛亮', faction: 'shu', rarity: 'epic', skill: { name: '神算', description: '可查看下一张锦囊卡', type: 'active' }, unlocked: true },
  { id: 'guanyu', name: '关羽', faction: 'shu', rarity: 'epic', skill: { name: '武圣', description: '免费出狱1次', type: 'passive' }, unlocked: true },
  { id: 'zhouyu', name: '周瑜', faction: 'wu', rarity: 'epic', skill: { name: '火攻', description: '火攻卡效果翻倍', type: 'passive' }, unlocked: true },
])

const selectedHero = ref<string | null>(null)
const isReady = ref(false)
const roomId = computed(() => route.params.roomId as string)
const showInviteModal = ref(false)
const inviteLink = ref('')

// 房间数据
const roomData = ref({
  id: '',
  name: '',
  hostId: '',
  maxPlayers: 4,
  players: [] as Array<{id: string, name: string, hero: string, isReady: boolean, isHost: boolean, isBot?: boolean}>,
  status: 'waiting'
})

const isHost = computed(() => roomData.value.hostId === playerId.value)
const canStart = computed(() => {
  return roomData.value.players.length >= 2 && 
         roomData.value.players.every(p => p.hero && p.isReady)
})

// 初始化房间
onMounted(() => {
  const roomCode = localStorage.getItem('roomCode')
  const isNewRoom = roomCode === roomId.value
  
  if (isNewRoom) {
    // 新创建的房间，使用 localStorage 保存的设置
    const savedMaxPlayers = parseInt(localStorage.getItem('maxPlayers') || '4')
    const savedRoomName = localStorage.getItem('roomName') || '新房间'
    
    roomData.value = {
      id: roomId.value,
      name: savedRoomName,
      hostId: playerId.value,
      maxPlayers: savedMaxPlayers,
      players: [{
        id: playerId.value,
        name: playerName.value,
        hero: '',
        isReady: false,
        isHost: true
      }],
      status: 'waiting'
    }
    
    // 生成邀请链接
    inviteLink.value = `${window.location.origin}/room/${roomId.value}`
  } else {
    // 模拟房间（根据6位短码）
    const roomConfigs: Record<string, any> = {
      'ABC123': { name: '三国大乱斗', maxPlayers: 4, hostId: 'player_1', players: [
        { id: 'player_1', name: '曹操', hero: 'caocao', isReady: true, isHost: true },
        { id: 'player_2', name: '典韦', hero: 'dianwei', isReady: true, isHost: false },
      ]},
      'SHU456': { name: '蜀汉崛起', maxPlayers: 4, hostId: 'player_1', players: [
        { id: 'player_1', name: '刘备', hero: 'liubei', isReady: true, isHost: true },
        { id: 'player_2', name: '关羽', hero: 'guanyu', isReady: true, isHost: false },
        { id: 'player_3', name: '张飞', hero: 'zhangfei', isReady: false, isHost: false },
      ]},
      'WU789': { name: '江东霸业', maxPlayers: 4, hostId: 'player_1', players: [
        { id: 'player_1', name: '孙权', hero: 'sunquan', isReady: true, isHost: true },
        { id: 'player_2', name: '周瑜', hero: 'zhouyu', isReady: true, isHost: false },
        { id: 'player_3', name: '陆逊', hero: 'luxun', isReady: true, isHost: false },
        { id: 'player_4', name: '吕蒙', hero: 'lvmeng', isReady: true, isHost: false },
      ]},
      'QX012': { name: '群雄逐鹿', maxPlayers: 8, hostId: 'player_1', players: [
        { id: 'player_1', name: '董卓', hero: 'caocao', isReady: true, isHost: true },
      ]},
      'CB345': { name: '赤壁之战', maxPlayers: 6, hostId: 'player_1', players: [
        { id: 'player_1', name: '周瑜', hero: 'zhouyu', isReady: true, isHost: true },
        { id: 'player_2', name: '诸葛亮', hero: 'zhugeliang', isReady: true, isHost: false },
      ]},
    }
    
    const config = roomConfigs[roomId.value] || { name: '新房间', maxPlayers: 4, hostId: playerId.value, players: [] }
    
    // 检查当前用户是否已在玩家列表中，如果不在则添加
    const players = [...config.players]
    const existingPlayer = players.find(p => p.id === playerId.value)
    if (!existingPlayer) {
      players.push({
        id: playerId.value,
        name: playerName.value,
        hero: '',
        isReady: false,
        isHost: false
      })
    }
    
    roomData.value = {
      id: roomId.value,
      name: config.name,
      hostId: config.hostId,
      maxPlayers: config.maxPlayers,
      players: players,
      status: 'waiting'
    }
    
    inviteLink.value = `${window.location.origin}/room/${roomId.value}`
  }
})

function selectHero(heroId: string) {
  if (isReady.value) return
  selectedHero.value = heroId
  
  // 更新自己的武将
  const myPlayer = roomData.value.players.find(p => p.id === playerId.value)
  if (myPlayer) {
    myPlayer.hero = heroId
    // 房主选择武将后自动准备
    if (isHost.value) {
      myPlayer.isReady = true
    }
  }
}

function toggleReady() {
  if (!selectedHero.value) {
    alert('请先选择武将')
    return
  }
  isReady.value = !isReady.value
  
  // 更新自己的准备状态和武将
  const myPlayer = roomData.value.players.find(p => p.id === playerId.value)
  if (myPlayer) {
    myPlayer.isReady = isReady.value
    myPlayer.hero = selectedHero.value
  }
}

function addBot() {
  if (roomData.value.players.length >= roomData.value.maxPlayers) {
    alert('房间已满')
    return
  }
  
  const botNames = ['曹操AI', '刘备AI', '孙权AI', '诸葛亮AI', '关羽AI', '周瑜AI']
  const usedHeroes = roomData.value.players.map(p => p.hero)
  const availableHeroes = heroes.value.filter(h => !usedHeroes.includes(h.id))
  
  if (availableHeroes.length === 0) {
    alert('没有可用武将了')
    return
  }
  
  const randomHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)]
  const botId = `bot_${Date.now()}`
  
  roomData.value.players.push({
    id: botId,
    name: botNames[roomData.value.players.filter(p => p.isBot).length],
    hero: randomHero.id,
    isReady: true,
    isHost: false,
    isBot: true
  })
}

function copyInviteLink() {
  navigator.clipboard.writeText(inviteLink.value)
  alert('邀请链接已复制！')
}

function copyRoomId() {
  navigator.clipboard.writeText(roomId.value)
  alert('邀请码已复制！')
}

function startGame() {
  if (!canStart.value) return
  // 保存房间数据到 localStorage，供游戏页面使用
  localStorage.setItem('roomData', JSON.stringify(roomData.value))
  router.push(`/game/${roomId.value}`)
}

function leaveRoom() {
  router.push('/lobby')
}

function getFactionColor(faction: string) {
  const colors: Record<string, string> = {
    wei: 'text-blue-400',
    shu: 'text-green-400',
    wu: 'text-red-400'
  }
  return colors[faction] || 'text-gray-400'
}

function getRarityColor(rarity: string) {
  const colors: Record<string, string> = {
    legendary: 'border-yellow-500',
    epic: 'border-purple-500',
    rare: 'border-blue-500',
    common: 'border-gray-500'
  }
  return colors[rarity] || 'border-gray-500'
}

function getHeroName(heroId: string) {
  return heroes.value.find(h => h.id === heroId)?.name || '未选择'
}

onUnmounted(() => {
  // 清理
})
</script>

<template>
  <div class="min-h-screen p-4">
    <!-- 顶部栏 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-chinese text-gold">{{ roomData.name }}</h1>
        <p class="text-gray-500">房间号：{{ roomId }} | 玩家：{{ roomData.players.length }}/{{ roomData.maxPlayers }}</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showInviteModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
        >
          📎 邀请好友
        </button>
        <button
          @click="leaveRoom"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
        >
          离开房间
        </button>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- 玩家列表 -->
      <div class="lg:col-span-1">
        <div class="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700">
          <h2 class="text-xl text-white mb-4">玩家 ({{ roomData.players.length }}/{{ roomData.maxPlayers }})</h2>
          
          <div class="space-y-3">
            <div
              v-for="player in roomData.players"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white">
                  {{ player.name[0] }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-white">{{ player.name }}</span>
                    <span v-if="player.isHost" class="text-xs text-gold">房主</span>
                    <span v-if="player.isBot" class="text-xs text-purple-400">🤖</span>
                  </div>
                  <span class="text-sm text-gray-400">
                    {{ player.hero ? getHeroName(player.hero) : '选择武将中...' }}
                  </span>
                </div>
              </div>
              <span
                :class="player.isReady ? 'text-green-500' : 'text-gray-500'"
                class="text-sm"
              >
                {{ player.isReady ? '已准备' : '未准备' }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-6 space-y-3">
            <!-- 房主显示已选择状态 -->
            <div v-if="isHost && selectedHero" class="p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-center">
              <span class="text-green-400">✓ 已选择 {{ getHeroName(selectedHero) }}</span>
            </div>
            
            <!-- 非房主显示准备按钮 -->
            <button
              v-if="!isHost"
              @click="toggleReady"
              :disabled="!selectedHero"
              :class="isReady ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'"
              class="w-full py-3 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isReady ? '取消准备' : '准备' }}
            </button>
            
            <!-- 添加机器人按钮 -->
            <button
              v-if="isHost"
              @click="addBot"
              :disabled="roomData.players.length >= roomData.maxPlayers"
              class="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🤖 添加机器人
            </button>
            
            <!-- 开始游戏按钮 -->
            <button
              v-if="isHost"
              @click="startGame"
              :disabled="!canStart"
              class="w-full py-3 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ canStart ? '开始游戏' : '等待玩家准备...' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 武将选择 -->
      <div class="lg:col-span-2">
        <div class="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700">
          <h2 class="text-xl text-white mb-4">选择武将</h2>
          
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="hero in heroes"
              :key="hero.id"
              @click="selectHero(hero.id)"
              :class="[
                'p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden',
                selectedHero === hero.id ? 'border-gold bg-gold/10' : 'border-slate-600 hover:border-slate-500',
                isReady ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <!-- 势力印章 -->
              <div
                :class="[
                  'absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-lg font-bold rounded border-2 rotate-12',
                  hero.faction === 'wei' ? 'bg-blue-900/80 border-blue-400 text-blue-300' : '',
                  hero.faction === 'shu' ? 'bg-green-900/80 border-green-400 text-green-300' : '',
                  hero.faction === 'wu' ? 'bg-red-900/80 border-red-400 text-red-300' : ''
                ]"
                style="font-family: 'KaiTi', 'STKaiti', serif;"
              >
                {{ hero.faction === 'wei' ? '魏' : hero.faction === 'shu' ? '蜀' : '吴' }}
              </div>
              
              <!-- 武将头像 -->
              <div class="w-24 h-24 mx-auto mb-3 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-5xl border-4 shadow-lg"
                :class="hero.faction === '魏' ? 'border-blue-500 shadow-blue-500/20' : hero.faction === '蜀' ? 'border-green-500 shadow-green-500/20' : 'border-red-500 shadow-red-500/20'"
              >
                <span class="font-bold" 
                  :class="hero.faction === '魏' ? 'text-blue-400' : hero.faction === '蜀' ? 'text-green-400' : 'text-red-400'"
                >{{ hero.name[0] }}</span>
              </div>
              
              <!-- 武将名称 -->
              <div class="text-center mb-2">
                <span :class="[
                  'text-2xl font-chinese',
                  hero.faction === '魏' ? 'text-blue-400' : hero.faction === '蜀' ? 'text-green-400' : 'text-red-400'
                ]">
                  {{ hero.name }}
                </span>
              </div>
              
              <!-- 技能信息 -->
              <div class="text-center">
                <div class="text-sm text-gold mb-1">{{ hero.skill.name }}</div>
                <div class="text-xs text-gray-500">{{ hero.skill.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀请弹窗 -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showInviteModal = false"
    >
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <h2 class="text-2xl text-white mb-4">邀请好友</h2>
        
        <div class="mb-4">
          <label class="block text-gray-400 mb-2">邀请链接</label>
          <div class="flex gap-2">
            <input
              :value="inviteLink"
              readonly
              class="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
            />
            <button
              @click="copyInviteLink"
              class="px-4 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              复制
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-400 mb-2">邀请码</label>
          <div class="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <span class="text-white font-mono text-lg">{{ roomId }}</span>
            <button
              @click="copyRoomId"
              class="text-gold hover:text-yellow-400"
            >
              复制
            </button>
          </div>
        </div>
        
        <button
          @click="showInviteModal = false"
          class="w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gold {
  color: #fbbf24;
}
.bg-gold {
  background-color: #fbbf24;
}
.border-gold {
  border-color: #fbbf24;
}
</style>

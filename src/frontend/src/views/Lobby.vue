<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showCreateModal = ref(false)
const showNameModal = ref(false)
const newRoomName = ref('')
const maxPlayers = ref(4)
const roomPassword = ref('')
const playerName = ref(localStorage.getItem('playerName') || '玩家')
const newPlayerName = ref('')
const searchQuery = ref('')

// 模拟房间列表
const mockRooms = ref([
  { id: 'ABC123', name: '三国大乱斗', hostName: '曹操', currentPlayers: 2, maxPlayers: 4, status: 'waiting', hasPassword: false },
  { id: 'SHU456', name: '蜀汉崛起', hostName: '刘备', currentPlayers: 3, maxPlayers: 4, status: 'waiting', hasPassword: true },
  { id: 'WU789', name: '江东霸业', hostName: '孙权', currentPlayers: 4, maxPlayers: 4, status: 'playing', hasPassword: false },
  { id: 'QX012', name: '群雄逐鹿', hostName: '董卓', currentPlayers: 1, maxPlayers: 8, status: 'waiting', hasPassword: false },
  { id: 'CB345', name: '赤壁之战', hostName: '周瑜', currentPlayers: 2, maxPlayers: 6, status: 'waiting', hasPassword: false },
])

const filteredRooms = computed(() => {
  if (!searchQuery.value.trim()) return mockRooms.value
  
  const query = searchQuery.value.toLowerCase()
  return mockRooms.value.filter(room => 
    room.id.toLowerCase().includes(query) || 
    room.name.toLowerCase().includes(query)
  )
})

// 生成6位房间码
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function createRoom() {
  if (!newRoomName.value.trim()) {
    alert('请输入房间名称')
    return
  }
  
  // 保存房间设置到 localStorage
  const roomCode = generateRoomCode()
  localStorage.setItem('roomName', newRoomName.value)
  localStorage.setItem('maxPlayers', maxPlayers.value.toString())
  localStorage.setItem('roomPassword', roomPassword.value)
  localStorage.setItem('roomCode', roomCode)
  
  // 使用6位短码作为房间ID
  router.push(`/room/${roomCode}`)
}

function joinRoom(roomId: string, hasPassword: boolean, status: string) {
  // 游戏中的房间不能加入
  if (status === 'playing') {
    alert('游戏进行中，无法加入')
    return
  }
  
  if (hasPassword) {
    const password = prompt('请输入房间密码')
    if (!password) return
    // TODO: 验证密码
  }
  router.push(`/room/${roomId}`)
}

function refreshRooms() {
  // TODO: 刷新房间列表
  console.log('刷新房间列表')
}

function updatePlayerName() {
  if (!newPlayerName.value.trim()) {
    alert('请输入昵称')
    return
  }
  
  playerName.value = newPlayerName.value.trim()
  localStorage.setItem('playerName', playerName.value)
  showNameModal.value = false
}

onMounted(() => {
  refreshRooms()
})
</script>

<template>
  <div class="min-h-screen p-4 bg-gradient-to-br from-amber-950/20 via-slate-900 to-red-950/20 relative overflow-hidden">
    <!-- 中国风背景装饰 -->
    <div class="absolute inset-0 opacity-5 pointer-events-none">
      <div class="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
    </div>
    <!-- 顶部栏 -->
    <div class="relative z-10 flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-chinese text-gold">游戏大厅</h1>
        <div class="flex items-center gap-3 mt-1">
          <p class="text-gray-400">欢迎回来，<span class="text-white font-medium">{{ playerName }}</span></p>
          <button
            @click="newPlayerName = playerName; showNameModal = true"
            class="px-3 py-1 text-sm bg-slate-700 text-gold rounded hover:bg-slate-600 transition-colors"
          >
            ✏️ 修改昵称
          </button>
        </div>
      </div>
      <div class="flex gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索房间号或名称..."
          class="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold w-64"
        />
        <button
          @click="refreshRooms"
          class="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          刷新
        </button>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          创建房间
        </button>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="bg-slate-800/50 backdrop-blur rounded-xl p-5 border border-slate-700 hover:border-gold/50 transition-colors cursor-pointer"
        @click="joinRoom(room.id, room.hasPassword, room.status)"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-xl text-white">{{ room.name }}</h3>
            <p class="text-gray-500 text-sm">房间号：{{ room.id }}</p>
          </div>
          <span
            :class="room.status === 'waiting' ? 'bg-green-500' : 'bg-yellow-500'"
            class="px-2 py-0.5 text-xs rounded text-white"
          >
            {{ room.status === 'waiting' ? '等待中' : '游戏中' }}
          </span>
        </div>
        
        <div class="text-gray-400 text-sm mb-3">
          房主：{{ room.hostName }}
          <span v-if="room.hasPassword" class="ml-2">🔒</span>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex -space-x-2">
            <div
              v-for="i in room.currentPlayers"
              :key="i"
              class="w-8 h-8 bg-slate-600 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white"
            >
              {{ i }}
            </div>
          </div>
          <span class="text-gray-500">{{ room.currentPlayers }}/{{ room.maxPlayers }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="filteredRooms.length === 0"
      class="text-center py-20"
    >
      <p class="text-gray-500 text-lg mb-4">{{ searchQuery ? '未找到匹配的房间' : '暂无房间' }}</p>
      <button
        v-if="!searchQuery"
        @click="showCreateModal = true"
        class="px-6 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
      >
        创建第一个房间
      </button>
    </div>

    <!-- 创建房间弹窗 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <h2 class="text-2xl text-white mb-6">创建房间</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-gray-400 mb-1">房间名称</label>
            <input
              v-model="newRoomName"
              type="text"
              maxlength="20"
              placeholder="给房间起个名字"
              class="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>
          
          <div>
            <label class="block text-gray-400 mb-1">人数上限</label>
            <select
              v-model="maxPlayers"
              class="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-gold"
            >
              <option :value="2">2人</option>
              <option :value="3">3人</option>
              <option :value="4">4人</option>
              <option :value="5">5人</option>
              <option :value="6">6人</option>
              <option :value="7">7人</option>
              <option :value="8">8人</option>
            </select>
          </div>
          
          <div>
            <label class="block text-gray-400 mb-1">房间密码（可选）</label>
            <input
              v-model="roomPassword"
              type="password"
              maxlength="20"
              placeholder="留空则无需密码"
              class="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            />
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button
            @click="showCreateModal = false"
            class="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="createRoom"
            class="flex-1 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            创建
          </button>
        </div>
      </div>
    </div>

    <!-- 修改名称弹窗 -->
    <div
      v-if="showNameModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showNameModal = false"
    >
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
        <h2 class="text-2xl text-white mb-6">修改昵称</h2>
        
        <div>
          <label class="block text-gray-400 mb-1">新昵称</label>
          <input
            v-model="newPlayerName"
            type="text"
            maxlength="12"
            placeholder="输入新昵称"
            class="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
            @keyup.enter="updatePlayerName"
          />
        </div>
        
        <div class="flex gap-3 mt-6">
          <button
            @click="showNameModal = false"
            class="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="updatePlayerName"
            class="flex-1 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-chinese {
  font-family: 'KaiTi', 'STKaiti', 'SimSun', 'Ma Shan Zheng', cursive;
}

.text-gold {
  color: #d4af37;
}

.bg-gold {
  background-color: #d4af37;
}

.border-gold {
  border-color: #d4af37;
}

/* 中国风配色 */
:root {
  --color-wei-primary: #3b82f6;
  --color-shu-primary: #22c55e;
  --color-wu-primary: #ef4444;
  --color-gold-primary: #d4af37;
}
</style>

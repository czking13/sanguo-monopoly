<template>
  <div class="game-map" ref="mapContainer">
    <canvas ref="mapCanvas" :width="canvasSize" :height="canvasSize"></canvas>
    
    <!-- 玩家棋子层 -->
    <div class="players-layer">
      <div
        v-for="(player, index) in players"
        :key="player.id"
        class="player-piece"
        :class="{ current: currentPlayerId === player.id }"
        :style="getPlayerStyle(player.position, index)"
      >
        <!-- 武将头像 -->
        <div class="piece-avatar" v-if="player.hero">
          <img :src="`/heroes/${player.hero}.jpg`" :alt="player.name" />
          <div class="faction-badge" :class="getFactionClass(player.hero)"></div>
        </div>
        <div class="piece-avatar fallback" v-else :style="{ borderColor: player.color }">
          {{ player.name.charAt(0) }}
        </div>
        <!-- 玩家名称标签 -->
        <div class="piece-name" :style="{ backgroundColor: player.color }">
          {{ player.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Player, MapCell } from '../types'
import { heroes } from '../data/heroes'

// Props
const props = defineProps<{
  players: Player[]
  cells: MapCell[]
  currentPlayerId?: string
}>()

const mapCanvas = ref<HTMLCanvasElement | null>(null)
const mapContainer = ref<HTMLDivElement | null>(null)

// 画布尺寸
const canvasSize = 720
const cellSize = 80
const padding = 20

// 获取武将势力
const getFactionClass = (heroId: string) => {
  const hero = heroes.find(h => h.id === heroId)
  if (!hero) return 'faction-neutral'
  return `faction-${hero.faction}`
}

// 56格地图布局（四方环形）
const cellPositions = computed(() => {
  const positions: { x: number; y: number }[] = []
  
  // 外圈（1-28）
  // 顶部（1-8）：从左到右
  for (let i = 0; i < 8; i++) {
    positions.push({
      x: padding + i * cellSize + cellSize / 2,
      y: padding + cellSize / 2
    })
  }
  
  // 右侧（9-14）：从上到下
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + 7 * cellSize + cellSize / 2,
      y: padding + (i + 1) * cellSize + cellSize / 2
    })
  }
  
  // 底部（15-22）：从右到左
  for (let i = 0; i < 8; i++) {
    positions.push({
      x: padding + (7 - i) * cellSize + cellSize / 2,
      y: padding + 7 * cellSize + cellSize / 2
    })
  }
  
  // 左侧（23-28）：从下到上
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + cellSize / 2,
      y: padding + (6 - i) * cellSize + cellSize / 2
    })
  }
  
  // 内圈（29-56）
  const innerOffset = cellSize
  
  // 内圈顶部（29-34）
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + innerOffset + i * cellSize + cellSize / 2,
      y: padding + innerOffset + cellSize / 2
    })
  }
  
  // 内圈右侧（35-38）
  for (let i = 0; i < 4; i++) {
    positions.push({
      x: padding + innerOffset + 5 * cellSize + cellSize / 2,
      y: padding + innerOffset + (i + 1) * cellSize + cellSize / 2
    })
  }
  
  // 内圈底部（39-44）
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + innerOffset + (5 - i) * cellSize + cellSize / 2,
      y: padding + innerOffset + 5 * cellSize + cellSize / 2
    })
  }
  
  // 内圈左侧（45-48）
  for (let i = 0; i < 4; i++) {
    positions.push({
      x: padding + innerOffset + cellSize / 2,
      y: padding + innerOffset + (4 - i) * cellSize + cellSize / 2
    })
  }
  
  // 中心区域（49-56）- 8格围绕中心
  const centerOffset = 2.5 * cellSize
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 - 90) * Math.PI / 180
    positions.push({
      x: padding + centerOffset * cellSize / cellSize + Math.cos(angle) * 60 + cellSize,
      y: padding + centerOffset * cellSize / cellSize + Math.sin(angle) * 60 + cellSize
    })
  }
  
  return positions
})

// 获取玩家位置样式
const getPlayerStyle = (position: number, index: number) => {
  const pos = cellPositions.value[position]
  if (!pos) return {}
  
  // 多个玩家在同一格子时偏移
  const playersAtSamePosition = props.players.filter((p, i) => i < index && p.position === position).length
  const offsetX = (playersAtSamePosition % 2) * 30 - 15
  const offsetY = Math.floor(playersAtSamePosition / 2) * 30 - 15
  
  return {
    left: `${pos.x + offsetX}px`,
    top: `${pos.y + offsetY}px`,
    zIndex: 10 + index
  }
}

// 绘制地图
const drawMap = () => {
  const canvas = mapCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  // 绘制水墨风格背景
  drawInkBackground(ctx)
  
  // 绘制中心区域装饰
  drawCenterDecoration(ctx)
  
  // 绘制所有格子
  props.cells.forEach((cell, index) => {
    const pos = cellPositions.value[index]
    if (pos) {
      drawCell(ctx, pos.x - cellSize / 2, pos.y - cellSize / 2, cell, index)
    }
  })
  
  // 绘制连接线（古代地图风格）
  drawConnections(ctx)
}

// 绘制水墨风格背景
const drawInkBackground = (ctx: CanvasRenderingContext2D) => {
  // 主背景 - 宣纸色
  const gradient = ctx.createRadialGradient(
    canvasSize / 2, canvasSize / 2, 0,
    canvasSize / 2, canvasSize / 2, canvasSize / 2
  )
  gradient.addColorStop(0, '#f5f0e6')
  gradient.addColorStop(0.5, '#ebe4d4')
  gradient.addColorStop(1, '#d9d0bc')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  
  // 添加水墨晕染效果
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvasSize
    const y = Math.random() * canvasSize
    const radius = Math.random() * 100 + 50
    
    const inkGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    inkGradient.addColorStop(0, '#4a4a4a')
    inkGradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = inkGradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  
  // 添加纸张纹理
  ctx.strokeStyle = 'rgba(139, 119, 101, 0.1)'
  ctx.lineWidth = 0.5
  for (let i = 0; i < canvasSize; i += 4) {
    ctx.beginPath()
    ctx.moveTo(0, i + Math.random() * 2)
    ctx.lineTo(canvasSize, i + Math.random() * 2)
    ctx.stroke()
  }
}

// 绘制中心装饰（三国地图图案）
const drawCenterDecoration = (ctx: CanvasRenderingContext2D) => {
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  const radius = 80
  
  // 绘制太极图案
  ctx.save()
  ctx.globalAlpha = 0.15
  
  // 外圆
  ctx.strokeStyle = '#8b4513'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()
  
  // 阴阳鱼
  ctx.fillStyle = '#c41e3a'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI / 2)
  ctx.arc(centerX, centerY - radius / 2, radius / 2, Math.PI / 2, -Math.PI / 2)
  ctx.fill()
  
  ctx.fillStyle = '#1a5f7a'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, Math.PI / 2, -Math.PI / 2, true)
  ctx.arc(centerX, centerY + radius / 2, radius / 2, -Math.PI / 2, Math.PI / 2, true)
  ctx.fill()
  
  ctx.restore()
  
  // 中心文字
  ctx.fillStyle = '#5d4e37'
  ctx.font = 'bold 24px "Ma Shan Zheng", "STKaiti", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('三国', centerX, centerY)
}

// 绘制连接线
const drawConnections = (ctx: CanvasRenderingContext2D) => {
  ctx.strokeStyle = 'rgba(93, 78, 55, 0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 3])
  
  // 外圈连接
  for (let i = 0; i < 28; i++) {
    const next = (i + 1) % 28
    const pos1 = cellPositions.value[i]
    const pos2 = cellPositions.value[next]
    if (pos1 && pos2) {
      ctx.beginPath()
      ctx.moveTo(pos1.x, pos1.y)
      ctx.lineTo(pos2.x, pos2.y)
      ctx.stroke()
    }
  }
  
  ctx.setLineDash([])
}

// 绘制单个格子（中国风）
const drawCell = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  cell: MapCell, 
  index: number
) => {
  const width = cellSize - 4
  const height = cellSize - 4
  
  // 格子样式
  let bgColor = 'rgba(245, 240, 230, 0.9)'
  let borderColor = '#8b7355'
  let textColor = '#5d4e37'
  let symbolColor = '#8b4513'
  
  // 根据格子类型设置中国风样式
  switch (cell.type) {
    case 'city':
      // 城池 - 根据势力使用不同颜色
      const factionStyles: Record<string, { border: string; bg: string; text: string }> = {
        '魏': { border: '#1a5f7a', bg: 'rgba(26, 95, 122, 0.15)', text: '#1a5f7a' },
        '蜀': { border: '#228b22', bg: 'rgba(34, 139, 34, 0.15)', text: '#228b22' },
        '吴': { border: '#c41e3a', bg: 'rgba(196, 30, 58, 0.15)', text: '#c41e3a' },
        '中立': { border: '#8b7355', bg: 'rgba(139, 115, 85, 0.1)', text: '#5d4e37' }
      }
      const style = factionStyles[cell.faction || '中立'] || factionStyles['中立']
      borderColor = style.border
      bgColor = style.bg
      textColor = style.text
      break
    case 'chance':
      // 机遇 - 金色
      borderColor = '#d4a574'
      bgColor = 'rgba(212, 165, 116, 0.2)'
      textColor = '#8b6914'
      break
    case 'destiny':
      // 天命 - 紫色
      borderColor = '#7b5544'
      bgColor = 'rgba(123, 85, 68, 0.15)'
      textColor = '#5d3a1a'
      break
    case 'prison':
      // 牢狱 - 深色
      borderColor = '#4a4a4a'
      bgColor = 'rgba(74, 74, 74, 0.2)'
      textColor = '#333333'
      break
    case 'start':
      // 起点 - 红色喜庆
      borderColor = '#c41e3a'
      bgColor = 'rgba(196, 30, 58, 0.15)'
      textColor = '#c41e3a'
      break
    case 'rest':
      // 休息 - 青色
      borderColor = '#5f9ea0'
      bgColor = 'rgba(95, 158, 160, 0.15)'
      textColor = '#2f6f6f'
      break
    case 'checkpoint':
      // 关卡 - 棕色
      borderColor = '#8b4513'
      bgColor = 'rgba(139, 69, 19, 0.15)'
      textColor = '#5d2e0c'
      break
  }
  
  // 绘制格子阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  
  // 绘制格子背景
  ctx.fillStyle = bgColor
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  
  // 中国风圆角矩形
  const radius = 4
  ctx.beginPath()
  ctx.roundRect(x + 2, y + 2, width, height, radius)
  ctx.fill()
  ctx.stroke()
  
  // 清除阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  
  // 绘制格子装饰边框（内框）
  ctx.strokeStyle = borderColor + '40'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x + 6, y + 6, width - 8, height - 8, 2)
  ctx.stroke()
  
  // 绘制格子名称
  ctx.fillStyle = textColor
  ctx.font = 'bold 12px "Ma Shan Zheng", "STKaiti", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const displayName = cell.name.length > 4 ? cell.name.substring(0, 4) : cell.name
  ctx.fillText(displayName, x + width / 2 + 2, y + height / 2 + 2)
  
  // 绘制格子编号
  ctx.fillStyle = symbolColor + '60'
  ctx.font = '9px serif'
  ctx.fillText(String(index + 1), x + 12, y + 12)
  
  // 如果是城池，显示等级星
  if (cell.type === 'city' && cell.level && cell.level > 1) {
    ctx.fillStyle = '#d4a574'
    ctx.font = '10px serif'
    ctx.fillText('★'.repeat(cell.level - 1), x + width / 2 + 2, y + height - 10)
  }
  
  // 如果被玩家拥有，显示所有者标记
  if (cell.ownerId) {
    const owner = props.players.find(p => p.id === cell.ownerId)
    if (owner) {
      // 在格子角落绘制所有者颜色标记
      ctx.fillStyle = owner.color
      ctx.beginPath()
      ctx.arc(x + width - 8, y + 8, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
}

// 生命周期
onMounted(() => {
  drawMap()
})

// 监听变化重绘
watch(() => [props.cells, props.players], () => {
  drawMap()
}, { deep: true })
</script>

<style scoped>
.game-map {
  position: relative;
  width: 720px;
  height: 720px;
  margin: 0 auto;
  border: 4px solid #8b7355;
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(139, 115, 85, 0.3),
    inset 0 0 30px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f5f0e6 0%, #ebe4d4 50%, #d9d0bc 100%);
  overflow: hidden;
}

.game-map::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b7355' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.5;
}

canvas {
  display: block;
}

.players-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.player-piece {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  z-index: 10;
}

.piece-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #8b7355;
  box-shadow: 
    0 3px 10px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(245, 240, 230, 0.9);
  position: relative;
  background: #f5f0e6;
}

.piece-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.piece-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0e6 0%, #d9d0bc 100%);
  font-weight: bold;
  font-size: 14px;
  color: #5d4e37;
}

/* 势力徽章 */
.faction-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #f5f0e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.faction-badge.faction-魏 {
  background: #1a5f7a;
}

.faction-badge.faction-蜀 {
  background: #228b22;
}

.faction-badge.faction-吴 {
  background: #c41e3a;
}

.faction-badge.faction-neutral {
  background: #8b7355;
}

.piece-name {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  color: white;
  white-space: nowrap;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 当前玩家高亮 */
.player-piece.current {
  animation: pulse 1.5s infinite;
}

.player-piece.current .piece-avatar {
  border-color: #ffd700 !important;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 0.6),
    0 3px 10px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(255, 215, 0, 0.3);
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
  }
}
</style>

<template>
  <div class="game-map" ref="mapContainer">
    <canvas ref="mapCanvas" :width="canvasSize" :height="canvasSize"></canvas>
    
    <!-- 玩家棋子层 -->
    <div class="players-layer">
      <div 
        v-for="(player, index) in players" 
        :key="player.id"
        class="player-piece"
        :style="getPlayerStyle(player.position, index)"
      >
        <div class="piece-avatar" :style="{ backgroundColor: player.color }">
          {{ player.name.charAt(0) }}
        </div>
        <div class="piece-name">{{ player.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Player, MapCell } from '../types'

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

// 56格地图布局（四方环形）
// 格子编号从顶部中间开始，顺时针方向
// 北方区域（1-14）：顶部 -> 右上
// 荆州区域（15-28）：右侧 -> 右下
// 蜀地区域（29-42）：底部 -> 左下
// 江东区域（43-56）：左侧 -> 左上

const cellPositions = computed(() => {
  const positions: { x: number; y: number }[] = []
  
  // 56格地图布局：三方环形
  // 外圈24格，内圈16格，中心16格
  
  // 外圈（1-24）
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
  
  // 内圈（29-44）
  const innerOffset = cellSize
  
  // 内圈顶部（29-34）：从左到右
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + innerOffset + i * cellSize + cellSize / 2,
      y: padding + innerOffset + cellSize / 2
    })
  }
  
  // 内圈右侧（35-38）：从上到下
  for (let i = 0; i < 4; i++) {
    positions.push({
      x: padding + innerOffset + 5 * cellSize + cellSize / 2,
      y: padding + innerOffset + (i + 1) * cellSize + cellSize / 2
    })
  }
  
  // 内圈底部（39-44）：从右到左
  for (let i = 0; i < 6; i++) {
    positions.push({
      x: padding + innerOffset + (5 - i) * cellSize + cellSize / 2,
      y: padding + innerOffset + 5 * cellSize + cellSize / 2
    })
  }
  
  // 内圈左侧（45-48）：从下到上
  for (let i = 0; i < 4; i++) {
    positions.push({
      x: padding + innerOffset + cellSize / 2,
      y: padding + innerOffset + (4 - i) * cellSize + cellSize / 2
    })
  }
  
  // 中心区域（49-56）：4x2布局
  const centerX = padding + innerOffset + cellSize
  const centerY = padding + innerOffset + cellSize * 1.5
  
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      positions.push({
        x: centerX + col * cellSize,
        y: centerY + row * cellSize * 1.5
      })
    }
  }
  
  return positions
})

// 获取玩家位置和偏移（避免重叠）
const getPlayerStyle = (position: number, playerIndex: number) => {
  const pos = cellPositions.value[position % 56]
  if (!pos) return { left: '0px', top: '0px' }
  
  // 同一格子内的玩家偏移
  const samePositionPlayers = props.players.filter(p => p.position === position)
  const indexInSamePos = samePositionPlayers.findIndex(p => p.id === props.players[playerIndex]?.id)
  
  const offsetAngle = (indexInSamePos * 90) * Math.PI / 180
  const offsetRadius = 15
  const offsetX = Math.cos(offsetAngle) * offsetRadius
  const offsetY = Math.sin(offsetAngle) * offsetRadius
  
  return {
    left: `${pos.x + offsetX}px`,
    top: `${pos.y + offsetY}px`,
    transform: 'translate(-50%, -50%)',
    zIndex: 10 + playerIndex
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
  
  // 绘制背景
  const gradient = ctx.createRadialGradient(
    canvasSize / 2, canvasSize / 2, 0,
    canvasSize / 2, canvasSize / 2, canvasSize / 2
  )
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasSize, canvasSize)
  
  // 绘制格子
  props.cells.forEach((cell, index) => {
    const pos = cellPositions.value[index]
    if (!pos) return
    
    drawCell(ctx, pos.x - cellSize / 2, pos.y - cellSize / 2, cell, index)
  })
  
  // 绘制区域标签
  drawRegionLabels(ctx)
  
  // 绘制中心装饰
  drawCenterDecoration(ctx)
}

// 绘制单个格子
const drawCell = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number, 
  cell: MapCell, 
  index: number
) => {
  const width = cellSize - 4
  const height = cellSize - 4
  
  // 格子背景色
  let bgColor = '#2d2d44'
  let borderColor = '#3d3d54'
  let textColor = '#ffffff'
  
  // 根据格子类型设置颜色
  switch (cell.type) {
    case 'city':
      // 根据所属势力着色
      const factionColors: Record<string, string> = {
        '魏': '#4a90d9',
        '蜀': '#e74c3c',
        '吴': '#2ecc71',
        '中立': '#95a5a6'
      }
      borderColor = factionColors[cell.faction || '中立'] || borderColor
      
      // 如果被玩家拥有
      if (cell.ownerId) {
        const owner = props.players.find(p => p.id === cell.ownerId)
        if (owner) {
          bgColor = owner.color + '33'
          borderColor = owner.color
        }
      }
      break
    case 'chance':
      bgColor = '#f39c1233'
      borderColor = '#f39c12'
      textColor = '#f39c12'
      break
    case 'destiny':
      bgColor = '#9b59b633'
      borderColor = '#9b59b6'
      textColor = '#9b59b6'
      break
    case 'prison':
      bgColor = '#e74c3c33'
      borderColor = '#e74c3c'
      textColor = '#e74c3c'
      break
    case 'start':
      bgColor = '#2ecc7133'
      borderColor = '#2ecc71'
      textColor = '#2ecc71'
      break
    case 'rest':
      bgColor = '#3498db33'
      borderColor = '#3498db'
      textColor = '#3498db'
      break
    case 'checkpoint':
      bgColor = '#1abc9c33'
      borderColor = '#1abc9c'
      textColor = '#1abc9c'
      break
  }
  
  // 绘制格子背景
  ctx.fillStyle = bgColor
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  
  // 圆角矩形
  const radius = 6
  ctx.beginPath()
  ctx.roundRect(x + 2, y + 2, width, height, radius)
  ctx.fill()
  ctx.stroke()
  
  // 绘制格子名称
  ctx.fillStyle = textColor
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 名称可能太长，需要截断
  const displayName = cell.name.length > 4 ? cell.name.substring(0, 4) : cell.name
  ctx.fillText(displayName, x + width / 2 + 2, y + height / 2 + 2)
  
  // 绘制格子编号（小字）
  ctx.fillStyle = textColor + '66'
  ctx.font = '8px sans-serif'
  ctx.fillText(String(index + 1), x + 12, y + 12)
  
  // 如果是城池且被拥有，显示等级
  if (cell.type === 'city' && cell.level && cell.level > 1) {
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 10px sans-serif'
    ctx.fillText('★'.repeat(cell.level - 1), x + width / 2 + 2, y + height - 10)
  }
}

// 绘制区域标签
const drawRegionLabels = (ctx: CanvasRenderingContext2D) => {
  const regions = [
    { name: '【魏国】', x: 320, y: 10, color: '#4a90d9' },
    { name: '【吴国】', x: 10, y: 360, color: '#2ecc71' },
    { name: '【蜀国】', x: 630, y: 360, color: '#e74c3c' },
    { name: '【荆州】', x: 320, y: 710, color: '#f39c12' }
  ]
  
  regions.forEach(region => {
    ctx.fillStyle = region.color
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(region.name, region.x, region.y)
  })
}

// 绘制中心装饰
const drawCenterDecoration = (ctx: CanvasRenderingContext2D) => {
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2
  
  // 绘制三国鼎立图标
  ctx.fillStyle = '#ffffff11'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#ffffff33'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('三国大富翁', centerX, centerY)
}

// 监听数据变化重绘
watch(() => [props.cells, props.players], drawMap, { deep: true })

onMounted(() => {
  drawMap()
})
</script>

<style scoped>
.game-map {
  position: relative;
  width: 720px;
  height: 720px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.piece-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  border: 2px solid white;
}

.piece-name {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  margin-top: 4px;
}
</style>

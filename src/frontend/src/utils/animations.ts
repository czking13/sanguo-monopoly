// 动画配置
export const animationConfig = {
  // 骰子动画
  dice: {
    duration: 1000,
    frameCount: 10,
    interval: 100
  },
  
  // 棋子移动
  pieceMove: {
    duration: 500,
    easing: 'ease-out'
  },
  
  // 购买城池
  purchase: {
    duration: 300,
    scale: 1.2
  },
  
  // 升级城池
  upgrade: {
    duration: 400,
    glowDuration: 600
  },
  
  // 卡牌使用
  cardUse: {
    duration: 300,
    fadeOut: 200
  },
  
  // 回合切换
  turnChange: {
    duration: 500,
    delay: 200
  }
}

// 生成随机骰子动画帧
export function generateDiceFrames(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1)
}

// 缓动函数
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// 计算棋子移动路径
export function calculateMovePath(
  from: number,
  to: number,
  totalCells: number = 56
): number[] {
  const path: number[] = []
  let current = from
  
  while (current !== to) {
    current = (current + 1) % totalCells
    path.push(current)
  }
  
  return path
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 播放音效（如果有）
export function playSound(type: 'dice' | 'purchase' | 'upgrade' | 'card' | 'win'): void {
  // 预留给音效实现
  console.log(`Playing sound: ${type}`)
}

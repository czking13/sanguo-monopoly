// ============================================
// 游戏动画工具 v1.1
// UI-001~008: 核心动画效果
// ============================================

/**
 * 动画配置
 */
export const ANIMATION_CONFIG = {
  // 掷骰子动画
  DICE: {
    duration: 500,      // ms
    frames: 20,         // 帧数
    bounceHeight: 30,   // 弹跳高度 px
  },
  
  // 棋子移动动画
  MOVE: {
    durationPerCell: 150, // 每格移动时间 ms
    easing: 'ease-out',
  },
  
  // 经过起点
  PASS_START: {
    duration: 1000,
    floatHeight: 50,
    floatDistance: 100,
  },
  
  // 购买城池
  BUY_CITY: {
    flagDrop: 300,
    colorFade: 200,
  },
  
  // 过路费支付
  TOLL_PAY: {
    coinFly: 800,
    coinCount: 5,
  },
  
  // 卡牌使用
  CARD_USE: {
    flip: 400,
    glow: 300,
  },
  
  // 破产
  BANKRUPT: {
    fadeOut: 500,
    dropDown: 300,
  },
  
  // 天命卡展示
  FATE_CARD: {
    slideIn: 400,
    hold: 2000,
    slideOut: 300,
  },
}

/**
 * 掷骰子动画
 */
export function animateDice(
  diceElements: HTMLElement[],
  finalValues: number[],
  onComplete?: () => void
): void {
  const { duration, frames, bounceHeight } = ANIMATION_CONFIG.DICE
  const frameTime = duration / frames
  
  let frame = 0
  const interval = setInterval(() => {
    frame++
    
    diceElements.forEach((el, i) => {
      // 随机数字
      const randomValue = Math.floor(Math.random() * 6) + 1
      el.textContent = String(randomValue)
      
      // 弹跳效果
      const bounce = Math.sin((frame / frames) * Math.PI) * bounceHeight
      el.style.transform = `translateY(${-bounce}px)`
    })
    
    if (frame >= frames) {
      clearInterval(interval)
      
      // 显示最终值
      diceElements.forEach((el, i) => {
        el.textContent = String(finalValues[i])
        el.style.transform = 'translateY(0)'
      })
      
      onComplete?.()
    }
  }, frameTime)
}

/**
 * 棋子移动动画
 */
export function animatePieceMove(
  piece: HTMLElement,
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  steps: number,
  onComplete?: () => void
): void {
  const { durationPerCell } = ANIMATION_CONFIG.MOVE
  const totalDuration = steps * durationPerCell
  
  piece.style.transition = `left ${durationPerCell}ms ease-out, top ${durationPerCell}ms ease-out`
  
  // 逐格移动
  const dx = (toPos.x - fromPos.x) / steps
  const dy = (toPos.y - fromPos.y) / steps
  
  let currentStep = 0
  const moveInterval = setInterval(() => {
    currentStep++
    
    const x = fromPos.x + dx * currentStep
    const y = fromPos.y + dy * currentStep
    
    piece.style.left = `${x}px`
    piece.style.top = `${y}px`
    
    if (currentStep >= steps) {
      clearInterval(moveInterval)
      onComplete?.()
    }
  }, durationPerCell)
}

/**
 * 经过起点动画（飘字）
 */
export function animatePassStart(
  container: HTMLElement,
  amount: number,
  playerColor: string
): void {
  const { duration, floatHeight, floatDistance } = ANIMATION_CONFIG.PASS_START
  
  // 创建飘字元素
  const floater = document.createElement('div')
  floater.className = 'pass-start-floater'
  floater.textContent = `经过起点！+${amount}金`
  floater.style.cssText = `
    position: absolute;
    color: ${playerColor};
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    pointer-events: none;
    z-index: 100;
    animation: passStartFloat ${duration}ms ease-out forwards;
  `
  
  container.appendChild(floater)
  
  // 动画结束后移除
  setTimeout(() => {
    floater.remove()
  }, duration)
}

/**
 * 过路费支付动画（金币飘动）
 */
export function animateTollPay(
  container: HTMLElement,
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  amount: number,
  onComplete?: () => void
): void {
  const { coinFly, coinCount } = ANIMATION_CONFIG.TOLL_PAY
  
  // 创建多个金币
  for (let i = 0; i < coinCount; i++) {
    setTimeout(() => {
      const coin = document.createElement('div')
      coin.className = 'coin-fly'
      coin.textContent = '💰'
      coin.style.cssText = `
        position: absolute;
        left: ${fromPos.x}px;
        top: ${fromPos.y}px;
        font-size: 24px;
        pointer-events: none;
        z-index: 100;
        animation: coinFly ${coinFly}ms ease-in-out forwards;
        --to-x: ${toPos.x - fromPos.x}px;
        --to-y: ${toPos.y - fromPos.y}px;
      `
      
      container.appendChild(coin)
      
      setTimeout(() => {
        coin.remove()
      }, coinFly)
    }, i * 100)
  }
  
  // 全部完成后回调
  setTimeout(() => {
    onComplete?.()
  }, coinCount * 100 + coinFly)
}

/**
 * 甘宁劫营动画（金币分两份）
 */
export function animateGanningToll(
  container: HTMLElement,
  fromPos: { x: number; y: number },
  toOwnerPos: { x: number; y: number },
  toSelfPos: { x: number; y: number },
  amount: number
): void {
  const { coinFly, coinCount } = ANIMATION_CONFIG.TOLL_PAY
  const halfCount = Math.floor(coinCount / 2)
  
  // 一半给城主
  for (let i = 0; i < halfCount; i++) {
    setTimeout(() => {
      const coin = document.createElement('div')
      coin.textContent = '💰'
      coin.style.cssText = `
        position: absolute;
        left: ${fromPos.x}px;
        top: ${fromPos.y}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 100;
        animation: coinFly ${coinFly}ms ease-in-out forwards;
        --to-x: ${toOwnerPos.x - fromPos.x}px;
        --to-y: ${toOwnerPos.y - fromPos.y}px;
      `
      container.appendChild(coin)
      setTimeout(() => coin.remove(), coinFly)
    }, i * 100)
  }
  
  // 一半留在甘宁处
  for (let i = 0; i < halfCount; i++) {
    setTimeout(() => {
      const coin = document.createElement('div')
      coin.textContent = '💰'
      coin.style.cssText = `
        position: absolute;
        left: ${fromPos.x}px;
        top: ${fromPos.y}px;
        font-size: 20px;
        pointer-events: none;
        z-index: 100;
        animation: coinFly ${coinFly}ms ease-in-out forwards;
        --to-x: ${toSelfPos.x - fromPos.x}px;
        --to-y: ${toSelfPos.y - fromPos.y}px;
      `
      container.appendChild(coin)
      setTimeout(() => coin.remove(), coinFly)
    }, (i + halfCount) * 100)
  }
}

/**
 * 购买城池动画（旗帜插入）
 */
export function animateBuyCity(
  cell: HTMLElement,
  playerColor: string,
  onComplete?: () => void
): void {
  const { flagDrop, colorFade } = ANIMATION_CONFIG.BUY_CITY
  
  // 创建旗帜
  const flag = document.createElement('div')
  flag.className = 'city-flag'
  flag.style.cssText = `
    position: absolute;
    width: 20px;
    height: 30px;
    background: ${playerColor};
    border-radius: 2px;
    top: -30px;
    animation: flagDrop ${flagDrop}ms ease-out forwards;
  `
  
  cell.appendChild(flag)
  
  // 颜色渐变
  cell.style.transition = `background-color ${colorFade}ms`
  cell.style.backgroundColor = playerColor + '33' // 20% 透明度
  
  setTimeout(() => {
    onComplete?.()
  }, flagDrop)
}

/**
 * 卡牌使用动画（翻转+发光）
 */
export function animateCardUse(
  card: HTMLElement,
  onComplete?: () => void
): void {
  const { flip, glow } = ANIMATION_CONFIG.CARD_USE
  
  card.style.animation = `cardFlip ${flip}ms ease-in-out, cardGlow ${glow}ms ease-out ${flip}ms`
  
  setTimeout(() => {
    card.style.animation = ''
    onComplete?.()
  }, flip + glow)
}

/**
 * 玩家破产动画
 */
export function animateBankrupt(
  piece: HTMLElement,
  onComplete?: () => void
): void {
  const { fadeOut, dropDown } = ANIMATION_CONFIG.BANKRUPT
  
  piece.style.animation = `bankruptDrop ${dropDown}ms ease-in, bankruptFade ${fadeOut}ms ease-out ${dropDown}ms forwards`
  
  setTimeout(() => {
    piece.style.opacity = '0.3'
    piece.style.filter = 'grayscale(100%)'
    onComplete?.()
  }, dropDown + fadeOut)
}

/**
 * 天命卡展示动画
 */
export function animateFateCard(
  container: HTMLElement,
  cardContent: string,
  onComplete?: () => void
): void {
  const { slideIn, hold, slideOut } = ANIMATION_CONFIG.FATE_CARD
  
  // 创建全屏遮罩
  const overlay = document.createElement('div')
  overlay.className = 'fate-card-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000;
    animation: fateSlideIn ${slideIn}ms ease-out;
  `
  
  // 创建卡牌
  const card = document.createElement('div')
  card.className = 'fate-card'
  card.innerHTML = cardContent
  card.style.cssText = `
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #f59e0b;
    border-radius: 16px;
    padding: 40px;
    max-width: 400px;
    text-align: center;
    color: white;
  `
  
  overlay.appendChild(card)
  container.appendChild(overlay)
  
  // 自动消失
  setTimeout(() => {
    overlay.style.animation = `fateSlideOut ${slideOut}ms ease-in forwards`
    
    setTimeout(() => {
      overlay.remove()
      onComplete?.()
    }, slideOut)
  }, slideIn + hold)
}

// ============================================
// CSS 动画样式（需要注入到页面）
// ============================================

export const ANIMATION_STYLES = `
@keyframes passStartFloat {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-${ANIMATION_CONFIG.PASS_START.floatHeight}px);
  }
}

@keyframes coinFly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0.8;
    transform: translate(var(--to-x), var(--to-y)) scale(0.5);
  }
}

@keyframes flagDrop {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes cardFlip {
  0%, 100% {
    transform: rotateY(0);
  }
  50% {
    transform: rotateY(180deg);
  }
}

@keyframes cardGlow {
  0% {
    box-shadow: 0 0 0 rgba(78, 205, 196, 0);
  }
  50% {
    box-shadow: 0 0 30px rgba(78, 205, 196, 0.8);
  }
  100% {
    box-shadow: 0 0 0 rgba(78, 205, 196, 0);
  }
}

@keyframes bankruptDrop {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(90deg);
  }
}

@keyframes bankruptFade {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
    filter: grayscale(100%);
  }
}

@keyframes fateSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fateSlideOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
`

// 注入动画样式到页面
export function injectAnimationStyles(): void {
  if (typeof document === 'undefined') return
  
  const styleId = 'game-animation-styles'
  if (document.getElementById(styleId)) return
  
  const style = document.createElement('style')
  style.id = styleId
  style.textContent = ANIMATION_STYLES
  document.head.appendChild(style)
}

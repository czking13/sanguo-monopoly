// 音效配置
const sounds = {
  dice: '/sounds/dice.mp3',
  purchase: '/sounds/purchase.mp3',
  upgrade: '/sounds/upgrade.mp3',
  card: '/sounds/card.mp3',
  win: '/sounds/win.mp3',
  move: '/sounds/move.mp3',
  coin: '/sounds/coin.mp3'
}

const audioContext = typeof window !== 'undefined' ? new AudioContext() : null

export function playSound(type) {
  if (!audioContext || !sounds[type]) return
  
  const audio = new Audio(sounds[type])
  audio.volume = 0.5
  audio.play().catch(() => {})
}

export default sounds

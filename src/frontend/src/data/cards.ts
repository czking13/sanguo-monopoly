// 卡牌数据
export const chanceCards = [
  // 锦囊卡（机会）
  { id: 'c1', name: '火攻', type: '锦囊' as const, description: '对指定玩家造成500金损失', effect: 'damage', value: 500 },
  { id: 'c2', name: '连环计', type: '锦囊' as const, description: '指定玩家下回合不能移动', effect: 'skip_turn' },
  { id: 'c3', name: '空城计', type: '锦囊' as const, description: '本回合免疫所有攻击', effect: 'immune' },
  { id: 'c4', name: '借刀杀人', type: '锦囊' as const, description: '借用对手的卡牌使用', effect: 'steal_card' },
  { id: 'c5', name: '苦肉计', type: '锦囊' as const, description: '损失300金，获得2次掷骰', effect: 'double_roll', value: -300 },
  { id: 'c6', name: '反间计', type: '锦囊' as const, description: '查看一名玩家的手牌', effect: 'spy' },
  { id: 'c7', name: '美人计', type: '锦囊' as const, description: '指定玩家交出一张城池', effect: 'steal_city' },
  { id: 'c8', name: '走为上', type: '锦囊' as const, description: '立即移动到任意位置', effect: 'teleport' },
  
  // 天命卡（命运）
  { id: 'd1', name: '天降横财', type: '天命' as const, description: '获得1000金', effect: 'gain_money', value: 1000 },
  { id: 'd2', name: '破财免灾', type: '天命' as const, description: '损失500金', effect: 'lose_money', value: -500 },
  { id: 'd3', name: '官渡之战', type: '天命' as const, description: '所有玩家向你支付200金', effect: 'collect_all', value: 200 },
  { id: 'd4', name: '赤壁之战', type: '天命' as const, description: '所有城池过路费翻倍一轮', effect: 'double_toll' },
  { id: 'd5', name: '三顾茅庐', type: '天命' as const, description: '免费获得一座无人城池', effect: 'free_city' },
  { id: 'd6', name: '桃园结义', type: '天命' as const, description: '与指定玩家结盟3回合', effect: 'alliance' },
  { id: 'd7', name: '五丈原', type: '天命' as const, description: '进入监狱', effect: 'go_prison' },
  { id: 'd8', name: '黄巾起义', type: '天命' as const, description: '所有玩家后退3格', effect: 'all_back', value: 3 },
]

// 随机抽卡
export function drawCard(type: '锦囊' | '天命') {
  const cards = chanceCards.filter(c => c.type === type)
  return cards[Math.floor(Math.random() * cards.length)]
}

// 武将技能效果
export const heroSkills = {
  // 魏国
  'caocao': { name: '挟天子', trigger: 'pass_start', effect: (money: number) => Math.floor(money * 0.1) },
  'simayi': { name: '鹰视', trigger: 'draw_card', effect: 'peek_next' },
  'xiahou': { name: '盲视', trigger: 'in_prison', effect: 'auto_escape_2' },
  
  // 蜀国
  'liubei': { name: '仁德', trigger: 'pay_toll', effect: 'half_toll' },
  'guanyu': { name: '武圣', trigger: 'in_prison', effect: 'instant_escape' },
  'zhangfei': { name: '咆哮', trigger: 'roll_dice', effect: 'reroll_once' },
  'zhugeliang': { name: '神算', trigger: 'draw_card', effect: 'peek_next' },
  
  // 吴国
  'sunquan': { name: '制衡', trigger: 'roll_dice', effect: 'reroll_anytime' },
  'zhouyu': { name: '火攻', trigger: 'use_card', effect: 'fire_double' },
  'lusu': { name: '好施', trigger: 'turn_start', effect: () => 100 },
  'lvmeng': { name: '白衣', trigger: 'any', effect: 'spy_hand' },
}

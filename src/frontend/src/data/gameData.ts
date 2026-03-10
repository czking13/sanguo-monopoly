import type { MapCell } from '../types'

// 56格完整地图数据
export const initialCells: MapCell[] = [
  // 北方区域（魏国）1-14
  { id: 1, name: '邺城', type: 'city', faction: '魏', price: 1200, toll: 120 },
  { id: 2, name: '锦囊', type: 'chance' },
  { id: 3, name: '徐州', type: 'city', faction: '魏', price: 1000, toll: 100 },
  { id: 4, name: '天命', type: 'destiny' },
  { id: 5, name: '许昌', type: 'city', faction: '魏', price: 1400, toll: 140 },
  { id: 6, name: '监狱', type: 'prison' },
  { id: 7, name: '虎牢关', type: 'city', faction: '魏', price: 1600, toll: 160 },
  { id: 8, name: '锦囊', type: 'chance' },
  { id: 9, name: '洛阳', type: 'start', faction: '魏', price: 2000, toll: 200 },
  { id: 10, name: '陈留', type: 'city', faction: '魏', price: 800, toll: 80 },
  { id: 11, name: '天命', type: 'destiny' },
  { id: 12, name: '濮阳', type: 'city', faction: '魏', price: 600, toll: 60 },
  { id: 13, name: '锦囊', type: 'chance' },
  { id: 14, name: '晋阳', type: 'city', faction: '魏', price: 900, toll: 90 },
  
  // 荆州区域（争夺区）15-28
  { id: 15, name: '关卡1', type: 'checkpoint' },
  { id: 16, name: '新野', type: 'city', faction: '中立', price: 800, toll: 80 },
  { id: 17, name: '锦囊', type: 'chance' },
  { id: 18, name: '襄阳', type: 'city', faction: '中立', price: 1200, toll: 120 },
  { id: 19, name: '江夏', type: 'city', faction: '中立', price: 1000, toll: 100 },
  { id: 20, name: '天命', type: 'destiny' },
  { id: 21, name: '关卡2', type: 'checkpoint' },
  { id: 22, name: '长沙', type: 'city', faction: '中立', price: 1100, toll: 110 },
  { id: 23, name: '关卡3', type: 'checkpoint' },
  { id: 24, name: '武陵', type: 'city', faction: '中立', price: 700, toll: 70 },
  { id: 25, name: '天命', type: 'destiny' },
  { id: 26, name: '零陵', type: 'city', faction: '中立', price: 600, toll: 60 },
  { id: 27, name: '锦囊', type: 'chance' },
  { id: 28, name: '桂阳', type: 'city', faction: '中立', price: 500, toll: 50 },
  
  // 蜀地区域（蜀国）29-42
  { id: 29, name: '关卡4', type: 'checkpoint' },
  { id: 30, name: '汉中', type: 'city', faction: '蜀', price: 1000, toll: 100 },
  { id: 31, name: '锦囊', type: 'chance' },
  { id: 32, name: '成都', type: 'city', faction: '蜀', price: 1600, toll: 160 },
  { id: 33, name: '永安', type: 'city', faction: '蜀', price: 900, toll: 90 },
  { id: 34, name: '天命', type: 'destiny' },
  { id: 35, name: '关卡5', type: 'checkpoint' },
  { id: 36, name: '建宁', type: 'city', faction: '蜀', price: 700, toll: 70 },
  { id: 37, name: '关卡6', type: 'checkpoint' },
  { id: 38, name: '阆中', type: 'city', faction: '蜀', price: 800, toll: 80 },
  { id: 39, name: '锦囊', type: 'chance' },
  { id: 40, name: '雒城', type: 'city', faction: '蜀', price: 600, toll: 60 },
  { id: 41, name: '天命', type: 'destiny' },
  { id: 42, name: '绵竹', type: 'city', faction: '蜀', price: 500, toll: 50 },
  
  // 江东区域（吴国）43-56
  { id: 43, name: '关卡7', type: 'checkpoint' },
  { id: 44, name: '建业', type: 'city', faction: '吴', price: 1400, toll: 140 },
  { id: 45, name: '锦囊', type: 'chance' },
  { id: 46, name: '吴郡', type: 'city', faction: '吴', price: 1200, toll: 120 },
  { id: 47, name: '会稽', type: 'city', faction: '吴', price: 1000, toll: 100 },
  { id: 48, name: '天命', type: 'destiny' },
  { id: 49, name: '关卡8', type: 'checkpoint' },
  { id: 50, name: '南海', type: 'city', faction: '吴', price: 800, toll: 80 },
  { id: 51, name: '休息', type: 'rest' },
  { id: 52, name: '豫章', type: 'city', faction: '吴', price: 700, toll: 70 },
  { id: 53, name: '锦囊', type: 'chance' },
  { id: 54, name: '柴桑', type: 'city', faction: '吴', price: 1100, toll: 110 },
  { id: 55, name: '天命', type: 'destiny' },
  { id: 56, name: '庐江', type: 'city', faction: '吴', price: 900, toll: 90 },
]

// 武将数据
export const heroes = [
  // 魏国武将
  { id: 'caocao', name: '曹操', faction: '魏' as const, skill: { name: '挟天子', description: '每次经过起点额外获得10%资金', effect: 'startBonus' } },
  { id: 'simayi', name: '司马懿', faction: '魏' as const, skill: { name: '鹰视', description: '可查看下一张事件卡', effect: 'peekCard' } },
  { id: 'xiahou', name: '夏侯惇', faction: '魏' as const, skill: { name: '盲视', description: '入狱后2回合自动出狱', effect: 'prisonEscape' } },
  { id: 'dianwei', name: '典韦', faction: '魏' as const, skill: { name: '恶来', description: '攻击卡效果+50%', effect: 'attackBoost' } },
  { id: 'xuchu', name: '许褚', faction: '魏' as const, skill: { name: '裸衣', description: '每回合可多使用一张卡', effect: 'extraCard' } },
  { id: 'guojia', name: '郭嘉', faction: '魏' as const, skill: { name: '遗计', description: '破产时可转移一半资金给指定玩家', effect: 'transferOnBankrupt' } },
  
  // 蜀国武将
  { id: 'liubei', name: '刘备', faction: '蜀' as const, skill: { name: '仁德', description: '经过对手城池过路费减半', effect: 'tollDiscount' } },
  { id: 'guanyu', name: '关羽', faction: '蜀' as const, skill: { name: '武圣', description: '入狱后可立即出狱', effect: 'instantEscape' } },
  { id: 'zhangfei', name: '张飞', faction: '蜀' as const, skill: { name: '咆哮', description: '可连续掷两次骰子', effect: 'doubleRoll' } },
  { id: 'zhugeliang', name: '诸葛亮', faction: '蜀' as const, skill: { name: '神算', description: '可查看下一张事件卡', effect: 'peekCard' } },
  { id: 'zhaoyun', name: '赵云', faction: '蜀' as const, skill: { name: '龙胆', description: '被攻击时50%概率闪避', effect: 'dodge' } },
  { id: 'huangzhong', name: '黄忠', faction: '蜀' as const, skill: { name: '烈弓', description: '攻击卡必中', effect: 'sureHit' } },
  
  // 吴国武将
  { id: 'sunquan', name: '孙权', faction: '吴' as const, skill: { name: '制衡', description: '每回合可重新掷一次骰子', effect: 'reroll' } },
  { id: 'zhouyu', name: '周瑜', faction: '吴' as const, skill: { name: '火攻', description: '火攻卡效果翻倍', effect: 'fireBoost' } },
  { id: 'lusu', name: '鲁肃', faction: '吴' as const, skill: { name: '好施', description: '每回合获得额外100金币', effect: 'incomeBonus' } },
  { id: 'lvmeng', name: '吕蒙', faction: '吴' as const, skill: { name: '白衣', description: '可查看一名玩家的手牌', effect: 'spyHand' } },
  { id: 'ganning', name: '甘宁', faction: '吴' as const, skill: { name: '奇袭', description: '偷取对手一张卡', effect: 'stealCard' } },
  { id: 'lunxun', name: '陆逊', faction: '吴' as const, skill: { name: '连营', description: '使用卡牌后50%概率抽一张', effect: 'drawOnUse' } },
]

// 玩家颜色
export const playerColors = [
  '#e74c3c', // 红
  '#3498db', // 蓝
  '#2ecc71', // 绿
  '#f39c12', // 橙
  '#9b59b6', // 紫
  '#1abc9c', // 青
  '#e91e63', // 粉
  '#00bcd4', // 青蓝
]

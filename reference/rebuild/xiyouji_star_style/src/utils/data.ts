import * as THREE from 'three'
import type { 
  XiyoujiCharacter, 
  CharacterRelationship, 
  CelestialBodyConfig, 
  CelestialBodyType,
  ThemePalette 
} from '@/types'

/**
 * 西游记主题配色方案
 */
export const xiyoujiPalettes: ThemePalette[] = [
  // 天庭金辉
  [
    new THREE.Color(0xFFD700), 
    new THREE.Color(0xFF8C00), 
    new THREE.Color(0xFF4500), 
    new THREE.Color(0xDC143C), 
    new THREE.Color(0xB8860B)
  ],
  // 佛光普照
  [
    new THREE.Color(0x4F46E5), 
    new THREE.Color(0x7C3AED), 
    new THREE.Color(0xC026D3), 
    new THREE.Color(0xDB2777), 
    new THREE.Color(0x8B5CF6)
  ],
  // 妖魔鬼怪
  [
    new THREE.Color(0x10B981), 
    new THREE.Color(0xA3E635), 
    new THREE.Color(0xFACC15), 
    new THREE.Color(0xFB923C), 
    new THREE.Color(0x4ADE80)
  ],
  // 取经路上
  [
    new THREE.Color(0xEC4899), 
    new THREE.Color(0x8B5CF6), 
    new THREE.Color(0x6366F1), 
    new THREE.Color(0x3B82F6), 
    new THREE.Color(0xA855F7)
  ]
]

/**
 * 西游记角色数据
 */
export const xiyoujiCharacters: XiyoujiCharacter[] = [
  { name: '孙悟空', type: 0, importance: 1.0, celestial: 'earth', aliases: ['美猴王', '齐天大圣'] },
  { name: '唐僧', type: 0, importance: 0.9, celestial: 'earth', aliases: ['玄奘', '三藏法师'] },
  { name: '猪八戒', type: 0, importance: 0.8, celestial: 'earth', aliases: ['猪悟能', '天蓬元帅'] },
  { name: '沙僧', type: 0, importance: 0.7, celestial: 'earth', aliases: ['沙悟净', '卷帘大将'] },
  { name: '白龙马', type: 0, importance: 0.6, celestial: 'earth', aliases: ['敖烈', '三太子'] },
  { name: '如来佛祖', type: 1, importance: 1.0, celestial: 'mercury', aliases: ['释迦牟尼', '佛祖'] },
  { name: '观音菩萨', type: 1, importance: 0.95, celestial: 'venus', aliases: ['观世音', '南海观音'] },
  { name: '玉皇大帝', type: 1, importance: 1.0, celestial: 'sun', aliases: ['昊天上帝', '天帝'] },
  { name: '太上老君', type: 1, importance: 0.9, celestial: 'uranus', aliases: ['老子', '道德天尊'] },
  { name: '二郎神', type: 1, importance: 0.8, celestial: 'saturn', aliases: ['杨戬', '显圣真君'] },
  { name: '哪吒', type: 1, importance: 0.75, celestial: 'saturn', aliases: ['三太子'] },
  { name: '牛魔王', type: 2, importance: 0.85, celestial: 'mars', aliases: ['大力王'] },
  { name: '铁扇公主', type: 2, importance: 0.75, celestial: 'mars', aliases: ['罗刹女'] },
  { name: '红孩儿', type: 2, importance: 0.7, celestial: 'mars', aliases: ['圣婴大王'] },
  { name: '白骨精', type: 2, importance: 0.65, celestial: 'mars', aliases: ['白骨夫人'] },
  { name: '金角大王', type: 2, importance: 0.6, celestial: 'jupiter', aliases: [] },
  { name: '银角大王', type: 2, importance: 0.6, celestial: 'jupiter', aliases: [] },
  { name: '文殊菩萨', type: 1, importance: 0.8, celestial: 'mercury', aliases: ['文殊师利'] },
  { name: '李天王', type: 1, importance: 0.7, celestial: 'saturn', aliases: ['托塔天王', '李靖'] },
  { name: '太白金星', type: 1, importance: 0.65, celestial: 'saturn', aliases: [] },
  { name: '镇元大仙', type: 3, importance: 0.6, celestial: 'neptune', aliases: ['地仙之祖'] }
]

/**
 * 角色关系数据
 */
export const relationships: CharacterRelationship[] = [
  { from: 1, to: 0, type: 'master_disciple', strength: 0.9 },
  { from: 1, to: 2, type: 'master_disciple', strength: 0.8 },
  { from: 1, to: 3, type: 'master_disciple', strength: 0.85 },
  { from: 1, to: 4, type: 'master_disciple', strength: 0.7 },
  { from: 0, to: 2, type: 'fellow_disciple', strength: 0.7 },
  { from: 0, to: 3, type: 'fellow_disciple', strength: 0.8 },
  { from: 2, to: 3, type: 'fellow_disciple', strength: 0.75 },
  { from: 11, to: 12, type: 'family', strength: 0.8 },
  { from: 11, to: 13, type: 'family', strength: 0.9 },
  { from: 12, to: 13, type: 'family', strength: 0.9 },
  { from: 0, to: 14, type: 'enemy', strength: 0.9 },
  { from: 0, to: 11, type: 'enemy', strength: 0.8 },
  { from: 0, to: 15, type: 'enemy', strength: 0.7 },
  { from: 0, to: 16, type: 'enemy', strength: 0.7 },
  { from: 7, to: 9, type: 'superior', strength: 0.8 },
  { from: 7, to: 10, type: 'superior', strength: 0.75 },
  { from: 7, to: 18, type: 'superior', strength: 0.7 },
  { from: 5, to: 6, type: 'buddhist', strength: 0.9 },
  { from: 5, to: 17, type: 'buddhist', strength: 0.8 }
]

/**
 * 天体配置映射
 */
export const celestialBodies: Record<CelestialBodyType, CelestialBodyConfig> = {
  sun: { radius: 0, name: '太阳中心' },
  mercury: { radius: 8, name: '水星-佛界' },
  venus: { radius: 12, name: '金星-观音净土' },
  earth: { radius: 16, name: '地球-取经团队' },
  mars: { radius: 20, name: '火星-妖魔世界' },
  jupiter: { radius: 24, name: '木星-妖王联盟' },
  saturn: { radius: 28, name: '土星-天庭众神' },
  uranus: { radius: 32, name: '天王星-道教仙人' },
  neptune: { radius: 36, name: '海王星-其他角色' }
}

/**
 * 获取角色类型显示名称
 */
export function getTypeDisplayName(type: number): string {
  const names = ['主角', '神仙', '妖魔', '其他']
  return names[type] || '未知'
}

/**
 * 布局名称映射
 */
export const formationNames = ['银河系螺旋', '九重天分层', '取经路线', '势力阵营']

/**
 * 主题名称映射
 */
export const themeNames = ['天庭金辉', '佛光普照', '妖魔鬼怪', '取经路上']

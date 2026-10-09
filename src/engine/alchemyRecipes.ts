import type { ElementType, PotionRecipe } from '../lib/types'

export const POTION_RECIPES: PotionRecipe[] = [
  {
    id: 'inferno_bomb',
    name: 'Inferno Bomb',
    nameJa: 'インフェルノ・ボム',
    formula: ['pyr', 'pyr'],
    description: '広範囲に業火の爆発を起こし、敵に大ダメージと火傷を付与する。',
    color: '#ef4444',
    radius: 95,
    baseDamage: 55,
    dotDamage: 8,
    duration: 3.5,
  },
  {
    id: 'frost_shock',
    name: 'Frost Shock',
    nameJa: 'フロスト・ショック',
    formula: ['aqua', 'aqua'],
    description: '極冷気の衝撃波を放ち、敵の移動を3秒間完全に氷結停止させる。',
    color: '#06b6d4',
    radius: 70,
    baseDamage: 25,
    freezeDuration: 3.0,
  },
  {
    id: 'steam_scald',
    name: 'Steam Scald',
    nameJa: 'スチーム・スカルド',
    formula: ['pyr', 'aqua'],
    description: '高熱の沸騰蒸気を噴射し、防御を貫通して敵をノックバックさせる。',
    color: '#38bdf8',
    radius: 80,
    baseDamage: 40,
    knockback: 75,
  },
  {
    id: 'poison_cloud',
    name: 'Poison Cloud',
    nameJa: 'ポイズン・クラウド',
    formula: ['pyr', 'terra'],
    description: '毒素の濃霧エリアを展開し、滞在する敵に継続的な猛毒ダメージを与える。',
    color: '#10b981',
    radius: 100,
    baseDamage: 15,
    dotDamage: 12,
    duration: 4.5,
  },
  {
    id: 'healing_elixir',
    name: 'Healing Elixir',
    nameJa: 'ヒーリング・エリクサー',
    formula: ['aqua', 'terra'],
    description: '生命の雫を調合し、プレイヤーのHPを即座に40回復する。',
    color: '#34d399',
    radius: 40,
    baseDamage: 0,
    healAmount: 40,
  },
  {
    id: 'hellfire',
    name: 'Hellfire',
    nameJa: 'ヘルファイア',
    formula: ['pyr', 'nox'],
    description: '自身の生命力(5 HP)を代償に、単体の敵に破壊的な闇の業火ダメージを与える。',
    color: '#f43f5e',
    radius: 50,
    baseDamage: 120,
    hpCost: 5,
  },
  {
    id: 'vampiric_drain',
    name: 'Vampiric Drain',
    nameJa: 'ヴァンピリック・ドレイン',
    formula: ['aqua', 'nox'],
    description: '影と水の共鳴で敵の生気を吸い取り、ダメージを与えて同量のHPを吸収する。',
    color: '#c084fc',
    radius: 65,
    baseDamage: 38,
    healAmount: 30,
  },
  {
    id: 'acid_splash',
    name: 'Acid Splash',
    nameJa: 'アシッド・スプラッシュ',
    formula: ['terra', 'nox'],
    description: '腐食性の強酸を撒き散らし、敵の防御力を永久に50%削り取る。',
    color: '#a855f7',
    radius: 85,
    baseDamage: 30,
    defenseReduction: 0.5,
  },
  {
    id: 'prismatic_nova',
    name: 'Prismatic Nova',
    nameJa: 'プリズマティック・ノヴァ',
    formula: ['pyr', 'aqua', 'terra'],
    description: '3元素の核融合により、画面全体を巻き込む強大な全属性衝撃波を解き放つ。',
    color: '#fbbf24',
    radius: 160,
    baseDamage: 90,
    knockback: 100,
  },
  {
    id: 'elemental_slag',
    name: 'Elemental Slag',
    nameJa: 'エレメンタル・スラグ',
    formula: [],
    description: '不完全な調合によって生じた不安定なスラグ。小規模な衝撃波を生む。',
    color: '#94a3b8',
    radius: 50,
    baseDamage: 15,
  },
]

export const evaluateRecipe = (elements: ElementType[]): PotionRecipe => {
  if (elements.length < 2) {
    return POTION_RECIPES.find(r => r.id === 'elemental_slag')!
  }

  const sortedInput = [...elements].sort()

  for (const recipe of POTION_RECIPES) {
    if (recipe.formula.length === 0) continue
    const sortedFormula = [...recipe.formula].sort()
    if (sortedInput.length === sortedFormula.length && sortedFormula.every((val, idx) => val === sortedInput[idx])) {
      return recipe
    }
  }

  const firstTwo = sortedInput.slice(0, 2)
  for (const recipe of POTION_RECIPES) {
    if (recipe.formula.length === 2) {
      const sortedFormula = [...recipe.formula].sort()
      if (firstTwo.length === sortedFormula.length && sortedFormula.every((val, idx) => val === sortedFormula[idx])) {
        return recipe
      }
    }
  }

  return POTION_RECIPES.find(r => r.id === 'elemental_slag')!
}

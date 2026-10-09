export type ElementType = 'pyr' | 'aqua' | 'terra' | 'nox'

export type ElementInventory = Record<ElementType, number>

export type PotionEffectId =
  | 'inferno_bomb'
  | 'frost_shock'
  | 'steam_scald'
  | 'poison_cloud'
  | 'healing_elixir'
  | 'hellfire'
  | 'vampiric_drain'
  | 'acid_splash'
  | 'prismatic_nova'
  | 'elemental_slag'

export interface PotionRecipe {
  id: PotionEffectId
  name: string
  nameJa: string
  formula: ElementType[]
  description: string
  color: string
  radius: number
  baseDamage: number
  dotDamage?: number
  duration?: number
  healAmount?: number
  hpCost?: number
  freezeDuration?: number
  defenseReduction?: number
  knockback?: number
}

export interface StatusEffect {
  type: 'burn' | 'freeze' | 'poison' | 'acid'
  duration: number
  tickTimer: number
  value: number
}

export interface Player {
  x: number
  y: number
  hp: number
  maxHp: number
  shield: number
  maxShield: number
  speed: number
  crucibleCapacity: number
  elementYieldBonus: number
  unlockedRecipes: PotionEffectId[]
}

export type EnemyAiRole = 'swarmer' | 'ranger' | 'phaser' | 'teleporter' | 'tank'

export interface Enemy {
  id: string
  name: string
  type: string
  aiRole: EnemyAiRole
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  attack: number
  defense: number
  weakElement: ElementType
  resistElement: ElementType
  color: string
  statusEffects: StatusEffect[]
  attackCooldown: number
  specialCooldown: number
  isPhasing?: boolean
}

export interface EnemyProjectile {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  damage: number
  color: string
  life: number
  maxLife: number
}

export interface ResourceNode {
  id: string
  x: number
  y: number
  element: ElementType
  amount: number
  harvested: boolean
}

export type TileType = 'floor' | 'wall' | 'stairs'

export interface Tile {
  type: TileType
  explored: boolean
}

export interface Room {
  x: number
  y: number
  width: number
  height: number
}

export interface DungeonFloor {
  floorNumber: number
  width: number
  height: number
  tiles: Tile[][]
  rooms: Room[]
  stairsPosition: { x: number; y: number }
  spawnPosition: { x: number; y: number }
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

export interface FloatingText {
  id: string
  x: number
  y: number
  text: string
  color: string
  alpha: number
  life: number
}

export interface Projectile {
  id: string
  startX: number
  startY: number
  targetX: number
  targetY: number
  x: number
  y: number
  recipe: PotionRecipe
  progress: number
  speed: number
}

export interface AreaEffect {
  id: string
  x: number
  y: number
  radius: number
  recipe: PotionRecipe
  remainingTime: number
  maxDuration: number
  tickTimer: number
}

export type GameStatePhase = 'loading' | 'home' | 'exploring' | 'paused' | 'rest_site' | 'game_over' | 'victory'

export interface UpgradeOption {
  id: string
  title: string
  description: string
  cost: Partial<ElementInventory>
  apply: (player: Player) => void
  recipeToUnlock?: PotionEffectId
}

export interface GameStats {
  totalPlayTimeSeconds: number
  totalKills: number
  highestFloor: number
  totalPotionsBrewed: number
  discoveredRecipes: string[]
}

export interface GameSettings {
  soundEnabled: boolean
  masterVolume: number
  screenShakeEnabled: boolean
}

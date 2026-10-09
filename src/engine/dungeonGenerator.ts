import type { DungeonFloor, Enemy, ResourceNode, Room, Tile, ElementType, EnemyAiRole } from '../lib/types'

const ENEMY_TEMPLATES: {
  type: string
  name: string
  aiRole: EnemyAiRole
  baseHp: number
  speed: number
  attack: number
  defense: number
  weakElement: ElementType
  resistElement: ElementType
  color: string
}[] = [
  {
    type: 'slime',
    name: 'Toxic Slime',
    aiRole: 'swarmer',
    baseHp: 45,
    speed: 56,
    attack: 8,
    defense: 0,
    weakElement: 'pyr',
    resistElement: 'aqua',
    color: '#22c55e',
  },
  {
    type: 'skeleton',
    name: 'Bone Wanderer',
    aiRole: 'ranger',
    baseHp: 65,
    speed: 62,
    attack: 14,
    defense: 4,
    weakElement: 'terra',
    resistElement: 'nox',
    color: '#e2e8f0',
  },
  {
    type: 'fire_elemental',
    name: 'Blaze Spectre',
    aiRole: 'phaser',
    baseHp: 80,
    speed: 72,
    attack: 18,
    defense: 6,
    weakElement: 'aqua',
    resistElement: 'pyr',
    color: '#f97316',
  },
  {
    type: 'shadow_fiend',
    name: 'Abyssal Ghoul',
    aiRole: 'teleporter',
    baseHp: 95,
    speed: 55,
    attack: 22,
    defense: 8,
    weakElement: 'pyr',
    resistElement: 'nox',
    color: '#9333ea',
  },
  {
    type: 'gargoyle',
    name: 'Stone Gargoyle',
    aiRole: 'tank',
    baseHp: 130,
    speed: 40,
    attack: 24,
    defense: 18,
    weakElement: 'nox',
    resistElement: 'terra',
    color: '#64748b',
  },
]

export const generateDungeonFloor = (floorNumber: number): {
  floor: DungeonFloor
  enemies: Enemy[]
  nodes: ResourceNode[]
} => {
  const width = 42
  const height = 30
  const tiles: Tile[][] = []

  for (let y = 0; y < height; y++) {
    const row: Tile[] = []
    for (let x = 0; x < width; x++) {
      row.push({ type: 'wall', explored: false })
    }
    tiles.push(row)
  }

  const rooms: Room[] = []
  const roomCount = 6 + Math.min(floorNumber, 4)

  for (let i = 0; i < roomCount * 4; i++) {
    if (rooms.length >= roomCount) break

    const rWidth = 6 + Math.floor(Math.random() * 5)
    const rHeight = 5 + Math.floor(Math.random() * 4)
    const rx = 2 + Math.floor(Math.random() * (width - rWidth - 4))
    const ry = 2 + Math.floor(Math.random() * (height - rHeight - 4))

    const newRoom: Room = { x: rx, y: ry, width: rWidth, height: rHeight }

    let overlaps = false
    for (const other of rooms) {
      if (
        newRoom.x <= other.x + other.width + 1 &&
        newRoom.x + newRoom.width + 1 >= other.x &&
        newRoom.y <= other.y + other.height + 1 &&
        newRoom.y + newRoom.height + 1 >= other.y
      ) {
        overlaps = true
        break
      }
    }

    if (!overlaps) {
      rooms.push(newRoom)
      for (let y = newRoom.y; y < newRoom.y + newRoom.height; y++) {
        for (let x = newRoom.x; x < newRoom.x + newRoom.width; x++) {
          tiles[y][x].type = 'floor'
        }
      }
    }
  }

  for (let i = 0; i < rooms.length - 1; i++) {
    const rA = rooms[i]
    const rB = rooms[i + 1]

    let currX = Math.floor(rA.x + rA.width / 2)
    let currY = Math.floor(rA.y + rA.height / 2)
    const targetX = Math.floor(rB.x + rB.width / 2)
    const targetY = Math.floor(rB.y + rB.height / 2)

    while (currX !== targetX) {
      tiles[currY][currX].type = 'floor'
      currX += currX < targetX ? 1 : -1
    }
    while (currY !== targetY) {
      tiles[currY][currX].type = 'floor'
      currY += currY < targetY ? 1 : -1
    }
  }

  const startRoom = rooms[0]
  const endRoom = rooms[rooms.length - 1]

  const spawnPosition = {
    x: Math.floor(startRoom.x + startRoom.width / 2),
    y: Math.floor(startRoom.y + startRoom.height / 2),
  }

  const stairsPosition = {
    x: Math.floor(endRoom.x + endRoom.width / 2),
    y: Math.floor(endRoom.y + endRoom.height / 2),
  }

  tiles[stairsPosition.y][stairsPosition.x].type = 'stairs'

  const enemies: Enemy[] = []
  const nodes: ResourceNode[] = []
  const elements: ElementType[] = ['pyr', 'aqua', 'terra', 'nox']

  for (let i = 1; i < rooms.length; i++) {
    const r = rooms[i]
    const enemyCount = 1 + Math.floor(Math.random() * 2) + Math.floor(floorNumber / 2)

    for (let e = 0; e < enemyCount; e++) {
      const templateIndex = Math.min(
        Math.floor(Math.random() * (2 + floorNumber)),
        ENEMY_TEMPLATES.length - 1
      )
      const t = ENEMY_TEMPLATES[templateIndex]

      const ex = r.x + 1 + Math.floor(Math.random() * (r.width - 2))
      const ey = r.y + 1 + Math.floor(Math.random() * (r.height - 2))

      const hpScale = 1 + (floorNumber - 1) * 0.25
      const atkScale = 1 + (floorNumber - 1) * 0.2

      enemies.push({
        id: `enemy-${i}-${e}-${Math.random().toString(36).substr(2, 5)}`,
        name: t.name,
        type: t.type,
        aiRole: t.aiRole,
        x: ex * 32 + 16,
        y: ey * 32 + 16,
        hp: Math.round(t.baseHp * hpScale),
        maxHp: Math.round(t.baseHp * hpScale),
        speed: t.speed,
        attack: Math.round(t.attack * atkScale),
        defense: t.defense,
        weakElement: t.weakElement,
        resistElement: t.resistElement,
        color: t.color,
        statusEffects: [],
        attackCooldown: 0,
        specialCooldown: 1.5 + Math.random() * 2,
      })
    }

    const nodeCount = 1 + Math.floor(Math.random() * 2)
    for (let n = 0; n < nodeCount; n++) {
      const nx = r.x + 1 + Math.floor(Math.random() * (r.width - 2))
      const ny = r.y + 1 + Math.floor(Math.random() * (r.height - 2))
      const randomElement = elements[Math.floor(Math.random() * elements.length)]

      nodes.push({
        id: `node-${i}-${n}-${Math.random().toString(36).substr(2, 5)}`,
        x: nx * 32 + 16,
        y: ny * 32 + 16,
        element: randomElement,
        amount: 2 + Math.floor(Math.random() * 3),
        harvested: false,
      })
    }
  }

  const startNodeElem = elements[Math.floor(Math.random() * elements.length)]
  nodes.push({
    id: `node-start-0`,
    x: (startRoom.x + 1) * 32 + 16,
    y: (startRoom.y + 1) * 32 + 16,
    element: startNodeElem,
    amount: 3,
    harvested: false,
  })

  return {
    floor: {
      floorNumber,
      width,
      height,
      tiles,
      rooms,
      stairsPosition,
      spawnPosition,
    },
    enemies,
    nodes,
  }
}

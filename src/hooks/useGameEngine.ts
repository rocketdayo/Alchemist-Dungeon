import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  ElementType,
  ElementInventory,
  Player,
  Enemy,
  EnemyProjectile,
  ResourceNode,
  DungeonFloor,
  Particle,
  FloatingText,
  Projectile,
  AreaEffect,
  GameStatePhase,
  PotionRecipe,
  GameStats,
  GameSettings,
} from '../lib/types'
import { generateDungeonFloor } from '../engine/dungeonGenerator'
import { evaluateRecipe, POTION_RECIPES } from '../engine/alchemyRecipes'
import { soundEngine } from '../engine/soundEngine'
import {
  loadGameStats,
  saveGameStats,
  loadGameSettings,
  saveGameSettings,
} from '../lib/storage'

const TILE_SIZE = 32

export const useGameEngine = () => {
  const [phase, setPhase] = useState<GameStatePhase>('loading')
  const [floorNumber, setFloorNumber] = useState<number>(1)
  const [stats, setStats] = useState<GameStats>(loadGameStats)
  const [settings, setSettings] = useState<GameSettings>(loadGameSettings)

  const [inventory, setInventory] = useState<ElementInventory>({
    pyr: 5,
    aqua: 5,
    terra: 5,
    nox: 5,
  })
  const [alchemySlots, setAlchemySlots] = useState<ElementType[]>([])
  const [readyPotion, setReadyPotion] = useState<PotionRecipe | null>(null)

  const [player, setPlayer] = useState<Player>({
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    shield: 30,
    maxShield: 30,
    speed: 130,
    crucibleCapacity: 2,
    elementYieldBonus: 0,
    unlockedRecipes: ['inferno_bomb', 'frost_shock', 'healing_elixir'],
  })

  const [dungeonFloor, setDungeonFloor] = useState<DungeonFloor | null>(null)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [enemyProjectiles, setEnemyProjectiles] = useState<EnemyProjectile[]>([])
  const [nodes, setNodes] = useState<ResourceNode[]>([])
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [areaEffects, setAreaEffects] = useState<AreaEffect[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [screenShake, setScreenShake] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const keysPressed = useRef<Record<string, boolean>>({})
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lastTimeRef = useRef<number>(performance.now())
  const shakeIntensityRef = useRef<number>(0)
  const flowFieldRef = useRef<{ dx: number; dy: number }[][]>([])
  const lastFlowTargetRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
  const statsRef = useRef<GameStats>(stats)
  statsRef.current = stats
  const enemiesRef = useRef<Enemy[]>([])
  enemiesRef.current = enemies

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      saveGameSettings(updated)
      soundEngine.setSettings(updated.soundEnabled, updated.masterVolume)
      return updated
    })
  }, [])

  useEffect(() => {
    soundEngine.setSettings(settings.soundEnabled, settings.masterVolume)
  }, [settings.soundEnabled, settings.masterVolume])

  const finishLoading = useCallback(() => {
    setPhase('home')
  }, [])

  const goToHome = useCallback(() => {
    setPhase('home')
    setAlchemySlots([])
    setReadyPotion(null)
  }, [])

  const togglePause = useCallback(() => {
    setPhase(cur => {
      if (cur === 'exploring') {
        soundEngine.playClick()
        return 'paused'
      }
      if (cur === 'paused') {
        soundEngine.playClick()
        lastTimeRef.current = performance.now()
        return 'exploring'
      }
      return cur
    })
  }, [])

  const addParticles = useCallback((
    x: number,
    y: number,
    color: string,
    count: number,
    speedRange: number = 100,
    sizeRange: number = 4
  ) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (Math.random() * 0.7 + 0.3) * speedRange
      newParticles.push({
        id: `p-${Math.random().toString(36).substr(2, 7)}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * sizeRange + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.35 + 0.25,
      })
    }
    setParticles(prev => [...prev.slice(-140), ...newParticles])
  }, [])

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    setFloatingTexts(prev => [
      ...prev.slice(-25),
      {
        id: `ft-${Math.random().toString(36).substr(2, 7)}`,
        x,
        y,
        text,
        color,
        alpha: 1,
        life: 0,
      },
    ])
  }, [])

  const triggerShake = useCallback((intensity: number) => {
    if (!settings.screenShakeEnabled) return
    shakeIntensityRef.current = Math.min(shakeIntensityRef.current + intensity, 18)
  }, [settings.screenShakeEnabled])

  const computeFlowField = useCallback((floor: DungeonFloor, targetTileX: number, targetTileY: number) => {
    const w = floor.width
    const h = floor.height
    const dist: number[][] = Array.from({ length: h }, () => Array(w).fill(9999))
    const queue: [number, number][] = []

    if (
      targetTileX >= 0 &&
      targetTileX < w &&
      targetTileY >= 0 &&
      targetTileY < h &&
      floor.tiles[targetTileY][targetTileX].type !== 'wall'
    ) {
      dist[targetTileY][targetTileX] = 0
      queue.push([targetTileX, targetTileY])
    }

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]

    let head = 0
    while (head < queue.length) {
      const [cx, cy] = queue[head++]
      const cd = dist[cy][cx]

      for (const [dx, dy] of dirs) {
        const nx = cx + dx
        const ny = cy + dy
        if (
          nx >= 0 &&
          nx < w &&
          ny >= 0 &&
          ny < h &&
          floor.tiles[ny][nx].type !== 'wall'
        ) {
          if (dist[ny][nx] > cd + 1) {
            dist[ny][nx] = cd + 1
            queue.push([nx, ny])
          }
        }
      }
    }

    const field: { dx: number; dy: number }[][] = Array.from({ length: h }, () =>
      Array(w).fill({ dx: 0, dy: 0 })
    )

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (floor.tiles[y][x].type === 'wall' || dist[y][x] === 0 || dist[y][x] >= 9999) {
          field[y][x] = { dx: 0, dy: 0 }
          continue
        }

        let bestD = dist[y][x]
        let bestDir = { dx: 0, dy: 0 }

        for (const [dx, dy] of dirs) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            if (dist[ny][nx] < bestD) {
              bestD = dist[ny][nx]
              bestDir = { dx, dy }
            }
          }
        }

        field[y][x] = bestDir
      }
    }

    flowFieldRef.current = field
    lastFlowTargetRef.current = { x: targetTileX, y: targetTileY }
  }, [])

  const hasLineOfSight = useCallback((floor: DungeonFloor, x0: number, y0: number, x1: number, y1: number): boolean => {
    const dist = Math.hypot(x1 - x0, y1 - y0)
    const steps = Math.ceil(dist / 14)
    if (steps <= 1) return true

    for (let i = 1; i < steps; i++) {
      const t = i / steps
      const cx = x0 + (x1 - x0) * t
      const cy = y0 + (y1 - y0) * t
      const tx = Math.floor(cx / TILE_SIZE)
      const ty = Math.floor(cy / TILE_SIZE)
      if (
        tx < 0 ||
        tx >= floor.width ||
        ty < 0 ||
        ty >= floor.height ||
        floor.tiles[ty][tx].type === 'wall'
      ) {
        return false
      }
    }
    return true
  }, [])

  const initializeFloor = useCallback((newFloorNum: number, existingPlayer?: Player) => {
    const generated = generateDungeonFloor(newFloorNum)
    setDungeonFloor(generated.floor)
    setEnemies(generated.enemies)
    setEnemyProjectiles([])
    setNodes(generated.nodes)
    setProjectiles([])
    setAreaEffects([])

    const spawnPx = {
      x: generated.floor.spawnPosition.x * TILE_SIZE + 16,
      y: generated.floor.spawnPosition.y * TILE_SIZE + 16,
    }

    const nextPlayer = {
      ...(existingPlayer || player),
      x: spawnPx.x,
      y: spawnPx.y,
    }
    setPlayer(nextPlayer)

    computeFlowField(
      generated.floor,
      generated.floor.spawnPosition.x,
      generated.floor.spawnPosition.y
    )

    setFloorNumber(newFloorNum)
    setStats(prev => {
      const updated = {
        ...prev,
        highestFloor: Math.max(prev.highestFloor, newFloorNum),
      }
      saveGameStats(updated)
      return updated
    })
    setPhase('exploring')
    lastTimeRef.current = performance.now()
  }, [computeFlowField, player])

  const startGame = useCallback(() => {
    const initialPlayer: Player = {
      x: 0,
      y: 0,
      hp: 100,
      maxHp: 100,
      shield: 30,
      maxShield: 30,
      speed: 130,
      crucibleCapacity: 2,
      elementYieldBonus: 0,
      unlockedRecipes: statsRef.current.discoveredRecipes as any,
    }
    setInventory({
      pyr: 6,
      aqua: 6,
      terra: 6,
      nox: 6,
    })
    setAlchemySlots([])
    setReadyPotion(null)
    setPlayer(initialPlayer)
    initializeFloor(1, initialPlayer)
  }, [initializeFloor])

  const addElementToSlot = useCallback((element: ElementType) => {
    if (inventory[element] <= 0) return
    if (alchemySlots.length >= player.crucibleCapacity) return

    soundEngine.playClick()
    setInventory(prev => ({ ...prev, [element]: prev[element] - 1 }))
    const nextSlots = [...alchemySlots, element]
    setAlchemySlots(nextSlots)

    if (nextSlots.length >= 2) {
      const recipe = evaluateRecipe(nextSlots)
      setReadyPotion(recipe)
      setStats(prev => {
        const isDiscovered = prev.discoveredRecipes.includes(recipe.id)
        const updated = {
          ...prev,
          totalPotionsBrewed: prev.totalPotionsBrewed + 1,
          discoveredRecipes: isDiscovered
            ? prev.discoveredRecipes
            : [...prev.discoveredRecipes, recipe.id],
        }
        saveGameStats(updated)
        return updated
      })
    }
  }, [inventory, alchemySlots, player.crucibleCapacity])

  const clearAlchemySlots = useCallback(() => {
    if (alchemySlots.length === 0) return
    soundEngine.playClick()
    setInventory(prev => {
      const restored = { ...prev }
      alchemySlots.forEach(e => {
        restored[e] += 1
      })
      return restored
    })
    setAlchemySlots([])
    setReadyPotion(null)
  }, [alchemySlots])

  const throwCurrentPotion = useCallback((worldTargetX: number, worldTargetY: number) => {
    if (!readyPotion) return

    soundEngine.playPotionThrow()

    if (readyPotion.hpCost && readyPotion.hpCost > 0) {
      setPlayer(prev => {
        const nextHp = Math.max(1, prev.hp - (readyPotion.hpCost || 0))
        return { ...prev, hp: nextHp }
      })
      addFloatingText(player.x, player.y - 20, `-${readyPotion.hpCost} HP`, '#f43f5e')
    }

    if (readyPotion.healAmount && readyPotion.healAmount > 0 && readyPotion.id === 'healing_elixir') {
      soundEngine.playHeal()
      setPlayer(prev => {
        const nextHp = Math.min(prev.maxHp, prev.hp + (readyPotion.healAmount || 0))
        return { ...prev, hp: nextHp }
      })
      addParticles(player.x, player.y, '#34d399', 24, 80, 5)
      addFloatingText(player.x, player.y - 20, `+${readyPotion.healAmount} HP`, '#34d399')
      setAlchemySlots([])
      setReadyPotion(null)
      return
    }

    const dist = Math.hypot(worldTargetX - player.x, worldTargetY - player.y)
    const clampedDist = Math.min(dist, 320)
    const angle = Math.atan2(worldTargetY - player.y, worldTargetX - player.x)
    let actualTargetX = player.x + Math.cos(angle) * clampedDist
    let actualTargetY = player.y + Math.sin(angle) * clampedDist

    if (dungeonFloor) {
      const steps = Math.ceil(clampedDist / 10)
      for (let s = 1; s <= steps; s++) {
        const testX = player.x + Math.cos(angle) * (s * 10)
        const testY = player.y + Math.sin(angle) * (s * 10)
        const tx = Math.floor(testX / TILE_SIZE)
        const ty = Math.floor(testY / TILE_SIZE)
        if (
          tx >= 0 &&
          tx < dungeonFloor.width &&
          ty >= 0 &&
          ty < dungeonFloor.height &&
          dungeonFloor.tiles[ty][tx].type === 'wall'
        ) {
          actualTargetX = testX - Math.cos(angle) * 8
          actualTargetY = testY - Math.sin(angle) * 8
          break
        }
      }
    }

    setProjectiles(prev => [
      ...prev,
      {
        id: `proj-${Math.random().toString(36).substr(2, 7)}`,
        startX: player.x,
        startY: player.y,
        targetX: actualTargetX,
        targetY: actualTargetY,
        x: player.x,
        y: player.y,
        recipe: readyPotion,
        progress: 0,
        speed: 380,
      },
    ])

    setAlchemySlots([])
    setReadyPotion(null)
  }, [readyPotion, player, dungeonFloor, addFloatingText, addParticles])

  const harvestNearbyNode = useCallback(() => {
    if (!dungeonFloor) return
    let harvestedAny = false

    setNodes(prev =>
      prev.map(n => {
        if (n.harvested) return n
        const dist = Math.hypot(n.x - player.x, n.y - player.y)
        if (dist <= 42) {
          harvestedAny = true
          const yieldAmount = n.amount + player.elementYieldBonus
          setInventory(inv => ({
            ...inv,
            [n.element]: inv[n.element] + yieldAmount,
          }))
          addParticles(n.x, n.y, '#38bdf8', 16, 60, 3)
          addFloatingText(n.x, n.y - 10, `+${yieldAmount} ${n.element.toUpperCase()}`, '#38bdf8')
          return { ...n, harvested: true }
        }
        return n
      })
    )

    if (harvestedAny) {
      soundEngine.playElementHarvest()
    }
  }, [dungeonFloor, player, addParticles, addFloatingText])

  const upgradePlayer = useCallback((applyFn: (p: Player) => void, cost: Partial<ElementInventory>) => {
    for (const [elem, amount] of Object.entries(cost)) {
      if ((inventory[elem as ElementType] || 0) < (amount || 0)) {
        return false
      }
    }

    setInventory(prev => {
      const next = { ...prev }
      for (const [elem, amount] of Object.entries(cost)) {
        next[elem as ElementType] -= amount || 0
      }
      return next
    })

    setPlayer(prev => {
      const cloned = { ...prev }
      applyFn(cloned)
      return cloned
    })

    soundEngine.playCraftSuccess()
    return true
  }, [inventory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause()
        return
      }

      if (phase !== 'exploring') return

      keysPressed.current[e.key.toLowerCase()] = true

      if (e.key.toLowerCase() === 'e') harvestNearbyNode()
      if (e.key === '1') addElementToSlot('pyr')
      if (e.key === '2') addElementToSlot('aqua')
      if (e.key === '3') addElementToSlot('terra')
      if (e.key === '4') addElementToSlot('nox')
      if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'r') clearAlchemySlots()
      if (e.key === ' ' && readyPotion) {
        throwCurrentPotion(mousePos.current.x, mousePos.current.y)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [phase, addElementToSlot, clearAlchemySlots, harvestNearbyNode, readyPotion, throwCurrentPotion, togglePause])

  useEffect(() => {
    if (phase !== 'exploring') return
    const interval = setInterval(() => {
      setStats(prev => {
        const updated = {
          ...prev,
          totalPlayTimeSeconds: prev.totalPlayTimeSeconds + 1,
        }
        saveGameStats(updated)
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase !== 'exploring' || !dungeonFloor) return

    let animId: number
    let flowUpdateTimer = 0

    const isTileBlocked = (worldX: number, worldY: number, radius: number = 8): boolean => {
      const corners = [
        { x: worldX - radius, y: worldY - radius },
        { x: worldX + radius, y: worldY - radius },
        { x: worldX - radius, y: worldY + radius },
        { x: worldX + radius, y: worldY + radius },
      ]
      for (const pt of corners) {
        const tx = Math.floor(pt.x / TILE_SIZE)
        const ty = Math.floor(pt.y / TILE_SIZE)
        if (
          tx < 0 ||
          tx >= dungeonFloor.width ||
          ty < 0 ||
          ty >= dungeonFloor.height ||
          dungeonFloor.tiles[ty][tx].type === 'wall'
        ) {
          return true
        }
      }
      return false
    }

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = currentTime

      flowUpdateTimer += dt
      const pTileX = Math.floor(player.x / TILE_SIZE)
      const pTileY = Math.floor(player.y / TILE_SIZE)
      if (
        flowUpdateTimer > 0.25 ||
        pTileX !== lastFlowTargetRef.current.x ||
        pTileY !== lastFlowTargetRef.current.y
      ) {
        flowUpdateTimer = 0
        computeFlowField(dungeonFloor, pTileX, pTileY)
      }

      if (shakeIntensityRef.current > 0) {
        const sx = (Math.random() * 2 - 1) * shakeIntensityRef.current
        const sy = (Math.random() * 2 - 1) * shakeIntensityRef.current
        setScreenShake({ x: sx, y: sy })
        shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - dt * 25)
      } else {
        setScreenShake({ x: 0, y: 0 })
      }

      let dx = 0
      let dy = 0
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1

      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy)
        dx /= length
        dy /= length
      }

      setPlayer(prev => {
        let newX = prev.x + dx * prev.speed * dt
        let newY = prev.y + dy * prev.speed * dt

        let finalX = prev.x
        let finalY = prev.y

        if (!isTileBlocked(newX, prev.y, 9)) finalX = newX
        if (!isTileBlocked(finalX, newY, 9)) finalY = newY

        const tileX = Math.floor(finalX / TILE_SIZE)
        const tileY = Math.floor(finalY / TILE_SIZE)

        const stairs = dungeonFloor.stairsPosition
        if (tileX === stairs.x && tileY === stairs.y && enemiesRef.current.length === 0) {
          setPhase('rest_site')
          soundEngine.playHeal()
        }

        return { ...prev, x: finalX, y: finalY }
      })

      setProjectiles(prevProj => {
        const nextProj: Projectile[] = []
        prevProj.forEach(p => {
          const totalDist = Math.hypot(p.targetX - p.startX, p.targetY - p.startY)
          const travel = p.speed * dt
          const newProgress = Math.min(1, p.progress + (totalDist > 0 ? travel / totalDist : 1))

          const currX = p.startX + (p.targetX - p.startX) * newProgress
          const currY = p.startY + (p.targetY - p.startY) * newProgress

          if (Math.random() < 0.4) {
            addParticles(currX, currY, p.recipe.color, 2, 20, 2)
          }

          if (newProgress >= 1) {
            triggerShake(6)
            soundEngine.playExplosion()
            addParticles(currX, currY, p.recipe.color, 28, 140, 5)

            if (p.recipe.duration && p.recipe.duration > 0) {
              setAreaEffects(cur => [
                ...cur,
                {
                  id: `aoe-${Math.random().toString(36).substr(2, 7)}`,
                  x: currX,
                  y: currY,
                  radius: p.recipe.radius,
                  recipe: p.recipe,
                  remainingTime: p.recipe.duration || 3,
                  maxDuration: p.recipe.duration || 3,
                  tickTimer: 0,
                },
              ])
            }

            setEnemies(currEnemies =>
              currEnemies.map(enemy => {
                const distToImpact = Math.hypot(enemy.x - currX, enemy.y - currY)
                if (distToImpact <= p.recipe.radius) {
                  let dmg = p.recipe.baseDamage
                  if (p.recipe.formula.includes(enemy.weakElement)) {
                    dmg *= 2.0
                    addFloatingText(enemy.x, enemy.y - 30, 'WEAKNESS! 2x', '#fbbf24')
                  } else if (p.recipe.formula.includes(enemy.resistElement)) {
                    dmg *= 0.5
                    addFloatingText(enemy.x, enemy.y - 30, 'RESIST! 0.5x', '#94a3b8')
                  }

                  const finalDmg = Math.max(1, Math.round(dmg - enemy.defense))
                  addFloatingText(enemy.x, enemy.y - 15, `-${finalDmg}`, p.recipe.color)

                  let newStatus = [...enemy.statusEffects]
                  if (p.recipe.freezeDuration) {
                    newStatus.push({
                      type: 'freeze',
                      duration: p.recipe.freezeDuration,
                      tickTimer: 0,
                      value: 0,
                    })
                    soundEngine.playFreeze()
                  }
                  if (p.recipe.defenseReduction) {
                    enemy.defense = Math.round(enemy.defense * (1 - p.recipe.defenseReduction))
                    newStatus.push({
                      type: 'acid',
                      duration: 8,
                      tickTimer: 0,
                      value: 0,
                    })
                  }

                  let pushX = enemy.x
                  let pushY = enemy.y
                  if (p.recipe.knockback) {
                    const kAngle = Math.atan2(enemy.y - currY, enemy.x - currX)
                    const targetPushX = pushX + Math.cos(kAngle) * p.recipe.knockback
                    const targetPushY = pushY + Math.sin(kAngle) * p.recipe.knockback
                    if (!isTileBlocked(targetPushX, pushY, 9)) pushX = targetPushX
                    if (!isTileBlocked(pushX, targetPushY, 9)) pushY = targetPushY
                  }

                  if (p.recipe.id === 'vampiric_drain') {
                    setPlayer(pl => ({
                      ...pl,
                      hp: Math.min(pl.maxHp, pl.hp + (p.recipe.healAmount || 20)),
                    }))
                    soundEngine.playHeal()
                  }

                  return {
                    ...enemy,
                    x: pushX,
                    y: pushY,
                    hp: enemy.hp - finalDmg,
                    statusEffects: newStatus,
                  }
                }
                return enemy
              })
            )
          } else {
            nextProj.push({
              ...p,
              x: currX,
              y: currY,
              progress: newProgress,
            })
          }
        })
        return nextProj
      })

      setEnemyProjectiles(prevEp => {
        const nextEp: EnemyProjectile[] = []
        prevEp.forEach(ep => {
          const nextX = ep.x + ep.vx * dt
          const nextY = ep.y + ep.vy * dt
          const nextLife = ep.life + dt

          const hitWall = isTileBlocked(nextX, nextY, 4)
          const distToP = Math.hypot(player.x - nextX, player.y - nextY)

          if (distToP < 16) {
            soundEngine.playHit()
            triggerShake(4)
            setPlayer(pl => {
              let dmg = ep.damage
              let newShield = pl.shield
              let newHp = pl.hp

              if (newShield > 0) {
                const absorb = Math.min(newShield, dmg)
                newShield -= absorb
                dmg -= absorb
                addFloatingText(pl.x, pl.y - 25, `-${absorb} SHIELD`, '#38bdf8')
              }
              if (dmg > 0) {
                newHp = Math.max(0, newHp - dmg)
                addFloatingText(pl.x, pl.y - 15, `-${dmg} HP`, '#ef4444')
              }
              if (newHp <= 0) setPhase('game_over')

              return { ...pl, hp: newHp, shield: newShield }
            })
            addParticles(nextX, nextY, ep.color, 12, 60, 3)
            return
          }

          if (!hitWall && nextLife < ep.maxLife) {
            nextEp.push({ ...ep, x: nextX, y: nextY, life: nextLife })
          } else {
            addParticles(nextX, nextY, ep.color, 6, 40, 2)
          }
        })
        return nextEp
      })

      setAreaEffects(prevAoe => {
        const nextAoe: AreaEffect[] = []
        prevAoe.forEach(aoe => {
          const remaining = aoe.remainingTime - dt
          const tick = aoe.tickTimer + dt

          if (Math.random() < 0.25) {
            addParticles(
              aoe.x + (Math.random() * 2 - 1) * aoe.radius * 0.7,
              aoe.y + (Math.random() * 2 - 1) * aoe.radius * 0.7,
              aoe.recipe.color,
              2,
              25,
              3
            )
          }

          if (tick >= 0.5) {
            if (aoe.recipe.dotDamage) {
              setEnemies(currEnemies =>
                currEnemies.map(enemy => {
                  const dist = Math.hypot(enemy.x - aoe.x, enemy.y - aoe.y)
                  if (dist <= aoe.radius) {
                    const dot = aoe.recipe.dotDamage || 5
                    addFloatingText(enemy.x, enemy.y - 12, `-${dot}`, aoe.recipe.color)
                    return {
                      ...enemy,
                      hp: enemy.hp - dot,
                    }
                  }
                  return enemy
                })
              )
            }
          }

          if (remaining > 0) {
            nextAoe.push({
              ...aoe,
              remainingTime: remaining,
              tickTimer: tick >= 0.5 ? 0 : tick,
            })
          }
        })
        return nextAoe
      })

      setEnemies(prevEnemies => {
        const aliveEnemies: Enemy[] = []
        const newProjectilesToAdd: EnemyProjectile[] = []

        prevEnemies.forEach((enemy, idx) => {
          if (enemy.hp <= 0) {
            addParticles(enemy.x, enemy.y, enemy.color, 18, 90, 4)
            setStats(st => {
              const updated = { ...st, totalKills: st.totalKills + 1 }
              saveGameStats(updated)
              return updated
            })
            if (Math.random() < 0.75) {
              const elements: ElementType[] = ['pyr', 'aqua', 'terra', 'nox']
              const droppedElem = enemy.weakElement || elements[Math.floor(Math.random() * elements.length)]
              setInventory(inv => ({
                ...inv,
                [droppedElem]: inv[droppedElem] + 1,
              }))
              addFloatingText(enemy.x, enemy.y - 15, `+1 ${droppedElem.toUpperCase()}`, '#a855f7')
            }
            return
          }

          let isFrozen = false
          const nextStatuses = enemy.statusEffects
            .map(st => ({
              ...st,
              duration: st.duration - dt,
            }))
            .filter(st => {
              if (st.type === 'freeze') isFrozen = true
              return st.duration > 0
            })

          let currentX = enemy.x
          let currentY = enemy.y
          let cd = Math.max(0, enemy.attackCooldown - dt)
          let specialCd = Math.max(0, enemy.specialCooldown - dt)
          let isPhasing = enemy.isPhasing || false

          const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y)
          const hasLos = hasLineOfSight(dungeonFloor, enemy.x, enemy.y, player.x, player.y)

          if (!isFrozen && distToPlayer < 450) {
            let desiredVx = 0
            let desiredVy = 0

            const eTileX = Math.floor(enemy.x / TILE_SIZE)
            const eTileY = Math.floor(enemy.y / TILE_SIZE)
            const curCenterX = eTileX * TILE_SIZE + 16
            const curCenterY = eTileY * TILE_SIZE + 16

            const flow =
              flowFieldRef.current[eTileY] && flowFieldRef.current[eTileY][eTileX]
                ? flowFieldRef.current[eTileY][eTileX]
                : { dx: 0, dy: 0 }

            const isDirectRush =
              isPhasing ||
              (hasLos && distToPlayer < 75) ||
              (hasLos && enemy.aiRole === 'swarmer' && Math.abs(player.x - enemy.x) < 20) ||
              (hasLos && enemy.aiRole === 'swarmer' && Math.abs(player.y - enemy.y) < 20)

            if (isDirectRush) {
              const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
              desiredVx = Math.cos(angle)
              desiredVy = Math.sin(angle)
            } else if (flow.dx !== 0 || flow.dy !== 0) {
              let targetX = (eTileX + flow.dx) * TILE_SIZE + 16
              let targetY = (eTileY + flow.dy) * TILE_SIZE + 16

              if (flow.dx !== 0) {
                const diffY = curCenterY - enemy.y
                if (Math.abs(diffY) > 2) {
                  targetY = curCenterY
                }
              }
              if (flow.dy !== 0) {
                const diffX = curCenterX - enemy.x
                if (Math.abs(diffX) > 2) {
                  targetX = curCenterX
                }
              }

              const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x)
              desiredVx = Math.cos(angle)
              desiredVy = Math.sin(angle)
            } else {
              const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
              desiredVx = Math.cos(angle)
              desiredVy = Math.sin(angle)
            }

            let sepX = 0
            let sepY = 0
            prevEnemies.forEach((other, oIdx) => {
              if (idx === oIdx || other.hp <= 0) return
              const d = Math.hypot(enemy.x - other.x, enemy.y - other.y)
              if (d > 0 && d < 22) {
                sepX += (enemy.x - other.x) / d
                sepY += (enemy.y - other.y) / d
              }
            })

            let moveSpeed = enemy.speed
            if (enemy.aiRole === 'swarmer' && distToPlayer < 90 && hasLos) {
              moveSpeed *= 1.35
            }

            let finalVx = desiredVx + sepX * 0.4
            let finalVy = desiredVy + sepY * 0.4
            const vLen = Math.hypot(finalVx, finalVy)
            if (vLen > 0) {
              finalVx /= vLen
              finalVy /= vLen
            }

            let stepX = finalVx * moveSpeed * dt
            let stepY = finalVy * moveSpeed * dt

            if (enemy.aiRole === 'phaser' && specialCd <= 0 && distToPlayer > 80) {
              isPhasing = true
              specialCd = 4.0
              addParticles(enemy.x, enemy.y, '#f97316', 10, 50, 3)
            } else if (isPhasing && specialCd < 2.5) {
              isPhasing = false
            }

            if (enemy.aiRole === 'teleporter' && specialCd <= 0 && (!hasLos || distToPlayer > 180)) {
              specialCd = 5.0
              const angleToP = Math.random() * Math.PI * 2
              const warpDist = 48 + Math.random() * 32
              const warpX = player.x + Math.cos(angleToP) * warpDist
              const warpY = player.y + Math.sin(angleToP) * warpDist
              if (!isTileBlocked(warpX, warpY, 11)) {
                addParticles(currentX, currentY, '#9333ea', 16, 70, 3)
                currentX = warpX
                currentY = warpY
                addParticles(currentX, currentY, '#c084fc', 20, 90, 4)
                soundEngine.playFreeze()
              }
            }

            if (enemy.aiRole === 'ranger' && specialCd <= 0 && hasLos && distToPlayer > 70 && distToPlayer < 280) {
              specialCd = 2.4
              const bAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
              newProjectilesToAdd.push({
                id: `ep-${Math.random().toString(36).substr(2, 7)}`,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(bAngle) * 220,
                vy: Math.sin(bAngle) * 220,
                damage: Math.round(enemy.attack * 0.8),
                color: '#e2e8f0',
                life: 0,
                maxLife: 2.2,
              })
              soundEngine.playPotionThrow()
            }

            const enemyRadius = 7.5
            if (isPhasing) {
              currentX += stepX
              currentY += stepY
            } else {
              let movedX = false
              let movedY = false

              if (!isTileBlocked(currentX + stepX, currentY, enemyRadius)) {
                currentX += stepX
                movedX = true
              } else {
                const nudgeY = Math.sign(curCenterY - currentY) * moveSpeed * dt * 0.7
                if (Math.abs(curCenterY - currentY) > 1 && !isTileBlocked(currentX, currentY + nudgeY, enemyRadius)) {
                  currentY += nudgeY
                  movedY = true
                }
              }

              if (!isTileBlocked(currentX, currentY + stepY, enemyRadius)) {
                currentY += stepY
                movedY = true
              } else {
                const nudgeX = Math.sign(curCenterX - currentX) * moveSpeed * dt * 0.7
                if (Math.abs(curCenterX - currentX) > 1 && !isTileBlocked(currentX + nudgeX, currentY, enemyRadius)) {
                  currentX += nudgeX
                  movedX = true
                }
              }

              if (!movedX && !movedY) {
                const cornerNudgeX = Math.sign(curCenterX - currentX) * moveSpeed * dt
                const cornerNudgeY = Math.sign(curCenterY - currentY) * moveSpeed * dt
                if (!isTileBlocked(currentX + cornerNudgeX, currentY, enemyRadius)) {
                  currentX += cornerNudgeX
                }
                if (!isTileBlocked(currentX, currentY + cornerNudgeY, enemyRadius)) {
                  currentY += cornerNudgeY
                }
              }
            }

            if (distToPlayer < 24 && cd <= 0) {
              cd = 1.0
              soundEngine.playHit()
              triggerShake(5)
              setPlayer(pl => {
                let dmg = enemy.attack
                let newShield = pl.shield
                let newHp = pl.hp

                if (newShield > 0) {
                  const absorb = Math.min(newShield, dmg)
                  newShield -= absorb
                  dmg -= absorb
                  addFloatingText(pl.x, pl.y - 25, `-${absorb} SHIELD`, '#38bdf8')
                }

                if (dmg > 0) {
                  newHp = Math.max(0, newHp - dmg)
                  addFloatingText(pl.x, pl.y - 15, `-${dmg} HP`, '#ef4444')
                }

                if (newHp <= 0) {
                  setPhase('game_over')
                }

                return {
                  ...pl,
                  hp: newHp,
                  shield: newShield,
                }
              })
            }
          }

          aliveEnemies.push({
            ...enemy,
            x: currentX,
            y: currentY,
            statusEffects: nextStatuses,
            attackCooldown: cd,
            specialCooldown: specialCd,
            isPhasing,
          })
        })

        if (newProjectilesToAdd.length > 0) {
          setEnemyProjectiles(prev => [...prev, ...newProjectilesToAdd])
        }

        return aliveEnemies
      })

      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life + dt,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
          }))
          .filter(p => p.life < p.maxLife)
      )

      setFloatingTexts(prev =>
        prev
          .map(t => ({
            ...t,
            y: t.y - 25 * dt,
            life: t.life + dt,
            alpha: Math.max(0, 1 - t.life / 1.0),
          }))
          .filter(t => t.life < 1.0)
      )

      animId = requestAnimationFrame(gameLoop)
    }

    animId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [
    phase,
    dungeonFloor,
    player.x,
    player.y,
    addParticles,
    addFloatingText,
    triggerShake,
    computeFlowField,
    hasLineOfSight,
  ])

  return {
    phase,
    setPhase,
    floorNumber,
    stats,
    settings,
    updateSettings,
    finishLoading,
    goToHome,
    togglePause,
    inventory,
    alchemySlots,
    readyPotion,
    player,
    dungeonFloor,
    enemies,
    enemyProjectiles,
    nodes,
    projectiles,
    areaEffects,
    particles,
    floatingTexts,
    screenShake,
    mousePos,
    startGame,
    initializeFloor,
    addElementToSlot,
    clearAlchemySlots,
    throwCurrentPotion,
    harvestNearbyNode,
    upgradePlayer,
    allRecipes: POTION_RECIPES,
  }
}

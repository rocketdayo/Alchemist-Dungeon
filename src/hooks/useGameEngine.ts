import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  ElementType,
  ElementInventory,
  Player,
  Enemy,
  ResourceNode,
  DungeonFloor,
  Particle,
  FloatingText,
  Projectile,
  AreaEffect,
  GameStatePhase,
  PotionRecipe,
} from '../lib/types'
import { generateDungeonFloor } from '../engine/dungeonGenerator'
import { evaluateRecipe, POTION_RECIPES } from '../engine/alchemyRecipes'
import { soundEngine } from '../engine/soundEngine'

const TILE_SIZE = 32

export const useGameEngine = () => {
  const [phase, setPhase] = useState<GameStatePhase>('start')
  const [floorNumber, setFloorNumber] = useState<number>(1)
  const [inventory, setInventory] = useState<ElementInventory>({
    pyr: 5,
    aqua: 5,
    terra: 5,
    nox: 5,
  })
  const [alchemySlots, setAlchemySlots] = useState<ElementType[]>([])
  const [readyPotion, setReadyPotion] = useState<PotionRecipe | null>(null)
  const [discoveredRecipes, setDiscoveredRecipes] = useState<string[]>([
    'inferno_bomb',
    'frost_shock',
    'healing_elixir',
  ])

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
    setParticles(prev => [...prev.slice(-120), ...newParticles])
  }, [])

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    setFloatingTexts(prev => [
      ...prev.slice(-20),
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
    shakeIntensityRef.current = Math.min(shakeIntensityRef.current + intensity, 18)
  }, [])

  const initializeFloor = useCallback((newFloorNum: number, existingPlayer?: Player) => {
    const generated = generateDungeonFloor(newFloorNum)
    setDungeonFloor(generated.floor)
    setEnemies(generated.enemies)
    setNodes(generated.nodes)
    setProjectiles([])
    setAreaEffects([])

    const spawnPx = {
      x: generated.floor.spawnPosition.x * TILE_SIZE + 16,
      y: generated.floor.spawnPosition.y * TILE_SIZE + 16,
    }

    setPlayer(prev => ({
      ...(existingPlayer || prev),
      x: spawnPx.x,
      y: spawnPx.y,
    }))

    setFloorNumber(newFloorNum)
    setPhase('exploring')
  }, [])

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
      unlockedRecipes: ['inferno_bomb', 'frost_shock', 'healing_elixir'],
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
      if (!discoveredRecipes.includes(recipe.id)) {
        setDiscoveredRecipes(prev => [...prev, recipe.id])
      }
    }
  }, [inventory, alchemySlots, player.crucibleCapacity, discoveredRecipes])

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
    const actualTargetX = player.x + Math.cos(angle) * clampedDist
    const actualTargetY = player.y + Math.sin(angle) * clampedDist

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
  }, [readyPotion, player, addFloatingText, addParticles])

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
      keysPressed.current[e.key.toLowerCase()] = true

      if (e.key.toLowerCase() === 'e') {
        harvestNearbyNode()
      }
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
  }, [addElementToSlot, clearAlchemySlots, harvestNearbyNode, readyPotion, throwCurrentPotion])

  useEffect(() => {
    if (phase !== 'exploring' || !dungeonFloor) return

    let animId: number

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = currentTime

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

        const tileX = Math.floor(newX / TILE_SIZE)
        const tileY = Math.floor(newY / TILE_SIZE)

        if (
          tileX >= 0 &&
          tileX < dungeonFloor.width &&
          tileY >= 0 &&
          tileY < dungeonFloor.height &&
          dungeonFloor.tiles[tileY][tileX].type !== 'wall'
        ) {
          const stairs = dungeonFloor.stairsPosition
          if (tileX === stairs.x && tileY === stairs.y) {
            setPhase('rest_site')
            soundEngine.playHeal()
          }
          return { ...prev, x: newX, y: newY }
        }
        return prev
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
                    pushX += Math.cos(kAngle) * p.recipe.knockback
                    pushY += Math.sin(kAngle) * p.recipe.knockback
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
        prevEnemies.forEach(enemy => {
          if (enemy.hp <= 0) {
            addParticles(enemy.x, enemy.y, enemy.color, 18, 90, 4)
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

          const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y)

          if (!isFrozen && distToPlayer < 380) {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)
            const moveSpeed = enemy.speed * dt
            currentX += Math.cos(angle) * moveSpeed
            currentY += Math.sin(angle) * moveSpeed

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
          })
        })
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
  ])

  return {
    phase,
    setPhase,
    floorNumber,
    inventory,
    alchemySlots,
    readyPotion,
    discoveredRecipes,
    player,
    dungeonFloor,
    enemies,
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

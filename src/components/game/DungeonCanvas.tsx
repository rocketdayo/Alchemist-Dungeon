import React, { useRef, useEffect, useCallback } from 'react'
import type {
  Player,
  Enemy,
  EnemyProjectile,
  ResourceNode,
  DungeonFloor,
  Particle,
  FloatingText,
  Projectile,
  AreaEffect,
  PotionRecipe,
  ElementType,
} from '../../lib/types'

const TILE_SIZE = 32

interface DungeonCanvasProps {
  player: Player
  dungeonFloor: DungeonFloor | null
  enemies: Enemy[]
  enemyProjectiles: EnemyProjectile[]
  nodes: ResourceNode[]
  projectiles: Projectile[]
  areaEffects: AreaEffect[]
  particles: Particle[]
  floatingTexts: FloatingText[]
  screenShake: { x: number; y: number }
  readyPotion: PotionRecipe | null
  onAimMove: (worldX: number, worldY: number) => void
  onCanvasClick: (worldX: number, worldY: number) => void
}

export const DungeonCanvas: React.FC<DungeonCanvasProps> = ({
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
  readyPotion,
  onAimMove,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const aimPosRef = useRef<{ x: number; y: number }>({ x: player.x, y: player.y })

  const getElementColor = (el: ElementType): string => {
    switch (el) {
      case 'pyr':
        return '#ef4444'
      case 'aqua':
        return '#06b6d4'
      case 'terra':
        return '#10b981'
      case 'nox':
        return '#a855f7'
      default:
        return '#94a3b8'
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseScreenX = e.clientX - rect.left
      const mouseScreenY = e.clientY - rect.top

      const cameraX = player.x - canvas.width / 2
      const cameraY = player.y - canvas.height / 2

      const worldX = mouseScreenX + cameraX
      const worldY = mouseScreenY + cameraY

      aimPosRef.current = { x: worldX, y: worldY }
      onAimMove(worldX, worldY)
    },
    [player.x, player.y, onAimMove]
  )

  const handleClick = useCallback(() => {
    onCanvasClick(aimPosRef.current.x, aimPosRef.current.y)
  }, [onCanvasClick])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateCanvasSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    const cameraX = player.x - canvas.width / 2 + screenShake.x
    const cameraY = player.y - canvas.height / 2 + screenShake.y

    ctx.translate(-cameraX, -cameraY)

    if (dungeonFloor) {
      const startTileX = Math.max(0, Math.floor(cameraX / TILE_SIZE))
      const endTileX = Math.min(dungeonFloor.width, Math.ceil((cameraX + canvas.width) / TILE_SIZE))
      const startTileY = Math.max(0, Math.floor(cameraY / TILE_SIZE))
      const endTileY = Math.min(dungeonFloor.height, Math.ceil((cameraY + canvas.height) / TILE_SIZE))

      for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
          const tile = dungeonFloor.tiles[y][x]
          const px = x * TILE_SIZE
          const py = y * TILE_SIZE

          if (tile.type === 'wall') {
            ctx.fillStyle = '#11121d'
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
            ctx.strokeStyle = '#1e2133'
            ctx.lineWidth = 1
            ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1)
          } else if (tile.type === 'stairs') {
            ctx.fillStyle = '#1e1b4b'
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)

            ctx.fillStyle = '#6366f1'
            ctx.beginPath()
            ctx.arc(px + 16, py + 16, 12, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#e0e7ff'
            ctx.font = '10px serif'
            ctx.textAlign = 'center'
            ctx.fillText('▼', px + 16, py + 19)
          } else {
            ctx.fillStyle = '#1a1b26'
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
            ctx.strokeStyle = '#24283b'
            ctx.lineWidth = 0.5
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
          }
        }
      }
    }

    nodes.forEach(node => {
      if (node.harvested) return
      const col = getElementColor(node.element)

      ctx.save()
      ctx.shadowColor = col
      ctx.shadowBlur = 12

      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(node.x - 2, node.y - 2, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.fillStyle = '#e2e8f0'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(node.element.toUpperCase(), node.x, node.y - 12)
    })

    areaEffects.forEach(aoe => {
      ctx.save()
      const ratio = aoe.remainingTime / aoe.maxDuration
      ctx.globalAlpha = 0.35 * ratio
      ctx.fillStyle = aoe.recipe.color
      ctx.beginPath()
      ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.7 * ratio
      ctx.strokeStyle = aoe.recipe.color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    })

    enemies.forEach(enemy => {
      ctx.save()

      if (enemy.isPhasing) {
        ctx.globalAlpha = 0.55
        ctx.shadowColor = '#f97316'
        ctx.shadowBlur = 14
      }

      ctx.fillStyle = enemy.color
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, 11, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, 11, 0, Math.PI * 2)
      ctx.stroke()

      const isFrozen = enemy.statusEffects.some(s => s.type === 'freeze')
      if (isFrozen) {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(enemy.x, enemy.y, 14, 0, Math.PI * 2)
        ctx.stroke()
      }

      const barWidth = 26
      const barHeight = 4
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp)
      const barX = enemy.x - barWidth / 2
      const barY = enemy.y - 19

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(barX, barY, barWidth, barHeight)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '8px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(enemy.name, enemy.x, enemy.y - 22)

      const weakCol = getElementColor(enemy.weakElement)
      ctx.fillStyle = weakCol
      ctx.beginPath()
      ctx.arc(enemy.x - 7, enemy.y + 18, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f8fafc'
      ctx.font = '7px sans-serif'
      ctx.fillText('W', enemy.x - 7, enemy.y + 19)

      const resCol = getElementColor(enemy.resistElement)
      ctx.fillStyle = resCol
      ctx.beginPath()
      ctx.arc(enemy.x + 7, enemy.y + 18, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f8fafc'
      ctx.font = '7px sans-serif'
      ctx.fillText('R', enemy.x + 7, enemy.y + 19)

      ctx.restore()
    })

    enemyProjectiles.forEach(ep => {
      ctx.save()
      ctx.shadowColor = ep.color
      ctx.shadowBlur = 8
      ctx.fillStyle = ep.color
      ctx.beginPath()
      ctx.arc(ep.x, ep.y, 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    projectiles.forEach(p => {
      ctx.save()
      ctx.shadowColor = p.recipe.color
      ctx.shadowBlur = 10
      ctx.fillStyle = p.recipe.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    ctx.save()
    ctx.shadowColor = '#60a5fa'
    ctx.shadowBlur = 10
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(player.x, player.y, 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(player.x, player.y - 4, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    if (readyPotion) {
      const aim = aimPosRef.current
      ctx.save()
      ctx.strokeStyle = readyPotion.color
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])

      ctx.beginPath()
      ctx.moveTo(player.x, player.y)
      ctx.lineTo(aim.x, aim.y)
      ctx.stroke()

      ctx.fillStyle = readyPotion.color
      ctx.globalAlpha = 0.2
      ctx.beginPath()
      ctx.arc(aim.x, aim.y, readyPotion.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(aim.x, aim.y, readyPotion.radius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    particles.forEach(p => {
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    floatingTexts.forEach(ft => {
      ctx.save()
      ctx.globalAlpha = ft.alpha
      ctx.fillStyle = ft.color
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 4
      ctx.fillText(ft.text, ft.x, ft.y)
      ctx.restore()
    })

    ctx.restore()
  }, [
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
    readyPotion,
  ])

  return (
    <div className="relative w-full h-full overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="block w-full h-full"
      />
    </div>
  )
}

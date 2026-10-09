import React, { useRef, useEffect } from 'react'
import type { Player, DungeonFloor } from '../../lib/types'
import { Heart, Shield, Compass } from 'lucide-react'

interface StatusPanelProps {
  player: Player
  floorNumber: number
  dungeonFloor: DungeonFloor | null
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  player,
  floorNumber,
  dungeonFloor,
}) => {
  const miniMapRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = miniMapRef.current
    if (!canvas || !dungeonFloor) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mw = canvas.width
    const mh = canvas.height
    ctx.clearRect(0, 0, mw, mh)

    const cellW = mw / dungeonFloor.width
    const cellH = mh / dungeonFloor.height

    for (let y = 0; y < dungeonFloor.height; y++) {
      for (let x = 0; x < dungeonFloor.width; x++) {
        const tile = dungeonFloor.tiles[y][x]
        if (tile.type === 'floor') {
          ctx.fillStyle = '#27293d'
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
        } else if (tile.type === 'stairs') {
          ctx.fillStyle = '#818cf8'
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
        }
      }
    }

    const playerTileX = player.x / 32
    const playerTileY = player.y / 32
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(playerTileX * cellW, playerTileY * cellH, 3, 0, Math.PI * 2)
    ctx.fill()
  }, [player.x, player.y, dungeonFloor])

  const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp))
  const shieldRatio = Math.max(0, Math.min(1, player.shield / player.maxShield))

  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-dungeon-800/90 border border-dungeon-border backdrop-blur-md shadow-2xl">
      <div className="flex flex-col gap-2 min-w-[170px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-fantasy tracking-wider">階層: 第 {floorNumber} 層</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <div className="flex items-center justify-between text-[11px] mb-0.5 font-mono">
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <Heart className="w-3.5 h-3.5" /> HP
              </span>
              <span className="text-gray-300">
                {player.hp} / {player.maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-dungeon-900 rounded-full overflow-hidden border border-dungeon-border">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-200"
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between text-[11px] mb-0.5 font-mono">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Shield className="w-3.5 h-3.5" /> シールド
              </span>
              <span className="text-gray-300">
                {player.shield} / {player.maxShield}
              </span>
            </div>
            <div className="w-full h-2 bg-dungeon-900 rounded-full overflow-hidden border border-dungeon-border">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-200"
                style={{ width: `${shieldRatio * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-20 h-16 bg-dungeon-900 rounded-lg border border-dungeon-border overflow-hidden shadow-inner">
          <canvas
            ref={miniMapRef}
            width={80}
            height={64}
            className="w-full h-full block"
          />
        </div>
        <span className="text-[9px] text-gray-500 mt-0.5 tracking-wider font-mono">
          MAP
        </span>
      </div>
    </div>
  )
}

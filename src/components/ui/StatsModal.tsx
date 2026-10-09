import { motion } from 'framer-motion'
import type { GameStats } from '../../lib/types'
import { POTION_RECIPES } from '../../engine/alchemyRecipes'
import { X, Clock, Skull, Trophy, FlaskConical, BookOpen } from 'lucide-react'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
  stats: GameStats
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const validRecipesCount = POTION_RECIPES.filter(r => r.formula.length > 0).length
  const discoveredValidCount = stats.discoveredRecipes.filter(id => id !== 'elemental_slag').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-dungeon-border bg-dungeon-900/80">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-fantasy text-amber-200">
              錬金術師の記録・戦績
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dungeon-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border flex flex-col">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>総プレイ時間</span>
              </span>
              <span className="text-xl font-bold font-mono text-white mt-auto">
                {formatTime(stats.totalPlayTimeSeconds)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border flex flex-col">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>最高到達階層</span>
              </span>
              <span className="text-xl font-bold font-fantasy text-amber-300 mt-auto">
                第 {stats.highestFloor} 層
              </span>
            </div>

            <div className="p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border flex flex-col">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Skull className="w-4 h-4 text-red-400" />
                <span>総討伐数</span>
              </span>
              <span className="text-xl font-bold font-mono text-white mt-auto">
                {stats.totalKills} 体
              </span>
            </div>

            <div className="p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border flex flex-col">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span>調合した秘薬</span>
              </span>
              <span className="text-xl font-bold font-mono text-white mt-auto">
                {stats.totalPotionsBrewed} 回
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-gray-200">解明済み錬金術式</div>
                <div className="text-xs text-gray-400">古代の組み合わせ知識</div>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-lg font-bold text-emerald-400">
                {discoveredValidCount}
              </span>
              <span className="text-xs text-gray-500"> / {validRecipesCount} 種</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-dungeon-900 border-t border-dungeon-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-dungeon-700 hover:bg-dungeon-600 text-white transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </motion.div>
    </div>
  )
}

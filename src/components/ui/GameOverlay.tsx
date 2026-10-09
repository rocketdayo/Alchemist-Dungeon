import { motion } from 'framer-motion'
import type { GameStatePhase } from '../../lib/types'
import { Skull, RotateCcw, Home } from 'lucide-react'

interface GameOverlayProps {
  phase: GameStatePhase
  floorNumber: number
  onRestart: () => void
  onReturnToHome: () => void
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  phase,
  floorNumber,
  onRestart,
  onReturnToHome,
}) => {
  if (phase !== 'game_over') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-dungeon-800 border border-red-900/50 rounded-2xl p-6 shadow-2xl text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4 shadow-lg shadow-red-500/10">
          <Skull className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold font-fantasy tracking-wider text-red-400">
          錬金術師の死 (DEFEAT)
        </h2>
        <p className="text-xs text-gray-400 mt-2">
          肉体は崩壊し、秘めたる錬金術のエーテルは地下の闇へと霧散した。
        </p>

        <div className="my-6 p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border text-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">
            最終到達階層
          </div>
          <div className="text-3xl font-extrabold font-fantasy text-amber-300 mt-1">
            第 {floorNumber} 層
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl font-fantasy font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>魂の再調合 (Restart)</span>
          </button>

          <button
            onClick={onReturnToHome}
            className="w-full py-2.5 rounded-xl bg-dungeon-900/90 hover:bg-dungeon-700/80 border border-dungeon-border text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>ホーム画面へ戻る</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

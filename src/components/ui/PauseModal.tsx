import { motion } from 'framer-motion'
import { Play, BookOpen, Settings, Home, Pause } from 'lucide-react'

interface PauseModalProps {
  isOpen: boolean
  onResume: () => void
  onOpenCodex: () => void
  onOpenSettings: () => void
  onReturnToHome: () => void
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onOpenCodex,
  onOpenSettings,
  onReturnToHome,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 text-center"
      >
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
          <Pause className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold font-fantasy text-amber-200 tracking-wider">
          一時停止中 (PAUSED)
        </h2>
        <p className="text-xs text-gray-400 mt-1 mb-6">
          時間の流れが凍結されています
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl font-fantasy font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>探索を再開 [ESC]</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="w-full py-2.5 px-4 rounded-xl bg-dungeon-900/90 hover:bg-dungeon-700/80 border border-dungeon-border text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>錬金術式録 [B]</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-dungeon-900/90 hover:bg-dungeon-700/80 border border-dungeon-border text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>環境設定</span>
          </button>

          <button
            onClick={onReturnToHome}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-xs font-bold text-red-300 hover:text-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Home className="w-4 h-4" />
            <span>ホーム画面へ戻る</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

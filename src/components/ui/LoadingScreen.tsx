import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FlaskConical } from 'lucide-react'

interface LoadingScreenProps {
  onLoaded: () => void
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        const inc = Math.floor(Math.random() * 14) + 6
        return Math.min(100, prev + inc)
      })
    }, 120)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07070b] text-gray-100 select-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative flex flex-col items-center z-10"
      >
        <div className="relative flex items-center justify-center w-28 h-28 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-purple-500/20 border-t-purple-400 border-r-amber-400/40"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-cyan-500/20 border-b-cyan-400 border-l-emerald-400/40"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/40 shadow-xl shadow-purple-950/60"
          >
            <FlaskConical className="w-8 h-8 text-amber-300" />
          </motion.div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-300 drop-shadow-md">
          ALCHEMIST DUNGEON
        </h1>
        <p className="text-xs sm:text-sm font-fantasy text-purple-300/80 tracking-widest mt-1 uppercase">
          アルケミスト・ダンジョン
        </p>

        <div className="w-64 sm:w-80 mt-10">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>地下霊脈の同調中...</span>
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-dungeon-800 rounded-full overflow-hidden border border-purple-950 p-[1px]">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-cyan-500 to-amber-400 rounded-full shadow-lg"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {progress >= 100 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onLoaded}
            className="mt-8 px-8 py-3 rounded-xl font-fantasy font-bold text-sm tracking-widest uppercase bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 hover:from-purple-600 hover:to-indigo-500 text-white shadow-xl shadow-purple-950/80 border border-purple-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            地下工房の扉を開く (Enter)
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

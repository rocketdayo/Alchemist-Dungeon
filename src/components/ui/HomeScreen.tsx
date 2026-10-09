import { motion } from 'framer-motion'
import { Play, BookOpen, BarChart3, Settings, Sparkles, Flame, Droplets, Leaf, Skull } from 'lucide-react'

interface HomeScreenProps {
  onStartGame: () => void
  onOpenCodex: () => void
  onOpenStats: () => void
  onOpenSettings: () => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenCodex,
  onOpenStats,
  onOpenSettings,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#090a12] via-[#0d0e1a] to-[#07070b] text-gray-100 select-none overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80">
          <Sparkles className="w-4 h-4" />
          <span>v1.2.0 • ROGUELITE ALCHEMY</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dungeon-800/80 hover:bg-dungeon-700 border border-dungeon-border text-xs text-gray-300 hover:text-white transition-all cursor-pointer shadow-md"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>環境設定</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center my-auto py-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 rounded-lg bg-pyr/20 text-pyr"><Flame className="w-4 h-4" /></span>
          <span className="p-1.5 rounded-lg bg-aqua/20 text-aqua"><Droplets className="w-4 h-4" /></span>
          <span className="p-1.5 rounded-lg bg-terra/20 text-terra"><Leaf className="w-4 h-4" /></span>
          <span className="p-1.5 rounded-lg bg-nox/20 text-nox"><Skull className="w-4 h-4" /></span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-100 to-amber-300 drop-shadow-xl">
          ALCHEMIST DUNGEON
        </h1>
        <p className="text-sm sm:text-base font-fantasy text-amber-400/90 tracking-widest mt-2 uppercase">
          アルケミスト・ダンジョン
        </p>
        <p className="max-w-md text-xs sm:text-sm text-gray-400 mt-4 leading-relaxed font-light">
          火・水・地・闇の4元素を抽出し、坩堝で瞬時に調合せよ。<br />
          属性の反発と融合を操り、地下迷宮の怪異を撃退するリアルタイム調合ローグライト。
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-md">
          <button
            onClick={onStartGame}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-fantasy font-bold text-base bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white shadow-xl shadow-amber-950/60 border border-amber-400/40 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>地下深層へ挑む</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-md">
          <button
            onClick={onOpenCodex}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-xs font-bold text-gray-300 hover:text-white transition-all hover:scale-[1.02] cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>錬金術式録 (図鑑)</span>
          </button>

          <button
            onClick={onOpenStats}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-xs font-bold text-gray-300 hover:text-white transition-all hover:scale-[1.02] cursor-pointer shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>戦績・ステータス</span>
          </button>
        </div>
      </motion.div>

      <div className="w-full max-w-4xl p-4 rounded-2xl bg-dungeon-800/50 border border-dungeon-border text-gray-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-300 font-bold">[操作]</span>
          <span>WASD / 矢印: 移動</span>
          <span>•</span>
          <span>1~4: 元素選択</span>
          <span>•</span>
          <span>クリック/スペース: 投擲</span>
          <span>•</span>
          <span>E: 採取</span>
          <span>•</span>
          <span>ESC: 一時停止</span>
        </div>
        <div className="font-mono text-[11px] text-gray-500">
          ローカルストレージ自動保存対応
        </div>
      </div>
    </div>
  )
}

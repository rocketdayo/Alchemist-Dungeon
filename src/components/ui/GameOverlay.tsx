import React from 'react'
import { motion } from 'framer-motion'
import type { GameStatePhase } from '../../lib/types'
import { Skull, Play, RotateCcw, Sparkles } from 'lucide-react'

interface GameOverlayProps {
  phase: GameStatePhase
  floorNumber: number
  onStart: () => void
  onRestart: () => void
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  phase,
  floorNumber,
  onStart,
  onRestart,
}) => {
  if (phase === 'exploring' || phase === 'rest_site') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {phase === 'start' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full bg-dungeon-800 border border-dungeon-border rounded-2xl p-6 shadow-2xl text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-fantasy tracking-wider text-amber-200">
            ALCHEMIST DUNGEON
          </h1>
          <p className="text-sm font-fantasy text-amber-400/80 mt-1">
            アルケミスト・ダンジョン
          </p>

          <div className="my-6 p-4 rounded-xl bg-dungeon-900/80 border border-dungeon-border text-left text-xs space-y-2 text-gray-300">
            <div className="font-bold text-amber-300 text-sm mb-2">
              基本操作 & ルール:
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">移動:</span>
              <span className="font-mono text-white">[W] [A] [S] [D] または 矢印キー</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">元素投入:</span>
              <span className="font-mono text-white">[1] 火 [2] 水 [3] 地 [4] 闇 (クリック可)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ポーション投擲:</span>
              <span className="font-mono text-white">[画面クリック] または [スペースキー]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">元素の採取:</span>
              <span className="font-mono text-white">鉱床近くで [E] キー</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">坩堝リセット / 図鑑:</span>
              <span className="font-mono text-white">[C] リセット / [B] 術式録</span>
            </div>
          </div>

          <button
            onClick={onStart}
            className="w-full py-3.5 rounded-xl font-fantasy font-bold text-base bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-xl shadow-amber-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>地下深層へ挑む (Enter Dungeon)</span>
          </button>
        </motion.div>
      )}

      {phase === 'game_over' && (
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

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl font-fantasy font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>魂の再調合 (Restart Dungeon)</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType, PotionRecipe } from '../../lib/types'
import { Flame, Droplets, Leaf, Skull, RotateCcw, Sparkles } from 'lucide-react'

interface AlchemyBenchProps {
  slots: ElementType[]
  maxSlots: number
  readyPotion: PotionRecipe | null
  onClear: () => void
}

export const AlchemyBench: React.FC<AlchemyBenchProps> = ({
  slots,
  maxSlots,
  readyPotion,
  onClear,
}) => {
  const getElementIcon = (el: ElementType) => {
    switch (el) {
      case 'pyr':
        return <Flame className="w-5 h-5 text-pyr" />
      case 'aqua':
        return <Droplets className="w-5 h-5 text-aqua" />
      case 'terra':
        return <Leaf className="w-5 h-5 text-terra" />
      case 'nox':
        return <Skull className="w-5 h-5 text-nox" />
    }
  }

  const getElementBg = (el: ElementType) => {
    switch (el) {
      case 'pyr':
        return 'bg-pyr/20 border-pyr glow-pyr'
      case 'aqua':
        return 'bg-aqua/20 border-aqua glow-aqua'
      case 'terra':
        return 'bg-terra/20 border-terra glow-terra'
      case 'nox':
        return 'bg-nox/20 border-nox glow-nox'
    }
  }

  return (
    <div className="relative flex flex-col items-center p-3 rounded-2xl bg-dungeon-800/90 border border-dungeon-border backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between w-full mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-300 uppercase font-fantasy">
          <Sparkles className="w-3.5 h-3.5" />
          <span>坩堝 (Crucible)</span>
        </div>
        <button
          onClick={onClear}
          disabled={slots.length === 0}
          className="flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 hover:text-white transition-colors bg-dungeon-700/60 hover:bg-dungeon-600 rounded border border-dungeon-border disabled:opacity-40 disabled:cursor-not-allowed"
          title="スロットをクリア [C]"
        >
          <RotateCcw className="w-3 h-3" />
          <span>リセット</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {Array.from({ length: maxSlots }).map((_, index) => {
          const el = slots[index]
          return (
            <div
              key={index}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                el
                  ? getElementBg(el)
                  : 'bg-dungeon-900/80 border-gray-700/60 border-dashed shadow-inner'
              }`}
            >
              <AnimatePresence>
                {el && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    {getElementIcon(el)}
                    <span className="text-[9px] font-bold tracking-tighter uppercase mt-0.5">
                      {el}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {readyPotion && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="mt-3 w-full p-2.5 rounded-xl border flex flex-col items-center text-center shadow-lg"
            style={{
              backgroundColor: `${readyPotion.color}15`,
              borderColor: readyPotion.color,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full animate-ping"
                style={{ backgroundColor: readyPotion.color }}
              />
              <span
                className="font-fantasy font-bold text-sm tracking-wide"
                style={{ color: readyPotion.color }}
              >
                {readyPotion.nameJa}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-1 leading-tight">
              {readyPotion.description}
            </p>
            <div className="mt-1.5 text-[10px] text-amber-200/90 font-mono tracking-wider">
              [左クリック] または [スペースキー] で投擲
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

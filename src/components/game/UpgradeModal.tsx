import React from 'react'
import { motion } from 'framer-motion'
import type { Player, ElementInventory, PotionEffectId } from '../../lib/types'
import { POTION_RECIPES } from '../../engine/alchemyRecipes'
import { Sparkles, ShieldPlus, Layers, ArrowRight, BookOpen } from 'lucide-react'

interface UpgradeModalProps {
  player: Player
  inventory: ElementInventory
  floorNumber: number
  onUpgrade: (applyFn: (p: Player) => void, cost: Partial<ElementInventory>) => boolean
  onNextFloor: () => void
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  player,
  inventory,
  floorNumber,
  onUpgrade,
  onNextFloor,
}) => {
  const canAfford = (cost: Partial<ElementInventory>) => {
    return Object.entries(cost).every(([elem, amount]) => {
      return (inventory[elem as keyof ElementInventory] || 0) >= (amount || 0)
    })
  }

  const lockedRecipes = POTION_RECIPES.filter(
    r => !player.unlockedRecipes.includes(r.id) && r.formula.length > 0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-dungeon-border bg-gradient-to-r from-dungeon-900 via-dungeon-800 to-dungeon-900 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-fantasy">
              <Sparkles className="w-4 h-4" />
              <span>錬金術師の休息所 (Alchemist Sanctuary)</span>
            </div>
            <h2 className="text-2xl font-bold font-fantasy text-white mt-1">
              第 {floorNumber} 層 突破
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-dungeon-900/80 px-4 py-2 rounded-xl border border-dungeon-border text-xs font-mono">
            <span className="text-pyr font-bold">P: {inventory.pyr}</span>
            <span className="text-aqua font-bold">A: {inventory.aqua}</span>
            <span className="text-terra font-bold">T: {inventory.terra}</span>
            <span className="text-nox font-bold">N: {inventory.nox}</span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-dungeon-900/60 border border-dungeon-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>坩堝の拡張 (Crucible Capacity)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  調合スロット上限を3枠へ拡張。3元素による秘術が調合可能になる。
                </p>
                <div className="mt-2 text-xs text-amber-300 font-mono">
                  コスト: 火4, 水4, 地4, 闇4
                </div>
              </div>
              <button
                disabled={
                  player.crucibleCapacity >= 3 ||
                  !canAfford({ pyr: 4, aqua: 4, terra: 4, nox: 4 })
                }
                onClick={() =>
                  onUpgrade(
                    p => {
                      p.crucibleCapacity = 3
                    },
                    { pyr: 4, aqua: 4, terra: 4, nox: 4 }
                  )
                }
                className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {player.crucibleCapacity >= 3 ? '習得済み' : '強化を実行'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-dungeon-900/60 border border-dungeon-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>採取技術の向上 (Element Yield)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  鉱床からの元素採取量が常に+1増加する。
                </p>
                <div className="mt-2 text-xs text-amber-300 font-mono">
                  コスト: 地6, 水3
                </div>
              </div>
              <button
                disabled={!canAfford({ terra: 6, aqua: 3 })}
                onClick={() =>
                  onUpgrade(
                    p => {
                      p.elementYieldBonus += 1
                    },
                    { terra: 6, aqua: 3 }
                  )
                }
                className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                強化を実行 (Lv.{player.elementYieldBonus})
              </button>
            </div>

            <div className="p-4 rounded-xl bg-dungeon-900/60 border border-dungeon-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <ShieldPlus className="w-4 h-4" />
                  <span>エーテル防壁強化 (Shield & HP)</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  最大シールドを+15増加し、全快させる。
                </p>
                <div className="mt-2 text-xs text-amber-300 font-mono">
                  コスト: 水5, 闇3
                </div>
              </div>
              <button
                disabled={!canAfford({ aqua: 5, nox: 3 })}
                onClick={() =>
                  onUpgrade(
                    p => {
                      p.maxShield += 15
                      p.shield = p.maxShield
                      p.hp = Math.min(p.maxHp, p.hp + 20)
                    },
                    { aqua: 5, nox: 3 }
                  )
                }
                className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                強化を実行
              </button>
            </div>

            {lockedRecipes.slice(0, 1).map(recipe => (
              <div
                key={recipe.id}
                className="p-4 rounded-xl bg-dungeon-900/60 border border-dungeon-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span>秘伝書の解放: {recipe.nameJa}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{recipe.description}</p>
                  <div className="mt-2 text-xs text-amber-300 font-mono">
                    コスト: 各元素2個ずつ
                  </div>
                </div>
                <button
                  disabled={!canAfford({ pyr: 2, aqua: 2, terra: 2, nox: 2 })}
                  onClick={() =>
                    onUpgrade(
                      p => {
                        p.unlockedRecipes.push(recipe.id as PotionEffectId)
                      },
                      { pyr: 2, aqua: 2, terra: 2, nox: 2 }
                    )
                  }
                  className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  レシピを解読
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-dungeon-900 border-t border-dungeon-border flex justify-end">
          <button
            onClick={onNextFloor}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-fantasy font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-900/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>次の階層へ進む</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

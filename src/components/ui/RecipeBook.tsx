import React from 'react'
import { motion } from 'framer-motion'
import type { PotionRecipe, ElementType } from '../../lib/types'
import { Book, X, Flame, Droplets, Leaf, Skull, Lock } from 'lucide-react'

interface RecipeBookProps {
  isOpen: boolean
  onClose: () => void
  allRecipes: PotionRecipe[]
  discoveredRecipeIds: string[]
}

export const RecipeBook: React.FC<RecipeBookProps> = ({
  isOpen,
  onClose,
  allRecipes,
  discoveredRecipeIds,
}) => {
  if (!isOpen) return null

  const getElementBadge = (el: ElementType) => {
    switch (el) {
      case 'pyr':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-pyr/20 text-pyr border border-pyr/40">
            <Flame className="w-3 h-3" /> 火
          </span>
        )
      case 'aqua':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-aqua/20 text-aqua border border-aqua/40">
            <Droplets className="w-3 h-3" /> 水
          </span>
        )
      case 'terra':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-terra/20 text-terra border border-terra/40">
            <Leaf className="w-3 h-3" /> 地
          </span>
        )
      case 'nox':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-nox/20 text-nox border border-nox/40">
            <Skull className="w-3 h-3" /> 闇
          </span>
        )
    }
  }

  const validRecipes = allRecipes.filter(r => r.formula.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-dungeon-border bg-dungeon-900/60">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-fantasy text-amber-200">
              錬金術式録 (Alchemical Codex)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dungeon-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[65vh] custom-scrollbar space-y-3">
          {validRecipes.map(recipe => {
            const isDiscovered = discoveredRecipeIds.includes(recipe.id)

            return (
              <div
                key={recipe.id}
                className={`p-3 rounded-xl border transition-all ${
                  isDiscovered
                    ? 'bg-dungeon-900/80 border-dungeon-border shadow-md'
                    : 'bg-dungeon-900/30 border-gray-800/60 opacity-60'
                }`}
              >
                {isDiscovered ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: recipe.color }}
                        />
                        <span className="font-bold text-white text-sm font-fantasy">
                          {recipe.nameJa}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          ({recipe.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {recipe.formula.map((elem, idx) => (
                          <React.Fragment key={idx}>{getElementBadge(elem)}</React.Fragment>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-mono tracking-wider">
                        ??? (未解明の錬金術式)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                      {recipe.formula.map((elem, idx) => (
                        <React.Fragment key={idx}>{getElementBadge(elem)}</React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

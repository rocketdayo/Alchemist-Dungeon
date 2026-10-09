import React from 'react'
import { motion } from 'framer-motion'
import type { ElementType, ElementInventory } from '../../lib/types'
import { Flame, Droplets, Leaf, Skull } from 'lucide-react'

interface InventoryBarProps {
  inventory: ElementInventory
  onSelectElement: (el: ElementType) => void
  disabled?: boolean
}

export const InventoryBar: React.FC<InventoryBarProps> = ({
  inventory,
  onSelectElement,
  disabled = false,
}) => {
  const elements: {
    type: ElementType
    nameJa: string
    key: string
    colorText: string
    borderHover: string
    bgGrad: string
    icon: React.ReactNode
  }[] = [
    {
      type: 'pyr',
      nameJa: '火 (Pyr)',
      key: '1',
      colorText: 'text-pyr',
      borderHover: 'hover:border-pyr',
      bgGrad: 'hover:bg-pyr/15',
      icon: <Flame className="w-5 h-5 text-pyr" />,
    },
    {
      type: 'aqua',
      nameJa: '水 (Aqua)',
      key: '2',
      colorText: 'text-aqua',
      borderHover: 'hover:border-aqua',
      bgGrad: 'hover:bg-aqua/15',
      icon: <Droplets className="w-5 h-5 text-aqua" />,
    },
    {
      type: 'terra',
      nameJa: '地 (Terra)',
      key: '3',
      colorText: 'text-terra',
      borderHover: 'hover:border-terra',
      bgGrad: 'hover:bg-terra/15',
      icon: <Leaf className="w-5 h-5 text-terra" />,
    },
    {
      type: 'nox',
      nameJa: '闇 (Nox)',
      key: '4',
      colorText: 'text-nox',
      borderHover: 'hover:border-nox',
      bgGrad: 'hover:bg-nox/15',
      icon: <Skull className="w-5 h-5 text-nox" />,
    },
  ]

  return (
    <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-dungeon-800/90 border border-dungeon-border backdrop-blur-md shadow-2xl">
      {elements.map(item => {
        const count = inventory[item.type]
        const isDepleted = count <= 0

        return (
          <motion.button
            key={item.type}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectElement(item.type)}
            disabled={disabled || isDepleted}
            className={`relative flex flex-col items-center justify-between w-16 h-20 p-1.5 rounded-xl border bg-dungeon-900/80 transition-all duration-150 ${
              item.borderHover
            } ${item.bgGrad} ${
              isDepleted
                ? 'opacity-40 border-gray-800 cursor-not-allowed'
                : 'border-dungeon-border shadow-lg cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/50 text-gray-400">
                [{item.key}]
              </span>
              <span className={`text-[10px] font-bold ${item.colorText}`}>
                {item.type.toUpperCase()}
              </span>
            </div>

            <div className="my-auto">{item.icon}</div>

            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-extrabold font-mono text-white">
                {count}
              </span>
              <span className="text-[9px] text-gray-500">個</span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

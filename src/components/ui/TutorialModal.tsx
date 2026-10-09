import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Flame,
  Droplets,
  Leaf,
  Skull,
  FlaskConical,
  Crosshair,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  onSkip?: () => void
  isInitialTutorial?: boolean
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onSkip,
  isInitialTutorial = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const steps = [
    {
      title: '1. 基本移動とダンジョン探索',
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-gray-300">
          <p>
            地下迷宮の探索は、キーボードの移動キーとマウスの照準で行います。
          </p>
          <div className="p-3 rounded-xl bg-dungeon-900/90 border border-dungeon-border space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">移動操作:</span>
              <span className="text-amber-300 font-bold">[W] [A] [S] [D] または [矢印キー]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">照準 / 視点:</span>
              <span className="text-amber-300 font-bold">マウスポインター</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">階層の進行:</span>
              <span className="text-indigo-400 font-bold">青い階段タイル [▼] に到達</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            敵は壁を回り込んで包囲網を築きます。通路の角や遮蔽物をうまく活かして立ち回りましょう。
          </p>
        </div>
      ),
    },
    {
      title: '2. 4大元素の採取と収集',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-gray-300">
          <p>
            迷宮内に自生する元素鉱床や、倒した魔物から4つの基本元素を集めます。
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-pyr/15 border border-pyr/30 text-pyr font-bold">
              <Flame className="w-4 h-4" /> 火 (Pyr)
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-aqua/15 border border-aqua/30 text-aqua font-bold">
              <Droplets className="w-4 h-4" /> 水 (Aqua)
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-terra/15 border border-terra/30 text-terra font-bold">
              <Leaf className="w-4 h-4" /> 地 (Terra)
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-nox/15 border border-nox/30 text-nox font-bold">
              <Skull className="w-4 h-4" /> 闇 (Nox)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-dungeon-900/90 border border-dungeon-border font-mono text-xs text-amber-200">
            鉱床に近づいて <span className="font-bold underline text-white">[E] キー</span> または画面右上の「採取」ボタンで素早く回収！
          </div>
        </div>
      ),
    },
    {
      title: '3. リアルタイム調合 (錬金術)',
      icon: <FlaskConical className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-gray-300">
          <p>
            画面下部の「坩堝（Crucible）」に元素を投入し、瞬時に戦術秘薬を錬成します。
          </p>
          <div className="p-3 rounded-xl bg-dungeon-900/90 border border-dungeon-border space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">元素スロット投入:</span>
              <span className="text-white font-bold">[1] 火  [2] 水  [3] 地  [4] 闇</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">スロットのリセット:</span>
              <span className="text-red-400 font-bold">[C] キー (元素は還元)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 leading-relaxed">
            元素を2つ（またはアップグレードで3つ）投入すると、即座にポーションが調合完了し投擲スタンバイ状態になります！
          </div>
        </div>
      ),
    },
    {
      title: '4. ポーション投擲 & 弱点システム',
      icon: <Crosshair className="w-6 h-6 text-red-400" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-gray-300">
          <p>
            照準を定めて調合したポーションを投げ込み、敵を殲滅します。
          </p>
          <div className="p-3 rounded-xl bg-dungeon-900/90 border border-dungeon-border space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ポーション投擲:</span>
              <span className="text-amber-300 font-bold">[左クリック] または [スペースキー]</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">弱点属性 [W]:</span>
              <span className="text-emerald-400 font-bold">ダメージ 2.0倍 (WEAKNESS)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">耐性属性 [R]:</span>
              <span className="text-gray-400 font-bold">ダメージ 0.5倍 (RESIST)</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            敵の頭上に弱点属性（W）と耐性属性（R）が表示されます。属性の相性を見極めて調合しましょう。
          </p>
        </div>
      ),
    },
    {
      title: '5. ショートカットと一時停止',
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-gray-300">
          <p>
            いつでも術式図鑑の確認や、ゲームの一時停止を行えます。
          </p>
          <div className="p-3 rounded-xl bg-dungeon-900/90 border border-dungeon-border space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">錬金術式録 (図鑑):</span>
              <span className="text-amber-300 font-bold">[B] キー</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">一時停止 (ポーズ):</span>
              <span className="text-cyan-300 font-bold">[ESC] キー</span>
            </div>
          </div>
          <p className="text-emerald-300 text-xs">
            一時停止画面からいつでもこの操作指南書を再確認できます。
          </p>
        </div>
      ),
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-dungeon-border bg-dungeon-900/80">
          <div className="flex items-center gap-2">
            {steps[currentStep].icon}
            <h2 className="text-lg font-bold font-fantasy text-amber-200">
              {steps[currentStep].title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dungeon-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 min-h-[260px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-1.5 mt-6">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-gray-700 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-dungeon-900 border-t border-dungeon-border flex items-center justify-between">
          <div>
            {isInitialTutorial && onSkip && (
              <button
                onClick={onSkip}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                説明をスキップ
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-dungeon-700 hover:bg-dungeon-600 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>前へ</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-fantasy font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? '理解した (完了)' : '次へ'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

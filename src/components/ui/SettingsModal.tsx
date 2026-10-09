import { motion } from 'framer-motion'
import type { GameSettings } from '../../lib/types'
import { X, Volume2, VolumeX, Vibrate } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: GameSettings
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-dungeon-800 border border-dungeon-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-dungeon-border bg-dungeon-900/80">
          <h2 className="text-lg font-bold font-fantasy text-amber-200">
            環境設定 (Settings)
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dungeon-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <div className="text-sm font-bold text-gray-200">サウンド効果音</div>
                <div className="text-xs text-gray-400">Web Audio API 合成音</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-cyan-600 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-white shadow-md"
              />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-300">
              <span>マスター音量</span>
              <span className="font-mono">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              disabled={!settings.soundEnabled}
              onChange={e => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm font-bold text-gray-200">画面の振動演出</div>
                <div className="text-xs text-gray-400">爆発・被ダメージ時の揺れ</div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ screenShakeEnabled: !settings.screenShakeEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.screenShakeEnabled ? 'bg-purple-600 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>

        <div className="p-4 bg-dungeon-900 border-t border-dungeon-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-dungeon-700 hover:bg-dungeon-600 text-white transition-colors cursor-pointer"
          >
            完了
          </button>
        </div>
      </motion.div>
    </div>
  )
}

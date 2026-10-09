import { useState, useEffect } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import { DungeonCanvas } from './components/game/DungeonCanvas'
import { AlchemyBench } from './components/game/AlchemyBench'
import { InventoryBar } from './components/game/InventoryBar'
import { StatusPanel } from './components/game/StatusPanel'
import { UpgradeModal } from './components/game/UpgradeModal'
import { RecipeBook } from './components/ui/RecipeBook'
import { GameOverlay } from './components/ui/GameOverlay'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { HomeScreen } from './components/ui/HomeScreen'
import { PauseModal } from './components/ui/PauseModal'
import { StatsModal } from './components/ui/StatsModal'
import { SettingsModal } from './components/ui/SettingsModal'
import { TutorialModal } from './components/ui/TutorialModal'
import { hasSeenTutorial, setTutorialSeen } from './lib/storage'
import { BookOpen, Hand, Pause, HelpCircle } from 'lucide-react'

export function App() {
  const {
    phase,
    floorNumber,
    stats,
    settings,
    updateSettings,
    finishLoading,
    goToHome,
    togglePause,
    inventory,
    alchemySlots,
    readyPotion,
    player,
    dungeonFloor,
    enemies,
    enemyProjectiles,
    nodes,
    projectiles,
    areaEffects,
    particles,
    floatingTexts,
    screenShake,
    mousePos,
    startGame,
    initializeFloor,
    addElementToSlot,
    clearAlchemySlots,
    throwCurrentPotion,
    harvestNearbyNode,
    upgradePlayer,
    allRecipes,
  } = useGameEngine()

  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isFirstPlayPrompt, setIsFirstPlayPrompt] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' && (phase === 'exploring' || phase === 'paused')) {
        setIsRecipeBookOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase])

  const handleStartGameClick = () => {
    if (!hasSeenTutorial()) {
      setIsFirstPlayPrompt(true)
      setIsTutorialOpen(true)
    } else {
      startGame()
    }
  }

  const handleCloseTutorial = () => {
    setTutorialSeen(true)
    setIsTutorialOpen(false)
    if (isFirstPlayPrompt) {
      setIsFirstPlayPrompt(false)
      startGame()
    }
  }

  const handleSkipTutorial = () => {
    setTutorialSeen(true)
    setIsTutorialOpen(false)
    if (isFirstPlayPrompt) {
      setIsFirstPlayPrompt(false)
      startGame()
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dungeon-900 font-sans text-gray-100 select-none">
      {phase === 'loading' && (
        <LoadingScreen onLoaded={finishLoading} />
      )}

      {phase === 'home' && (
        <HomeScreen
          onStartGame={handleStartGameClick}
          onOpenCodex={() => setIsRecipeBookOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTutorial={() => {
            setIsFirstPlayPrompt(false)
            setIsTutorialOpen(true)
          }}
        />
      )}

      {(phase === 'exploring' || phase === 'paused' || phase === 'rest_site' || phase === 'game_over') && (
        <>
          <DungeonCanvas
            player={player}
            dungeonFloor={dungeonFloor}
            enemies={enemies}
            enemyProjectiles={enemyProjectiles}
            nodes={nodes}
            projectiles={projectiles}
            areaEffects={areaEffects}
            particles={particles}
            floatingTexts={floatingTexts}
            screenShake={screenShake}
            readyPotion={readyPotion}
            onAimMove={(wx, wy) => {
              mousePos.current = { x: wx, y: wy }
            }}
            onCanvasClick={(wx, wy) => {
              if (phase === 'exploring') {
                throwCurrentPotion(wx, wy)
              }
            }}
          />

          <div className="absolute top-4 left-4 z-20 pointer-events-auto">
            <StatusPanel
              player={player}
              floorNumber={floorNumber}
              dungeonFloor={dungeonFloor}
            />
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={harvestNearbyNode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-amber-300 text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="近くの元素鉱床を採取 [E]"
            >
              <Hand className="w-4 h-4" />
              <span>採取 [E]</span>
            </button>

            <button
              onClick={() => setIsRecipeBookOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-amber-300 text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="錬金術式録 [B]"
            >
              <BookOpen className="w-4 h-4" />
              <span>術式録 [B]</span>
            </button>

            <button
              onClick={() => {
                setIsFirstPlayPrompt(false)
                setIsTutorialOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-amber-300 text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="操作説明"
            >
              <HelpCircle className="w-4 h-4" />
              <span>指南</span>
            </button>

            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-gray-300 hover:text-white text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="一時停止 [ESC]"
            >
              <Pause className="w-4 h-4 text-cyan-400" />
              <span>停止 [ESC]</span>
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col md:flex-row items-center gap-4 pointer-events-auto">
            <InventoryBar
              inventory={inventory}
              onSelectElement={addElementToSlot}
              disabled={phase !== 'exploring'}
            />
            <AlchemyBench
              slots={alchemySlots}
              maxSlots={player.crucibleCapacity}
              readyPotion={readyPotion}
              onClear={clearAlchemySlots}
            />
          </div>

          {phase === 'rest_site' && (
            <UpgradeModal
              player={player}
              inventory={inventory}
              floorNumber={floorNumber}
              onUpgrade={upgradePlayer}
              onNextFloor={() => initializeFloor(floorNumber + 1)}
            />
          )}

          <PauseModal
            isOpen={phase === 'paused'}
            onResume={togglePause}
            onOpenCodex={() => setIsRecipeBookOpen(true)}
            onOpenTutorial={() => {
              setIsFirstPlayPrompt(false)
              setIsTutorialOpen(true)
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onReturnToHome={goToHome}
          />

          <GameOverlay
            phase={phase}
            floorNumber={floorNumber}
            onRestart={startGame}
            onReturnToHome={goToHome}
          />
        </>
      )}

      <RecipeBook
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
        allRecipes={allRecipes}
        discoveredRecipeIds={stats.discoveredRecipes}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        onSkip={handleSkipTutorial}
        isInitialTutorial={isFirstPlayPrompt}
      />
    </div>
  )
}

export default App

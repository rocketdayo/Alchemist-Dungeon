import { useState, useEffect } from 'react'
import { useGameEngine } from './hooks/useGameEngine'
import { DungeonCanvas } from './components/game/DungeonCanvas'
import { AlchemyBench } from './components/game/AlchemyBench'
import { InventoryBar } from './components/game/InventoryBar'
import { StatusPanel } from './components/game/StatusPanel'
import { UpgradeModal } from './components/game/UpgradeModal'
import { RecipeBook } from './components/ui/RecipeBook'
import { GameOverlay } from './components/ui/GameOverlay'
import { BookOpen, Hand } from 'lucide-react'

export function App() {
  const {
    phase,
    floorNumber,
    inventory,
    alchemySlots,
    readyPotion,
    discoveredRecipes,
    player,
    dungeonFloor,
    enemies,
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') {
        setIsRecipeBookOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-dungeon-900 font-sans text-gray-100 select-none">
      <DungeonCanvas
        player={player}
        dungeonFloor={dungeonFloor}
        enemies={enemies}
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
          throwCurrentPotion(wx, wy)
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
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-amber-300 text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95"
          title="近くの元素鉱床を採取 [E]"
        >
          <Hand className="w-4 h-4" />
          <span>採取 [E]</span>
        </button>

        <button
          onClick={() => setIsRecipeBookOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dungeon-800/90 hover:bg-dungeon-700/90 border border-dungeon-border text-amber-300 text-xs font-bold font-fantasy backdrop-blur-md shadow-lg transition-transform active:scale-95"
          title="錬金術式録 [B]"
        >
          <BookOpen className="w-4 h-4" />
          <span>術式録 [B]</span>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col md:flex-row items-center gap-4 pointer-events-auto">
        <InventoryBar
          inventory={inventory}
          onSelectElement={addElementToSlot}
        />
        <AlchemyBench
          slots={alchemySlots}
          maxSlots={player.crucibleCapacity}
          readyPotion={readyPotion}
          onClear={clearAlchemySlots}
        />
      </div>

      <RecipeBook
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
        allRecipes={allRecipes}
        discoveredRecipeIds={discoveredRecipes}
      />

      {phase === 'rest_site' && (
        <UpgradeModal
          player={player}
          inventory={inventory}
          floorNumber={floorNumber}
          onUpgrade={upgradePlayer}
          onNextFloor={() => initializeFloor(floorNumber + 1)}
        />
      )}

      <GameOverlay
        phase={phase}
        floorNumber={floorNumber}
        onStart={startGame}
        onRestart={startGame}
      />
    </div>
  )
}

export default App

import type { GameStats, GameSettings } from './types'

const STATS_STORAGE_KEY = 'alchemist_dungeon_stats'
const SETTINGS_STORAGE_KEY = 'alchemist_dungeon_settings'
const TUTORIAL_STORAGE_KEY = 'alchemist_dungeon_tutorial_seen'

const DEFAULT_STATS: GameStats = {
  totalPlayTimeSeconds: 0,
  totalKills: 0,
  highestFloor: 1,
  totalPotionsBrewed: 0,
  discoveredRecipes: ['inferno_bomb', 'frost_shock', 'healing_elixir'],
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  masterVolume: 0.8,
  screenShakeEnabled: true,
}

export const loadGameStats = (): GameStats => {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY)
    if (!raw) return DEFAULT_STATS
    const parsed = JSON.parse(raw)
    return {
      totalPlayTimeSeconds: Number(parsed.totalPlayTimeSeconds) || 0,
      totalKills: Number(parsed.totalKills) || 0,
      highestFloor: Math.max(1, Number(parsed.highestFloor) || 1),
      totalPotionsBrewed: Number(parsed.totalPotionsBrewed) || 0,
      discoveredRecipes: Array.isArray(parsed.discoveredRecipes)
        ? parsed.discoveredRecipes
        : DEFAULT_STATS.discoveredRecipes,
    }
  } catch {
    return DEFAULT_STATS
  }
}

export const saveGameStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch {}
}

export const loadGameSettings = (): GameSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return {
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      masterVolume: typeof parsed.masterVolume === 'number' ? parsed.masterVolume : 0.8,
      screenShakeEnabled: typeof parsed.screenShakeEnabled === 'boolean' ? parsed.screenShakeEnabled : true,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export const saveGameSettings = (settings: GameSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch {}
}

export const hasSeenTutorial = (): boolean => {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export const setTutorialSeen = (seen: boolean = true): void => {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, seen ? 'true' : 'false')
  } catch {}
}

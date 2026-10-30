export type GamePhase = 'setup' | 'round-intro' | 'memorize' | 'playing' | 'turn-complete' | 'pass-device' | 'round-results' | 'final-results'
export type TileType = 'coin' | 'diamond' | 'bomb' | 'empty'

export interface RoundConfig {
  size: number
  memorizeSeconds: number
  name: string
}
export interface Player {
  name: string
  color: string
  score: number
}
export interface Tile {
  id: number
  kind: TileType
  claimedBy: number | null
}
export interface ClaimFeedback {
  tileId: number
  points: number
  message: string
}
export interface RoundResult {
  round: number
  scores: number[]
  totals: number[]
}
export interface GameState {
  phase: GamePhase
  players: Player[]
  roundIndex: number
  activePlayer: number
  picksLeft: number
  phaseEndsAt: number | null
  tiles: Tile[]
  roundScores: number[]
  results: RoundResult[]
  feedback: ClaimFeedback | null
}
export type GameAction =
  | { type: 'start'; names: string[] }
  | { type: 'reveal'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'pick'; tileId: number; roundIndex: number; player: number; now: number }
  | { type: 'ready' | 'next-round' | 'play-again' | 'new-players' }

import type { GameAction, GameState, Player, RoundConfig, Tile, TileType } from './types.ts'

export const ROUNDS = [
  { size: 4, memorizeSeconds: 5, name: 'The warm-up' },
  { size: 4, memorizeSeconds: 4, name: 'Quick fingers' },
  { size: 5, memorizeSeconds: 4, name: 'Bigger stakes' },
  { size: 5, memorizeSeconds: 3, name: 'Under pressure' },
  { size: 6, memorizeSeconds: 3, name: 'The big score' },
] as const satisfies readonly RoundConfig[]
export const PICKS_PER_TURN = 3
export const REVEAL_FEEDBACK_MS = 1100
export const POINTS: Record<TileType, number> = { coin: 100, diamond: 250, bomb: -150, empty: -25 }
export const TILE_LABELS: Record<TileType, string> = { coin: 'Coin', diamond: 'Diamond', bomb: 'Bomb', empty: 'Empty' }
export const TILE_KINDS: TileType[] = ['coin', 'diamond', 'bomb', 'empty']

export function formatScore(score: number, signed = false): string {
  return `${score > 0 && signed ? '+' : ''}${score.toLocaleString('en-US')}`
}
export function rankPlayers(players: Player[]) {
  const ranked = players.map((player, seat) => ({ player, seat })).sort((a, b) => b.player.score - a.player.score || a.seat - b.seat)
  return ranked.map((entry) => ({ ...entry, rank: ranked.findIndex((other) => other.player.score === entry.player.score) + 1 }))
}
export function validateNames(names: string[]): string[] {
  if (names.length < 2 || names.length > 4) throw new Error('Choose 2, 3, or 4 players.')
  return names.map((value, seat) => {
    const name = value.trim().replace(/\s+/g, ' ')
    if (!name || name.length > 18 || [...name].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) throw new Error(`Player ${seat + 1} needs a nickname of 1–18 characters.`)
    return name
  })
}
export function generateBoard(size: number, random = Math.random): Tile[] {
  const count = size * size
  const kinds: TileType[] = [
    ...Array<TileType>(Math.round(count * .38)).fill('coin'),
    ...Array<TileType>(Math.round(count * .16)).fill('diamond'),
    ...Array<TileType>(Math.round(count * .19)).fill('bomb'),
  ]
  while (kinds.length < count) kinds.push('empty')
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
  }
  return kinds.map((kind, id) => ({ id, kind, claimedBy: null }))
}
export function initialState(): GameState {
  return { phase: 'setup', players: [], roundIndex: 0, activePlayer: 0, picksLeft: PICKS_PER_TURN,
    phaseEndsAt: null, tiles: [], roundScores: [], results: [], feedback: null }
}
function roundIntro(state: GameState, index: number): GameState {
  return { ...state, phase: 'round-intro', roundIndex: index, activePlayer: 0, picksLeft: PICKS_PER_TURN,
    phaseEndsAt: null, tiles: generateBoard(ROUNDS[index].size), roundScores: state.players.map(() => 0), feedback: null }
}
function freshGame(names: string[]): GameState {
  const colors = ['purple', 'pink', 'cyan', 'gold']
  return roundIntro({ ...initialState(), players: validateNames(names).map((name, seat) => ({ name, color: colors[seat], score: 0 })) }, 0)
}

// One synchronous reducer owns every local turn, score and timer transition.
// Player positions in the crew array are seats, not network identities.
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'start': return state.phase === 'setup' ? freshGame(action.names) : state
    case 'reveal': return state.phase === 'round-intro'
      ? { ...state, phase: 'memorize', phaseEndsAt: action.now + ROUNDS[state.roundIndex].memorizeSeconds * 1000 } : state
    case 'tick': {
      if (state.phaseEndsAt === null || action.now < state.phaseEndsAt) return state
      if (state.phase === 'memorize') return { ...state, phase: 'playing', phaseEndsAt: null }
      if (state.phase !== 'turn-complete') return state
      if (state.activePlayer < state.players.length - 1) return {
        ...state, phase: 'pass-device', activePlayer: state.activePlayer + 1, picksLeft: PICKS_PER_TURN, phaseEndsAt: null, feedback: null,
      }
      return { ...state, phase: 'round-results', phaseEndsAt: null, feedback: null,
        results: [...state.results, { round: state.roundIndex + 1, scores: [...state.roundScores], totals: state.players.map((p) => p.score) }] }
    }
    case 'pick': {
      if (state.phase !== 'playing' || state.picksLeft <= 0 || action.roundIndex !== state.roundIndex || action.player !== state.activePlayer) return state
      const tile = state.tiles.find((item) => item.id === action.tileId)
      if (!tile || tile.claimedBy !== null) return state
      const points = POINTS[tile.kind]
      const picksLeft = state.picksLeft - 1
      const name = state.players[state.activePlayer].name
      const verb = tile.kind === 'bomb' ? 'hit a bomb' : tile.kind === 'empty' ? 'found an empty tile' : `stole a ${tile.kind}`
      return {
        ...state, picksLeft,
        phase: picksLeft === 0 ? 'turn-complete' : 'playing',
        phaseEndsAt: picksLeft === 0 ? action.now + REVEAL_FEEDBACK_MS : null,
        tiles: state.tiles.map((item) => item.id === tile.id ? { ...item, claimedBy: state.activePlayer } : item),
        players: state.players.map((player, seat) => seat === state.activePlayer ? { ...player, score: player.score + points } : player),
        roundScores: state.roundScores.map((score, seat) => seat === state.activePlayer ? score + points : score),
        feedback: { tileId: tile.id, points, message: `${name} ${verb} ${formatScore(points, true)}` },
      }
    }
    case 'ready': return state.phase === 'pass-device' ? { ...state, phase: 'playing', feedback: null } : state
    case 'next-round': return state.phase !== 'round-results' ? state
      : state.roundIndex === ROUNDS.length - 1 ? { ...state, phase: 'final-results' } : roundIntro(state, state.roundIndex + 1)
    case 'play-again': return state.phase === 'final-results' ? freshGame(state.players.map((p) => p.name)) : state
    case 'new-players': return initialState()
    default: return state
  }
}

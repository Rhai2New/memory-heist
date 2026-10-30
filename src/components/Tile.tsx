import { POINTS, TILE_LABELS, formatScore } from '../game/engine'
import type { Player, Tile as VaultTile } from '../game/types'
import { Icon } from './Icon'

export function Tile({ tile, size, revealed, interactive, players, activePlayer, onPick, lastTileId }: {
  tile: VaultTile
  size: number
  revealed: boolean
  interactive: boolean
  players: Player[]
  activePlayer: number
  onPick?: (id: number) => void
  lastTileId?: number
}) {
  const claimed = tile.claimedBy !== null
  const kind = revealed || claimed ? tile.kind : null
  const owner = tile.claimedBy === null ? undefined : players[tile.claimedBy]
  const isYours = tile.claimedBy === activePlayer
  const description = kind ? `${TILE_LABELS[kind]}, ${formatScore(POINTS[kind], true)} points${owner ? `, picked by ${owner.name}` : ''}` : 'Hidden tile'
  return (
    <button type="button" className={`tile ${kind ? `tile-${kind} tile-visible` : 'tile-concealed'} ${claimed ? 'tile-claimed' : ''} ${isYours ? 'claimed-yours' : ''} ${lastTileId === tile.id ? 'latest-tile' : ''}`}
      disabled={!interactive || claimed} onClick={() => onPick?.(tile.id)}
      aria-label={`Row ${Math.floor(tile.id / size) + 1}, column ${(tile.id % size) + 1}: ${description}`}>
      <span className="tile-face"><Icon name={kind ?? 'vault'} />{claimed && <span className="tile-points">{formatScore(POINTS[tile.kind], true)}</span>}</span>
      {owner ? <span className={`claim-marker avatar-${owner.color}`} title={owner.name}>{owner.name.slice(0, 1)}</span>
        : <span className="tile-position">{String(tile.id + 1).padStart(2, '0')}</span>}
    </button>
  )
}

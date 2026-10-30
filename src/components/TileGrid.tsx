import type { CSSProperties } from 'react'
import type { Player, Tile as VaultTile } from '../game/types'
import { Tile } from './Tile'

export function TileGrid({ tiles, size, revealed, interactive = false, players, activePlayer, onPick, lastTileId }: {
  tiles: VaultTile[]
  size: number
  revealed: boolean
  interactive?: boolean
  players: Player[]
  activePlayer: number
  onPick?: (id: number) => void
  lastTileId?: number
}) {
  return (
    <div className={`tile-grid grid-size-${size} ${revealed ? 'grid-revealed' : 'grid-hidden'}`}
      style={{ '--grid-size': size } as CSSProperties} aria-label={`${size} by ${size} vault. ${interactive ? 'Choose a hidden tile.' : 'Vault tiles.'}`}>
      {tiles.map((tile) => <Tile key={tile.id} tile={tile} size={size} revealed={revealed} interactive={interactive}
        players={players} activePlayer={activePlayer} onPick={onPick} lastTileId={lastTileId} />)}
    </div>
  )
}

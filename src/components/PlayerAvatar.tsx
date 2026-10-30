import type { Player } from '../game/types'
import { Icon } from './Icon'
export function PlayerAvatar({ player }: { player: Player }) {
  return (
    <span className={`player-avatar avatar-${player.color}`}>
      <Icon name="mask" />
    </span>
  )
}

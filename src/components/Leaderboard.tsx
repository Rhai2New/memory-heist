import { formatScore, rankPlayers } from '../game/engine'
import type { Player } from '../game/types'
import { PlayerAvatar } from './PlayerAvatar'

export function Leaderboard({ players, activePlayer, roundScores, title = 'The crew', final = false }: {
  players: Player[]
  activePlayer?: number
  roundScores?: number[]
  title?: string
  final?: boolean
}) {
  return (
    <section className={`leaderboard ${final ? 'leaderboard-final' : ''}`} aria-label={title}>
      <div className="panel-title"><h2>{title}</h2><span className="panel-step">{roundScores ? 'ROUND / TOTAL' : 'TOTAL PTS'}</span></div>
      <ol>
        {rankPlayers(players).map(({ player, seat, rank }) => <li key={seat} data-seat={seat} data-score={player.score}
          className={`${seat === activePlayer ? 'your-row' : ''} ${rank === 1 ? 'leading-row' : ''}`}>
          <span className="rank">{String(rank).padStart(2, '0')}</span><PlayerAvatar player={player} />
          <span className="leader-name">{player.name}<small>{seat === activePlayer ? 'At the vault' : `Player ${seat + 1}`}</small></span>
          <span className="standing-scores">{roundScores && <small className={roundScores[seat] < 0 ? 'negative' : 'positive'}>{formatScore(roundScores[seat], true)} this round</small>}<strong>{formatScore(player.score)}</strong></span>
        </li>)}
      </ol>
    </section>
  )
}

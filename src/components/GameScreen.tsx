import { useEffect, useRef } from 'react'
import { formatScore, PICKS_PER_TURN, ROUNDS } from '../game/engine'
import type { GameState } from '../game/types'
import { Icon } from './Icon'
import { Countdown } from './Countdown'
import { TileGrid } from './TileGrid'
import { ScoringGuide } from './ScoringGuide'
import { Leaderboard } from './Leaderboard'
import { PlayerAvatar } from './PlayerAvatar'

export function GameScreen({ state, now, onPick }: { state: GameState; now: number; onPick: (id: number) => void }) {
  const memorize = state.phase === 'memorize'
  const complete = state.phase === 'turn-complete'
  const round = ROUNDS[state.roundIndex]
  const player = state.players[state.activePlayer]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [state.phase, state.roundIndex, state.activePlayer])
  const treasureLeft = state.tiles.filter((t) => t.claimedBy === null && (t.kind === 'coin' || t.kind === 'diamond')).length
  const visible = memorize && now < (state.phaseEndsAt ?? 0)
  return (
    <div className={`inner-screen game-screen screen-enter ${memorize ? 'is-memorizing' : 'is-playing'}`}>
      <div className="game-topline">
        <span className="eyebrow">{memorize ? 'EVERYONE LOOK' : `PLAYER ${state.activePlayer + 1} OF ${state.players.length}`} <b>/</b> {round.name.toUpperCase()}</span>
        <span className="round-progress" aria-label={`Round ${state.roundIndex + 1} of 5`}>{ROUNDS.map((_, index) => <i key={index} className={index <= state.roundIndex ? 'active' : ''} />)}<span>ROUND {state.roundIndex + 1} / 5</span></span>
      </div>
      {!memorize && <div className="turn-banner"><div><PlayerAvatar player={player} /><span><small>AT THE VAULT</small><strong>{player.name}</strong></span></div>
        <span className="picks-label">PICKS LEFT: <strong data-testid="picks-left">{state.picksLeft}</strong><span className="pick-dots" aria-hidden="true">{Array.from({ length: PICKS_PER_TURN }, (_, i) => <i key={i} className={i < state.picksLeft ? 'available' : ''} />)}</span></span></div>}
      <div className="game-layout">
        <section className="vault-board panel">
          <div className="board-heading">
            <div>
              <span className={`phase-label ${memorize ? '' : 'steal-label'}`}><Icon name={memorize ? 'eye' : 'lock'} />{memorize ? 'EVERYONE LOOK!' : complete ? 'YOUR PICKS ARE IN' : 'ROB THE VAULT!'}</span>
              <h1 ref={heading} tabIndex={-1}>{memorize ? 'MEMORIZE THE VAULT' : complete ? 'Turn complete.' : 'Trust your memory.'}</h1>
              <p>{memorize ? 'One look together. Find the treasure. Remember the danger.' : complete ? 'Take in your final pick. Passing the device in a moment…' : `${player.name}, choose ${state.picksLeft} hidden ${state.picksLeft === 1 ? 'tile' : 'tiles'}.`}</p>
            </div>
            {memorize && <Countdown deadline={state.phaseEndsAt} now={Math.max(now, (state.phaseEndsAt ?? now) - round.memorizeSeconds * 1000)} duration={round.memorizeSeconds} />}
          </div>
          <TileGrid tiles={state.tiles} size={round.size} revealed={visible} interactive={state.phase === 'playing' && state.picksLeft > 0}
            players={state.players} activePlayer={state.activePlayer} onPick={onPick} lastTileId={state.feedback?.tileId} />
          <div className="board-bottom"><span><Icon name={memorize ? 'eye' : 'vault'} />{memorize ? `Tiles hide after ${round.memorizeSeconds} seconds` : `${treasureLeft} treasures left`}</span><span>{round.size} × {round.size} VAULT</span></div>
        </section>
        <aside className="game-sidebar">
          {!memorize && <section className="panel personal-score"><span className="eyebrow">{player.name.toUpperCase()}’S STASH</span>
            <strong className="total-score">{formatScore(player.score)}<small>pts</small></strong>
            <div><span>This round</span><strong className={state.roundScores[state.activePlayer] < 0 ? 'negative' : 'positive'}>{formatScore(state.roundScores[state.activePlayer], true)}</strong></div>
            <p className={`live-feedback ${state.feedback && state.feedback.points < 0 ? 'negative' : ''}`} role="status" key={state.feedback?.tileId ?? 'waiting'}><Icon name={state.feedback && state.feedback.points < 0 ? 'bomb' : 'spark'} />{state.feedback?.message ?? 'Your move, mastermind.'}</p>
          </section>}
          <div className="panel crew-score-panel"><Leaderboard players={state.players} activePlayer={memorize ? undefined : state.activePlayer} /></div>
          <div className="panel turn-rules"><span className="eyebrow">THE STAKES</span><ScoringGuide compact /><p>Three picks per thief. Opened tiles stay open. Make every memory count.</p></div>
        </aside>
      </div>
      <p className="game-tip"><Icon name="lock" />{memorize ? 'Hands off. Everyone gets this one memorization period.' : 'Every tile can be picked only once. Discovered treasure is gone for the rest of the crew.'}</p>
    </div>
  )
}

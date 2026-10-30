import { useEffect, useRef } from 'react'
import { formatScore, rankPlayers, ROUNDS } from '../game/engine'
import type { GameState } from '../game/types'
import { Icon } from './Icon'
import { Leaderboard } from './Leaderboard'
import { PlayerAvatar } from './PlayerAvatar'

export function ResultsScreen({ state, onNext, onReplay, onNewPlayers }: {
  state: GameState; onNext: () => void; onReplay: () => void; onNewPlayers: () => void
}) {
  const final = state.phase === 'final-results'
  const ranked = rankPlayers(state.players)
  const winners = ranked.filter(({ rank }) => rank === 1)
  const tie = winners.length > 1
  const result = state.results[state.results.length - 1]
  const lastRound = state.roundIndex === ROUNDS.length - 1
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [state.phase, state.roundIndex])
  return (
    <div className={`inner-screen results-screen screen-enter ${final ? 'final-results' : 'round-results'}`}>
      <div className="page-heading results-heading">
        <span className="result-emblem"><Icon name={final ? 'trophy' : 'vault'} /></span>
        <span className="eyebrow">{final ? tie ? 'CO-WINNERS · A SHARED GETAWAY' : 'FIVE ROUNDS. ONE BIG GETAWAY.' : 'TIME TO TALLY THE LOOT'}</span>
        <h1 ref={heading} tabIndex={-1}>{final ? tie ? 'MASTER THIEVES' : 'MASTER THIEF' : `ROUND ${state.roundIndex + 1} COMPLETE`}</h1>
        <p>{final ? tie ? 'A perfect tie. The crew shares the crown.' : 'A sharp mind makes a clean getaway.' : 'Everyone made their three picks. See who came out ahead.'}</p>
      </div>
      {final && <section className="panel winner-card" aria-label={tie ? 'Co-winners' : 'Winner'}>
        <div className="winner-names">{winners.map(({ player, seat }) => <div key={seat}><PlayerAvatar player={player} /><h2>{player.name}</h2></div>)}</div>
        <strong className="winner-score">{formatScore(winners[0].player.score)}<small> pts{tie ? ' each' : ''}</small></strong>
      </section>}
      <div className="results-layout">
        <section className="panel results-main"><Leaderboard players={state.players} roundScores={final ? undefined : result.scores} title={final ? 'Final standings' : 'Round standings'} final={final} />
          {final && <div className="crew-history"><span className="eyebrow">THE FIVE-ROUND TAKE</span><div className="history-scroll"><table><thead><tr><th>THIEF</th>{state.results.map((r) => <th key={r.round}>R{r.round}</th>)}</tr></thead><tbody>
            {state.players.map((player, seat) => <tr key={seat}><th>{player.name}</th>{state.results.map((r) => <td key={r.round} className={r.scores[seat] < 0 ? 'negative' : 'positive'}>{formatScore(r.scores[seat], true)}</td>)}</tr>)}
          </tbody></table></div></div>}
        </section>
        <aside className="results-side"><div className={`panel ${final ? 'final-card' : 'next-round-card'}`}>
          <Icon name={final ? 'mask' : 'vault'} /><span className="eyebrow">{final ? 'THE NEXT JOB AWAITS' : lastRound ? 'THE JOB IS DONE' : 'UP NEXT'}</span>
          <h2>{final ? 'One more heist?' : lastRound ? 'Time to split the loot.' : `Round ${state.roundIndex + 2}: ${ROUNDS[state.roundIndex + 1].name}`}</h2>
          <p>{final ? 'Fresh vaults. Clean scores. Same questionable career choice.' : lastRound ? 'Five vaults cracked. Find out who made the biggest getaway.' : `${ROUNDS[state.roundIndex + 1].size}×${ROUNDS[state.roundIndex + 1].size} vault · ${ROUNDS[state.roundIndex + 1].memorizeSeconds}s to memorize · 3 picks each`}</p>
          {final ? <><button className="button button-primary" onClick={onReplay}>PLAY AGAIN <Icon name="arrow" /></button><button className="button button-secondary" onClick={onNewPlayers}>NEW PLAYERS</button><span className="input-hint">Play Again keeps your crew and resets everything else.</span></>
            : <><button className="button button-primary" onClick={onNext}>{lastRound ? 'FINAL RESULTS' : 'NEXT ROUND'} <Icon name="arrow" /></button><span className="input-hint">Take your time. The next vault waits for you.</span></>}
        </div></aside>
      </div>
    </div>
  )
}

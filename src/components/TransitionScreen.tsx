import { useEffect, useRef } from 'react'
import { ROUNDS } from '../game/engine'
import type { GameState } from '../game/types'
import { Icon } from './Icon'
import { PlayerAvatar } from './PlayerAvatar'
import { ScoringGuide } from './ScoringGuide'

export function TransitionScreen({ state, onReady }: { state: GameState; onReady: () => void }) {
  const pass = state.phase === 'pass-device'
  const player = state.players[state.activePlayer]
  const round = ROUNDS[state.roundIndex]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [state.phase, state.roundIndex, state.activePlayer])
  return (
    <div className={`inner-screen transition-screen screen-enter ${pass ? 'pass-screen' : 'round-intro'}`}>
      <section className="panel transition-card">
        <span className="transition-emblem"><Icon name={pass ? 'users' : 'vault'} /></span>
        <span className="eyebrow">ROUND {state.roundIndex + 1} / 5 {pass ? ' · KEEP THE LOOT MOVING' : ` · ${round.name.toUpperCase()}`}</span>
        <h1 ref={heading} tabIndex={-1}>{pass ? 'PASS THE DEVICE' : `ROUND ${state.roundIndex + 1}`}</h1>
        {pass ? <>
          <span className="eyebrow next-player-label">NEXT PLAYER</span>
          <div className="next-player"><PlayerAvatar player={player} /><h2>{player.name}</h2></div>
          <p>Hand the device to {player.name}. Your 3 picks begin when you are ready.</p>
          <p className="transition-note">Discovered tiles stay open. The rest stay hidden.</p>
        </> : <>
          <h2>EVERYONE LOOK!</h2>
          <p>Gather the crew. You get one shared look at this vault.<br />Remember the treasure. Remember the danger.</p>
          <div className="intro-facts"><span><strong>{round.size}×{round.size}</strong>VAULT</span><span><strong>{round.memorizeSeconds}s</strong>TO MEMORIZE</span><span><strong>3</strong>PICKS EACH</span></div>
          <p className="transition-note">{state.players[0].name} steals first. All {state.players.length} players get one turn.</p>
        </>}
        <button className="button button-primary" onClick={onReady}>{pass ? "I'M READY" : 'REVEAL VAULT'} <Icon name="arrow" /></button>
      </section>
      {!pass && <ScoringGuide compact />}
    </div>
  )
}

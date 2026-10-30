import { ROUNDS } from '../game/engine'
import { ScoringGuide } from './ScoringGuide'

const rules = [
  ['Everyone memorize.', 'Look at the whole vault together for 3–5 seconds. Then the hidden tiles stay hidden until picked.'],
  ['Take turns stealing.', 'Each player gets exactly 3 picks per round. Coins and diamonds earn points; bombs and empty spaces lose points.'],
  ['Gone means gone.', 'Each tile opens only once for the entire crew. Discovered tiles stay visible, but nobody can score them again.'],
  ['Pass the device.', 'After your turn, hand over the device. The next thief presses I’M READY to begin. Nobody gets another look at the solution.'],
  ['Take the getaway.', 'Play all five rounds. The highest total wins; tied thieves share the title. Negative scores count too.'],
]
export function Rules() {
  return (
    <section className="panel rules-panel" aria-label="How to play">
      <span className="eyebrow">YOUR BRIEFING</span><h2>How to play</h2>
      {rules.map(([title, text], index) => <div className="rule-step" key={title}><span className="rule-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
      <ScoringGuide compact />
      <div className="round-roadmap"><span className="panel-step">THE JOB GETS TOUGHER</span><div>
        {ROUNDS.map((round, index) => <div key={index}><span>R{index + 1}</span><strong>{round.size}×{round.size}</strong><small>{round.memorizeSeconds}s look</small></div>)}
      </div></div>
      <p className="rules-note">Everyone gets the same look. Player 1 goes first each round. Results wait until the crew is ready.</p>
    </section>
  )
}

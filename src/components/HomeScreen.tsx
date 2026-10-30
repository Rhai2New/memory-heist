import { useState } from 'react'
import { Icon } from './Icon'
import { Rules } from './Rules'
import { validateNames } from '../game/engine'

function VaultArtwork() {
  return (
    <div className="vault-art" aria-hidden="true">
      <div className="orbit orbit-one" /><div className="orbit orbit-two" />
      <span className="art-label label-top"><i /> VAULT 001 / CLASSIFIED</span>
      <div className="vault-case">
        <div className="vault-hinge hinge-top" /><div className="vault-hinge hinge-bottom" />
        <div className="vault-inner">
          <span className="vault-brand">MH <span>SECURE SYSTEMS</span></span>
          <div className="vault-dial"><div className="dial-ring"><div className="dial-wheel"><i /><i /><i /><span /></div></div></div>
          <span className="vault-keypad"><i /><i /><i /><i /><i /><i /></span>
          <span className="vault-serial">NO. 00440 <b>●</b></span>
        </div>
      </div>
      <div className="floating-loot loot-diamond"><Icon name="diamond" /></div>
      <div className="floating-loot loot-coin"><Icon name="coin" /></div>
      <div className="floating-loot loot-bomb"><Icon name="bomb" /></div>
      <span className="art-label label-bottom"><Icon name="lock" /> GET IN. GET RICH. GET OUT.</span>
      <span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span>
    </div>
  )
}
export function HomeScreen({ onStart }: { onStart: (names: string[]) => void }) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  return (
    <div className="home-screen screen-enter">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span /> A MEMORY GAME WITH SOMETHING TO LOSE</span>
          <h1>MEMORY<br /><span>HEIST<span className="title-period">.</span></span></h1>
          <p className="tagline">Remember. Steal. Survive.</p>
          <p className="hero-description">One vault. One device. A crew of questionable friends.<br className="desktop-break" /> Remember the loot, then take turns stealing it.</p>
          <div className="hero-facts"><span><Icon name="users" /> 2–4 local players</span><span><Icon name="vault" /> 5 rounds</span><span><Icon name="lock" /> 3 picks each</span></div>
        </div>
        <VaultArtwork />
      </section>
      <div className="local-setup-layout">
        <section className="panel setup-panel">
          <span className="panel-step">01 / ASSEMBLE THE CREW</span>
          <h2>Your vault. Your heist.</h2>
          <p>Share one phone, tablet, or computer. Get everyone together before you start.</p>
          <form noValidate onSubmit={(event) => {
            event.preventDefault()
            try { const crew = validateNames(names.slice(0, count)); setError(''); onStart(crew) }
            catch (caught) { setError(caught instanceof Error ? caught.message : 'Enter a nickname for every player.') }
          }}>
            <fieldset className="player-count"><legend>HOW MANY THIEVES?</legend><div>
              {[2, 3, 4].map((number) => <button type="button" key={number} aria-pressed={count === number} className={count === number ? 'selected' : ''}
                onClick={() => { setCount(number); setError('') }}>{number} Players</button>)}
            </div></fieldset>
            <div className="name-fields">
              {names.slice(0, count).map((name, seat) => <label key={seat} className="nickname-field">PLAYER {seat + 1}
                <input value={name} onChange={(event) => setNames(names.map((old, index) => index === seat ? event.target.value : old))}
                  maxLength={18} required autoComplete="off" placeholder={['The Mastermind', 'The Safecracker', 'The Lookout', 'The Wildcard'][seat]} />
              </label>)}
            </div>
            {error && <p className="setup-error" role="alert">{error}</p>}
            <button className="button button-primary" type="submit"><Icon name="vault" /> START HEIST <Icon name="arrow" /></button>
            <p className="input-hint">Same device. Same vault. Highest score takes the getaway.</p>
          </form>
        </section>
        <Rules />
      </div>
    </div>
  )
}

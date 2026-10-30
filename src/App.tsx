import { useEffect, useState } from 'react'
import { Icon } from './components/Icon'
import { HomeScreen } from './components/HomeScreen'
import { GameScreen } from './components/GameScreen'
import { ResultsScreen } from './components/ResultsScreen'
import { TransitionScreen } from './components/TransitionScreen'
import { ExitDialog } from './components/ExitDialog'
import { useLocalGame } from './game/useLocalGame'
import './App.css'
import './responsive.css'
import './local.css'

function App() {
  const { state, dispatch, now } = useLocalGame()
  const [showExit, setShowExit] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [state.phase, state.roundIndex])
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); if (state.phase !== 'setup') setShowExit(true) }} aria-label="Memory Heist home">
          <span className="brand-mark"><Icon name="vault" /></span>
          <span>MEMORY<span className="brand-light">HEIST</span><small>THE VAULT IS WAITING.</small></span>
        </a>
        <div className="header-right">
          <span className="local-badge"><i /> PASS & PLAY</span>
          {state.phase !== 'setup' && <button className="text-button exit-button" aria-label="New players" onClick={() => setShowExit(true)}><Icon name="exit" /> New players</button>}
        </div>
      </header>
      <main id="main-content">
        {state.phase === 'setup' && <HomeScreen onStart={(names) => dispatch({ type: 'start', names })} />}
        {(state.phase === 'round-intro' || state.phase === 'pass-device') && <TransitionScreen state={state} onReady={() => dispatch(state.phase === 'round-intro' ? { type: 'reveal', now: Date.now() } : { type: 'ready' })} />}
        {(state.phase === 'memorize' || state.phase === 'playing' || state.phase === 'turn-complete') && <GameScreen state={state} now={now}
          onPick={(tileId) => dispatch({ type: 'pick', tileId, roundIndex: state.roundIndex, player: state.activePlayer, now: Date.now() })} />}
        {(state.phase === 'round-results' || state.phase === 'final-results') && <ResultsScreen state={state}
          onNext={() => dispatch({ type: 'next-round' })} onReplay={() => dispatch({ type: 'play-again' })} onNewPlayers={() => dispatch({ type: 'new-players' })} />}
      </main>
      <footer className="site-footer"><span><Icon name="lock" /> A little memory. A lot at stake.</span><span>COMP 440 <b> / </b> MEMORY HEIST</span></footer>
      {showExit && <ExitDialog onStay={() => setShowExit(false)} onLeave={() => { setShowExit(false); dispatch({ type: 'new-players' }) }} />}
    </div>
  )
}
export default App

import { useEffect, useReducer, useState } from 'react'
import { gameReducer, initialState } from './engine'

export function useLocalGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const deadline = state.phaseEndsAt
    if (deadline === null) return
    const update = () => { const time = Date.now(); setNow(time); dispatch({ type: 'tick', now: time }) }
    const timer = setTimeout(update, Math.max(0, deadline - Date.now()))
    const clock = setInterval(update, 100)
    return () => { clearTimeout(timer); clearInterval(clock) }
  }, [state.phaseEndsAt])
  return { state, dispatch, now }
}

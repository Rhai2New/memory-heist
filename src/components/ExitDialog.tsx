import { useEffect, useRef } from 'react'

export function ExitDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close() }, [])
  return (
    <dialog ref={ref} className="panel exit-dialog" aria-labelledby="exit-title" aria-describedby="exit-description" onCancel={onStay}>
      <span className="eyebrow">LEAVING SO SOON?</span><h2 id="exit-title">Call off the heist?</h2>
      <p id="exit-description">Return to player setup? This ends the current game and clears every score.</p>
      <div className="button-row"><button autoFocus className="button button-secondary" onClick={onStay}>KEEP PLAYING</button><button className="button button-primary" onClick={onLeave}>NEW PLAYERS</button></div>
    </dialog>
  )
}

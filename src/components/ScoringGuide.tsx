import { POINTS, TILE_LABELS, TILE_KINDS, formatScore } from '../game/engine'
import { Icon } from './Icon'
export function ScoringGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`scoring-guide ${compact ? 'compact' : ''}`}
      aria-label="Tile scoring"
    >
      {TILE_KINDS.map((kind) => (
        <div className={`score-item ${kind}`} key={kind}>
          <span className="score-icon">
            <Icon name={kind} />
          </span>
          <span>
            <span className="score-name">{TILE_LABELS[kind]}</span>
            <strong>
              {formatScore(POINTS[kind], true)}
              <small> pts</small>
            </strong>
          </span>
        </div>
      ))}
    </div>
  )
}

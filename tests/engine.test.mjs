import test from 'node:test'
import assert from 'node:assert/strict'
import { gameReducer as reduce, initialState, ROUNDS, POINTS, PICKS_PER_TURN, REVEAL_FEEDBACK_MS, generateBoard, validateNames, rankPlayers } from '../src/game/engine.ts'

const start = (count = 2) => reduce(initialState(), { type: 'start', names: Array.from({ length: count }, (_, i) => `Thief ${i + 1}`) })
function open(state, now = 1000) {
  state = reduce(state, { type: 'reveal', now })
  return reduce(state, { type: 'tick', now: state.phaseEndsAt })
}
const pick = (state, tileId, now = 9000) => reduce(state, { type: 'pick', tileId, player: state.activePlayer, roundIndex: state.roundIndex, now })
function finishTurn(state) {
  for (let i = 0; i < PICKS_PER_TURN; i++) state = pick(state, state.tiles.find((t) => t.claimedBy === null).id)
  return reduce(state, { type: 'tick', now: state.phaseEndsAt })
}

test('five exact grids/timings and balanced shuffled boards with every tile type', () => {
  assert.deepEqual(ROUNDS.map((r) => r.size), [4, 4, 5, 5, 6])
  assert.deepEqual(ROUNDS.map((r) => r.memorizeSeconds), [5, 4, 4, 3, 3])
  for (const size of [4, 5, 6]) {
    const board = generateBoard(size, () => .5)
    assert.equal(board.length, size * size)
    assert.equal(new Set(board.map((t) => t.id)).size, size * size)
    for (const kind of Object.keys(POINTS)) assert.ok(board.some((t) => t.kind === kind))
    assert.ok(board.filter((t) => t.kind === 'coin' || t.kind === 'diamond').length >= 9)
    assert.ok(board.every((t) => t.claimedBy === null))
  }
})
test('2–4 seats, normalized usable nicknames, and duplicate names without identity collisions', () => {
  assert.deepEqual(validateNames([' Rhaiyn  Jones ', 'Evan']), ['Rhaiyn Jones', 'Evan'])
  for (const names of [[], ['one'], ['a', 'b', 'c', 'd', 'e'], ['ok', '  '], ['ok', 'x'.repeat(19)], ['ok', '\u0001bad']]) assert.throws(() => validateNames(names))
  const state = reduce(initialState(), { type: 'start', names: ['Evan', 'Evan'] })
  assert.equal(state.players.length, 2)
  assert.equal(state.players[0].score, 0)
  assert.equal(state.phase, 'round-intro')
})
test('memorize cannot score; one shared period expires exactly at the configured deadline', () => {
  let state = start()
  const intro = state
  assert.equal(pick(state, 0), state)
  state = reduce(state, { type: 'reveal', now: 100 })
  assert.equal(state.phaseEndsAt, 5100)
  assert.equal(pick(state, 0), state)
  assert.equal(reduce(state, { type: 'tick', now: 5099 }), state)
  state = reduce(state, { type: 'tick', now: 5100 })
  assert.equal(state.phase, 'playing')
  assert.equal(state.phaseEndsAt, null)
  assert.equal(state.activePlayer, 0)
  assert.equal(state.picksLeft, 3)
  assert.equal(reduce(state, { type: 'reveal', now: 9999 }), state)
  assert.deepEqual(state.tiles, intro.tiles)
})
test('exact scoring for all tile types, negative totals, immediate feedback, immutable updates', () => {
  for (const [kind, points] of Object.entries(POINTS)) {
    const before = open(start())
    const tile = before.tiles.find((t) => t.kind === kind)
    const after = pick(before, tile.id)
    assert.equal(after.players[0].score, points)
    assert.equal(after.roundScores[0], points)
    assert.equal(after.picksLeft, 2)
    assert.equal(after.feedback.points, points)
    assert.equal(after.tiles[tile.id].claimedBy, 0)
    assert.equal(before.players[0].score, 0)
    assert.equal(before.tiles[tile.id].claimedBy, null)
  }
})
test('duplicate, rapid, fourth, invalid, wrong-turn and stale-round picks cannot score', () => {
  let state = open(start())
  assert.equal(pick(state, -1), state)
  assert.equal(reduce(state, { type: 'pick', tileId: 0, player: 1, roundIndex: 0, now: 9000 }), state)
  assert.equal(reduce(state, { type: 'pick', tileId: 0, player: 0, roundIndex: 1, now: 9000 }), state)
  state = pick(state, 0)
  assert.equal(pick(state, 0), state)
  state = pick(state, 1)
  state = pick(state, 2)
  const complete = state
  for (let i = 0; i < 100; i++) state = pick(state, i % 16)
  assert.equal(state, complete)
  assert.equal(state.phase, 'turn-complete')
  assert.equal(state.picksLeft, 0)
  assert.equal(state.tiles.filter((t) => t.claimedBy !== null).length, 3)
  assert.equal(state.phaseEndsAt, 9000 + REVEAL_FEEDBACK_MS)
  assert.equal(reduce(state, { type: 'tick', now: state.phaseEndsAt - 1 }), state)
  state = reduce(state, { type: 'tick', now: state.phaseEndsAt })
  assert.equal(state.phase, 'pass-device')
  assert.equal(state.activePlayer, 1)
  assert.equal(pick(state, 3), state)
  state = reduce(state, { type: 'ready' })
  assert.equal(state.phase, 'playing')
  assert.equal(state.picksLeft, 3)
  assert.equal(pick(state, 0), state)
  assert.equal(state.tiles[0].claimedBy, 0)
})
test('complete five-round games for 2, 3 and 4 players, manual results and comprehensive rematch reset', () => {
  for (const count of [2, 3, 4]) {
    let state = start(count)
    for (let r = 0; r < 5; r++) {
      assert.equal(state.phase, 'round-intro')
      assert.equal(state.roundIndex, r)
      assert.equal(state.tiles.length, ROUNDS[r].size ** 2)
      assert.ok(state.tiles.every((t) => t.claimedBy === null))
      state = open(state)
      for (let seat = 0; seat < count; seat++) {
        assert.equal(state.activePlayer, seat)
        assert.equal(state.picksLeft, 3)
        state = finishTurn(state)
        if (seat < count - 1) {
          assert.equal(state.phase, 'pass-device')
          state = reduce(state, { type: 'ready' })
        }
      }
      assert.equal(state.phase, 'round-results')
      assert.equal(state.results.length, r + 1)
      assert.equal(state.tiles.filter((t) => t.claimedBy !== null).length, count * 3)
      assert.equal(reduce(state, { type: 'tick', now: 1e12 }), state, 'results never auto-advance')
      state.players.forEach((p, seat) => assert.equal(p.score, state.results.reduce((total, result) => total + result.scores[seat], 0)))
      state = reduce(state, { type: 'next-round' })
    }
    assert.equal(state.phase, 'final-results')
    assert.equal(state.phaseEndsAt, null)
    const oldBoard = state.tiles
    const fresh = reduce(state, { type: 'play-again' })
    assert.equal(fresh.phase, 'round-intro')
    assert.equal(fresh.roundIndex, 0)
    assert.equal(fresh.activePlayer, 0)
    assert.equal(fresh.picksLeft, 3)
    assert.equal(fresh.phaseEndsAt, null)
    assert.deepEqual(fresh.players.map((p) => p.name), state.players.map((p) => p.name))
    assert.ok(fresh.players.every((p) => p.score === 0))
    assert.deepEqual(fresh.roundScores, Array(count).fill(0))
    assert.deepEqual(fresh.results, [])
    assert.equal(fresh.feedback, null)
    assert.notEqual(fresh.tiles, oldBoard)
    assert.equal(fresh.tiles.length, 16)
    assert.ok(fresh.tiles.every((t) => t.claimedBy === null))
    assert.deepEqual(reduce(fresh, { type: 'new-players' }), initialState())
  }
})
test('total standings, negative winners, ties and stable setup order', () => {
  const players = [{ name: 'A', color: 'purple', score: -75 }, { name: 'B', color: 'pink', score: -25 }, { name: 'C', color: 'cyan', score: -25 }]
  const ranked = rankPlayers(players)
  assert.deepEqual(ranked.map((p) => p.seat), [1, 2, 0])
  assert.deepEqual(ranked.map((p) => p.rank), [1, 1, 3])
  assert.equal(players[0].name, 'A')
})
test('reset during a live countdown ignores old timer callbacks and all unavailable actions', () => {
  let state = reduce(start(), { type: 'reveal', now: 100 })
  state = reduce(state, { type: 'new-players' })
  for (const action of [{ type: 'tick', now: 999999 }, { type: 'ready' }, { type: 'reveal', now: 999999 }, { type: 'next-round' }, { type: 'play-again' }]) assert.equal(reduce(state, action), state)
  assert.deepEqual(state, initialState())
})

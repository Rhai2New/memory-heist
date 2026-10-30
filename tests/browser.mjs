import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { build, preview } from 'vite'
import { chromium } from 'playwright'

await build()
const server = await preview({ preview: { host: '127.0.0.1', port: 5175, strictPort: true } })
const origin = 'http://127.0.0.1:5175'
const base = `${origin}/memory-heist/`
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM === '1' ? {} : { channel: 'chrome', headless: true })
await mkdir('test-artifacts', { recursive: true })
const report = [], errors = [], externalRequests = []
const log = (message) => { report.push(message); console.log(message) }
const points = { coin: 100, diamond: 250, bomb: -150, empty: -25 }
const sizes = [4, 4, 5, 5, 6], seconds = [5, 4, 4, 3, 3]
const click = (page, name) => page.getByRole('button', { name, exact: true }).click()
const tiles = (page) => page.locator('.vault-board .tile')
const currentScore = async (page) => Number((await page.locator('.total-score').innerText()).replace(/[^\d-]/g, ''))
const picksLeft = async (page) => Number(await page.getByTestId('picks-left').innerText())
const shot = (page, name) => page.screenshot({ path: `test-artifacts/${name}.png`, fullPage: true, animations: 'disabled' })
async function layout(page, phase) {
  const size = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }))
  assert.ok(size.content <= size.width, `${phase}: page overflow ${size.content} > ${size.width}`)
}
async function open(width = 1440) {
  const context = await browser.newContext({ viewport: { width, height: 880 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) externalRequests.push(request.url()) })
  await page.goto(base)
  await page.evaluate(() => document.fonts.ready)
  return page
}
async function virtualClock(page) {
  const time = await page.evaluate(() => Date.now())
  await page.clock.install({ time: new Date(time) })
  await page.clock.pauseAt(new Date(time + 1000))
}
async function setup(page, names) {
  await click(page, `${names.length} Players`)
  assert.equal(await page.locator('.name-fields input').count(), names.length)
  for (const [index, name] of names.entries()) await page.getByLabel(`PLAYER ${index + 1}`, { exact: true }).fill(name)
  await click(page, 'START HEIST')
  await page.locator('.round-intro').waitFor()
  assert.equal(await tiles(page).count(), 0, 'intro does not expose the board')
}
async function playGame(page, names, { realFirst = false, tie = false, mobile = false, finalNewPlayers = false } = {}) {
  const totals = names.map(() => 0)
  const history = []
  for (let round = 0; round < 5; round++) {
    await page.locator('.round-intro').waitFor()
    assert.match(await page.locator('.transition-card h1').innerText(), new RegExp(`ROUND ${round + 1}`))
    const started = Date.now()
    await click(page, 'REVEAL VAULT')
    await page.locator('.is-memorizing').waitFor()
    assert.equal(await tiles(page).count(), sizes[round] ** 2)
    assert.equal(await page.locator('.tile-visible').count(), sizes[round] ** 2)
    const memory = await tiles(page).evaluateAll((nodes) => nodes.map((n, id) => ({ id, kind: n.getAttribute('aria-label').split(': ')[1].split(',')[0].toLowerCase() })))
    for (const kind of Object.keys(points)) assert.ok(memory.some((tile) => tile.kind === kind))
    await tiles(page).evaluateAll((nodes) => nodes.forEach((n) => n.click()))
    assert.equal(await page.locator('.tile-claimed').count(), 0)
    await layout(page, 'memorize')
    if (realFirst && round === 0) {
      await page.locator('.is-playing').waitFor({ timeout: 8000 })
      assert.ok(Date.now() - started >= 4900, 'real Round 1 memorize period is five seconds')
      await virtualClock(page)
      // The complete remaining game continues without any network connection.
      await page.context().setOffline(true)
    } else {
      await page.clock.runFor(seconds[round] * 1000 - 100)
      assert.equal(await page.locator('.is-memorizing').count(), 1, 'memorize cannot end early')
      await page.clock.runFor(100)
      await page.locator('.is-playing').waitFor()
    }
    assert.equal(await page.locator('.tile-visible').count(), 0, 'all unpicked answers are hidden')
    assert.equal(await picksLeft(page), 3)
    const claimed = new Set()
    const deltas = names.map(() => 0)
    if (mobile && round === 4) {
      for (const width of [320, 390, 430]) {
        await page.setViewportSize({ width, height: 880 })
        await layout(page, `Round 5 ${width}px`)
        const box = await tiles(page).first().boundingBox()
        assert.ok(box.width >= 44 && box.height >= 44, `touch target ${box.width}x${box.height} at ${width}`)
        await shot(page, `local-round5-${width}px`)
      }
    }
    for (let seat = 0; seat < names.length; seat++) {
      assert.equal(await page.locator('.turn-banner > div strong').innerText(), names[seat])
      assert.equal(await currentScore(page), totals[seat])
      assert.equal(await picksLeft(page), 3)
      assert.equal(await page.locator('.tile-visible').count(), claimed.size, 'only discoveries stay revealed')
      for (const id of claimed) assert.equal(await tiles(page).nth(id).isDisabled(), true)
      let wanted
      if (tie) wanted = ['coin', 'bomb', 'empty']
      else if (round === 0 && seat === 0) wanted = ['coin', 'diamond', 'bomb']
      else if (round === 0 && seat === 1) wanted = ['empty', 'coin', 'bomb']
      const chosen = []
      for (let pick = 0; pick < 3; pick++) {
        const target = memory.find((tile) => !claimed.has(tile.id) && (!wanted || tile.kind === wanted[pick]))
        assert.ok(target)
        await tiles(page).nth(target.id).click()
        claimed.add(target.id)
        chosen.push(target.id)
        totals[seat] += points[target.kind]
        deltas[seat] += points[target.kind]
        assert.equal(await currentScore(page), totals[seat], `${target.kind}: correct immediate score`)
        assert.equal(await picksLeft(page), 2 - pick)
        assert.equal(await tiles(page).nth(target.id).isDisabled(), true)
        // Deliberate repeat clicks must neither score nor use another pick.
        await tiles(page).nth(target.id).evaluate((tile) => { tile.click(); tile.click() })
        assert.equal(await currentScore(page), totals[seat])
        assert.equal(await picksLeft(page), 2 - pick)
        assert.match(await page.locator('.live-feedback').innerText(), new RegExp(`${points[target.kind]}`))
      }
      // Rapidly try every tile after the third pick; the turn is already locked.
      await tiles(page).evaluateAll((nodes) => nodes.forEach((tile) => { tile.click(); tile.click() }))
      assert.equal(await currentScore(page), totals[seat])
      assert.equal(await page.locator('.tile-claimed').count(), claimed.size)
      assert.equal(await picksLeft(page), 0)
      await page.clock.runFor(1100)
      if (seat < names.length - 1) {
        await page.locator('.pass-screen').waitFor()
        assert.equal(await tiles(page).count(), 0, 'pass-device has no board or answers')
        assert.equal(await page.locator('.next-player h2').innerText(), names[seat + 1])
        await layout(page, 'pass device')
        if (round === 0 && seat === 0) await shot(page, `local-pass-${names.length}players${tie ? '-tie' : ''}`)
        await page.clock.runFor(20000)
        assert.equal(await page.locator('.pass-screen').count(), 1, 'ready gate waits indefinitely')
        await click(page, "I'M READY")
        await page.locator('.is-playing').waitFor()
      }
    }
    await page.locator('.round-results').waitFor()
    await layout(page, 'round results')
    const standings = await page.locator('.round-results .leaderboard li').evaluateAll((rows) => rows.map((r) => ({ seat: Number(r.dataset.seat), score: Number(r.dataset.score), text: r.textContent })))
    assert.deepEqual(standings.map((row) => row.score), [...totals].sort((a, b) => b - a))
    for (const row of standings) {
      assert.equal(row.score, totals[row.seat])
      assert.ok(row.text.includes(String(deltas[row.seat])), 'round delta is displayed')
    }
    history.push(deltas)
    await page.clock.runFor(60000)
    assert.equal(await page.locator('.round-results').count(), 1, 'results wait for the crew')
    await click(page, round === 4 ? 'FINAL RESULTS' : 'NEXT ROUND')
    log(`${names.length}-player${tie ? ' tie' : ''}: Round ${round + 1}, ${sizes[round]}x${sizes[round]}, ${seconds[round]}s memorize, exactly 3 picks each, scores/pass/results passed.`)
  }
  await page.locator('.final-results').waitFor()
  await layout(page, 'final results')
  const highest = Math.max(...totals)
  const winners = names.filter((_, seat) => totals[seat] === highest)
  const displayedWinners = await page.locator('.winner-names h2').allTextContents()
  assert.deepEqual(displayedWinners, winners)
  if (tie) assert.equal(await page.locator('.results-heading h1').innerText(), 'MASTER THIEVES')
  assert.equal(Number((await page.locator('.winner-score').innerText()).replace(/[^\d-]/g, '')), highest)
  for (let seat = 0; seat < names.length; seat++) assert.equal(history.reduce((sum, round) => sum + round[seat], 0), totals[seat])
  await shot(page, `local-final-${names.length}players${tie ? '-tie' : ''}`)
  if (finalNewPlayers) {
    await page.locator('.final-card').getByRole('button', { name: 'NEW PLAYERS', exact: true }).click()
    await page.locator('.setup-panel').waitFor()
    assert.equal(await page.locator('.name-fields input').count(), 2)
    assert.equal(await tiles(page).count(), 0)
    log(`${names.length}-player: final winner and final-screen New Players reset passed.`)
    return
  }
  await click(page, 'PLAY AGAIN')
  await page.locator('.round-intro').waitFor()
  assert.match(await page.locator('.transition-card h1').innerText(), /ROUND 1/)
  await click(page, 'REVEAL VAULT')
  assert.equal(await tiles(page).count(), 16)
  assert.equal(await page.locator('.tile-claimed').count(), 0)
  assert.deepEqual(await page.locator('.leaderboard li').evaluateAll((rows) => rows.map((r) => Number(r.dataset.score))), names.map(() => 0))
  await page.clock.runFor(5000)
  assert.equal(await picksLeft(page), 3)
  assert.equal(await currentScore(page), 0)
  await page.getByRole('button', { name: 'New players', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'NEW PLAYERS', exact: true }).click()
  await page.locator('.setup-panel').waitFor()
  await page.clock.runFor(100000)
  assert.equal(await page.locator('.setup-panel').count(), 1)
  assert.equal(await tiles(page).count(), 0)
  assert.equal(await page.locator('.name-fields input').count(), 2)
  log(`${names.length}-player${tie ? ' tie' : ''}: final winner, complete Play Again reset, New Players and timer cleanup passed.`)
}

let page
try {
  page = await open()
  assert.match(await page.locator('.tagline').innerText(), /Remember\. Steal\. Survive\./)
  assert.ok(await page.getByRole('region', { name: 'How to play' }).isVisible())
  await click(page, 'START HEIST')
  assert.match(await page.getByRole('alert').innerText(), /Player 1 needs a nickname/)
  await page.getByLabel('PLAYER 1', { exact: true }).fill('Rhaiyn')
  await page.getByLabel('PLAYER 2', { exact: true }).fill('   ')
  await click(page, 'START HEIST')
  assert.match(await page.getByRole('alert').innerText(), /Player 2 needs a nickname/)
  await shot(page, 'local-home-desktop')
  await setup(page, ['Rhaiyn', 'Evan'])
  await playGame(page, ['Rhaiyn', 'Evan'], { realFirst: true })
  log('2-player complete game remained playable offline after loading. No external service requests.')
  await page.context().setOffline(false)
  await page.reload()
  assert.equal(await page.locator('.setup-panel').count(), 1, 'refresh returns safely to setup')
  await page.context().close()

  for (const count of [3, 4]) {
    page = await open(count === 3 ? 390 : 320)
    await virtualClock(page)
    for (const width of [320, 390, 430]) { await page.setViewportSize({ width, height: 880 }); await layout(page, 'setup'); await shot(page, `local-setup-${width}px`) }
    await page.setViewportSize({ width: count === 3 ? 390 : 320, height: 880 })
    const names = count === 3 ? ['Rhaiyn', 'Evan', 'Zion'] : ['ABCDEFGHIJKLMNOPQR', 'SameName', 'SameName', 'Melissa']
    await setup(page, names)
    await playGame(page, names, { mobile: count === 4, finalNewPlayers: count === 3 })
    await page.context().close()
  }
  page = await open(390)
  await virtualClock(page)
  await setup(page, ['Rhaiyn', 'Evan'])
  await playGame(page, ['Rhaiyn', 'Evan'], { tie: true })
  // Cancel a running memorization timer, then wait well past its old deadline.
  await setup(page, ['New One', 'New Two'])
  await click(page, 'REVEAL VAULT')
  await page.getByRole('button', { name: 'New players', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'KEEP PLAYING', exact: true }).click()
  assert.equal(await page.locator('.is-memorizing').count(), 1)
  await page.getByRole('button', { name: 'New players', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'NEW PLAYERS', exact: true }).click()
  await page.clock.runFor(10000)
  assert.equal(await page.locator('.setup-panel').count(), 1)
  assert.deepEqual(errors, [])
  assert.deepEqual(externalRequests, [])
  log('PASS: complete 2/3/4-player games, five-round tie, exact scoring, negative scores, rapid/duplicate clicks, reset, timer cleanup, and mobile 320/390/430px. No console errors or external/backend requests.')
} catch (error) {
  log(`FAIL: ${error.stack}`)
  if (page && !page.isClosed()) await shot(page, 'local-failure').catch(() => {})
  process.exitCode = 1
} finally {
  await writeFile('test-artifacts/local-browser-report.txt', report.join('\n') + '\nErrors: ' + JSON.stringify(errors) + '\nExternal requests: ' + JSON.stringify(externalRequests))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}

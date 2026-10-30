# Local gameplay validation

The final game is same-device pass-and-play. There are no room, account, database, or network requirements.

Run `npm test` for deterministic engine tests. Run `npm run test:browser` for real UI testing; it starts its own Vite server. Playwright's virtual clock advances later countdowns without changing production timings. The first memorization countdown is also tested with real elapsed time.

Coverage:

- Player count selection, empty/whitespace name validation, long names and duplicate nicknames.
- Exact coin +100, diamond +250, bomb -150 and empty -25 scores, including negative totals.
- Three picks per player, rapid clicks, duplicate clicks, already discovered tiles, wrong-turn and stale-round actions.
- Disabled memorize tiles, all answers visible only during the one shared look, exact countdown deadlines.
- Full-screen pass-device gate with no board or answers; ready begins only the next player's turn.
- Five rounds with grids 4/4/5/5/6 and memorize periods 5/4/4/3/3 seconds.
- Standings include round deltas and totals, remain until requested, and rank by total score.
- Complete 2-player, 3-player and 4-player games, single winner and co-winners.
- Play Again resets all scores, boards, turn state, history and timers while keeping names.
- New Players returns to setup; exiting mid-countdown clears timers; refresh safely returns to setup.
- Phone widths 320, 390 and 430px, including a 6×6 board with at least 44px touch targets and no horizontal page overflow.
- No console/runtime errors or backend requests during normal gameplay, including a game played with the browser offline after loading.

Generated browser report and screenshots are written under ignored `test-artifacts/`. Final validation also runs `npm run lint` and `npm run build`.

Latest result: all 8 engine tests and complete browser games passed. The browser run covered 2/3/4-player games plus a five-round tie, all three mobile widths, rematch and setup reset, offline play, and zero console errors or external/backend requests. Lint and the production build passed.

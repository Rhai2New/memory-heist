# Memory Heist

**Remember. Steal. Survive.** A local memory party game for **2–4 players sharing one device**, built for COMP 440. Case the same vault together, take turns stealing treasure, and pass the device to the next thief.

## Play

1. Choose 2, 3, or 4 players, enter everyone's nickname, and press **Start Heist**.
2. Gather everyone at each round intro. Press **Reveal Vault** when the whole crew is looking.
3. Everyone memorizes the vault together. When the countdown ends, the tiles hide. You never see the original solution again during that round.
4. In setup order, each player gets exactly **3 picks**. Each tile can be picked once for the whole crew. Opened tiles stay visible and unavailable.
5. After a turn, **Pass the Device** appears. The next player presses **I'm Ready** to begin. There is no turn time limit.
6. Read the round standings, then press **Next Round**. Highest total after five rounds wins; tied players are co-winners.

| Tile | Points |
|---|---:|
| Coin | +100 |
| Diamond | +250 |
| Bomb | -150 |
| Empty | -25 |

Negative scores are allowed. Every player receives three picks even if the remaining treasure has been collected. Player 1 goes first each round.

| Round | Grid | Shared memorization |
|---|---|---|
| 1 | 4×4 | 5 seconds |
| 2 | 4×4 | 4 seconds |
| 3 | 5×5 | 4 seconds |
| 4 | 5×5 | 3 seconds |
| 5 | 6×6 | 3 seconds |

**Play Again** keeps the names and starts a fresh five-round game with zero scores. **New Players** returns to setup. Game state stays in browser memory: refreshing starts a new setup.

## Run locally

Use Node.js **22.13+** and npm:

```sh
npm ci
npm run dev
```

Open the URL Vite prints, normally **http://localhost:5173**. No backend, accounts, environment variables, or external service setup is required.

## Build, test, and deploy

```sh
npm test
npm run test:browser
npm run lint
npm run build
```

Core tests cover scoring, invalid picks, turn boundaries, five-round progression, ties and reset. Browser tests run complete games for 2, 3 and 4 players and check mobile layouts. Browser tests start their own Vite server and use installed Chrome. Alternatively run `npx playwright install chromium` and set `PLAYWRIGHT_CHROMIUM=1`.

Deploy the existing repository to Netlify as a static Vite site: **build command `npm run build`**, **publish directory `dist`**. The root `netlify.toml` supplies these settings. For a manual static upload, build locally and upload the `dist` folder. `npm run package` creates a source archive named `netlify-ready-game.zip`; it is not the built `dist` upload.

## Technology and structure

React, TypeScript, Vite, ESLint, CSS animations, Node's test runner, and Playwright. The board, rules, scoring, and state transitions run entirely in the browser.

- `src/game/engine.ts`: board generation, scoring, validation, and the local game reducer.
- `src/game/useLocalGame.ts`: React state and cleaned-up countdown timers.
- `src/components/`: setup, rules, round intros, pass-device screen, board, tiles, standings, and results.
- `src/App.css`, `src/responsive.css`, `src/local.css`: the dark heist theme, animations, and phone layouts.
- `tests/`: focused logic tests and complete browser gameplay checks.

No build output, dependencies, credentials, screenshots, or caches belong in Git.

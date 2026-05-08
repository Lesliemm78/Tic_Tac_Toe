# tic_tac_toe

This project is a mouse-playable Tic Tac Toe game built with TypeScript and browser JavaScript. The player uses `X`, the computer uses `O`, and the original command-line version is still available.

The browser game uses a local strategy for computer moves, so it works without API setup.

## Files

- `public/index.html`: Browser game markup.
- `public/styles.css`: Browser game styling.
- `public/game.js`: Mouse controls, board state, scoring, and computer moves.
- `src/server.ts`: Local static file server for the browser game.
- `src/ai_project.ts`: Original command-line game loop.
- `src/header.ts`: Prints the game title and instructions.
- `tsconfig.json`: TypeScript compiler configuration.
- `package.json`: npm scripts and dependencies.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Run the mouse-playable game:
   ```
   npm start
   ```

3. Open the local URL:
   ```
   http://localhost:3000
   ```

4. Check TypeScript:
   ```
   npm run typecheck
   ```

5. Optional: run the coordinate-based CLI:
   ```
   npm run cli
   ```

## Deploy Online

This project deploys the static browser game in `public/` with GitHub Pages.

1. In GitHub, open the repository settings.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main`, or run the `Deploy Tic Tac Toe` workflow manually.

The published site should be available at:

```
https://lesliemm78.github.io/aiProject/
```

## Game Rules

- The game is played on a 3x3 grid.
- Players take turns placing their marks (X for the player and O for the computer) in empty squares.
- The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins the game.
- If all squares are filled and no player has three in a row, the game is a draw.

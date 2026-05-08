# tic_tac_toe Learning Notes

This file explains the main changes made while building the mouse-playable Tic Tac Toe game. Use it as a reference when you want to remember what changed, why it changed, and what coding ideas were involved.

## Table of Contents

- [Project Shape](#project-shape)
- [Browser Deployment](#browser-deployment)
- [Relative Asset Paths](#relative-asset-paths)
- [Cache-Busting Asset Versions](#cache-busting-asset-versions)
- [Layout Structure](#layout-structure)
- [Fitting the Game on Screen](#fitting-the-game-on-screen)
- [Purple Panel Sizing](#purple-panel-sizing)
- [Game State](#game-state)
- [Preventing Double Moves](#preventing-double-moves)
- [Resetting Safely](#resetting-safely)
- [Winner Highlighting](#winner-highlighting)
- [Local Server Safety](#local-server-safety)
- [Useful Commands](#useful-commands)
- [Patterns to Reuse](#patterns-to-reuse)
- [Index](#index)

## Project Shape

The project now has two ways to play:

- Browser version: `public/index.html`, `public/styles.css`, and `public/game.js`
- Original command-line version: `src/ai_project.ts`

The browser version is the main experience. The local TypeScript server in `src/server.ts` serves the files in `public/` when you run:

```bash
npm start
```

## Browser Deployment

The live site is deployed with GitHub Pages from the `public/` folder.

The workflow file is:

```text
.github/workflows/deploy.yml
```

Concept to remember:

GitHub Pages serves static files. That means HTML, CSS, and browser JavaScript work well there, but server-side TypeScript does not run on GitHub Pages. The local server is only for development.

## Relative Asset Paths

In `public/index.html`, the CSS and JavaScript are linked like this:

```html
<link rel="stylesheet" href="styles.css?v=20260508-5" />
<script src="game.js?v=20260508-5"></script>
```

Earlier, these paths started with `/`, like `/styles.css`. That worked locally but broke on GitHub Pages because the site is hosted under:

```text
/Tic_Tac_Toe/
```

Concept to remember:

- `/styles.css` means "look at the domain root."
- `styles.css` means "look next to this HTML file."

For GitHub Pages project sites, relative paths are usually safer.

## Cache-Busting Asset Versions

The `?v=...` part in the CSS and JavaScript URLs is a cache buster.

Example:

```html
styles.css?v=20260508-5
```

Browsers sometimes keep old CSS files cached. Changing the version makes the browser treat it like a new URL, so it fetches the latest file.

Concept to remember:

When your deployed CSS "should" be updated but the page still looks old, caching may be the reason. A version query string is a simple fix.

## Layout Structure

The page has three main visual parts:

- `.app`: the full game wrapper
- `.scoreboard`: the three score boxes
- `.game-shell`: the purple game panel
- `.board`: the 3 by 3 Tic Tac Toe grid
- `.cell`: each clickable square

In `public/styles.css`, the board uses CSS Grid:

```css
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}
```

Concept to remember:

CSS Grid is good when you want rows and columns. `repeat(3, 1fr)` means "make three equal-sized tracks."

## Fitting the Game on Screen

The layout uses viewport height units so it fits without scrolling:

```css
.app {
  height: 100svh;
}
```

`svh` means "small viewport height." It is useful in browsers where the visible height can change because of browser bars.

The board is constrained like this:

```css
.board {
  width: min(100%, 390px, 48svh);
}
```

Concept to remember:

`min()` lets CSS choose the smallest value from a list. Here, the board cannot be wider than:

- its container
- 390px
- 48% of the viewport height

That keeps it from overflowing vertically.

## Purple Panel Sizing

At one point, the purple panel looked too tall because it was using grid layout and stretching. The fix was to make the panel size to its content:

```css
.game-shell {
  align-self: start;
  height: fit-content;
}
```

Concept to remember:

Grid children can stretch by default. If a grid item looks too tall, check whether it is stretching in its parent grid. `align-self: start` often fixes that.

## Game State

The browser game state lives in `public/game.js`.

Important variables:

```js
let board = Array(9).fill(EMPTY);
let isGameOver = false;
let isComputerThinking = false;
let pendingComputerMove = null;
```

What they mean:

- `board`: stores the 9 squares
- `isGameOver`: prevents moves after a win or draw
- `isComputerThinking`: locks input while the computer is choosing
- `pendingComputerMove`: stores the delayed computer move timer

Concept to remember:

Interactive apps usually need state. State is the memory of what is currently happening.

## Preventing Double Moves

The player should not be able to click two squares before the computer moves. The game prevents that with:

```js
if (isGameOver || isComputerThinking || board[index]) return;
```

Concept to remember:

Guard clauses stop a function early when an action is not allowed. They make event handlers safer and easier to read.

## Resetting Safely

The computer move happens after a short delay:

```js
pendingComputerMove = window.setTimeout(computerTurn, 320);
```

If the player resets before that delay finishes, the old computer move must be cancelled:

```js
if (pendingComputerMove !== null) {
  window.clearTimeout(pendingComputerMove);
  pendingComputerMove = null;
}
```

Concept to remember:

If you use `setTimeout`, think about whether it needs to be cancelled. Reset buttons often need to clear timers.

## Winner Highlighting

The game finds a winner by checking all winning line combinations:

```js
const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
```

When someone wins, the matching cells get a `win` class:

```js
result.line.forEach((index) => cells[index].classList.add("win"));
```

Concept to remember:

CSS classes are a clean way to connect JavaScript state to visual styling.

## Local Server Safety

The local server in `src/server.ts` serves files from `public/`. It also protects against bad paths:

```ts
const relativePath = path.relative(PUBLIC_DIR, filePath);

if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
  return path.join(PUBLIC_DIR, "index.html");
}
```

Concept to remember:

When serving files from user-requested URLs, make sure the request cannot escape the intended public folder.

## Useful Commands

Run the browser game locally:

```bash
npm start
```

Run the original CLI version:

```bash
npm run cli
```

Check TypeScript:

```bash
npm run typecheck
```

Check browser JavaScript syntax:

```bash
node --check public/game.js
```

Check for whitespace issues before committing:

```bash
git diff --check
```

## Patterns to Reuse

- Use CSS Grid for boards and tile layouts.
- Use relative asset paths for GitHub Pages.
- Use cache-busting query strings when deployed CSS is stale.
- Use guard clauses in click handlers.
- Clear pending timers when resetting state.
- Keep state variables explicit and named for what they control.
- Let the live page and local page teach you different things: local is fast for testing, live exposes deployment and caching issues.

## Index

- **`.app`**: The main page wrapper in `public/styles.css`. It controls the overall width, height, spacing, and how the scoreboard and game panel stack.
- **`.board`**: The 3 by 3 CSS Grid that holds the Tic Tac Toe cells.
- **`.cell`**: Each clickable square in the board.
- **`.game-shell`**: The purple game panel around the title, reset button, board, and status text.
- **`.scoreboard`**: The row of score cards for player wins, draws, and computer wins.
- **`100svh`**: CSS unit for the small viewport height. Useful when trying to fit an app into the visible browser area.
- **`align-self: start`**: CSS rule used to stop a grid item from stretching taller than its content.
- **Asset path**: The URL used to load a CSS or JavaScript file, such as `styles.css`.
- **Cache busting**: Adding a query string like `?v=20260508-5` to force the browser to fetch a fresh asset.
- **CSS Grid**: CSS layout system used for the Tic Tac Toe board.
- **Deployment**: The process of publishing the project online. This project deploys with GitHub Pages.
- **GitHub Actions**: GitHub automation system. The file `.github/workflows/deploy.yml` tells GitHub how to publish the site.
- **GitHub Pages**: GitHub's static website hosting. It serves the files from `public/`.
- **Guard clause**: A quick early return that prevents invalid actions, such as clicking while the computer is thinking.
- **`height: fit-content`**: CSS rule that makes an element size itself to its content instead of stretching.
- **`min()`**: CSS function that chooses the smallest value from a list. Used to keep the board from getting too large.
- **Relative path**: A path like `styles.css`, which loads a file relative to the current HTML file.
- **Root-relative path**: A path like `/styles.css`, which loads from the root of the domain. This caused trouble on GitHub Pages.
- **State**: The data that remembers what is happening in the app, such as the board contents or whether the game is over.
- **`setTimeout`**: JavaScript function that runs code after a delay. Used for the computer move.
- **`clearTimeout`**: JavaScript function that cancels a pending delayed action. Used when resetting the board.

const PLAYER_MARK = "X";
const COMPUTER_MARK = "O";
const EMPTY = "";

const cells = Array.from(document.querySelectorAll(".cell"));
const title = document.querySelector("#game-title");
const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#reset-button");
const playerScore = document.querySelector("#player-score");
const computerScore = document.querySelector("#computer-score");
const drawScore = document.querySelector("#draw-score");

let board = Array(9).fill(EMPTY);
let isGameOver = false;
let scores = {
  player: 0,
  computer: 0,
  draw: 0,
};

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

function getWinner(currentBoard) {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
      return { mark: currentBoard[a], line };
    }
  }

  if (currentBoard.every(Boolean)) {
    return { mark: "draw", line: [] };
  }

  return null;
}

function availableMoves(currentBoard) {
  return currentBoard
    .map((mark, index) => (mark ? null : index))
    .filter((index) => index !== null);
}

function findFinishingMove(mark) {
  for (const move of availableMoves(board)) {
    const nextBoard = [...board];
    nextBoard[move] = mark;
    const winner = getWinner(nextBoard);

    if (winner && winner.mark === mark) {
      return move;
    }
  }

  return null;
}

function getComputerMove() {
  const winningMove = findFinishingMove(COMPUTER_MARK);
  if (winningMove !== null) return winningMove;

  const blockingMove = findFinishingMove(PLAYER_MARK);
  if (blockingMove !== null) return blockingMove;

  if (!board[4]) return 4;

  const preferredMoves = [0, 2, 6, 8, 1, 3, 5, 7];
  return preferredMoves.find((move) => !board[move]);
}

function render() {
  cells.forEach((cell, index) => {
    const mark = board[index];
    cell.textContent = mark;
    cell.disabled = isGameOver || Boolean(mark);
    cell.classList.toggle("player", mark === PLAYER_MARK);
    cell.classList.toggle("computer", mark === COMPUTER_MARK);
    cell.classList.remove("win");
  });
}

function finishGame(result) {
  isGameOver = true;
  result.line.forEach((index) => cells[index].classList.add("win"));

  if (result.mark === PLAYER_MARK) {
    title.textContent = "You Win";
    statusText.textContent = "Nicely played.";
    scores.player += 1;
  } else if (result.mark === COMPUTER_MARK) {
    title.textContent = "Computer Wins";
    statusText.textContent = "New board?";
    scores.computer += 1;
  } else {
    title.textContent = "Draw";
    statusText.textContent = "No empty squares.";
    scores.draw += 1;
  }

  playerScore.textContent = scores.player;
  computerScore.textContent = scores.computer;
  drawScore.textContent = scores.draw;
  render();
}

function checkGameState() {
  const result = getWinner(board);
  if (result) {
    finishGame(result);
    return true;
  }

  return false;
}

function computerTurn() {
  if (isGameOver) return;

  const move = getComputerMove();
  if (move === undefined) return;

  board[move] = COMPUTER_MARK;

  if (!checkGameState()) {
    title.textContent = "Your Move";
    statusText.textContent = "Pick a square.";
    render();
  }
}

function playerTurn(index) {
  if (isGameOver || board[index]) return;

  board[index] = PLAYER_MARK;
  title.textContent = "Thinking";
  statusText.textContent = "Computer is choosing.";
  render();

  if (!checkGameState()) {
    window.setTimeout(computerTurn, 320);
  }
}

function resetBoard() {
  board = Array(9).fill(EMPTY);
  isGameOver = false;
  title.textContent = "Your Move";
  statusText.textContent = "Pick a square.";
  render();
}

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => playerTurn(index));
});

resetButton.addEventListener("click", resetBoard);

render();

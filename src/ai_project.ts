// ai_project.ts

import * as dotenv from "dotenv";
import readline from "readline";
import { printHeader } from "./header";

// Load environment variables
dotenv.config();

type Board = string[][];
type Move = [number, number];

const PLAYER_MARK = "X";
const COMPUTER_MARK = "O";
const EMPTY = " ";

function printBoard(board: Board): void {
  console.log("\n    0   1   2");
  board.forEach((row, index) => {
    console.log(`${index}   ${row.join(" | ")}`);
    if (index < board.length - 1) {
      console.log("   ---+---+---");
    }
  });
  console.log("");
}

function checkWinner(board: Board): string | null {
  const lines = [
    // Rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // Columns
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // Diagonals
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  for (const line of lines) {
    if (line.every((cell) => cell === PLAYER_MARK)) return "Player";
    if (line.every((cell) => cell === COMPUTER_MARK)) return "Computer";
  }

  return board.some((row) => row.some((cell) => cell === EMPTY)) ? null : "Draw";
}

function getAvailableMoves(board: Board): Move[] {
  const moves: Move[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === EMPTY) {
        moves.push([rowIndex, colIndex]);
      }
    });
  });

  return moves;
}

function isValidMove(board: Board, row: number, col: number): boolean {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < 3 &&
    col >= 0 &&
    col < 3 &&
    board[row][col] === EMPTY
  );
}

function findFinishingMove(board: Board, mark: string): Move | null {
  for (const [row, col] of getAvailableMoves(board)) {
    const boardCopy = board.map((boardRow) => [...boardRow]);
    boardCopy[row][col] = mark;

    if (
      (mark === COMPUTER_MARK && checkWinner(boardCopy) === "Computer") ||
      (mark === PLAYER_MARK && checkWinner(boardCopy) === "Player")
    ) {
      return [row, col];
    }
  }

  return null;
}

function strategicMove(board: Board): Move {
  const winningMove = findFinishingMove(board, COMPUTER_MARK);
  if (winningMove) return winningMove;

  const blockingMove = findFinishingMove(board, PLAYER_MARK);
  if (blockingMove) return blockingMove;

  if (board[1][1] === EMPTY) return [1, 1];

  const preferredMoves: Move[] = [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
    [0, 1],
    [1, 0],
    [1, 2],
    [2, 1],
  ];

  const move = preferredMoves.find(([row, col]) => board[row][col] === EMPTY);
  if (!move) {
    throw new Error("No moves available");
  }

  return move;
}

function parseMove(input: string): Move | null {
  const match = input.trim().match(/^([0-2])\s*,\s*([0-2])$/);
  if (!match) return null;

  return [Number(match[1]), Number(match[2])];
}

async function askOpenAiForMove(board: Board): Promise<Move | null> {
  if (process.env.USE_OPENAI_MOVES !== "true" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const { Configuration, OpenAIApi } = await import("openai");
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const prompt = `
You are playing Tic Tac Toe as "O". The current board is:
${board.map((row) => row.join(" ")).join("\n")}
Respond with the row and column (0-indexed) of your next move in the format "row,column".
    `;
  const response = await openai.createCompletion({
    model: process.env.OPENAI_API_MODEL || "text-davinci-003",
    prompt: prompt,
    max_tokens: 10,
    temperature: 0.7,
  });

  const move = response.data.choices[0].text?.trim();
  if (move) {
    const parsedMove = parseMove(move);
    if (parsedMove) {
      const [row, col] = parsedMove;
      return [row, col];
    }
  }

  return null;
}

async function computerMove(board: Board): Promise<Move> {
  try {
    const openAiMove = await askOpenAiForMove(board);
    if (openAiMove && isValidMove(board, openAiMove[0], openAiMove[1])) {
      return openAiMove;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`OpenAI move failed (${message}). Using local strategy.`);
  }

  return strategicMove(board);
}

async function main() {
  printHeader();
  console.log("Welcome to Tic Tac Toe!");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  const board: Board = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
  ];

  let currentPlayer = "Player";

  try {
    while (true) {
      printBoard(board);
      const winner = checkWinner(board);
      if (winner) {
        console.log(winner === "Draw" ? "It's a draw!" : `${winner} wins!`);
        break;
      }

      if (currentPlayer === "Player") {
        const answer = await askQuestion("Enter your move (row,column) or q to quit: ");
        if (answer.trim().toLowerCase() === "q") {
          console.log("Thanks for playing!");
          break;
        }

        const move = parseMove(answer);
        if (move && isValidMove(board, move[0], move[1])) {
          const [row, col] = move;
          board[row][col] = PLAYER_MARK;
          currentPlayer = "Computer";
        } else {
          console.log("Invalid move. Try again.");
        }
      } else {
        try {
          const [row, col] = await computerMove(board);
          console.log(`Computer plays ${row},${col}`);
          board[row][col] = COMPUTER_MARK;
          currentPlayer = "Player";
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.log("Error with computer move:", message);
          break;
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("An error occurred:", message);
  } finally {
    rl.close();
  }
}

main();

export function getOpponent(player) {
  if (player === 'X') return 'O';
  if (player === 'O') return 'X';
  return null;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createEmptyBoard() {
  return Array(9).fill(null);
}

export function checkWinner(board) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { indices: combination, winner: board[a] };
    }
  }
  return null;
}

export function isDraw(board) {
  return board.every(cell => cell !== null) && !checkWinner(board);
}

export function isGameOver(board) {
  return checkWinner(board) !== null || isDraw(board);
}

export function getAvailableMoves(board) {
  return board.reduce((moves, cell, index) => {
    if (cell === null) {
      moves.push(index);
    }
    return moves;
  }, []);
}

export function makeMove(board, position, player) {
  if (board[position] !== null) {
    throw new Error('Cell is already occupied');
  }
  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}

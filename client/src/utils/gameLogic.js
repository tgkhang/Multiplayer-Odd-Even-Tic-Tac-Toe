const WINNING_COMBINATIONS = [
  // 5 rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],

  // 5 columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],

  // 2 diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
]

export function createEmptyBoard() {
  return Array(25).fill(0);
}

export function checkWinner(board) {

  for (const combination of WINNING_COMBINATIONS) {
    const values = combination.map(i => board[i])

    const allOdd = values.every(v => v > 0 && v % 2 == 1)
    if (allOdd)
      return { indices: combination, winner: 'ODD' }

    const allEven = values.every(v => v > 0 && v % 2 == 0)
    if (allEven)
      return { indices: combination, winner: 'EVEN' }
  }
  return null;
}


export function incrementSquare(board, position) {
  const newBoard = [...board]
  newBoard[position] += 1
  return newBoard
}
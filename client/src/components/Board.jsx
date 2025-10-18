
import Cell from "./Cell";

function Board({ board, onCellClick, winningLine, disabled }) {
  const isWinningCell = (index) => {
    return winningLine?.indices.includes(index) ?? false;
  };

  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-lg mx-auto p-4">
      {board.map((cell, index) => (
        <Cell
          key={index}
          value={cell}
          onClick={() => onCellClick(index)}
          isWinning={isWinningCell(index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default Board;

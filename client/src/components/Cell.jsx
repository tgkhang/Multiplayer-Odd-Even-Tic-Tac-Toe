
function Cell({ value, onClick, isWinning, disabled }) {
  const isOdd = value > 0 && value % 2 === 1;
  const isEven = value > 0 && value % 2 === 0;

  const cellClass = `
    w-16 h-16 flex items-center justify-center
    text-2xl font-bold rounded-lg
    transition-all duration-200
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
    ${isWinning ? 'bg-green-400 text-white ring-4 ring-green-600' : 'bg-white'}
    ${!isWinning && isOdd ? 'text-blue-600 border-2 border-blue-300' : ''}
    ${!isWinning && isEven ? 'text-green-600 border-2 border-green-300' : ''}
    ${value === 0 ? 'text-gray-400 border-2 border-gray-200' : ''}
  `;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cellClass}
    >
      {value}
    </button>
  );
}

export default Cell;

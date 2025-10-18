function GameInfo({ currentPlayer, gameStatus, isPlayerTurn }) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-6 text-center'>
      <div className='mb-2'>
        <span className='text-gray-600'>Current Turn: </span>
        <span className={`font-bold text-2xl ${currentPlayer === 'X' ? 'text-red-500' : 'text-blue-500'}`}>
          {currentPlayer}
        </span>
      </div>
      <div className={`text-lg font-semibold ${isPlayerTurn ? 'text-green-600' : 'text-gray-600'}`}>
        {gameStatus}
      </div>
    </div>
  );
}

export default GameInfo;

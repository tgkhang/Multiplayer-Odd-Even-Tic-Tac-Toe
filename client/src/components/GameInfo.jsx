function GameInfo({ playerSymbol, gameStatus, isGameActive }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
      {playerSymbol && (
        <p className="text-lg mb-2">
          You are the <span className="font-bold text-purple-600">{playerSymbol}</span> player
        </p>
      )}
      <p className="text-xl font-semibold text-gray-700">{gameStatus}</p>
    </div>
  );
}

export default GameInfo;

import { useEffect, useState } from "react"
import { WebSocketService } from "../utils/webSocket"

function Menu({
  onStartOnlineGame,
  wins,
  losses,
  draws,
  currentStreak,
  onResetScore,
}) {
  const [isServerAvailable, setIsServerAvailable] = useState(false)

  useEffect(() => {
    console.log('Menu: Testing WebSocket server connection...')
    WebSocketService.testConnection()
      .then((available) => {
        console.log('Menu: Server availability:', available)
        setIsServerAvailable(available)
      })
      .catch((error) => {
        console.error('Menu: Server test failed:', error)
        setIsServerAvailable(false)
      })
  }, [])

  return (
    <div
      className='
        flex items-center justify-center
        py-8 px-4
        min-h-screen bg-gradient-to-br
        from-blue-50 to-purple-50
    '
    >
      {/* Max width = medium Element can shrink smaller, but won't grow beyond 448px*/}
      <div className='w-full max-w-md'>
        <h1 className='text-6xl font-bold text-center mb-4 text-gray-800'>
          Tic Tac Toe
        </h1>
        <p className='text-center text-gray-600 mb-12 text-lg'>
          Play online with real players
        </p>

        {/* Statistic */}
        <div>
          <h2 className='text-xl font-bold text-center mb-4 text-gray-800'>
            Your Statistic
          </h2>
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>{wins}</div>
              <div className='text-sm text-gray-600'>Wins</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-red-600'>{losses}</div>
              <div className='text-sm text-gray-600'>Losses</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-gray-600'>{draws}</div>
              <div className='text-sm text-gray-600'>Draws</div>
            </div>
          </div>

          <div className='text-center pt-4 border-t border-gray-400'>
            <div className='text-sm text-gray-600'>Current Streaks</div>
            <div
              className={`text-2xl font-bold ${
                currentStreak > 0 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {currentStreak > 0 ? `${currentStreak} 🔥` : "0"}
            </div>
          </div>
        </div>

        {/* Play Online Section */}
        <div className='space-y-4 mb-6'>
          <h2 className='text-2xl font-bold text-center text-gray-800 mb-4'>
            Start Playing
          </h2>

          <button
            onClick={onStartOnlineGame}
            className={`w-full py-4 px-6 rounded-lg font-bold text-xl
                     active:scale-95 transition-all shadow-lg
                     flex items-center justify-between
                     ${
                       isServerAvailable === false
                         ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                         : "bg-purple-600 text-white hover:bg-purple-700"
                     }`}
            disabled={isServerAvailable === false}
          >
            <span>Play Online</span>
            <span className='text-sm font-normal'>
              {isServerAvailable === null
                ? "Checking..."
                : isServerAvailable
                ? 'Find opponent'
                : "Server Offline"}
            </span>
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={onResetScore}
          className='w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg
        hover:bg-gray-300 active:scale-95 transition-all'
        >
          Reset All Scores
        </button>

        {/* Info */}
        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>First player plays as ODD</p>
          <p>Second player plays as EVEN</p>
          <p className='mt-2'>Click squares to increment numbers!</p>
        </div>
      </div>
    </div>
  )
}

export default Menu

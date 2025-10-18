import { useState, useEffect } from 'react'
import './App.css'
import Menu from './components/Menu'
import Game from './components/Game'

function App() {
  const [gameMode, setGameMode] = useState('menu') // 'menu' or 'online'
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('tictactoe-stats')
    return savedStats ? JSON.parse(savedStats) : {
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0
    }
  })

  useEffect(() => {
    localStorage.setItem('tictactoe-stats', JSON.stringify(stats))
  }, [stats])

  const handleWin = () => {
    setStats(prev => ({
      ...prev,
      wins: prev.wins + 1,
      currentStreak: prev.currentStreak + 1
    }))
  }

  const handleLoss = () => {
    setStats(prev => ({
      ...prev,
      losses: prev.losses + 1,
      currentStreak: 0
    }))
  }

  const handleDraw = () => {
    setStats(prev => ({
      ...prev,
      draws: prev.draws + 1,
      currentStreak: 0
    }))
  }

  const handleResetScore = () => {
    setStats({
      wins: 0,
      losses: 0,
      draws: 0,
      currentStreak: 0
    })
  }

  const handleStartOnlineGame = () => {
    setGameMode('online')
  }

  const handleBackToMenu = () => {
    setGameMode('menu')
  }

  return (
    <>
      {gameMode === 'menu' && (
        <Menu
          onStartOnlineGame={handleStartOnlineGame}
          wins={stats.wins}
          losses={stats.losses}
          draws={stats.draws}
          currentStreak={stats.currentStreak}
          onResetScore={handleResetScore}
        />
      )}

      {gameMode === 'online' && (
        <Game
          onBackToMenu={handleBackToMenu}
          onWin={handleWin}
          onLoss={handleLoss}
          onDraw={handleDraw}
        />
      )}
    </>
  )
}

export default App

import { useEffect, useRef, useState } from 'react'
import { createEmptyBoard } from '../utils/gameLogic'
import Board from './Board'
import GameInfo from './GameInfo'
import { WebSocketService } from '../utils/webSocket'

function Game({ onBackToMenu, onWin, onLoss, onDraw }) {
  //player
  const [playerSymbol, setPlayerSymbol] = useState(null) // ODD even

  //server
  const [isWaiting, setIsWaiting] = useState(true)

  const [gameStatus, setGameStatus] = useState("Connecting to server...")
  //game
  const [board, setBoard] = useState(createEmptyBoard())
  const [winningLine, setWinningLine] = useState(null)
  const [isGameActive, setIsGameActive] = useState(false)

  const wsService = useRef(null)
  const gameResultReportedRef = useRef(false)
  const playerSymbolRef = useRef(null)

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({ onWin, onLoss, onDraw })
  useEffect(() => {
    callbacksRef.current = { onWin, onLoss, onDraw }
  }, [onWin, onLoss, onDraw])

  useEffect(() => {
    let isActive = true
    console.log('OnlineGame: useEffect running, setting up WebSocket...')

    const initWebSocket = async () => {
      if (!isActive) {
        console.log('Effect already cleaned up, aborting connection...')
        return
      }

      wsService.current = new WebSocketService()

      //waiting   gameStart  moveMade gameOver rematchStated, opponnent disconected, erro
      wsService.current.onConnectionStatus((status) => {
        console.log("Connection status changed:", status)
        switch (status) {
          case "connecting":
            setGameStatus("Connecting to server...")
            break
          case "connected":
            if (isWaiting) {
              setGameStatus("Connected! Waiting for opponent...")
            } else if (isGameActive) {
              setGameStatus("Reconnected! Game continues...")
            }
            break
          case "reconnecting":
            console.warn("Reconnection attempt in progress...")
            setGameStatus("Connection lost... Attempting to reconnect...")
            // Don't set isGameActive to false during reconnection
            break
          case "disconnected":
            setGameStatus("Disconnected from server")
            setIsGameActive(false)
            break

          case "error":
            console.error("Connection error occurred")
            setGameStatus("Connection Error. Retrying...")
            setIsGameActive(false)
            break
          default:
            break
        }
      })

      wsService.current.on("gameStart", (data) => {
        setIsWaiting(false)
        setIsGameActive(true)
        setPlayerSymbol(data.playerSymbol)
        playerSymbolRef.current = data.playerSymbol

        setGameStatus(data.message)
        setBoard(data.board || Array(25).fill(0))
        setWinningLine(null)
        gameResultReportedRef.current = false
      })

      wsService.current.on("waiting", (data) => {
        try {
          console.log("Waiting message:", data)
          setIsWaiting(true)
          setGameStatus(data.message || "Waiting for opponent...")
        } catch (error) {
          console.error("Error in waiting handler:", error)
        }
      })

      wsService.current.on("error", (data) => {
        try {
          console.error("Received error message from server:", data)
          setGameStatus(`Error: ${data.message}`)
        } catch (error) {
          console.error("Error in error handler:", error)
        }
      })

      wsService.current.on("gameOver", (data) => {
        setBoard(data.board)
        setIsGameActive(false)

        if (data.winner) {
          const winningLine = {
            indices: data.winningLine,
            winner: data.winner,
          }
          setWinningLine(winningLine)

          if (data.winner === playerSymbolRef.current) {
            setGameStatus("You win!")
            if (!gameResultReportedRef.current) {
              callbacksRef.current.onWin()
              gameResultReportedRef.current = true
            }
          } else {
            setGameStatus("You lose!")
            if (!gameResultReportedRef.current) {
              callbacksRef.current.onLoss()
              gameResultReportedRef.current = true
            }
          }
        }
      })

      wsService.current.on("opponentDisconnected", (data) => {
        try {
          console.log("Opponent disconnected:", data)
          setGameStatus(data.message)
          setIsGameActive(false)
          if (!gameResultReportedRef.current) {
            callbacksRef.current.onWin()
            gameResultReportedRef.current = true
          }
        } catch (error) {
          console.error("Error in opponentDisconnected handler:", error)
        }
      })

      wsService.current.on("update", (data) => {
        console.log("Received UPDATE:", data);

        if (data.board) {
          setBoard(data.board);
        } else if (data.square !== undefined && data.value !== undefined) {
          setBoard(prev => {
            const newBoard = [...prev];
            newBoard[data.square] = data.value;
            return newBoard;
          });
        }
      });

      // connect to server
      try {
        if (!isActive) {
          console.log('Component unmounted during setup, aborting...')
          return
        }

        console.log("Attempting to connect to WebSocket server...")
        await wsService.current.connect()

        if (!isActive) {
          console.log('Component unmounted during connection, disconnecting...')
          wsService.current.disconnect()
          return
        }

        console.log("WebSocket connected successfully, sending join message...")
        wsService.current.send("join", {})
      } catch (error) {
        if (!isActive) {
          console.log('Component unmounted, ignoring connection error')
          return
        }
        console.error("Failed to connect to server:", error)
        setGameStatus("Failed to connect to server. Retrying...")
      }
    }

    initWebSocket()

    //cleanup
    return () => {
      console.log("Cleanup: marking effect as inactive and disconnecting WebSocket")
      isActive = false
      if (wsService.current) {
        wsService.current.disconnect()
        wsService.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  const handleCellClick = (index) => {
    if (!isGameActive) return;

    console.log(`Sending INCREMENT for square ${index}`);
    wsService.current?.send("INCREMENT", { square: index });
  }

  const handleBackToMenu = () => {
    if (wsService.current) {
      wsService.current.disconnect()
    }
    onBackToMenu()
  }

  useEffect(() => {
    console.log("Board updated:", board)
  }, [board])

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <button
            onClick={handleBackToMenu}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                     hover:bg-gray-300 active:scale-95 transition-all font-semibold'
          >
            ← Back to Menu
          </button>

          <div className='bg-purple-600 font-semibold text-white px-4 py-2 rounded-lg'>
            Online Mode
          </div>
        </div>

        <h1 className='text-5xl font-bold text-center mb-8 text-gray-800'>
          Tic Tac Toe
        </h1>

        {/* Player Info */}
        {playerSymbol && (
          <div className='bg-white rounded-lg shadow-md p-4 mb-6 text-center'>
            <p className='text-lg text-gray-700'>
              You are playing as{" "}
              <span className='font-bold text-blue-600'> {playerSymbol}</span>
            </p>
          </div>
        )}

        {/* Waiting Screen */}
        {isWaiting && (
          <div className='bg-white rounded-lg shadow-md p-8 mb-6 text-center'>
            <div className='animate-pulse mb-4'>
              <div className='inline-block h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
            </div>
            <p className='text-xl font-semibold text-gray-700'>{gameStatus}</p>
          </div>
        )}

        {!isWaiting && (
          <>
            <GameInfo
              playerSymbol={playerSymbol}
              gameStatus={gameStatus}
              isGameActive={isGameActive}
            />

            <Board
              board={board}
              onCellClick={handleCellClick}
              winningLine={winningLine}
              disabled={!isGameActive}
            />

            <div className='flex gap-4 justify-center mt-6 max-w-md mx-auto'>
              {!isGameActive && !isWaiting && (
                <button
                  onClick={handleBackToMenu}
                  className='w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                           hover:bg-blue-700 active:scale-95 transition-all shadow-md'
                >
                  Back to Menu
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Game


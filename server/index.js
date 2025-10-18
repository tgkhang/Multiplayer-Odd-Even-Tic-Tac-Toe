const { Server } = require('socket.io');

// Create a Socket.IO server on port 8080
const io = new Server(8080, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

console.log('Socket.IO server is running on http://localhost:8080');

const rooms = {}; // roomId -> { players: [socket1, socket2], board: [], currentPlayer: 'X', playerSymbols: {} }
let roomIdCounter = 0; // Counter for room IDs
let waitingRoom = null; // Store waiting player

function sendMessage(socket, type, data) {
  socket.emit('message', { type, data });
}

function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a], line: combination
      }
    }
  }

  return null;
}

function isDraw(board) {
  return board.every(cell => cell !== null) && !checkWinner(board);
}

function broadcastToRoom(roomId, type, data) {
  const room = rooms[roomId];
  if (room) {
    room.players.forEach(player => {
      sendMessage(player.socket, type, data);
    });
  }
}

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
  socket.roomId = null;
  socket.playerId = null;

  // Handle incoming messages from clients
  socket.on('message', (message) => {
    const { type, data } = message;

    switch (type) {
      case 'join':
        // Handle player joining a room
        if (waitingRoom && waitingRoom.players.length === 1) {
          // Join existing waiting room
          const room = waitingRoom;
          const roomId = room.roomId;

          room.players.push({ socket, symbol: 'O' });
          socket.roomId = roomId;
          socket.playerId = 1;

          // Clear waiting room
          waitingRoom = null;

          // Notify both players that game is starting
          sendMessage(room.players[0].socket, 'gameStart', {
            roomId,
            playerSymbol: 'X',
            opponentSymbol: 'O',
            isYourTurn: true,
            message: 'Game started! You are X (go first)'
          });

          sendMessage(room.players[1].socket, 'gameStart', {
            roomId,
            playerSymbol: 'O',
            opponentSymbol: 'X',
            isYourTurn: false,
            message: 'Game started! You are O (wait for opponent)'
          });

          console.log(`Room ${roomId} is now full. Game starting!`);
        }
        else {
          // Create a new room
          const roomId = roomIdCounter++;
          const newRoom = {
            roomId,
            players: [{ socket, symbol: 'X' }],
            board: Array(9).fill(null),
            currentPlayer: 'X',
          }

          rooms[roomId] = newRoom;
          waitingRoom = newRoom;
          socket.roomId = roomId;
          socket.playerId = 0;

          sendMessage(socket, 'waiting', {
            roomId,
            message: 'Waiting for opponent to join...'
          });
          console.log(`Player created room ${roomId}, waiting for opponent`);
        }
        break;

      case 'move':
        // Handle player making a move
        try {
          console.log(`Move received from ${socket.id}, roomId: ${socket.roomId}, playerId: ${socket.playerId}`);

          const { position } = data;
          const roomId = socket.roomId;
          const room = rooms[roomId];

          if (!room) {
            console.log(`Error: Room ${roomId} not found for socket ${socket.id}`);
            sendMessage(socket, 'error', { message: 'Room not found' });
            break;
          }

          // Verify player exists in room
          if (socket.playerId === null || socket.playerId === undefined) {
            console.log(`Error: Player ID not set for socket ${socket.id}`);
            sendMessage(socket, 'error', { message: 'Player not properly initialized' });
            break;
          }

          if (!room.players[socket.playerId]) {
            console.log(`Error: Player ${socket.playerId} not found in room ${roomId}`);
            sendMessage(socket, 'error', { message: 'Player not found in room' });
            break;
          }

          // Verify it's this player's turn
          const playerSymbol = room.players[socket.playerId].symbol;
          console.log(`Player ${socket.id} (${playerSymbol}) attempting move at position ${position}, current turn: ${room.currentPlayer}`);

          if (room.currentPlayer !== playerSymbol) {
            console.log(`Error: Not player's turn. Current: ${room.currentPlayer}, Player: ${playerSymbol}`);
            sendMessage(socket, 'error', { message: 'Not your turn' });
            break;
          }

          // Verify position is valid
          if (position < 0 || position > 8) {
            console.log(`Error: Invalid position ${position}`);
            sendMessage(socket, 'error', { message: 'Invalid position' });
            break;
          }

          if (room.board[position] !== null) {
            console.log(`Error: Cell ${position} already occupied`);
            sendMessage(socket, 'error', { message: 'Cell already occupied' });
            break;
          }

          // Make the move
          room.board[position] = playerSymbol;
          console.log(`Move successful: ${playerSymbol} at position ${position}`);

          const winner = checkWinner(room.board);
          const draw = isDraw(room.board);

          if (winner) {
            console.log(`Game over: ${winner.winner} wins!`);
            broadcastToRoom(roomId, 'gameOver', {
              board: room.board,
              winner: winner.winner,
              winningLine: winner.line,
              message: `${winner.winner} wins!`
            });
          } else if (draw) {
            console.log(`Game over: Draw`);
            broadcastToRoom(roomId, 'gameOver', {
              board: room.board,
              winner: null,
              message: "It's a draw!"
            });
          } else {
            // Continue game - switch turns
            room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
            console.log(`Switching turn to ${room.currentPlayer}, broadcasting moveMade`);
            broadcastToRoom(roomId, 'moveMade', {
              board: room.board,
              position,
              player: playerSymbol,
              currentPlayer: room.currentPlayer
            });
            console.log(`MoveMade broadcasted successfully`);
          }
        } catch (error) {
          console.error(`Error processing move from ${socket.id}:`, error);
          sendMessage(socket, 'error', { message: 'Error processing move' });
        }
        break;

      default:
        console.log('Unknown message type:', type);
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    const roomId = socket.roomId;
    const room = rooms[roomId];

    if (room) {
      // Find the other player
      const otherPlayer = room.players.find(p => p.socket.id !== socket.id);

      if (otherPlayer) {
        // Notify the other player that opponent disconnected
        sendMessage(otherPlayer.socket, 'opponentDisconnected', {
          message: 'Opponent disconnected. You win!'
        });
      }

      // Clean up the room
      delete rooms[roomId];

      // If this was the waiting room, clear it
      if (waitingRoom && waitingRoom.roomId === roomId) {
        waitingRoom = null;
      }

      console.log(`Room ${roomId} deleted due to player disconnect`);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

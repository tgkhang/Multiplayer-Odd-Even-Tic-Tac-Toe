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

          room.players.push({ socket, symbol: 'EVEN' });
          socket.roomId = roomId;
          socket.playerId = 1;

          // Clear waiting room
          waitingRoom = null;



          sendMessage(room.players[0].socket, 'gameStart', {
            roomId,
            playerSymbol: 'ODD',
            opponentSymbol: 'EVEN',
            message: 'Game started! You are the ODD player',
            board: room.board // Send initial board state
          });


          sendMessage(room.players[1].socket, 'gameStart', {
            roomId,
            playerSymbol: 'EVEN',
            opponentSymbol: 'ODD',
            message: 'Game started! You are the EVEN player',
            board: room.board
          });

          console.log(`Room ${roomId} is now full. Game starting!`);
        }
        else {
          // Create a new room
          const roomId = roomIdCounter++;
          const newRoom = {
            roomId,
            players: [{ socket, symbol: 'ODD' }],
            board: Array(25).fill(0),
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

      case 'INCREMENT':
        // Handle player making an increment
        try {

          const { square } = data;
          const roomId = socket.roomId;
          const room = rooms[roomId];

          if (!room) {
            sendMessage(socket, 'error', { message: 'Room not found' });
            break;
          }

          // Verify square is valid
          if (square < 0 || square > 24) {
            console.log(`Error: Invalid square ${square}`);
            sendMessage(socket, 'error', { message: 'Invalid square' });
            break;
          }

          // Make the move
          room.board[square] += 1
          const newValue = room.board[square];

          const winner = checkWinner(room.board);

          if (winner) {
            console.log(`Game over: ${winner.winner} wins!`);
            broadcastToRoom(roomId, 'gameOver', {
              board: room.board,
              winner: winner.winner,
              winningLine: winner.indices,
              message: `${winner.winner} player wins!`
            });
          } else {
            // Continue game - switch turns

            broadcastToRoom(roomId, 'update', {
              square: square,
              value: newValue,
              board: room.board // Send full board state
            });

          }
        } catch (error) {
          console.error(`Error processing move from ${socket.id}:`, error);
          sendMessage(socket, 'error', { message: 'Error processing increment' });
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

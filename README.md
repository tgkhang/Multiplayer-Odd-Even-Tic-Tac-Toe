# Multiplayer Odd/Even Tic-Tac-Toe

A real-time multiplayer twist on classic Tic-Tac-Toe where players compete by making squares odd or even. Built to demonstrate distributed systems concepts like operational transforms and server authority.

## Game Rules

### Board & Players
- **5x5 grid** with 25 squares, all starting at `0`
- **Player 1 (Odd)** wins by creating a line of all odd numbers
- **Player 2 (Even)** wins by creating a line of all even numbers

### Gameplay
- **No turns** - both players can click any square simultaneously
- Each click **increments** the square's value by 1 (`0 → 1 → 2 → 3...`)
- Players compete for control of the same squares in real-time

### Winning
Get 5 odd or even numbers in a row, column, or diagonal:
- **12 winning lines:** 5 rows, 5 columns, 2 diagonals
- **Draw:** Both players can win on the same move (rare!)

## Tech Stack

### Client
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Socket.io-client** - Real-time communication

### Server
- **Node.js** - Runtime environment
- **Socket.io** - WebSocket server
- **Nodemon** - Development auto-reload

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Multiplayer-Odd-Even-Tic-Tac-Toe
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

## Running the Project

### Start the Server
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3000`

### Start the Client
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173` (or next available port)

### Play the Game
1. Open two browser windows at the client URL
2. First window becomes **Odd Player**
3. Second window becomes **Even Player**
4. Click squares to increment them and control the board!

## Project Structure

```
Multiplayer-Odd-Even-Tic-Tac-Toe/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Game UI components
│   │   │   ├── Board.jsx
│   │   │   ├── Cell.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── GameInfo.jsx
│   │   │   └── Menu.jsx
│   │   └── utils/
│   │       └── gameLogic.js
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Socket.io server
│   └── package.json
├── requirement.md        # Detailed assignment specs
└── README.md
```

## Key Implementation Concepts

### 1. Server Authority
The server maintains the **single source of truth** for the game state. All clicks are processed server-side to prevent conflicts.

**Flow:**
1. Client sends `INCREMENT` operation
2. Server processes operation on authoritative board
3. Server broadcasts new value to ALL clients
4. Both clients update their UI

### 2. Operational Transforms
Instead of sending final values (states), clients send **operations** (increments). This ensures simultaneous clicks both count.

**Example:** If both players click square 5 at value `4`:
- Server receives two `INCREMENT` operations
- Processes: `4 → 5 → 6`
- Both clicks count!

**Why it matters:** Operations compose naturally without conflicts, unlike state updates which overwrite each other.

### 3. Real-time Communication
Socket.io provides:
- Bidirectional WebSocket connections
- Automatic reconnection handling
- Event-based messaging

## Features

- **Real-time multiplayer** gameplay over WebSockets
- **Connection status** indicators (Connected/Waiting/Disconnected)
- **Win detection** for all 12 possible lines (rows, columns, diagonals)
- **Draw handling** if both players win simultaneously
- **Game over** on player disconnect
- **Responsive UI** with visual feedback

## How to Test

### Testing Alone
Open two browser windows side-by-side and play against yourself!

### Testing Race Conditions
Both players rapidly clicking the same square should increment it by 2+ (all clicks count).

## Development

### Client Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server Scripts
```bash
npm run dev      # Start with nodemon (auto-reload)
node index.js    # Start without auto-reload
```

## Learning Objectives

This project demonstrates:
- **Distributed systems** fundamentals
- **Server authority** pattern
- **Operational transforms** vs state synchronization
- **Real-time communication** with WebSockets
- **Race condition** handling

These concepts power tools like Google Docs, Figma, and multiplayer games.

## License

This is an educational project (Naver Week 2 Assignment).

## Acknowledgments

Assignment designed to teach distributed systems concepts through game development.

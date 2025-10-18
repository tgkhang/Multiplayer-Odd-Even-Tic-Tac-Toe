# Week 2 Assignment: Multiplayer Odd/Even Tic-Tac-Toe

**Time Estimate:** 4-6 hours
**Due Date:** Sunday, 23:59 ICT

---

## 🎮 Game Rules

### Setup
- **Board:** 5x5 grid (25 squares)
- **Initial State:** All squares start at `0`
- **Players:**
  - First player = **Odd Player**
  - Second player = **Even Player**

### Gameplay
- **Click to increment:** Any square can be clicked by any player to increment its number by 1
  - `0 → 1 → 2 → 3 → 4...` (unlimited)
- **No turns:** Both players can click any square at any time (simultaneous play!)
- **Multiple clicks:** Clicking the same square repeatedly keeps incrementing it

### Winning Conditions
- **Odd Player wins** if any row, column, or diagonal has all 5 **odd** numbers
  - Examples: `[1, 3, 5, 7, 9]` or `[1, 1, 1, 1, 1]`
- **Even Player wins** if any row, column, or diagonal has all 5 **even** numbers
  - Examples: `[2, 4, 6, 8, 10]` or `[4, 6, 8, 8, 8]`

### Strategy
- **Odd player:** Clicks squares to make/keep them odd
- **Even player:** Clicks squares to make/keep them even
- **Competition:** Fighting over the same squares is the core gameplay!
  - If both click a square at `5` → becomes `7` (stays odd)
  - If both click a square at `4` → becomes `6` (stays even)

---

## 🎯 Why This Assignment?

### The Core Question
**When two players click the same square at the exact same time, what happens?**

In Week 1, your tic-tac-toe worked great locally. But when two people play over the internet, you face the fundamental challenge of distributed systems: **how do you handle simultaneous actions?**

### What You'll Learn
1. **Server Authority** - Why one computer needs to be "in charge" of the truth
2. **Operational Transforms** - How to make concurrent actions work without conflicts
3. **WebSocket Communication** - Real-time bidirectional communication

*This is how Google Docs, Figma, multiplayer games, and every collaborative tool actually works under the hood.*

---

## 📋 Core Requirements

### 1. Game Board & Display
- ✅ 5x5 grid displaying numbers (starts at 0)
- ✅ Clear visual indication of which player you are (Odd or Even)
- ✅ Display current board state clearly
- ✅ Click any square to increment by 1
- ✅ Connection status indicator:
  - "Connected"
  - "Disconnected"
  - "Waiting for opponent..."

---

### 2. WebSocket Communication

#### Client → Server (Send operation, not state!)
```javascript
// When player clicks square 12
{
  type: 'INCREMENT',
  square: 12
}
```

#### Server → All Clients (Broadcast new state)
```javascript
// After processing the increment
{
  type: 'UPDATE',
  square: 12,
  value: 6
}
```

---

### 3. Server Authority (The Key Concept!)

**The server maintains the single source of truth.**

#### How It Works
1. Client sends `INCREMENT` message to server
2. Client **WAITS** (don't update the UI yet!)
3. Server receives message and increments: `board[12] += 1`
4. Server broadcasts new value to **ALL** clients
5. ALL clients (including you) update their UI

#### Why This Matters - Simultaneous Clicks Example

**Scenario:** Square 12 currently shows `5`, both players click at the exact same time

```
Server processes messages in order:

1️⃣ Receives: INCREMENT square 12
   Processes: board[12] = 5 → 6
   Broadcasts: UPDATE square 12, value 6

2️⃣ Receives: INCREMENT square 12
   Processes: board[12] = 6 → 7
   Broadcasts: UPDATE square 12, value 7

Clients see: 5 → 6 → 7
```

**Result:** BOTH clicks counted! ✅

---

### 4. Operational Transforms

**This is the core learning objective!**

#### ❌ Wrong Approach (Sending States)
```javascript
// BAD: Telling server what the final value should be
{
  type: 'SET_VALUE',
  square: 12,
  value: 6
}

// Problem: If both players send this simultaneously,
// second message overwrites the first. Only ONE click counts!
```

#### ✅ Right Approach (Sending Operations)
```javascript
// GOOD: Telling server what operation to perform
{
  type: 'INCREMENT',
  square: 12,
  amount: 1  // or just omit if always +1
}

// Server applies each operation:
// 5 → 6 (first INCREMENT)
// 6 → 7 (second INCREMENT)
// BOTH clicks count!
```

**Key Insight:** Operations compose naturally. States conflict.

---

### 5. Win Detection

Check after every update for all rows, columns, and diagonals:

```javascript
// Check if all 5 numbers in a line are odd
if (values.every(v => v % 2 === 1)) {
  // Odd player wins!
}

// Check if all 5 numbers in a line are even
if (values.every(v => v % 2 === 0 && v > 0)) {
  // Even player wins!
}
```

#### Lines to Check (12 total)
- **5 rows:** `[0,1,2,3,4]`, `[5,6,7,8,9]`, `[10,11,12,13,14]`, `[15,16,17,18,19]`, `[20,21,22,23,24]`
- **5 columns:** `[0,5,10,15,20]`, `[1,6,11,16,21]`, `[2,7,12,17,22]`, `[3,8,13,18,23]`, `[4,9,14,19,24]`
- **2 diagonals:** `[0,6,12,18,24]`, `[4,8,12,16,20]`

---

### 6. Player Assignment

#### First Connection → Odd Player
```javascript
{
  type: 'PLAYER_ASSIGNED',
  player: 'ODD',
  board: [0, 0, 0, ...] // current board state
}
```

#### Second Connection → Even Player
```javascript
{
  type: 'PLAYER_ASSIGNED',
  player: 'EVEN',
  board: [0, 0, 0, ...] // current board state
}
```

**Important:** Game cannot start until both players are connected. Display "Waiting for opponent..." until the second player joins.

---

### 7. Game Over

When someone wins, broadcast:
```javascript
{
  type: 'GAME_OVER',
  winner: 'ODD', // or 'EVEN'
  winningLine: [0, 6, 12, 18, 24] // optional: which line won
}
```

Display a clear "Game Over" screen showing who won.

#### Important Rules
- ⚠️ If a player disconnects, the game ends immediately
- ⚠️ Once `GAME_OVER` is broadcast, ignore any subsequent moves
- ⚠️ Game cannot start until both players (Odd and Even) are connected

---

## 🌟 Bonus Features (Optional)

### Optimistic Updates
Instead of waiting for the server, update your UI immediately:

```javascript
// When player clicks:
// 1. Update UI immediately (optimistic)
board[square] += 1;
renderSquare(square, 'pending'); // yellow border

// 2. Send to server
ws.send({ type: 'INCREMENT', square });

// 3. When server broadcasts UPDATE, confirm it
// Your local value might differ from server's if you were
// slightly out of sync - server's value is the truth!
```

**Visual feedback:**
- Pending squares: yellow border
- When server confirms: green flash
- If server value differs: red flash (rare!)

### UI/UX Enhancements
- Highlight winning line when game ends
- Color code squares (odd = blue, even = green)
- Show click count per player
- "New Game" or "Rematch" button
- Animations for increments
- Sound effects

### Advanced Features
- Reconnection handling
- Move history / replay
- Multiple game rooms (each with unique URL)
- Spectator mode for third+ players

---

## 📝 About Grading

This assignment will **not be graded in detail**. This is primarily for your own learning.

However, we will look at every submission and select the best ones to:
- Share with the class as examples
- Award extra bonus points

**Focus on understanding:**
- Why does the server need to be the authority?
- Why send operations instead of states?
- How do operational transforms solve the simultaneous click problem?

If you can explain these concepts to someone else, you've succeeded.

---

## ❓ FAQ

**Q: Can I use Socket.io instead of raw WebSockets?**
A: Yes! Just document it in your README.

**Q: What if a third player connects?**
A: You can either reject them or make them a spectator. For simplicity, just reject (send an error message).

**Q: Should numbers have a max value?**
A: No limit needed. Let them go to 100, 1000, whatever!

**Q: What if both players are trying to win at the same time?**
A: Check for both win conditions. First one detected wins. Or it's a draw if both win on the same move!

**Q: Do I need to persist the game?**
A: No. In-memory is fine. Game resets if server restarts.

**Q: What if a player disconnects?**
A: The game ends immediately. Show "Opponent disconnected" message.

**Q: How do I test this alone?**
A: Open two browser windows side-by-side and play against yourself!

**Q: How can I test race conditions and simultaneous clicks?**
A: Add a "Chaos Mode" button that inserts random network lag! This makes it much easier to see the distributed systems problems in action:

```javascript
let chaosMode = false;

function toggleChaosMode() {
  chaosMode = !chaosMode;
}

// Wrap your WebSocket send
const originalSend = ws.send.bind(ws);
ws.send = (data) => {
  if (chaosMode) {
    // Random delay between 0-1000ms
    const delay = Math.random() * 1000;
    setTimeout(() => originalSend(data), delay);
  } else {
    originalSend(data);
  }
};
```

With chaos mode on, click rapidly in both windows - you'll see messages arrive out of order and really understand why operational transforms matter!

---

## 🎯 Success Criteria

You'll know you've succeeded when:

- ✅ Two players can play simultaneously in different browsers
- ✅ Both players clicking the same square makes it increment by 2
- ✅ Win detection works correctly
- ✅ You can explain why sending operations is better than sending states
- ✅ You understand how this applies to Google Docs and other real-time tools

---

## 📌 A Note on Message Ordering

You might wonder: *"What if both players click at almost the same time, but due to network lag, the messages arrive at the server in the wrong order?"*

This is a fundamental challenge in distributed systems. In this assignment:

- The server processes messages **in the order it receives them** - this is the "truth"
- Messages might arrive out of chronological order due to network lag
- The first message to complete a win condition wins, even if it wasn't "first" in real time
- **This is not a bug** - it's a fundamental limitation of distributed systems without complex consensus protocols

This is how most real-time applications work, including many multiplayer games. Perfect ordering would require:
- Trusted timestamps (clients can't be trusted)
- Synchronized clocks (impossible across networks)
- Consensus protocols like Raft or Paxos (way beyond this assignment's scope)

In practice, this limitation is rare enough that it doesn't break the game. Both players experience the same network conditions, making it fair. **Understanding this trade-off is part of learning distributed systems!**

---

**Remember:** The goal is understanding distributed systems concepts deeply. This knowledge applies to every real-time application you'll ever build.

Good luck, and have fun! 🎮🌐

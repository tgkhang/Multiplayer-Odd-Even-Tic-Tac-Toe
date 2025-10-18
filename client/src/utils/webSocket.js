// message from server: gameStart, waiting, error, gameOver, moveMade, opponentDisconnected
// message from client: join, move

import { io } from 'socket.io-client';

export class WebSocketService {
  constructor(url = 'http://localhost:8080') {
    this.socket = null;
    this.url = url;
    this.messageHandlers = new Map();
    this.connectionStatusCallback = null;
  }

  handleMessage(message) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      try {
        handler(message.data);
      } catch (error) {
        console.error(`Error in handler for message type "${message.type}":`, error);
      }
    } else {
      console.warn(`No handler registered for message type: "${message.type}"`, message);
    }
  }

  onConnectionStatus(callback) {
    this.connectionStatusCallback = callback;
  }

  notifyConnectionStatus(status) {
    if (this.connectionStatusCallback) {
      this.connectionStatusCallback(status);
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.notifyConnectionStatus('connecting');

        // Create socket.io connection with reconnection enabled
        this.socket = io(this.url, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          timeout: 5000  // Socket.IO built-in connection timeout
        });

        this.socket.on('connect', () => {
          console.log('Connected to Socket.IO server');
          this.notifyConnectionStatus('connected');
          resolve();
        });

        this.socket.on('message', (message) => {
          try {
            this.handleMessage(message);
          } catch (error) {
            console.error('Error handling Socket.IO message:', error);
          }
        });

        // Only handle connect_error during initial connection
        this.socket.once('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          this.notifyConnectionStatus('error');
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from Socket.IO server');
          this.notifyConnectionStatus('disconnected');
        });

        this.socket.on('reconnect_attempt', () => {
          console.log('Attempting to reconnect...');
          this.notifyConnectionStatus('reconnecting');
        });

        this.socket.on('reconnect', () => {
          console.log('Reconnected to Socket.IO server');
          this.notifyConnectionStatus('connected');
        });
      } catch (error) {
        this.notifyConnectionStatus('error');
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }

  send(type, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', { type, data });
    } else {
      console.log('socket is not connected');
    }
  }

  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  off(type) {
    this.messageHandlers.delete(type);
  }

  isConnected() {
    return this.socket !== null && this.socket.connected;
  }

  static async testConnection(url = 'http://localhost:8080') {
    return new Promise((resolve) => {
      try {
        const testSocket = io(url, {
          transports: ['websocket'],
          reconnection: false,
          timeout: 3000
        });

        const timeout = setTimeout(() => {
          testSocket.disconnect();
          resolve(false);
        }, 3000);

        testSocket.on('connect', () => {
          clearTimeout(timeout);
          testSocket.disconnect();
          resolve(true);
        });

        testSocket.on('connect_error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      } catch {
        resolve(false);
      }
    });
  }
}

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // userId -> WebSocket
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Authenticate connection
        const token = parse(req.url, true).query.token;
        if (!token) {
          throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.sub;

        // Store client connection
        this.clients.set(userId, ws);

        logger.info('WebSocket client connected', { userId });

        // Handle messages
        ws.on('message', (message) => this.handleMessage(userId, message));

        // Handle disconnection
        ws.on('close', () => {
          this.clients.delete(userId);
          logger.info('WebSocket client disconnected', { userId });
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Successfully connected to WebSocket server'
        }));
      } catch (error) {
        logger.error('WebSocket connection error:', error);
        ws.close();
      }
    });
  }

  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          this.sendToUser(userId, {
            type: 'pong',
            timestamp: Date.now()
          });
          break;

        case 'subscribe':
          // Handle channel subscription
          break;

        case 'unsubscribe':
          // Handle channel unsubscription
          break;

        default:
          logger.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      logger.error('WebSocket message handling error:', error);
    }
  }

  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcast(data, filter = () => true) {
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN && filter(userId)) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Notify about thumbnail status changes
  notifyThumbnailUpdate(thumbnailId, userId, status) {
    this.sendToUser(userId, {
      type: 'thumbnail_update',
      thumbnailId,
      status,
      timestamp: Date.now()
    });
  }

  // Notify about system events
  notifySystemEvent(event, data) {
    this.broadcast({
      type: 'system_event',
      event,
      data,
      timestamp: Date.now()
    });
  }
}
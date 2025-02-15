import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { config } from 'dotenv';
import { WebSocketManager } from './websocket/server.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { setupRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';
import { security } from './middleware/security.js';
import { apiLimiter, speedLimiter } from './middleware/rateLimiter.js';

// Load environment variables
config();

const app = express();
const server = createServer(app);

// Initialize WebSocket server
export const wsManager = new WebSocketManager(server);

// Security middleware
app.use(security);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Global rate limiting and speed limiting
app.use(apiLimiter);
app.use(speedLimiter);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Setup routes
setupRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
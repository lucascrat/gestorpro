import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import pool from './config/database';
import { sendMessage, getChatHistory, createSession } from './controllers/chatController';
import { handlePixWebhook, getPaymentStatus } from './controllers/paymentController';
import { listClients, createClient, updateClient, deleteClient, getClientPayments } from './controllers/clientController';
import { verifyToken } from './middleware/auth';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection OK', time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Chat routes
app.post('/api/chat/session', createSession);
app.post('/api/chat/message', sendMessage);
app.get('/api/chat/history/:sessionId', getChatHistory);

// Payment routes
app.post('/api/webhooks/pix', handlePixWebhook);
app.get('/api/payments/:transactionId', getPaymentStatus);

// Client routes (protected)
app.get('/api/clients', verifyToken, listClients);
app.post('/api/clients', verifyToken, createClient);
app.put('/api/clients/:id', verifyToken, updateClient);
app.delete('/api/clients/:id', verifyToken, deleteClient);
app.get('/api/clients/:id/payments', verifyToken, getClientPayments);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('send-message', (message: string) => {
    console.log(`Message from ${socket.id}: ${message}`);
    socket.emit('receive-message', {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready at http://localhost:${PORT}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL}`);
});

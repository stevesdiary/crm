import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { sequelize } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import leadRoutes from './routes/lead.routes';
import taskRoutes from './routes/task.routes';
import ticketRoutes from './routes/ticket.routes';
import opportunityRoutes from './routes/opportunity.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CRM API is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    console.log('ℹ️  Using existing database schema (no auto-sync)');
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('Error closing database:', (error as Error).message);
  }
  process.exit(0);
});

export { app, startServer };
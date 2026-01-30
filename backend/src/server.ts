import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import placesRoutes from './routes/places.js';
import reviewsRoutes from './routes/reviews.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for mobile app
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'AvaliaAí API is running' });
});

// Root endpoint (useful for quick checks when backend is deployed standalone)
app.get('/', (_req, res) => {
    res.send('AvaliaAí backend is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/reviews', reviewsRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
    });
}

// Export for Vercel
export default app;

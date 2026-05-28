import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import listingRoutes from './routes/listingRoutes';
import path from 'path';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Bypass JSON parsing for Stripe webhook to preserve raw request body buffer
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Basic route to check server status
app.get('/', (req, res) => {
    res.send('RentRoost API is working!');
});

// Serve static files from the "House Images" directory
app.use('/images', express.static(path.join(__dirname, '../data/House Images')));
app.use('/data', express.static(path.join(__dirname, '../data')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/listings', listingRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

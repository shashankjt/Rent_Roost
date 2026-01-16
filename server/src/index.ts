import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import Listing from './models/Listing';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the "House Images" directory
import path from 'path';
app.use('/images', express.static(path.join(__dirname, '../data/House Images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Get all listings
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get single listing by ID
app.get('/api/listings/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const listing = await Listing.findOne({ id });

        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        res.json(listing);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

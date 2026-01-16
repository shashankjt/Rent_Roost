import express from 'express';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Create Booking
// Create Booking
router.post('/', async (req: any, res) => {
    const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail } = req.body;

    try {
        // Check for auth token manually if present
        let userId;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
                userId = decoded.id;
            } catch (error) {
                // Token invalid, proceed as guest if guest details provided
            }
        }

        // Find the listing by its numeric ID to get the ObjectId
        const listing = await Listing.findOne({ id: listingId });

        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        if (!userId && (!guestName || !guestPhone)) {
            res.status(400).json({ message: 'Please provide guest details or log in.' });
            return;
        }

        // Check for overlapping bookings
        const existingBooking = await Booking.findOne({
            listing: listing._id,
            status: 'confirmed',
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });

        if (existingBooking) {
            res.status(400).json({ message: 'Dates are already booked.' });
            return;
        }

        const booking = await Booking.create({
            user: userId,
            guestName,
            guestPhone,
            guestEmail,
            listing: listing._id,
            checkIn,
            checkOut,
            totalPrice,
            status: 'confirmed'
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Unavailable Dates for a Listing
router.get('/unavailable-dates/:listingId', async (req, res) => {
    try {
        const listing = await Listing.findOne({ id: Number(req.params.listingId) });
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        const bookings = await Booking.find({
            listing: listing._id,
            status: 'confirmed',
            checkOut: { $gte: new Date() } // Only future/current bookings
        }).select('checkIn checkOut');

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Booking
router.put('/:id/cancel', protect, async (req: AuthRequest, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        // Ensure user owns the booking
        if (booking.user?.toString() !== req.user.id) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get My Bookings
router.get('/my-bookings', protect, async (req: AuthRequest, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('listing');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Track Guest Booking
router.post('/track', async (req, res) => {
    const { bookingReference, guestPhone } = req.body;
    try {
        const booking = await Booking.findOne({
            bookingReference,
            guestPhone
        }).populate('listing');

        if (!booking) {
            res.status(404).json({ message: 'Booking not found. Please check your details.' });
            return;
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel Guest Booking
router.post('/guest-cancel', async (req, res) => {
    const { bookingReference, guestPhone } = req.body;
    try {
        const booking = await Booking.findOne({
            bookingReference,
            guestPhone
        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        if (booking.status === 'cancelled') {
            res.status(400).json({ message: 'Booking is already cancelled.' });
            return;
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

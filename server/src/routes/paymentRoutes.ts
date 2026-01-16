import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import jwt from 'jsonwebtoken';

const router = express.Router();

let stripe: Stripe | null = null;

const getStripe = () => {
    if (!stripe) {
        const secretKey = process.env.STRIPE_SECRET_KEY || '';
        stripe = new Stripe(secretKey, {
            apiVersion: '2024-11-20.acacia' as any, // Use latest or compatible version
        });
    }
    return stripe;
};

// Get Stripe Publishable Key
router.get('/config', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail, userToken } = req.body;

        const listing = await Listing.findOne({ id: listingId });
        if (!listing) {
            res.status(404).json({ message: 'Listing not found' });
            return;
        }

        // Store booking details in metadata
        // Note: Metadata has size limits. For large data, store a pending booking in DB and pass ID.
        // For simplicity here, we'll pass essential IDs and create booking on verification.
        // Or better: Create a PENDING booking now.

        let userId;
        if (userToken) {
            try {
                const decoded: any = jwt.verify(userToken, process.env.JWT_SECRET as string);
                userId = decoded.id;
            } catch (e) { }
        }

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd', // Changed to USD for general compatibility, or use INR if Indian export enabled
                        product_data: {
                            name: listing.title,
                            images: [listing.image],
                        },
                        unit_amount: totalPrice * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/my-bookings?success=true&session_id={CHECKOUT_SESSION_ID}&listingId=${listingId}&checkIn=${checkIn}&checkOut=${checkOut}&guestName=${guestName || ''}&guestPhone=${guestPhone || ''}`,
            cancel_url: `http://localhost:5173/listings/${listingId}?canceled=true`,
            metadata: {
                listingId: listingId.toString(),
                userId: userId || '',
                checkIn,
                checkOut,
                guestName: guestName || '',
                guestPhone: guestPhone || '',
                totalPrice: totalPrice.toString()
            }
        });

        res.json({ id: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe Session Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Verify Session and Create Booking
router.post('/verify-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const { listingId, userId, checkIn, checkOut, guestName, guestPhone, totalPrice } = session.metadata as any;

            // Check if booking already exists for this session to prevent duplicates
            const existingBooking = await Booking.findOne({ stripePaymentIntentId: session.payment_intent as string });
            if (existingBooking) {
                res.json({ message: 'Booking already confirmed', bookingId: existingBooking._id });
                return;
            }

            const listing = await Listing.findOne({ id: Number(listingId) });

            // Generate Booking Reference
            const generateReference = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let result = '';
                for (let i = 0; i < 6; i++) {
                    result += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return result;
            };
            const bookingReference = generateReference();

            const booking = await Booking.create({
                user: userId || undefined,
                guestName,
                guestPhone,
                listing: listing?._id,
                checkIn,
                checkOut,
                totalPrice: Number(totalPrice),
                status: 'confirmed',
                stripePaymentIntentId: session.payment_intent as string,
                paymentStatus: 'paid',
                bookingReference
            });

            res.json({ message: 'Payment verified and booking created', bookingId: booking._id, bookingReference });
        } else {
            res.status(400).json({ message: 'Payment not successful' });
        }
    } catch (error: any) {
        console.error('Verify Session Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;

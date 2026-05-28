import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { BookingController } from '../controllers/BookingController';
import { BookingService } from '../services/BookingService';

const router = express.Router();

const bookingService = new BookingService();
const bookingController = new BookingController(bookingService);

// Create Booking
router.post('/', bookingController.create);

// Get Unavailable Dates for a Listing
router.get('/unavailable-dates/:listingId', bookingController.getUnavailableDates);

// Cancel Booking
router.put('/:id/cancel', protect, bookingController.cancel);

// Get My Bookings
router.get('/my-bookings', protect, bookingController.getMyBookings);

// Track Guest Booking
router.post('/track', bookingController.trackGuestBooking);

// Cancel Guest Booking
router.post('/guest-cancel', bookingController.cancelGuestBooking);

export default router;

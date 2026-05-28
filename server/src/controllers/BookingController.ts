import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { IBookingService } from '../interfaces/IBookingService';

export class BookingController {
    constructor(private bookingService: IBookingService) {}

    public create = async (req: Request, res: Response): Promise<void> => {
        const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail } = req.body;

        try {
            // Check for auth token manually if present
            let userId: string | undefined;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                try {
                    const token = req.headers.authorization.split(' ')[1];
                    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
                    userId = decoded.id;
                } catch (error) {
                    // Token invalid, proceed as guest
                }
            }

            const booking = await this.bookingService.create(
                { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail },
                userId
            );

            res.status(201).json(booking);
        } catch (error: any) {
            if (error.message === 'Listing not found') {
                res.status(404).json({ message: error.message });
            } else if (error.message === 'Please provide guest details or log in.') {
                res.status(400).json({ message: error.message });
            } else if (error.message === 'Dates are already booked.') {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };

    public getUnavailableDates = async (req: Request, res: Response): Promise<void> => {
        try {
            const listingId = Number(req.params.listingId);
            if (isNaN(listingId)) {
                res.status(400).json({ message: 'Invalid listing ID' });
                return;
            }

            const bookings = await this.bookingService.getUnavailableDates(listingId);
            res.json(bookings);
        } catch (error: any) {
            if (error.message === 'Listing not found') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };

    public cancel = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: 'Not authorized, token failed' });
                return;
            }

            const booking = await this.bookingService.cancel(req.params.id, req.user.id);
            res.json(booking);
        } catch (error: any) {
            if (error.message === 'Booking not found') {
                res.status(404).json({ message: error.message });
            } else if (error.message === 'Not authorized') {
                res.status(401).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };

    public getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: 'Not authorized, token failed' });
                return;
            }

            const bookings = await this.bookingService.getByUser(req.user.id);
            res.json(bookings);
        } catch (error: any) {
            res.status(500).json({ message: 'Server error' });
        }
    };

    public trackGuestBooking = async (req: Request, res: Response): Promise<void> => {
        const { bookingReference, guestPhone } = req.body;
        try {
            const booking = await this.bookingService.trackGuest(bookingReference, guestPhone);
            res.json(booking);
        } catch (error: any) {
            if (error.message === 'Booking not found. Please check your details.') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };

    public cancelGuestBooking = async (req: Request, res: Response): Promise<void> => {
        const { bookingReference, guestPhone } = req.body;
        try {
            const result = await this.bookingService.cancelGuest(bookingReference, guestPhone);
            res.json({ message: 'Booking cancelled successfully', booking: result });
        } catch (error: any) {
            if (error.message === 'Booking not found.') {
                res.status(404).json({ message: error.message });
            } else if (error.message === 'Booking is already cancelled.') {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Server error' });
            }
        }
    };
}

import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { IBookingService, CreateBookingDTO } from '../interfaces/IBookingService';

export class BookingService implements IBookingService {
    public async create(data: CreateBookingDTO, userId?: string): Promise<any> {
        const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail } = data;

        const listing = await Listing.findOne({ id: listingId });
        if (!listing) {
            throw new Error('Listing not found');
        }

        if (!userId && (!guestName || !guestPhone)) {
            throw new Error('Please provide guest details or log in.');
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
            throw new Error('Dates are already booked.');
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

        return booking;
    }

    public async getUnavailableDates(listingId: number): Promise<any[]> {
        const listing = await Listing.findOne({ id: listingId });
        if (!listing) {
            throw new Error('Listing not found');
        }

        return await Booking.find({
            listing: listing._id,
            status: 'confirmed',
            checkOut: { $gte: new Date() } // Only future/current bookings
        }).select('checkIn checkOut');
    }

    public async cancel(bookingId: string, userId: string): Promise<any> {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }

        if (booking.user?.toString() !== userId) {
            throw new Error('Not authorized');
        }

        booking.status = 'cancelled';
        await booking.save();
        return booking;
    }

    public async getByUser(userId: string): Promise<any[]> {
        return await Booking.find({ user: userId }).populate('listing');
    }

    public async trackGuest(bookingReference: string, guestPhone: string): Promise<any> {
        const booking = await Booking.findOne({
            bookingReference,
            guestPhone
        }).populate('listing');

        if (!booking) {
            throw new Error('Booking not found. Please check your details.');
        }

        return booking;
    }

    public async cancelGuest(bookingReference: string, guestPhone: string): Promise<any> {
        const booking = await Booking.findOne({
            bookingReference,
            guestPhone
        });

        if (!booking) {
            throw new Error('Booking not found.');
        }

        if (booking.status === 'cancelled') {
            throw new Error('Booking is already cancelled.');
        }

        booking.status = 'cancelled';
        await booking.save();
        return booking;
    }
}

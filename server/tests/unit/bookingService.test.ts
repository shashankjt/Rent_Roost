import { BookingService } from '../../src/services/BookingService';
import Booking from '../../src/models/Booking';
import Listing from '../../src/models/Listing';

jest.mock('../../src/models/Booking');
jest.mock('../../src/models/Listing');

describe('BookingService', () => {
    let bookingService: BookingService;

    beforeEach(() => {
        bookingService = new BookingService();
        jest.clearAllMocks();
    });

    describe('getUnavailableDates', () => {
        it('should return unavailable booking dates for a listing', async () => {
            const mockListing = {
                _id: 'listing-123',
                id: 1,
                title: 'Listing 1'
            };

            const mockBookings = [
                { checkIn: new Date('2026-06-01'), checkOut: new Date('2026-06-05') },
                { checkIn: new Date('2026-06-10'), checkOut: new Date('2026-06-15') }
            ];

            (Listing.findOne as jest.Mock).mockResolvedValue(mockListing);
            (Booking.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockBookings)
            } as any);

            const result = await bookingService.getUnavailableDates(1);

            expect(Listing.findOne).toHaveBeenCalledWith({ id: 1 });
            expect(Booking.find).toHaveBeenCalledWith(expect.objectContaining({
                listing: 'listing-123',
                status: 'confirmed'
            }));
            expect(result).toEqual(mockBookings);
        });

        it('should throw an error if listing not found', async () => {
            (Listing.findOne as jest.Mock).mockResolvedValue(null);

            await expect(bookingService.getUnavailableDates(999)).rejects.toThrow('Listing not found');
        });
    });
});

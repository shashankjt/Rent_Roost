export interface CreateBookingDTO {
    listingId: number;
    checkIn: string | Date;
    checkOut: string | Date;
    totalPrice: number;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
}

export interface IBookingService {
    create(data: CreateBookingDTO, userId?: string): Promise<any>;
    getUnavailableDates(listingId: number): Promise<any[]>;
    cancel(bookingId: string, userId: string): Promise<any>;
    getByUser(userId: string): Promise<any[]>;
    trackGuest(bookingReference: string, guestPhone: string): Promise<any>;
    cancelGuest(bookingReference: string, guestPhone: string): Promise<any>;
}

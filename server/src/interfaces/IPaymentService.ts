export interface CreateCheckoutSessionDTO {
    listingId: number;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
}

export interface CheckoutSessionResponseDTO {
    id: string;
    url: string | null;
}

export interface VerifySessionResponseDTO {
    message: string;
    bookingId: string;
    bookingReference?: string;
}

export interface IPaymentService {
    getPublishableKey(): string;
    createCheckoutSession(data: CreateCheckoutSessionDTO, userToken?: string): Promise<CheckoutSessionResponseDTO>;
    verifySession(sessionId: string): Promise<VerifySessionResponseDTO>;
    constructEvent(payload: any, signature: string, secret: string): any;
    handleWebhookEvent(event: any): Promise<void>;
}

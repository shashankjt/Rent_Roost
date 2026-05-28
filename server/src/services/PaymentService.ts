import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { IPaymentService, CreateCheckoutSessionDTO, CheckoutSessionResponseDTO, VerifySessionResponseDTO } from '../interfaces/IPaymentService';

export class PaymentService implements IPaymentService {
    private stripeInstance: Stripe | null = null;

    private getStripe(): Stripe {
        if (!this.stripeInstance) {
            const secretKey = process.env.STRIPE_SECRET_KEY || '';
            this.stripeInstance = new Stripe(secretKey, {
                apiVersion: '2024-11-20.acacia' as any,
            });
        }
        return this.stripeInstance;
    }

    private generateReference(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    public getPublishableKey(): string {
        return process.env.STRIPE_PUBLISHABLE_KEY || '';
    }

    public async createCheckoutSession(data: CreateCheckoutSessionDTO, userToken?: string): Promise<CheckoutSessionResponseDTO> {
        const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail } = data;

        const listing = await Listing.findOne({ id: listingId });
        if (!listing) {
            throw new Error('Listing not found');
        }

        let userId: string | undefined;
        if (userToken) {
            try {
                const decoded: any = jwt.verify(userToken, process.env.JWT_SECRET as string);
                userId = decoded.id;
            } catch (e) {
                // Token invalid or expired, continue as guest
            }
        }

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        const session = await this.getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
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
            success_url: `${clientUrl}/my-bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/listings/${listingId}?canceled=true`,
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

        return {
            id: session.id,
            url: session.url
        };
    }

    public async verifySession(sessionId: string): Promise<VerifySessionResponseDTO> {
        const session = await this.getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            throw new Error('Payment not successful');
        }

        const { listingId, userId, checkIn, checkOut, guestName, guestPhone, totalPrice } = session.metadata as any;

        // Check if booking already exists for this session to prevent duplicates
        const existingBooking = await Booking.findOne({ stripePaymentIntentId: session.payment_intent as string });
        if (existingBooking) {
            return {
                message: 'Booking already confirmed',
                bookingId: existingBooking._id.toString(),
                bookingReference: existingBooking.bookingReference || undefined
            };
        }

        const listing = await Listing.findOne({ id: Number(listingId) });
        const bookingReference = this.generateReference();

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

        return {
            message: 'Payment verified and booking created',
            bookingId: booking._id.toString(),
            bookingReference
        };
    }

    public constructEvent(payload: any, signature: string, secret: string): Stripe.Event {
        return this.getStripe().webhooks.constructEvent(payload, signature, secret);
    }

    public async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const { listingId, userId, checkIn, checkOut, guestName, guestPhone, totalPrice } = session.metadata as any;
            const stripePaymentIntentId = session.payment_intent as string;

            // Check if booking already exists to prevent duplicate creation
            const existingBooking = await Booking.findOne({ stripePaymentIntentId });
            if (existingBooking) {
                console.log(`Booking for payment intent ${stripePaymentIntentId} already created.`);
                return;
            }

            const listing = await Listing.findOne({ id: Number(listingId) });
            const bookingReference = this.generateReference();

            await Booking.create({
                user: userId || undefined,
                guestName,
                guestPhone,
                listing: listing?._id,
                checkIn,
                checkOut,
                totalPrice: Number(totalPrice),
                status: 'confirmed',
                stripePaymentIntentId,
                paymentStatus: 'paid',
                bookingReference
            });

            console.log(`Booking successfully created from Stripe Webhook for payment intent ${stripePaymentIntentId}`);
        }
    }
}

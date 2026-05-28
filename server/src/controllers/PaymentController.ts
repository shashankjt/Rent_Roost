import { Request, Response } from 'express';
import { IPaymentService } from '../interfaces/IPaymentService';

export class PaymentController {
    constructor(private paymentService: IPaymentService) {}

    public getConfig = (req: Request, res: Response): void => {
        const publishableKey = this.paymentService.getPublishableKey();
        res.json({ publishableKey });
    };

    public createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
        try {
            const { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail, userToken } = req.body;

            const session = await this.paymentService.createCheckoutSession(
                { listingId, checkIn, checkOut, totalPrice, guestName, guestPhone, guestEmail },
                userToken
            );

            res.json(session);
        } catch (error: any) {
            console.error('Stripe Session Creation Error:', error);
            if (error.message === 'Listing not found') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    };

    public verifySession = async (req: Request, res: Response): Promise<void> => {
        try {
            const { sessionId } = req.body;
            if (!sessionId) {
                res.status(400).json({ message: 'Session ID is required' });
                return;
            }

            const result = await this.paymentService.verifySession(sessionId);
            res.json(result);
        } catch (error: any) {
            console.error('Verify Session Error:', error);
            if (error.message === 'Payment not successful') {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    };

    public handleWebhook = async (req: Request, res: Response): Promise<void> => {
        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

        try {
            const event = this.paymentService.constructEvent(req.body, sig, endpointSecret);
            await this.paymentService.handleWebhookEvent(event);
            res.json({ received: true });
        } catch (error: any) {
            console.error('Webhook Error:', error.message);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    };
}

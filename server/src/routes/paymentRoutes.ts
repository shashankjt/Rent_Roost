import express from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { PaymentService } from '../services/PaymentService';

const router = express.Router();

const paymentService = new PaymentService();
const paymentController = new PaymentController(paymentService);

// Get Stripe Publishable Key
router.get('/config', paymentController.getConfig);

// Create Checkout Session
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Verify Session and Create Booking
router.post('/verify-session', paymentController.verifySession);

// Stripe Webhook Endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;

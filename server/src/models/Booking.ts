import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String },
    guestPhone: { type: String },
    guestEmail: { type: String },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    stripePaymentIntentId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    bookingReference: { type: String, unique: true, sparse: true },
}, {
    timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

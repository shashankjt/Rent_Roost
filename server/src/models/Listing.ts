import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    reviews: { type: Number, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    host: {
        name: { type: String, required: true },
        image: { type: String, required: true },
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
}, {
    timestamps: true,
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

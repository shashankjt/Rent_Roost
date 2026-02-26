import express from 'express';
import Listing from '../models/Listing';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

const router = express.Router();

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', protect, async (req: AuthRequest, res) => {
    try {
        const { title, description, price, location, image, amenities, images } = req.body;

        if (!title || !description || !price || !location || !image) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }

        // Get the latest numeric ID and increment it
        // Note: In a real-world app, we'd use auto-increment or UUIDs, 
        // but for this project's consistency with seed data:
        const lastListing = await Listing.findOne().sort({ id: -1 });
        const nextId = lastListing ? lastListing.id + 1 : 1;

        // Get user details for host info
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const newListing = await Listing.create({
            id: nextId,
            title,
            description,
            price: Number(price),
            rating: 0,
            reviews: 0,
            location,
            image,
            host: {
                name: user.name,
                image: `https://i.pravatar.cc/150?u=${user._id}`
            },
            amenities: amenities || [],
            images: images && images.length > 0 ? images : [image],
            owner: user._id
        });

        res.status(201).json(newListing);
    } catch (error: any) {
        console.error('Error creating listing:', error);
        res.status(500).json({ message: 'Server error creating listing', error: error.message });
    }
});

export default router;

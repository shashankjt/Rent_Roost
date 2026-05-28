import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { ListingController } from '../controllers/ListingController';
import { ListingService } from '../services/ListingService';

const router = express.Router();

const listingService = new ListingService();
const listingController = new ListingController(listingService);

// @route   GET /api/listings
// @desc    Get all listings
// @access  Public
router.get('/', listingController.getAllListings);

// @route   GET /api/listings/my-listings
// @desc    Get listings created by the current user
// @access  Private
router.get('/my-listings', protect, listingController.getMyListings);

// @route   GET /api/listings/:id
// @desc    Get single listing by ID
// @access  Public
router.get('/:id', listingController.getListingById);

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', protect, listingController.createListing);

export default router;

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IListingService } from '../interfaces/IListingService';

export class ListingController {
    constructor(private listingService: IListingService) {}

    public getAllListings = async (req: any, res: Response): Promise<void> => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
            const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;

            const result = await this.listingService.getAll(limit, cursor);
            res.json(result);
        } catch (error) {
            console.error('Error fetching listings:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    };

    public getListingById = async (req: any, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ message: 'Invalid listing ID' });
                return;
            }

            const listing = await this.listingService.getById(id);
            if (!listing) {
                res.status(404).json({ message: 'Listing not found' });
                return;
            }

            res.json(listing);
        } catch (error) {
            console.error('Error fetching listing by ID:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    };

    public createListing = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { title, description, price, location, image } = req.body;

            if (!title || !description || !price || !location || !image) {
                res.status(400).json({ message: 'Please provide all required fields' });
                return;
            }

            if (!req.user || !req.user.id) {
                res.status(401).json({ message: 'Not authorized, user details missing' });
                return;
            }

            const newListing = await this.listingService.create(req.body, req.user.id);
            res.status(201).json(newListing);
        } catch (error: any) {
            console.error('Error creating listing:', error);
            res.status(500).json({ message: 'Server error creating listing', error: error.message });
        }
    };

    public getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: 'Not authorized, user details missing' });
                return;
            }

            const listings = await this.listingService.getByOwner(req.user.id);
            res.json(listings);
        } catch (error) {
            console.error('Error fetching user listings:', error);
            res.status(500).json({ message: 'Server Error' });
        }
    };
}

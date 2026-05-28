import Listing from '../models/Listing';
import User from '../models/User';
import { IListingService, CreateListingDTO, PaginatedListings } from '../interfaces/IListingService';
import { getCached, setCached, deleteCached, deleteCachedPattern } from '../config/redis';

export class ListingService implements IListingService {
    public async getAll(limit = 6, cursor?: number): Promise<PaginatedListings> {
        const cacheKey = `listings:page:limit:${limit}:cursor:${cursor ?? 'none'}`;

        const cachedData = await getCached(cacheKey);
        if (cachedData) {
            try {
                console.log(`[Cache Hit] Listings retrieved from Redis cache (Key: ${cacheKey})`);
                return JSON.parse(cachedData);
            } catch (err) {
                console.error('Failed to parse cached listings:', err);
            }
        }

        console.log(`[Cache Miss] Querying MongoDB for listings (Key: ${cacheKey})`);
        const query: any = {};
        if (cursor !== undefined && cursor !== null && !isNaN(cursor)) {
            query.id = { $gt: cursor };
        }

        const listings = await Listing.find(query)
            .sort({ id: 1 })
            .limit(limit + 1);

        const hasNextPage = listings.length > limit;
        const results = hasNextPage ? listings.slice(0, limit) : listings;
        const nextCursor = hasNextPage ? results[results.length - 1].id : null;

        const resultData: PaginatedListings = {
            listings: results,
            nextCursor
        };

        await setCached(cacheKey, JSON.stringify(resultData), 3600);

        return resultData;
    }

    public async getById(id: number): Promise<any | null> {
        const cacheKey = `listings:id:${id}`;

        const cachedData = await getCached(cacheKey);
        if (cachedData) {
            try {
                console.log(`[Cache Hit] Listing details retrieved from Redis cache (Key: ${cacheKey})`);
                return JSON.parse(cachedData);
            } catch (err) {
                console.error('Failed to parse cached listing detail:', err);
            }
        }

        console.log(`[Cache Miss] Querying MongoDB for listing detail (Key: ${cacheKey})`);
        const listing = await Listing.findOne({ id });
        if (listing) {
            await setCached(cacheKey, JSON.stringify(listing), 3600);
        }

        return listing;
    }

    public async create(data: CreateListingDTO, ownerId: string): Promise<any> {
        const { title, description, price, location, image, amenities, images } = data;

        const lastListing = await Listing.findOne().sort({ id: -1 });
        const nextId = lastListing ? lastListing.id + 1 : 1;

        const user = await User.findById(ownerId);
        if (!user) {
            throw new Error('User not found');
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

        // Invalidate cache
        console.log('[Cache Invalidation] Purging all listings page keys from Redis');
        await deleteCachedPattern('listings:page:*');

        return newListing;
    }

    public async getByOwner(ownerId: string): Promise<any[]> {
        return await Listing.find({ owner: ownerId });
    }
}
